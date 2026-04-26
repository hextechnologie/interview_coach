'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, SkipForward } from 'lucide-react'
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

type Phase =
  | 'loading' | 'intro'
  | 'generating-question' | 'speaking-question'
  | 'waiting-for-answer' | 'recording-answer'
  | 'processing-answer' | 'speaking-feedback'
  | 'completed' | 'error'

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
  const [showTranscriptMobile, setShowTranscriptMobile] = useState(false)

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

  // estimated total questions based on duration (~2 min per Q)
  const estimatedTotal = session ? Math.max(3, Math.round(session.duration_minutes / 2)) : 8

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, liveCaption])

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
        // warn at 2 min remaining
        if (prev === 120) toast('⏰ 2 minutes remaining!', { icon: '⚠️', style: { background: '#1c2128', color: '#facc15', border: '1px solid #ca8a04' } })
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
      toast('🎙️ Recording started...', { duration: 1500, style: { background: '#1c2128', color: '#e2e8f0', border: '1px solid #6d28d9' } })
    } catch {
      toast.error('Microphone access denied.')
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

      toast('✅ Answer recorded!', { duration: 1500, style: { background: '#1c2128', color: '#86efac', border: '1px solid #16a34a' } })

      addToTranscript({
        role: 'user',
        speakerId: 'user',
        speakerName: 'You',
        speakerAvatar: '🧑',
        text: transcribedText,
      })

      setStatusText('Getting feedback...')
      toast('💡 Feedback incoming...', { duration: 1500, style: { background: '#1c2128', color: '#93c5fd', border: '1px solid #2563eb' } })

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

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <Toaster position="top-center" />

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left: participant chips */}
          <div className="flex items-center gap-2">
            {sessionInterviewers.map(iv => (
              <div key={iv.id} className="flex items-center gap-1.5">
                <div className={`relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-xs transition-all ${isSpeakingNow(iv.id) ? 'ring-2 ring-purple-400' : ''}`}>
                  {iv.avatar}
                  {isSpeakingNow(iv.id) && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />}
                </div>
                <span className="text-xs text-gray-400 hidden sm:block">{iv.name}</span>
              </div>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-xs ${isUserRecording ? 'ring-2 ring-red-400' : ''}`}>
              🧑
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">You</span>
          </div>

          {/* Center: brand */}
          <span className="text-xs font-semibold text-gray-500 hidden sm:block">Interview Coach</span>

          {/* Right: timer + controls */}
          <div className="flex items-center gap-2">
            <TimerRing timeRemaining={timeRemaining} totalSeconds={totalSeconds} />

            <button
              onClick={() => setTtsEnabled(v => !v)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title={ttsEnabled ? 'Mute interviewers' : 'Unmute interviewers'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
            </button>

            {/* Mobile transcript toggle */}
            <button
              onClick={() => setShowTranscriptMobile(v => !v)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center md:hidden text-xs text-gray-400 transition-colors"
              title="Toggle transcript"
            >
              💬
            </button>

            <button
              onClick={() => confirm('End interview early?') && handleEndSession('cancelled')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs font-medium transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT / CENTER: Interviewer card ──────────────────────────── */}
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden min-w-0">

          {/* Interviewer card */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-sm">
              <div className={`rounded-2xl bg-gray-900 border-2 transition-all duration-300 p-6 ${
                isAISpeaking && isSpeakingNow(currentInterviewer.id)
                  ? 'border-purple-500 shadow-xl shadow-purple-500/20'
                  : isAIThinking
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                  : 'border-white/8'
              }`}>
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* Speaking ripple rings */}
                    {isAISpeaking && isSpeakingNow(currentInterviewer.id) && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.6 }}
                          className="absolute inset-0 rounded-full border-2 border-purple-500"
                          style={{ margin: '-10px' }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.6, delay: 0.35 }}
                          className="absolute inset-0 rounded-full border-2 border-purple-400"
                          style={{ margin: '-20px' }}
                        />
                      </>
                    )}
                    {/* Listening ring */}
                    {phase === 'waiting-for-answer' && (
                      <div className="absolute inset-0 rounded-full border-2 border-green-500/60" style={{ margin: '-6px' }} />
                    )}

                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-5xl shadow-2xl relative z-10">
                      {currentInterviewer.avatar}
                    </div>
                  </div>

                  {/* Name + title */}
                  <div className="text-center">
                    <div className="font-bold text-lg">{currentInterviewer.name}</div>
                    <div className="text-sm text-gray-400">{currentInterviewer.title}</div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isAISpeaking && isSpeakingNow(currentInterviewer.id)
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : isAIThinking
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      : phase === 'waiting-for-answer'
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : phase === 'speaking-feedback'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-white/5 text-gray-500 border-white/10'
                  }`}>
                    {isAISpeaking && isSpeakingNow(currentInterviewer.id) ? (
                      <>
                        <VoiceWave isActive color="purple" />
                        <span>Speaking...</span>
                      </>
                    ) : isAIThinking ? (
                      <>
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
                        <span>Thinking...</span>
                      </>
                    ) : phase === 'waiting-for-answer' ? (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Listening...</span>
                      </>
                    ) : phase === 'speaking-feedback' ? (
                      <>
                        <span>💡</span>
                        <span>Feedback</span>
                      </>
                    ) : (
                      <span>Ready</span>
                    )}
                  </div>

                  {/* Sound wave when speaking */}
                  {isAISpeaking && isSpeakingNow(currentInterviewer.id) && (
                    <VoiceWave isActive color="purple" />
                  )}
                </div>

                {/* Current question inside card */}
                <AnimatePresence mode="wait">
                  {currentQuestion && (phase === 'waiting-for-answer' || phase === 'speaking-question' || phase === 'recording-answer' || phase === 'speaking-feedback' || phase === 'processing-answer') && (
                    <motion.div
                      key={currentQuestion.question}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-5 p-4 bg-gray-800/60 rounded-xl border border-purple-500/20 text-left"
                    >
                      <span className="text-xs text-purple-400 font-semibold">Question {questionCount}</span>
                      <p className="text-sm text-gray-100 mt-1.5 leading-relaxed">{currentQuestion.question}</p>
                    </motion.div>
                  )}
                  {isAIThinking && (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-5 p-4 bg-gray-800/40 rounded-xl border border-yellow-500/20 text-left"
                    >
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <span>Preparing question {questionCount}...</span>
                        <span className="flex gap-1">
                          {[0,1,2].map(i => (
                            <motion.span key={i} className="inline-block w-1 h-1 rounded-full bg-yellow-400"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
                          ))}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip audio button */}
                {isAISpeaking && ttsEnabled && (
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => audioRef.current?.dispatchEvent(new Event('ended'))}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      <SkipForward className="w-3 h-3" />
                      Skip audio
                    </button>
                  </div>
                )}
              </div>

              {/* Status text (transcribing, feedback) */}
              {statusText && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 text-center text-sm text-yellow-400"
                >
                  {statusText}
                </motion.div>
              )}
            </div>
          </div>

          {/* ── BOTTOM CONTROLS ──────────────────────────────────────────── */}
          <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur rounded-2xl border border-white/5 px-4 py-4">
            <div className="flex items-center justify-center gap-3">

              {/* TTS mute (visible here too for clarity) */}
              <button
                onClick={() => setTtsEnabled(v => !v)}
                className="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
              >
                {ttsEnabled
                  ? <Volume2 className="w-5 h-5 text-gray-300" />
                  : <VolumeX className="w-5 h-5 text-gray-500" />}
              </button>

              {/* Main speak button */}
              {canRecord && !isUserRecording && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startRecording}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-semibold text-white shadow-lg shadow-purple-900/40 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  Start Speaking
                </motion.button>
              )}

              {isUserRecording && (
                <motion.button
                  animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 12px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 font-semibold text-white shadow-lg"
                >
                  <span className="w-3 h-3 rounded-sm bg-white" />
                  Stop &nbsp;
                  <RecordingTimer isRecording={isUserRecording} />
                </motion.button>
              )}

              {isUserProcessing && (
                <div className="flex items-center gap-2 px-8 py-3 rounded-full bg-gray-800 text-gray-400 font-semibold cursor-not-allowed">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
                  Processing...
                </div>
              )}

              {/* Skip question */}
              {phase === 'waiting-for-answer' && (
                <button
                  onClick={() => generateNextQuestion()}
                  className="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center transition-colors text-gray-500 hover:text-gray-300"
                  title="Skip question"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              {/* End interview */}
              <button
                onClick={() => confirm('End interview early?') && handleEndSession('cancelled')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-900/30 text-sm transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                End
              </button>
            </div>

            {/* Voice wave when recording */}
            {isUserRecording && (
              <div className="flex justify-center mt-3">
                <VoiceWave isActive color="red" />
              </div>
            )}
          </div>
        </div>

        {/* ── TRANSCRIPT PANEL ────────────────────────────────────────── */}
        <div className="hidden md:flex flex-shrink-0 w-72 xl:w-80 border-l border-white/5 bg-gray-900 flex-col">
              {/* Panel header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-200">Live Transcript</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{transcript.length} exchanges</span>
                    <button
                      onClick={() => setShowTranscriptMobile(false)}
                      className="md:hidden w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300"
                    >✕</button>
                  </div>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Question {questionCount} of ~{estimatedTotal}</span>
                    <span>{Math.round((questionCount / estimatedTotal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                      animate={{ width: `${Math.min(100, (questionCount / estimatedTotal) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                <AnimatePresence initial={false}>
                  {transcript.map(entry => {
                    if (entry.role === 'user') {
                      return (
                        <motion.div key={entry.id}
                          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                          className="flex gap-2 justify-end"
                        >
                          <div className="bg-purple-900/50 border border-purple-500/30 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[82%]">
                            <p className="text-xs text-gray-200 leading-relaxed">{entry.text}</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            Y
                          </div>
                        </motion.div>
                      )
                    }
                    if (entry.role === 'feedback') {
                      return (
                        <motion.div key={entry.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-blue-900/25 border border-blue-500/25 rounded-xl px-3 py-2"
                        >
                          <span className="text-xs text-blue-400 font-medium">💡 Feedback</span>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{entry.text}</p>
                        </motion.div>
                      )
                    }
                    // interviewer question
                    return (
                      <motion.div key={entry.id}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {entry.speakerAvatar}
                        </div>
                        <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[82%]">
                          <span className="text-xs text-purple-400 font-medium">Question</span>
                          <p className="text-xs text-gray-200 mt-0.5 leading-relaxed">{entry.text}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Live caption preview */}
                {liveCaption && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {currentInterviewer.avatar}
                    </div>
                    <div className="bg-gray-800/70 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[82%] border border-purple-500/20">
                      <span className="text-xs text-purple-400 font-medium">{currentInterviewer.name}</span>
                      <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                        {liveCaption}
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.9 }}>▌</motion.span>
                      </p>
                    </div>
                  </motion.div>
                )}

                <div ref={transcriptBottomRef} />
              </div>

              {/* User tile at bottom of transcript panel */}
              <div className="flex-shrink-0 border-t border-white/5 px-4 py-3">
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  isUserRecording ? 'bg-red-500/10 border border-red-500/30' :
                  isUserProcessing ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  'bg-gray-800/50 border border-white/5'
                }`}>
                  <div className="relative">
                    {isUserRecording && (
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute inset-0 rounded-full bg-red-500" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-base relative z-10">🧑</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-300">You</div>
                    <div className={`text-xs ${isUserRecording ? 'text-red-400' : isUserProcessing ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {isUserRecording ? 'Recording...' : isUserProcessing ? 'Processing...' : 'Waiting'}
                    </div>
                  </div>
                  {isUserRecording
                    ? <Mic className="w-4 h-4 text-red-400 flex-shrink-0" />
                    : <MicOff className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                </div>
              </div>
        </div>

        {/* ── MOBILE TRANSCRIPT OVERLAY ───────────────────────────────── */}
        <AnimatePresence>
          {showTranscriptMobile && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-gray-900 border-l border-white/10 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-gray-200">Live Transcript</h3>
                <button onClick={() => setShowTranscriptMobile(false)} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 text-xs text-gray-400">
                {transcript.map(e => <div key={e.id} className="mb-2"><span className="font-medium text-gray-300">{e.speakerName}: </span>{e.text}</div>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
