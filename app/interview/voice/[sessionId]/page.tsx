'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MicrophoneRecorder from '@/components/interview/MicrophoneRecorder'
import { INTERVIEWERS, type Interviewer } from '@/components/interview/VoicePanelSelector'
import { Button } from '@/components/ui'

interface VoiceSession {
  id: string
  user_id: string
  mode: string
  interviewers: string[]
  duration_minutes: number
  actual_duration_minutes: number
  credits_charged: number
  is_free: boolean
  started_at: string
  ended_at: string | null
  status: string
}

interface CurrentQuestion {
  id: string
  question: string
  interviewer: Interviewer
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
  const [timeRemaining, setTimeRemaining] = useState(0) // in seconds
  const [questionCount, setQuestionCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [currentInterviewerIndex, setCurrentInterviewerIndex] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Get session interviewers
  const sessionInterviewers = session?.interviewers.map(id => 
    INTERVIEWERS.find(i => i.id === id)
  ).filter(Boolean) as Interviewer[] || []

  // Fetch session on mount
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
          setError('Session not found')
          setPhase('error')
          return
        }

        setSession(data)
        setTimeRemaining(data.duration_minutes * 60)
        startTimeRef.current = new Date()
        setPhase('intro')
      } catch (err) {
        console.error('Failed to fetch session:', err)
        setError('Failed to load session')
        setPhase('error')
      }
    }

    fetchSession()
  }, [params.sessionId, router, supabase])

  // Timer countdown
  useEffect(() => {
    if (phase === 'intro' || phase === 'generating-question' || phase === 'speaking-question' || 
        phase === 'waiting-for-answer' || phase === 'recording-answer' || 
        phase === 'processing-answer' || phase === 'speaking-feedback') {
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleEndSession('completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [phase])

  // Start interview after intro
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => {
        generateNextQuestion()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  async function generateNextQuestion() {
    setPhase('generating-question')
    
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      // Rotate through interviewers
      const interviewer = sessionInterviewers[currentInterviewerIndex % sessionInterviewers.length]
      setCurrentInterviewerIndex(prev => prev + 1)

      const response = await fetch('/api/interview/voice/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          interviewerId: interviewer.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const data = await response.json()
      
      setCurrentQuestion({
        id: data.questionId,
        question: data.question,
        interviewer: interviewer
      })

      setQuestionCount(prev => prev + 1)

      // Speak the question
      await speakText(data.question, interviewer.voice)
      
      setPhase('waiting-for-answer')

    } catch (err) {
      console.error('Failed to generate question:', err)
      setError('Failed to generate question')
      setPhase('error')
    }
  }

  async function speakText(text: string, voice: string) {
    setPhase('speaking-question')
    setAudioPlaying(true)

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch('/api/interview/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ text, voice })
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setAudioPlaying(false)
          resolve()
        }
        audio.onerror = reject
        audio.play()
      })

    } catch (err) {
      console.error('Failed to speak text:', err)
      setAudioPlaying(false)
    }
  }

  function handleStartRecording() {
    setIsRecording(true)
    setPhase('recording-answer')
  }

  function handleStopRecording() {
    setIsRecording(false)
  }

  async function handleRecordingComplete(audioBlob: Blob) {
    setPhase('processing-answer')

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession || !currentQuestion) return

      // Transcribe audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'answer.webm')

      const transcribeResponse = await fetch('/api/interview/voice/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: formData
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const { transcript } = await transcribeResponse.json()

      // Get feedback
      const feedbackResponse = await fetch('/api/interview/voice/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: transcript,
          interviewerId: currentQuestion.interviewer.id
        })
      })

      if (!feedbackResponse.ok) {
        throw new Error('Feedback generation failed')
      }

      const { feedback } = await feedbackResponse.json()

      // Speak feedback
      await speakText(feedback, currentQuestion.interviewer.voice)

      setPhase('speaking-feedback')

      // Wait a moment, then next question
      setTimeout(() => {
        generateNextQuestion()
      }, 2000)

    } catch (err) {
      console.error('Failed to process answer:', err)
      setError('Failed to process answer')
      setPhase('error')
    }
  }

  async function handleEndSession(reason: 'cancelled' | 'completed') {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession || !session) return

      // Calculate used time
      const endTime = new Date()
      const usedMinutes = startTimeRef.current 
        ? Math.ceil((endTime.getTime() - startTimeRef.current.getTime()) / 1000 / 60)
        : session.duration_minutes

      // Calculate refund
      const refundAmount = reason === 'cancelled' && !session.is_free
        ? Math.floor((1 - usedMinutes / session.duration_minutes) * session.credits_charged)
        : 0

      // Update session
      await supabase
        .from('voice_sessions')
        .update({
          ended_at: new Date().toISOString(),
          status: reason,
          actual_duration_minutes: usedMinutes
        })
        .eq('id', params.sessionId)

      // Refund credits if applicable
      if (refundAmount > 0) {
        await supabase.rpc('refund_credits', {
          user_id: authSession.user.id,
          amount: refundAmount,
          session_id: params.sessionId
        })
      }

      setPhase('completed')
      
      // Navigate to summary
      setTimeout(() => {
        router.push(`/interview/voice/${params.sessionId}/summary`)
      }, 2000)

    } catch (err) {
      console.error('Failed to end session:', err)
      setError('Failed to end session')
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function getProgressPercentage(): number {
    if (!session) return 0
    const totalSeconds = session.duration_minutes * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  // Render loading state
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview session...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Render intro
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-6">Your Interview is Starting</h1>
          <p className="text-xl text-gray-300 mb-8">
            You'll be interviewed by {sessionInterviewers.length} panel member{sessionInterviewers.length > 1 ? 's' : ''}
          </p>
          <div className="flex justify-center gap-8 mb-8">
            {sessionInterviewers.map((interviewer) => (
              <div key={interviewer.id} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-2">
                  {interviewer.avatar}
                </div>
                <div className="font-semibold">{interviewer.name}</div>
                <div className="text-sm text-gray-400">{interviewer.title}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-400">Get ready to begin...</p>
        </div>
      </div>
    )
  }

  // Render completed state
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-400">Preparing your results...</p>
        </div>
      </div>
    )
  }

  // Main interview interface
  const currentInterviewer = currentQuestion?.interviewer || sessionInterviewers[0]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
              {currentInterviewer.avatar}
            </div>
            <div>
              <div className="font-semibold">{currentInterviewer.name}</div>
              <div className="text-sm text-gray-400">{currentInterviewer.title}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</div>
              <div className="text-xs text-gray-400">Time Remaining</div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => {
                if (confirm('Are you sure you want to end the interview early? Unused time will be refunded.')) {
                  handleEndSession('cancelled')
                }
              }}
            >
              End Interview
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 rounded-full bg-gray-800 text-sm text-gray-400 mb-6">
            Question {questionCount}
          </div>
          
          {phase === 'generating-question' && (
            <div className="text-gray-400">
              <div className="animate-pulse mb-2">Preparing question...</div>
            </div>
          )}

          {phase === 'speaking-question' && currentQuestion && (
            <div>
              <div className="text-2xl font-semibold mb-4 leading-relaxed">
                {currentQuestion.question}
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span>Interviewer is speaking...</span>
              </div>
            </div>
          )}

          {(phase === 'waiting-for-answer' || phase === 'recording-answer') && currentQuestion && (
            <div>
              <div className="text-2xl font-semibold mb-8 leading-relaxed">
                {currentQuestion.question}
              </div>
              
              <div className="max-w-md mx-auto">
                <MicrophoneRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
              </div>
            </div>
          )}

          {phase === 'processing-answer' && (
            <div className="text-gray-400">
              <div className="animate-pulse mb-2">Processing your answer...</div>
            </div>
          )}

          {phase === 'speaking-feedback' && (
            <div className="text-gray-400">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>Interviewer is providing feedback...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
