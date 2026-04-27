'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  SkipForward,
  Shield,
  Grid3X3,
  Pause,
  ArrowRightLeft,
  MessageSquare,
  Users,
  LayoutGrid,
  Plus,
  MoreHorizontal,
  CameraOff,
  Share2,
  X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

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

const INTERVIEW_TIPS = [
  'Use the STAR method: Situation, Task, Action, Result',
  "Take a breath before answering — it's okay to pause",
  'Be specific — use real numbers and concrete examples',
  "It's okay to say \"I don't know\" — follow with what you would do",
  'Speak clearly and at a moderate pace',
  'Structure your answer: Context → Challenge → Solution → Impact',
  'Listen carefully to the full question before answering',
  'Keep answers focused — 90 seconds to 2 minutes is ideal',
]

const TRANSCRIPT_TRUNCATE = 60
const QUESTION_MAX_CHARS = 200

// Hard question limits by duration — interview ends when reached
function getMaxQuestions(durationMinutes: number): number {
  const exact: Record<number, number> = { 5: 3, 10: 4, 15: 5, 20: 7, 30: 10, 45: 14, 60: 18 }
  if (exact[durationMinutes]) return exact[durationMinutes]
  return Math.max(2, Math.floor(durationMinutes / 3))
}

type Phase =
  | 'loading' | 'intro'
  | 'generating-question' | 'speaking-question'
  | 'waiting-for-answer' | 'recording-answer'
  | 'processing-answer' | 'speaking-feedback'
  | 'completed' | 'error'

// ── Strip any residual markdown from voice text ────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.*?)\*/g, '$1')        // *italic*
    .replace(/_(.*?)_/g, '$1')          // _underline_
    .replace(/`(.*?)`/g, '$1')          // `code`
    .replace(/#{1,6}\s/g, '')           // # headings
    .trim()
}

// ── Render text with **bold** → <strong> (for display only) ───────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ── Voice wave visualizer ──────────────────────────────────────────────────
function VoiceWave({ isActive, color = 'purple' }: { isActive: boolean; color?: 'purple' | 'red' | 'green' }) {
  const colorMap = {
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
  }
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${colorMap[color]}`}
          animate={isActive ? {
            scaleY: [0.2, Math.random() * 0.8 + 0.4, 0.2],
            opacity: [0.6, 1, 0.6],
          } : { scaleY: 0.2, opacity: 0.3 }}
          transition={isActive ? {
            repeat: Infinity,
            duration: 0.4 + (i % 4) * 0.1,
            delay: i * 0.04,
            ease: 'easeInOut',
          } : { duration: 0.2 }}
          style={{ height: '100%' }}
        />
      ))}
    </div>
  )
}

// ── Recording timer ────────────────────────────────────────────────────────
function RecordingTimer({ isRecording }: { isRecording: boolean }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!isRecording) { setSecs(0); return }
    const t = setInterval(() => setSecs(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording])
  if (!isRecording) return null
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return <span className="text-red-400 font-mono text-sm tabular-nums">{m}:{s}</span>
}

// ── Circular timer ring ────────────────────────────────────────────────────
function TimerRing({ timeRemaining, totalSeconds }: { timeRemaining: number; totalSeconds: number }) {
  const pct = totalSeconds > 0 ? timeRemaining / totalSeconds : 1
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444'
  const fmt = `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
        <motion.circle
          cx="28" cy="28" r={r}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1 }}
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-xs font-mono font-bold tabular-nums ${pct < 0.25 ? 'text-red-400 animate-pulse' : pct < 0.5 ? 'text-yellow-400' : 'text-white'}`}>
        {fmt}
      </span>
    </div>
  )
}

export default function VoiceInterviewRoom({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [liveCaption, setLiveCaption] = useState('')
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('')
  const [showTranscript, setShowTranscript] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [currentQuestionEntryId, setCurrentQuestionEntryId] = useState<string | null>(null)
  const [tipIndex, setTipIndex] = useState(0)
  const [expandedQuestion, setExpandedQuestion] = useState(false)

  // mic state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const previousAnswersRef = useRef<PreviousAnswer[]>([])
  const sessionEndedRef = useRef(false)
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null)

  const sessionInterviewers: Interviewer[] = session
    ? session.interviewers.map(id => INTERVIEWERS.find(i => i.id === id)).filter(Boolean) as Interviewer[]
    : []

  // Hard max — interview stops once this is reached
  const maxQuestions = session ? getMaxQuestions(session.duration_minutes) : 3
  // Progress capped at 100%
  const progressPercent = Math.min(100, Math.round((questionCount / maxQuestions) * 100))

  // ── Toast deduplication ────────────────────────────────────────────────────
  const shownToasts = useRef<Set<string>>(new Set())

  const showUniqueToast = useCallback((id: string, fn: () => void) => {
    if (shownToasts.current.has(id)) return
    shownToasts.current.add(id)
    toast.dismiss()
    fn()
    setTimeout(() => shownToasts.current.delete(id), 5000)
  }, [])

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, liveCaption])

  // ── Rotating tips ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % INTERVIEW_TIPS.length), 15000)
    return () => clearInterval(t)
  }, [])

  // ── Fetch session ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSession() {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) { router.push('/login'); return }

      const { data, error: dbErr } = await supabase
        .from('voice_sessions').select('*')
        .eq('id', params.sessionId).eq('user_id', authSession.user.id).single()

      if (dbErr || !data) { setError('Session not found.'); setPhase('error'); return }
      setSession(data)
      const secs = data.duration_minutes * 60
      setTimeRemaining(secs)
      setTotalSeconds(secs)
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
      await new Promise(r => setTimeout(r, 800))
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
    } catch { setTtsAvailable(false) }
    setActiveSpeakerId(null)
  }

  function addToTranscript(entry: Omit<TranscriptEntry, 'id'>, markAsCurrent = false) {
    const id = Math.random().toString(36).slice(2)
    setTranscript(prev => {
      // Dedup: don't add if same role + first 50 chars already exists
      const isDuplicate = prev.some(
        m => m.role === entry.role && m.text.slice(0, 50) === entry.text.slice(0, 50)
      )
      if (isDuplicate) return prev
      return [...prev, { ...entry, id }]
    })
    if (markAsCurrent) {
      setCurrentQuestionEntryId(id)
      setExpandedQuestion(false)
    }
  }

  // ── Generate next question ─────────────────────────────────────────────────
  const generateNextQuestion = useCallback(async () => {
    if (sessionEndedRef.current) return

    // Hard question limit — end interview gracefully instead of continuing
    const nextCount = questionCount + 1
    if (nextCount > maxQuestions) {
      toast.dismiss()
      toast.success('🎉 Interview complete!', { duration: 3000, style: { background: '#065f46', color: '#fff', border: '1px solid #059669' } })
      handleEndSession('completed')
      return
    }
    setPhase('generating-question')
    setLiveCaption('')
    setStatusText('')

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth) return

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
      }, true /* markAsCurrent */)

      await speakText(data.question, interviewer.voice, interviewer.id, 'speaking-question')
      if (!sessionEndedRef.current) {
        setLiveCaption('')
        setPhase('waiting-for-answer')
      }
    } catch {
      setError('Failed to generate question.')
      setPhase('error')
    }
  }, [questionCount, maxQuestions, session, params.sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Microphone recording (inline, no external component needed for controls) ─
  async function startRecording() {
    try {
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        streamRef.current?.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        handleRecordingComplete(blob)
      }
      mr.start(100)
      setIsRecording(true)
      setPhase('recording-answer')
    } catch {
      toast.dismiss()
      toast.error('Microphone error. Please try again.', { duration: 4000 })
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
  }

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

      let transcribedText = ''
      if (transcribeRes.ok) transcribedText = (await transcribeRes.json()).transcript || ''

      setActiveSpeakerId(null)

      if (!transcribedText.trim()) {
        setPhase('waiting-for-answer')
        setStatusText("Couldn't hear you — please try again.")
        return
      }

      showUniqueToast('answer-recorded', () =>
        toast.success('Answer recorded!', { duration: 2000, icon: '✅', style: { background: '#065f46', color: '#fff', border: '1px solid #059669' } })
      )
      setCurrentQuestionEntryId(null) // question is now answered — show full text in transcript

      addToTranscript({
        role: 'user',
        speakerId: 'user',
        speakerName: 'You',
        speakerAvatar: '🧑',
        text: transcribedText,
      })

      setStatusText('Getting feedback...')

      const feedbackRes = await fetch('/api/interview/voice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.access_token}` },
        body: JSON.stringify({
          sessionId: params.sessionId,
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer: transcribedText,
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

      previousAnswersRef.current = [...previousAnswersRef.current, { question: currentQuestion.question, answer: transcribedText }]

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

  function getProgress() {
    if (!session) return 0
    return Math.min(100, ((totalSeconds - timeRemaining) / totalSeconds) * 100)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
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

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
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
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-950" />
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

  // ── Completed ──────────────────────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
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
  const isSpeakingNow = (id: string) => activeSpeakerId === id
  const isUserRecording = phase === 'recording-answer'
  const isUserProcessing = phase === 'processing-answer'
  const isAISpeaking = phase === 'speaking-question' || phase === 'speaking-feedback'
  const isAIThinking = phase === 'generating-question'
  const canRecord = phase === 'waiting-for-answer' || phase === 'recording-answer'
  const elapsedSeconds = Math.max(0, totalSeconds - timeRemaining)
  const userName = `${session?.user_profile?.firstName || ''} ${session?.user_profile?.lastName || ''}`.trim() || 'Candidate'
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || '')
    .join('') || 'YU'
  const interviewerInitials = currentInterviewer.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || '')
    .join('')
  const formatElapsed = (value: number): string => {
    const mins = Math.floor(value / 60).toString().padStart(2, '0')
    const secs = (value % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }
  const displayMessages = transcript.filter((entry) => !(entry.role === 'interviewer' && entry.id === currentQuestionEntryId))
  const teamsButtons = [
    { icon: Grid3X3, label: 'Pavé', onClick: () => setShowParticipants((v) => !v) },
    { icon: Pause, label: 'Pause', onClick: () => undefined },
    { icon: ArrowRightLeft, label: 'Transférer', onClick: () => undefined },
    { icon: MessageSquare, label: 'Conversation', onClick: () => setShowTranscript((v) => !v), badge: displayMessages.length > 0 ? displayMessages.length : undefined },
    { icon: Users, label: 'Participants', onClick: () => setShowParticipants((v) => !v), badge: 2 },
    { icon: LayoutGrid, label: 'Affichage', onClick: () => undefined },
    { icon: Plus, label: 'Applis', onClick: () => undefined },
    { icon: MoreHorizontal, label: 'Autres', onClick: () => undefined },
  ]

  return (
    <div
      className="h-screen text-gray-900 flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #dde8dd 0%, #e8ede8 100%)' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
        }}
        containerStyle={{ top: 20 }}
      />

      {/* Top bar */}
      <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 bg-transparent">
        <div className="flex items-center gap-2 bg-black/10 rounded-full px-3 py-1.5">
          <Shield className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">{userName}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/10 rounded-full px-3 py-1.5">
          <div className={`w-2 h-2 rounded-full ${isUserRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm font-mono font-medium text-gray-700">{formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Main stage */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
          <div className="relative rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm shadow-2xl border border-white/30 w-full max-w-[520px] h-[320px] md:h-[380px]">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #c8d8c8, #d8e4d8)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative">
                {isAISpeaking && isSpeakingNow(currentInterviewer.id) && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-white/40"
                      style={{ margin: '-10px' }}
                      animate={{ scale: [1, 1.16, 1], opacity: [0.75, 0, 0.75] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-white/20"
                      style={{ margin: '-22px' }}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                    />
                  </>
                )}
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4a5568, #2d3748)' }}
                >
                  <span className="text-white text-4xl md:text-5xl font-bold">{interviewerInitials || 'AI'}</span>
                </div>
              </div>
            </div>

            {(isAISpeaking || isAIThinking) && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full bg-white/80"
                    animate={{ height: [6, 20 + (i % 3) * 4, 6] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.05, repeatType: 'reverse' }}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-3 left-3">
              <span className="bg-black/60 text-white text-sm px-2 py-1 rounded-md font-medium">{currentInterviewer.name}</span>
            </div>
            {isAISpeaking && (
              <div className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5">
                <Mic className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 md:bottom-24 text-center">
          <p className="text-base md:text-lg font-semibold text-gray-800">{currentInterviewer.name} · {currentInterviewer.title}</p>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {statusText || (isAIThinking ? 'Preparing next question...' : phase === 'waiting-for-answer' ? 'Listening for your answer...' : 'Interview in progress')}
          </p>
          {currentQuestion && (
            <div className="mt-3 max-w-xl rounded-xl bg-black/35 text-white px-4 py-2 text-sm">
              {renderMarkdown(currentQuestion.question)}
            </div>
          )}
        </div>

        {/* Self tile bottom-right */}
        <div className="absolute bottom-24 right-3 md:right-4 w-36 md:w-44 h-24 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/30">
          <div className="absolute inset-0 bg-amber-100" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-400 flex items-center justify-center mb-1">
              <span className="text-white text-lg md:text-xl font-bold">{userInitials}</span>
            </div>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">{userName}</span>
          </div>
          {isRecording && (
            <>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-0.5 h-6 px-2 pb-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-400 rounded-t"
                    animate={{ height: [4, 14 + (i % 4) * 2, 4] }}
                    transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.04, repeatType: 'reverse' }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-20 flex-shrink-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 overflow-x-auto">
        <div className="min-w-max h-full flex items-center justify-center gap-1 px-3">
          {teamsButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-200/60 transition min-w-[64px] text-gray-600 hover:text-gray-900"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {btn.badge ? (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                      {btn.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{btn.label}</span>
              </button>
            )
          })}

          <div className="w-px h-10 bg-gray-300 mx-2" />

          <button
            onClick={() => setTtsEnabled((v) => !v)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition min-w-[64px] ${ttsEnabled ? 'hover:bg-gray-200/60' : 'bg-gray-200/70'}`}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
            <span className="text-xs text-gray-600 whitespace-nowrap">Audio</span>
          </button>

          <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-200/60 transition min-w-[64px]">
            <CameraOff className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 whitespace-nowrap">Caméra</span>
          </button>

          <button
            onClick={isRecording ? stopRecording : (canRecord ? startRecording : undefined)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition min-w-[64px] ${isRecording ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-200/60'}`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
            <span className={`text-xs whitespace-nowrap ${isRecording ? 'text-red-600' : 'text-gray-600'}`}>Microphone</span>
          </button>

          <button
            onClick={() => audioRef.current?.dispatchEvent(new Event('ended'))}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-200/60 transition min-w-[64px]"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 whitespace-nowrap">Passer</span>
          </button>

          <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-200/60 transition min-w-[64px]">
            <Share2 className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 whitespace-nowrap">Partager</span>
          </button>

          <div className="w-px h-10 bg-gray-300 mx-2" />

          <button
            onClick={() => confirm('End interview early?') && handleEndSession('cancelled')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition min-w-[74px]"
          >
            <PhoneOff className="w-5 h-5 text-white" />
            <span className="text-xs text-white font-medium whitespace-nowrap">Quitter</span>
          </button>
        </div>
      </div>

      {/* Transcript panel */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-20 w-80 bg-white shadow-2xl flex flex-col z-40"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Live Transcript</h3>
              <button onClick={() => setShowTranscript(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {displayMessages.map((msg) => {
                const isUser = msg.role === 'user'
                const isFeedback = msg.role === 'feedback'
                return (
                  <div key={msg.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{interviewerInitials || 'AI'}</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : isFeedback
                            ? 'bg-yellow-50 border border-yellow-200 text-gray-700 rounded-tl-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      {isFeedback && <span className="text-xs text-yellow-600 font-medium block mb-1">💡 Feedback</span>}
                      <p>{msg.text}</p>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{userInitials}</span>
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={transcriptBottomRef} />
            </div>
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <span className="text-gray-400 text-sm flex-1">Transcript live...</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants panel */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-20 w-72 bg-white shadow-2xl flex flex-col z-40"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Participants (2)</h3>
              <button onClick={() => setShowParticipants(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{interviewerInitials || 'AI'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{currentInterviewer.name}</p>
                  <p className="text-xs text-gray-500">{currentInterviewer.title} · AI Interviewer</p>
                </div>
                <Mic className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userInitials}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500">You</p>
                </div>
                <Mic className={`w-4 h-4 ml-auto ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
