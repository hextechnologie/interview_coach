'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MicrophoneRecorder from '@/components/interview/MicrophoneRecorder'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { Button } from '@/components/ui'

interface VoiceSession {
  id: string
  user_id: string
  interviewers: string[]
  duration_minutes: number
  actual_duration_minutes: number
  credits_charged: number
  is_free: boolean
  started_at: string
  ended_at: string | null
  status: string
  user_profile: Record<string, string>
}

interface CurrentQuestion {
  id: string | null
  question: string
  interviewer: Interviewer
}

interface PreviousAnswer {
  question: string
  answer: string
}

type InterviewPhase =
  | 'loading'
  | 'intro'
  | 'generating-question'
  | 'speaking-question'
  | 'waiting-for-answer'
  | 'recording-answer'
  | 'processing-answer'
  | 'speaking-feedback'
  | 'completed'
  | 'error'

export default function VoiceInterviewRoom({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [phase, setPhase] = useState<InterviewPhase>('loading')
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('')
  const [ttsAvailable, setTtsAvailable] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const previousAnswersRef = useRef<PreviousAnswer[]>([])
  const sessionEndedRef = useRef(false)

  const sessionInterviewers: Interviewer[] = session
    ? session.interviewers
        .map(id => INTERVIEWERS.find(i => i.id === id))
        .filter(Boolean) as Interviewer[]
    : []

  // ── Fetch session ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        if (!authSession) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('id', params.sessionId)
          .eq('user_id', authSession.user.id)
          .single()

        if (error || !data) {
          setError('Session not found. It may have already been completed.')
          setPhase('error')
          return
        }

        setSession(data)
        setTimeRemaining(data.duration_minutes * 60)
        startTimeRef.current = new Date()
        setPhase('intro')
      } catch {
        setError('Failed to load session. Please try again.')
        setPhase('error')
      }
    }

    fetchSession()
  }, [params.sessionId, router])

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    const activePhases: InterviewPhase[] = [
      'intro', 'generating-question', 'speaking-question',
      'waiting-for-answer', 'recording-answer', 'processing-answer', 'speaking-feedback',
    ]

    if (!activePhases.includes(phase)) return

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleEndSession('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-start after intro ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return
    const t = setTimeout(() => generateNextQuestion(), 3000)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── TTS helper ─────────────────────────────────────────────────────────────
  async function speakText(text: string, voice: string, phaseDuringSpeech: InterviewPhase) {
    setPhase(phaseDuringSpeech)

    if (!ttsAvailable) return

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch('/api/interview/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({ text, voice }),
      })

      if (!response.ok) {
        setTtsAvailable(false)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve() // Don't block on audio errors
        audio.play().catch(() => resolve())
      })

      URL.revokeObjectURL(audioUrl)
    } catch {
      setTtsAvailable(false)
    }
  }

  // ── Generate next question ─────────────────────────────────────────────────
  const generateNextQuestion = useCallback(async () => {
    if (sessionEndedRef.current) return
    setPhase('generating-question')
    setStatusText('Preparing next question...')

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const nextCount = questionCount + 1
      setQuestionCount(nextCount)

      // Rotate interviewers
      const currentInterviewers = session?.interviewers
        .map(id => INTERVIEWERS.find(i => i.id === id))
        .filter(Boolean) as Interviewer[]

      const interviewer = currentInterviewers[(nextCount - 1) % currentInterviewers.length]

      const response = await fetch('/api/interview/voice/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          interviewerId: interviewer.id,
          questionNumber: nextCount,
          previousAnswers: previousAnswersRef.current,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate question')

      const data = await response.json()

      const q: CurrentQuestion = {
        id: data.questionId ?? null,
        question: data.question,
        interviewer,
      }
      setCurrentQuestion(q)
      setStatusText('')

      // Speak the question, then wait for answer
      await speakText(data.question, interviewer.voice, 'speaking-question')
      if (!sessionEndedRef.current) setPhase('waiting-for-answer')
    } catch {
      setError('Failed to generate question. Please try again.')
      setPhase('error')
    }
  }, [questionCount, session, params.sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle recording complete ──────────────────────────────────────────────
  async function handleRecordingComplete(audioBlob: Blob) {
    if (sessionEndedRef.current || !currentQuestion) return
    setPhase('processing-answer')
    setStatusText('Transcribing your answer...')

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      // Transcribe
      const formData = new FormData()
      formData.append('audio', audioBlob, 'answer.webm')

      const transcribeRes = await fetch('/api/interview/voice/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authSession.access_token}` },
        body: formData,
      })

      let transcript = ''
      if (transcribeRes.ok) {
        const transcribeData = await transcribeRes.json()
        transcript = transcribeData.transcript || ''
      }

      if (!transcript.trim()) {
        // No speech detected — prompt to try again
        setPhase('waiting-for-answer')
        setStatusText("Couldn't hear you clearly. Please try again.")
        return
      }

      setStatusText('Generating feedback...')

      // Get feedback
      const feedbackRes = await fetch('/api/interview/voice/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: transcript,
          interviewerId: currentQuestion.interviewer.id,
        }),
      })

      let feedbackText = 'Thank you for your answer. Let\'s move on to the next question.'
      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json()
        feedbackText = feedbackData.feedback || feedbackText
      }

      // Save to previous answers for context
      previousAnswersRef.current = [
        ...previousAnswersRef.current,
        { question: currentQuestion.question, answer: transcript },
      ]

      setStatusText('')

      // Speak feedback aloud, then generate next question
      await speakText(feedbackText, currentQuestion.interviewer.voice, 'speaking-feedback')

      if (!sessionEndedRef.current) {
        setTimeout(() => generateNextQuestion(), 1500)
      }
    } catch {
      setError('Failed to process your answer. Please try again.')
      setPhase('error')
    }
  }

  // ── End session ────────────────────────────────────────────────────────────
  async function handleEndSession(reason: 'cancelled' | 'completed') {
    if (sessionEndedRef.current) return
    sessionEndedRef.current = true

    if (timerRef.current) clearInterval(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession || !session) return

      const endTime = new Date()
      const usedMinutes = startTimeRef.current
        ? Math.ceil((endTime.getTime() - startTimeRef.current.getTime()) / 60000)
        : session.duration_minutes

      await supabase
        .from('voice_sessions')
        .update({
          ended_at: endTime.toISOString(),
          status: reason === 'cancelled' ? 'cancelled' : 'completed',
          actual_duration_minutes: usedMinutes,
        })
        .eq('id', params.sessionId)

      // Refund unused credits proportionally if cancelled early (> 1 min unused)
      if (reason === 'cancelled' && !session.is_free && session.credits_charged > 0) {
        const unusedFraction = Math.max(0, 1 - usedMinutes / session.duration_minutes)
        const refundAmount = Math.floor(unusedFraction * session.credits_charged)
        if (refundAmount > 0) {
          const { data: credits } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', authSession.user.id)
            .single()
          if (credits) {
            await supabase
              .from('user_credits')
              .update({ balance: credits.balance + refundAmount })
              .eq('user_id', authSession.user.id)
          }
        }
      }
    } catch (err) {
      console.error('Failed to end session cleanly:', err)
    }

    setPhase('completed')
    setTimeout(() => {
      router.push(`/interview/voice/${params.sessionId}/summary`)
    }, 2000)
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function getProgress() {
    if (!session) return 0
    const total = session.duration_minutes * 60
    return Math.min(100, ((total - timeRemaining) / total) * 100)
  }

  const currentInterviewer =
    currentQuestion?.interviewer ?? sessionInterviewers[0] ?? INTERVIEWERS[0]

  // ── Render: loading ────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading interview session...</p>
        </div>
      </div>
    )
  }

  // ── Render: error ──────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { sessionEndedRef.current = false; setPhase('loading') }}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: intro ──────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Your Interview is Starting</h1>
          <p className="text-gray-400 mb-8">
            You&apos;ll be interviewed by {sessionInterviewers.length} panel member
            {sessionInterviewers.length !== 1 ? 's' : ''} for {session?.duration_minutes} minutes
          </p>
          <div className="flex justify-center gap-8 mb-8">
            {sessionInterviewers.map(iv => (
              <div key={iv.id} className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-2 mx-auto">
                  {iv.avatar}
                </div>
                <div className="font-semibold">{iv.name}</div>
                <div className="text-sm text-gray-400">{iv.title}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Get ready — starting in a moment...</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: completed ──────────────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-400">Preparing your results...</p>
        </div>
      </div>
    )
  }

  // ── Render: main interview UI ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
              {currentInterviewer.avatar}
            </div>
            <div>
              <div className="font-semibold">{currentInterviewer.name}</div>
              <div className="text-sm text-gray-400">{currentInterviewer.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-2xl font-mono font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-gray-400">Remaining</div>
            </div>
            <button
              onClick={() => {
                if (confirm('End interview early? Unused time will be refunded.')) {
                  handleEndSession('cancelled')
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-600 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              End
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-4 py-10 gap-8">

        {/* Question counter */}
        <div className="inline-block px-4 py-1 rounded-full bg-gray-800 text-sm text-gray-400">
          {questionCount > 0 ? `Question ${questionCount}` : 'Starting...'}
        </div>

        {/* Phase content */}
        <div className="w-full text-center space-y-6">

          {/* Generating */}
          {phase === 'generating-question' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-purple-400">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              </div>
              <p className="text-gray-400">{statusText || 'Preparing question...'}</p>
            </div>
          )}

          {/* Speaking question */}
          {phase === 'speaking-question' && currentQuestion && (
            <div className="space-y-6">
              <div className="text-2xl font-semibold leading-relaxed text-white">
                {currentQuestion.question}
              </div>
              {ttsAvailable ? (
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-1 bg-blue-400 rounded-full animate-pulse"
                        style={{
                          height: `${12 + (i % 3) * 6}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{currentInterviewer.name} is speaking...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Read the question above, then record your answer.</p>
              )}
            </div>
          )}

          {/* Waiting for / recording answer */}
          {(phase === 'waiting-for-answer' || phase === 'recording-answer') && currentQuestion && (
            <div className="space-y-8">
              <div className="text-2xl font-semibold leading-relaxed text-white">
                {currentQuestion.question}
              </div>
              {statusText && (
                <p className="text-sm text-yellow-400">{statusText}</p>
              )}
              <div className="max-w-sm mx-auto">
                <MicrophoneRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onStartRecording={() => { setIsRecording(true); setPhase('recording-answer'); setStatusText('') }}
                  onStopRecording={() => setIsRecording(false)}
                  disabled={phase === 'recording-answer' && !isRecording}
                />
              </div>
            </div>
          )}

          {/* Processing */}
          {phase === 'processing-answer' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" />
              </div>
              <p className="text-gray-400">{statusText || 'Processing your answer...'}</p>
            </div>
          )}

          {/* Speaking feedback */}
          {phase === 'speaking-feedback' && (
            <div className="space-y-3">
              {ttsAvailable ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-1 bg-green-400 rounded-full animate-pulse"
                        style={{
                          height: `${12 + (i % 3) * 6}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{currentInterviewer.name} is giving feedback...</span>
                </div>
              ) : (
                <p className="text-gray-400">Processing feedback, next question coming up...</p>
              )}
            </div>
          )}
        </div>

        {/* Skip TTS hint */}
        {(phase === 'speaking-question' || phase === 'speaking-feedback') && ttsAvailable && (
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.dispatchEvent(new Event('ended'))
            }}
            className="text-xs text-gray-600 hover:text-gray-400 underline transition-colors"
          >
            Skip audio
          </button>
        )}
      </div>
    </div>
  )
}
