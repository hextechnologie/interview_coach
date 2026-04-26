'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MicrophoneRecorder from '@/components/interview/MicrophoneRecorder'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react'

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
  language: string
}

interface CurrentQuestion {
  id: string | null
  question: string
  interviewer: Interviewer
}

interface TranscriptEntry {
  id: string
  role: 'interviewer' | 'user' | 'feedback'
  speakerId: string
  speakerName: string
  speakerAvatar: string
  text: string
}

interface PreviousAnswer { question: string; answer: string }

type Phase =
  | 'loading' | 'intro'
  | 'generating-question' | 'speaking-question'
  | 'waiting-for-answer' | 'recording-answer'
  | 'processing-answer' | 'speaking-feedback'
  | 'completed' | 'error'

export default function VoiceInterviewRoom({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [liveCaption, setLiveCaption] = useState('')
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const previousAnswersRef = useRef<PreviousAnswer[]>([])
  const sessionEndedRef = useRef(false)
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null)

  const sessionInterviewers: Interviewer[] = session
    ? session.interviewers.map(id => INTERVIEWERS.find(i => i.id === id)).filter(Boolean) as Interviewer[]
    : []

  // Auto-scroll transcript
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, liveCaption])

  // ── Fetch session ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSession() {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('voice_sessions').select('*')
        .eq('id', params.sessionId).eq('user_id', authSession.user.id).single()

      if (error || !data) {
        setError('Session not found.')
        setPhase('error')
        return
      }
      setSession(data)
      setTimeRemaining(data.duration_minutes * 60)
      startTimeRef.current = new Date()
      setPhase('intro')
    }
    fetchSession()
  }, [params.sessionId, router])

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const active: Phase[] = ['intro','generating-question','speaking-question',
      'waiting-for-answer','recording-answer','processing-answer','speaking-feedback']
    if (!active.includes(phase)) return
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { handleEndSession('completed'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-start ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return
    const t = setTimeout(() => generateNextQuestion(), 3500)
    return () => clearTimeout(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── TTS ────────────────────────────────────────────────────────────────────
  async function speakText(text: string, voice: string, speakerId: string, duringPhase: Phase) {
    setPhase(duringPhase)
    setActiveSpeakerId(speakerId)

    if (!ttsAvailable || !ttsEnabled) {
      await new Promise(r => setTimeout(r, 800)) // brief pause before continuing
      setActiveSpeakerId(null)
      return
    }

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth) return

      const res = await fetch('/api/interview/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.access_token}` },
        body: JSON.stringify({ text, voice }),
      })
      if (!res.ok) { setTtsAvailable(false); setActiveSpeakerId(null); return }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      await new Promise<void>(resolve => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
        audio.play().catch(() => resolve())
      })
      URL.revokeObjectURL(url)
    } catch {
      setTtsAvailable(false)
    }
    setActiveSpeakerId(null)
  }

  // ── Add transcript entry ───────────────────────────────────────────────────
  function addToTranscript(entry: Omit<TranscriptEntry, 'id'>) {
    setTranscript(prev => [...prev, { ...entry, id: Math.random().toString(36).slice(2) }])
  }

  // ── Generate next question ─────────────────────────────────────────────────
  const generateNextQuestion = useCallback(async () => {
    if (sessionEndedRef.current) return
    setPhase('generating-question')
    setLiveCaption('')
    setStatusText('')

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth) return

      const nextCount = questionCount + 1
      setQuestionCount(nextCount)

      const currentInterviewers = (session?.interviewers ?? [])
        .map(id => INTERVIEWERS.find(i => i.id === id)).filter(Boolean) as Interviewer[]
      const interviewer = currentInterviewers[(nextCount - 1) % currentInterviewers.length]

      const res = await fetch('/api/interview/voice/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.access_token}` },
        body: JSON.stringify({
          sessionId: params.sessionId,
          interviewerId: interviewer.id,
          questionNumber: nextCount,
          previousAnswers: previousAnswersRef.current,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate question')

      const data = await res.json()
      const q: CurrentQuestion = { id: data.questionId ?? null, question: data.question, interviewer }
      setCurrentQuestion(q)
      setLiveCaption(data.question)

      addToTranscript({
        role: 'interviewer',
        speakerId: interviewer.id,
        speakerName: interviewer.name,
        speakerAvatar: interviewer.avatar,
        text: data.question,
      })

      await speakText(data.question, interviewer.voice, interviewer.id, 'speaking-question')
      if (!sessionEndedRef.current) {
        setLiveCaption('')
        setPhase('waiting-for-answer')
      }
    } catch {
      setError('Failed to generate question.')
      setPhase('error')
    }
  }, [questionCount, session, params.sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle recording complete ──────────────────────────────────────────────
  async function handleRecordingComplete(audioBlob: Blob) {
    if (sessionEndedRef.current || !currentQuestion) return
    setPhase('processing-answer')
    setActiveSpeakerId('user')
    setStatusText('Transcribing...')

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth) return

      const formData = new FormData()
      formData.append('audio', audioBlob, 'answer.webm')
      formData.append('sessionId', params.sessionId)

      const transcribeRes = await fetch('/api/interview/voice/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.access_token}` },
        body: formData,
      })

      let transcript = ''
      if (transcribeRes.ok) transcript = (await transcribeRes.json()).transcript || ''

      setActiveSpeakerId(null)

      if (!transcript.trim()) {
        setPhase('waiting-for-answer')
        setStatusText("Couldn't hear you — please try again.")
        return
      }

      addToTranscript({
        role: 'user',
        speakerId: 'user',
        speakerName: 'You',
        speakerAvatar: '🧑',
        text: transcript,
      })

      setStatusText('Getting feedback...')

      const feedbackRes = await fetch('/api/interview/voice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.access_token}` },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: transcript,
          interviewerId: currentQuestion.interviewer.id,
        }),
      })

      let feedbackText = "Got it, let's keep going."
      let isRedirect = false
      if (feedbackRes.ok) {
        const fd = await feedbackRes.json()
        feedbackText = fd.feedback || feedbackText
        isRedirect = fd.isRedirect === true
      }

      setStatusText('')

      if (isRedirect) {
        setLiveCaption(feedbackText)
        await speakText(feedbackText, currentQuestion.interviewer.voice, currentQuestion.interviewer.id, 'speaking-feedback')
        setLiveCaption('')
        if (!sessionEndedRef.current) {
          setQuestionCount(prev => prev - 1)
          setPhase('waiting-for-answer')
        }
        return
      }

      previousAnswersRef.current = [...previousAnswersRef.current, { question: currentQuestion.question, answer: transcript }]

      addToTranscript({
        role: 'feedback',
        speakerId: currentQuestion.interviewer.id,
        speakerName: currentQuestion.interviewer.name,
        speakerAvatar: currentQuestion.interviewer.avatar,
        text: feedbackText,
      })

      setLiveCaption(feedbackText)
      await speakText(feedbackText, currentQuestion.interviewer.voice, currentQuestion.interviewer.id, 'speaking-feedback')
      setLiveCaption('')

      if (!sessionEndedRef.current) setTimeout(() => generateNextQuestion(), 1200)
    } catch {
      setError('Failed to process answer.')
      setPhase('error')
    }
  }

  // ── End session ────────────────────────────────────────────────────────────
  async function handleEndSession(reason: 'cancelled' | 'completed') {
    if (sessionEndedRef.current) return
    sessionEndedRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth || !session) return

      const endTime = new Date()
      const usedMinutes = startTimeRef.current
        ? Math.ceil((endTime.getTime() - startTimeRef.current.getTime()) / 60000)
        : session.duration_minutes

      await supabase.from('voice_sessions').update({
        ended_at: endTime.toISOString(),
        status: reason === 'cancelled' ? 'cancelled' : 'completed',
        actual_duration_minutes: usedMinutes,
      }).eq('id', params.sessionId)

      if (reason === 'cancelled' && !session.is_free && session.credits_charged > 0) {
        const unusedFraction = Math.max(0, 1 - usedMinutes / session.duration_minutes)
        const refund = Math.floor(unusedFraction * session.credits_charged)
        if (refund > 0) {
          const { data: c } = await supabase.from('user_credits').select('balance').eq('user_id', auth.user.id).single()
          if (c) await supabase.from('user_credits').update({ balance: c.balance + refund }).eq('user_id', auth.user.id)
        }
      }
    } catch (e) { console.error('Failed to end session:', e) }

    setPhase('completed')
    setTimeout(() => router.push(`/interview/voice/${params.sessionId}/summary`), 2000)
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  function getProgress() {
    if (!session) return 0
    const total = session.duration_minutes * 60
    return Math.min(100, ((total - timeRemaining) / total) * 100)
  }

  // ── Render: loading/intro/completed/error ──────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Interview starting...
          </div>
          <h1 className="text-4xl font-bold mb-3">Your panel is ready</h1>
          <p className="text-gray-400 mb-10">
            {sessionInterviewers.length} interviewer{sessionInterviewers.length !== 1 ? 's' : ''} •{' '}
            {session?.duration_minutes} minutes •{' '}
            {{ en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic' }[session?.language ?? 'en']}
          </p>
          <div className="flex justify-center gap-6">
            {sessionInterviewers.map((iv, i) => (
              <motion.div key={iv.id} initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-4xl shadow-xl">
                    {iv.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0d1117]" />
                </div>
                <div>
                  <div className="font-semibold text-center">{iv.name}</div>
                  <div className="text-xs text-gray-400 text-center">{iv.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-400">Preparing your results...</p>
        </motion.div>
      </div>
    )
  }

  // ── Main interview UI ──────────────────────────────────────────────────────
  const currentInterviewer = currentQuestion?.interviewer ?? sessionInterviewers[0] ?? INTERVIEWERS[0]
  const isSpeaking = (id: string) => activeSpeakerId === id
  const isUserActive = phase === 'recording-answer' || (phase === 'processing-answer' && activeSpeakerId === 'user')

  return (
    <div className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#161b22] border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Participants row */}
          <div className="flex items-center gap-3">
            {sessionInterviewers.map(iv => (
              <div key={iv.id} className="flex items-center gap-2">
                <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-sm transition-all ${isSpeaking(iv.id) ? 'ring-2 ring-green-400' : ''}`}>
                  {iv.avatar}
                  {isSpeaking(iv.id) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block">{iv.name}</span>
              </div>
            ))}
            <div className="w-px h-5 bg-white/10 mx-1" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-sm ${isUserActive ? 'ring-2 ring-blue-400' : ''}`}>
                🧑
              </div>
              <span className="text-sm text-gray-300 hidden sm:block">You</span>
            </div>
          </div>

          {/* Timer + controls */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-lg font-mono font-bold tabular-nums ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            <button
              onClick={() => setTtsEnabled(v => !v)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={ttsEnabled ? 'Mute interviewers' : 'Unmute interviewers'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-gray-300" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              onClick={() => confirm('End interview early?') && handleEndSession('cancelled')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-sm font-medium transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ width: `${getProgress()}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Video grid ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Participant tiles */}
          <div className={`flex-1 grid gap-3 ${
            sessionInterviewers.length === 1 ? 'grid-cols-1 grid-rows-1 max-w-lg mx-auto w-full' :
            sessionInterviewers.length === 2 ? 'grid-cols-2 grid-rows-1' :
            'grid-cols-2 grid-rows-2'
          }`}>
            {sessionInterviewers.map((iv, idx) => {
              const speaking = isSpeaking(iv.id)
              const isActive = currentQuestion?.interviewer.id === iv.id
              return (
                <motion.div key={iv.id}
                  className={`relative rounded-2xl overflow-hidden bg-[#1c2128] border-2 transition-all duration-300 ${
                    speaking ? 'border-green-400 shadow-lg shadow-green-400/20' :
                    isActive ? 'border-purple-500/50' : 'border-white/5'
                  } ${sessionInterviewers.length === 3 && idx === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    {/* Avatar with speaking ring */}
                    <div className="relative">
                      {speaking && (
                        <>
                          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-full bg-green-400" />
                          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                            className="absolute inset-0 rounded-full bg-green-400" />
                        </>
                      )}
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl z-10`}>
                        {iv.avatar}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-semibold text-sm sm:text-base">{iv.name}</div>
                      <div className="text-xs text-gray-400">{iv.title}</div>
                    </div>

                    {/* Status badge */}
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      speaking ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                      phase === 'generating-question' && isActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                      'bg-white/5 text-gray-500 border border-white/10'
                    }`}>
                      {speaking ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-flex gap-0.5">
                            {[0,1,2].map(i => (
                              <motion.span key={i} className="inline-block w-0.5 h-3 bg-green-400 rounded-full"
                                animate={{ scaleY: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
                            ))}
                          </span>
                          Speaking
                        </span>
                      ) : phase === 'generating-question' && isActive ? 'Thinking...' : 'Listening'}
                    </div>
                  </div>

                  {/* Name tag overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                    {iv.name}
                  </div>
                </motion.div>
              )
            })}

            {/* User tile */}
            <motion.div
              className={`relative rounded-2xl overflow-hidden bg-[#1c2128] border-2 transition-all duration-300 ${
                isUserActive ? 'border-blue-400 shadow-lg shadow-blue-400/20' : 'border-white/5'
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <div className="relative">
                  {isUserActive && (
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 rounded-full bg-blue-400" />
                  )}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-3xl z-10 shadow-2xl">
                    🧑
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm sm:text-base">You</div>
                  <div className="text-xs text-gray-400">Candidate</div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  phase === 'recording-answer' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  phase === 'processing-answer' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                  'bg-white/5 text-gray-500 border-white/10'
                }`}>
                  {phase === 'recording-answer' ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Recording
                    </span>
                  ) : phase === 'processing-answer' ? 'Processing...' : 'Muted'}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                You
              </div>
              {/* Mic indicator */}
              <div className="absolute top-2 right-2">
                {phase === 'recording-answer'
                  ? <Mic className="w-4 h-4 text-red-400" />
                  : <MicOff className="w-4 h-4 text-gray-600" />}
              </div>
            </motion.div>
          </div>

          {/* ── Caption / question bar ───────────────────────────────── */}
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              {(phase === 'waiting-for-answer' || phase === 'speaking-question' || phase === 'recording-answer') && currentQuestion && (
                <motion.div key="question"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-[#161b22] border border-white/10 rounded-2xl px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{currentQuestion.interviewer.avatar}</span>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        {currentQuestion.interviewer.name} · Question {questionCount}
                      </div>
                      <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {(phase === 'generating-question') && (
                <motion.div key="thinking"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-[#161b22] border border-white/10 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span>{currentInterviewer.avatar}</span>
                    <span>{currentInterviewer.name} is thinking</span>
                    <span className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.span key={i} className="inline-block w-1 h-1 rounded-full bg-gray-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
                      ))}
                    </span>
                  </div>
                </motion.div>
              )}
              {statusText && (
                <motion.div key="status"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-[#161b22] border border-white/10 rounded-2xl px-5 py-3 text-sm text-yellow-400 text-center">
                  {statusText}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mic controls ─────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center justify-center py-2">
            {(phase === 'waiting-for-answer' || phase === 'recording-answer') && (
              <MicrophoneRecorder
                onRecordingComplete={handleRecordingComplete}
                isRecording={isRecording}
                onStartRecording={() => { setIsRecording(true); setPhase('recording-answer') }}
                onStopRecording={() => setIsRecording(false)}
                disabled={false}
              />
            )}
            {phase === 'processing-answer' && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>
                  ●
                </motion.span>
                Processing your answer...
              </div>
            )}
            {(phase === 'speaking-feedback' || phase === 'speaking-question') && ttsEnabled && (
              <button
                onClick={() => audioRef.current?.dispatchEvent(new Event('ended'))}
                className="text-xs text-gray-600 hover:text-gray-400 underline transition-colors"
              >
                Skip audio →
              </button>
            )}
          </div>
        </div>

        {/* ── Transcript panel ─────────────────────────────────────── */}
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-white/5 bg-[#161b22] flex flex-col hidden md:flex">
          <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-gray-300">Live Transcript</h3>
            <p className="text-xs text-gray-500">{transcript.length} exchange{transcript.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            <AnimatePresence initial={false}>
              {transcript.map(entry => (
                <motion.div key={entry.id}
                  initial={{ opacity: 0, x: entry.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-sm flex-shrink-0">
                    {entry.speakerAvatar}
                  </div>
                  <div className={`max-w-[80%] ${entry.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <span className={`text-xs font-medium ${
                      entry.role === 'user' ? 'text-blue-400' :
                      entry.role === 'feedback' ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {entry.speakerName}
                      {entry.role === 'feedback' && ' · feedback'}
                    </span>
                    <div className={`text-xs leading-relaxed rounded-xl px-3 py-2 ${
                      entry.role === 'user'
                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20'
                        : entry.role === 'feedback'
                        ? 'bg-green-600/10 text-green-100 border border-green-500/20'
                        : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}>
                      {entry.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Live caption preview */}
            {liveCaption && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-sm flex-shrink-0">
                  {currentInterviewer.avatar}
                </div>
                <div className="max-w-[80%]">
                  <span className="text-xs font-medium text-purple-400">{currentInterviewer.name}</span>
                  <div className="text-xs leading-relaxed rounded-xl px-3 py-2 bg-purple-600/10 text-purple-200 border border-purple-500/20 mt-1">
                    {liveCaption}
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>|</motion.span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={transcriptBottomRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
