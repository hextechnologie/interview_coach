'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { motion } from 'framer-motion'
import {
  Check,
  MessageSquare,
  Mic,
  PhoneOff,
  Shield,
  Sparkles,
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

/** Fixed bar heights for Marcus tile wave (avoid Math.random on render). */
const VOICE_TILE_WAVE_HEIGHTS = [
  10, 16, 8, 20, 12, 14, 6, 18, 11, 15, 9, 17, 7, 13, 19, 10, 14, 8, 16, 12,
] as const

const TRANSCRIPT_HEADER_BARS = [3, 5, 4, 6, 3] as const
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

type VoiceUiLang = 'en' | 'fr' | 'ar' | 'es'

const TOOLBAR_LABELS: Record<VoiceUiLang, {
  participants: string
  microphone: string
  mic: string
  camera: string
  chat: string
  more: string
  stop: string
  leave: string
  speaking: string
  listening: string
  processing: string
  processingShort: string
  waiting: string
  waitingShort: string
  badgeSpeaking: string
  badgeListening: string
  badgeWaiting: string
  transcribing: string
  gettingFeedback: string
  hearError: string
  confirmEnd: string
  liveTranscript: string
  transcriptLive: string
  question: string
  feedback: string
  you: string
  emptyTranscript: string
  aiInterviewer: string
}> = {
  en: {
    participants: 'Participants',
    microphone: 'Microphone',
    mic: 'Mic',
    camera: 'Camera',
    chat: 'Chat',
    more: 'More',
    stop: 'Stop',
    leave: 'Leave',
    speaking: 'Speaking...',
    listening: 'Listening...',
    processing: 'Processing your answer...',
    processingShort: 'Processing...',
    waiting: 'Waiting for your answer...',
    waitingShort: 'Waiting...',
    badgeSpeaking: 'Speaking',
    badgeListening: 'Listening',
    badgeWaiting: 'Waiting',
    transcribing: 'Transcribing...',
    gettingFeedback: 'Getting feedback...',
    hearError: "Couldn't hear you — please try again.",
    confirmEnd: 'End interview early?',
    liveTranscript: 'Live Transcript',
    transcriptLive: 'Transcript live...',
    question: 'Question',
    feedback: 'Feedback',
    you: 'You',
    emptyTranscript: 'No messages yet',
    aiInterviewer: 'AI Interviewer',
  },
  fr: {
    participants: 'Participants',
    microphone: 'Microphone',
    mic: 'Micro',
    camera: 'Caméra',
    chat: 'Discussion',
    more: 'Plus',
    stop: 'Arrêter',
    leave: 'Quitter',
    speaking: 'En train de parler...',
    listening: "À l'écoute...",
    processing: 'Traitement de votre réponse...',
    processingShort: 'Traitement...',
    waiting: 'En attente de votre réponse...',
    waitingShort: 'En attente...',
    badgeSpeaking: 'Parole',
    badgeListening: 'Écoute',
    badgeWaiting: 'Attente',
    transcribing: 'Transcription en cours...',
    gettingFeedback: 'Obtention du retour...',
    hearError: "Je n'ai pas entendu — réessayez.",
    confirmEnd: "Mettre fin à l'entretien maintenant ?",
    liveTranscript: 'Transcription en direct',
    transcriptLive: 'Transcription en cours...',
    question: 'Question',
    feedback: 'Retour',
    you: 'Vous',
    emptyTranscript: 'Aucun message pour l’instant',
    aiInterviewer: 'Interviewer IA',
  },
  ar: {
    participants: 'المشاركون',
    microphone: 'الميكروفون',
    mic: 'ميكروفون',
    camera: 'الكاميرا',
    chat: 'محادثة',
    more: 'المزيد',
    stop: 'إيقاف',
    leave: 'مغادرة',
    speaking: 'يتحدث...',
    listening: 'يستمع...',
    processing: 'جاري معالجة إجابتك...',
    processingShort: 'جاري المعالجة...',
    waiting: 'في انتظار إجابتك...',
    waitingShort: 'في الانتظار...',
    badgeSpeaking: 'يتحدث',
    badgeListening: 'يستمع',
    badgeWaiting: 'انتظار',
    transcribing: 'جاري النسخ...',
    gettingFeedback: 'جاري تلقي الملاحظات...',
    hearError: 'لم نسمعك — حاول مرة أخرى.',
    confirmEnd: 'إنهاء المقابلة مبكراً؟',
    liveTranscript: 'النص المباشر',
    transcriptLive: 'النص جارٍ...',
    question: 'سؤال',
    feedback: 'ملاحظات',
    you: 'أنت',
    emptyTranscript: 'لا توجد رسائل بعد',
    aiInterviewer: 'مُحاور بالذكاء الاصطناعي',
  },
  es: {
    participants: 'Participantes',
    microphone: 'Micrófono',
    mic: 'Micrófono',
    camera: 'Cámara',
    chat: 'Chat',
    more: 'Más',
    stop: 'Detener',
    leave: 'Salir',
    speaking: 'Hablando...',
    listening: 'Escuchando...',
    processing: 'Procesando tu respuesta...',
    processingShort: 'Procesando...',
    waiting: 'Esperando tu respuesta...',
    waitingShort: 'Esperando...',
    badgeSpeaking: 'Hablando',
    badgeListening: 'Escuchando',
    badgeWaiting: 'Espera',
    transcribing: 'Transcribiendo...',
    gettingFeedback: 'Obteniendo comentarios...',
    hearError: 'No te oí — inténtalo de nuevo.',
    confirmEnd: '¿Terminar la entrevista ahora?',
    liveTranscript: 'Transcripción en vivo',
    transcriptLive: 'Transcripción en curso...',
    question: 'Pregunta',
    feedback: 'Comentario',
    you: 'Tú',
    emptyTranscript: 'Aún no hay mensajes',
    aiInterviewer: 'Entrevistador IA',
  },
}

function getVoiceUiLang(code: string | undefined): VoiceUiLang {
  if (code === 'fr' || code === 'ar' || code === 'es' || code === 'en') return code
  return 'en'
}

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
  const [ttsEnabled] = useState(true)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [currentPartialTranscript, setCurrentPartialTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [liveCaption, setLiveCaption] = useState('')
  const [showTranscript, setShowTranscript] = useState(true)
  const [currentQuestionEntryId, setCurrentQuestionEntryId] = useState<string | null>(null)

  // mic state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const isRecordingRef = useRef(false)
  const finalTranscriptRef = useRef('')
  const deepgramConnectionRef = useRef<{ send: (data: Blob) => void; finish: () => void; getReadyState: () => number } | null>(null)
  const silenceAudioContextRef = useRef<AudioContext | null>(null)
  const silenceAnimationRef = useRef<number | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const recordingStartRef = useRef(0)

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

  const t = useMemo(
    () => TOOLBAR_LABELS[getVoiceUiLang(session?.language)],
    [session?.language]
  )

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
  }, [transcript, liveCaption, currentPartialTranscript])

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    return () => {
      if (silenceAnimationRef.current !== null) cancelAnimationFrame(silenceAnimationRef.current)
      silenceAudioContextRef.current?.close().catch(() => undefined)
      deepgramConnectionRef.current?.finish()
    }
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
  async function speakText(text: string, voice: string, _speakerId: string, duringPhase: Phase) {
    setPhase(duringPhase)
    if (!ttsAvailable || !ttsEnabled) {
      await new Promise(r => setTimeout(r, 800))
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
      if (!res.ok) { setTtsAvailable(false); return }
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
        setTimeout(() => {
          void startRecording()
        }, 800)
      }
    } catch {
      setError('Failed to generate question.')
      setPhase('error')
    }
  }, [questionCount, maxQuestions, session, params.sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  function cleanupSilenceDetection() {
    if (silenceAnimationRef.current !== null) {
      cancelAnimationFrame(silenceAnimationRef.current)
      silenceAnimationRef.current = null
    }
    silenceAudioContextRef.current?.close().catch(() => undefined)
    silenceAudioContextRef.current = null
    silenceStartRef.current = null
    setAudioLevel(0)
  }

  function startSilenceDetection(stream: MediaStream) {
    cleanupSilenceDetection()
    const audioContext = new AudioContext()
    silenceAudioContextRef.current = audioContext

    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    analyser.fftSize = 256
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const SILENCE_THRESHOLD = 10
    const SILENCE_DURATION = 2000
    const MIN_RECORDING_TIME = 2000
    recordingStartRef.current = Date.now()
    silenceStartRef.current = null

    const checkSilence = () => {
      if (!isRecordingRef.current) {
        cleanupSilenceDetection()
        return
      }

      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      setAudioLevel(Math.min(average / 50, 1))

      const recordingDuration = Date.now() - recordingStartRef.current
      if (average < SILENCE_THRESHOLD) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now()
        } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION && recordingDuration > MIN_RECORDING_TIME) {
          stopRecording()
          cleanupSilenceDetection()
          return
        }
      } else {
        silenceStartRef.current = null
      }

      silenceAnimationRef.current = requestAnimationFrame(checkSilence)
    }

    silenceAnimationRef.current = requestAnimationFrame(checkSilence)
  }

  function startRealtimeTranscription(stream: MediaStream) {
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
    if (!apiKey) return

    const language = getVoiceUiLang(session?.language)
    const ws = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-2&language=${language}&smart_format=true&interim_results=true&utterance_end_ms=2000`,
      ['token', apiKey]
    )

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          channel?: { alternatives?: Array<{ transcript?: string }> }
          is_final?: boolean
          type?: string
        }
        if (data.type === 'UtteranceEnd') {
          stopRecording()
          return
        }
        const transcriptText = data.channel?.alternatives?.[0]?.transcript ?? ''
        if (!transcriptText.trim()) return
        if (data.is_final) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcriptText}`.trim()
          setCurrentPartialTranscript('')
        } else {
          setCurrentPartialTranscript(transcriptText)
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    }

    deepgramConnectionRef.current = {
      send: (data: Blob) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data)
      },
      finish: () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close()
      },
      getReadyState: () => ws.readyState,
    }
    streamRef.current = stream
  }

  // ── Microphone recording (auto-start after question audio) ─────────────────
  async function startRecording() {
    if (sessionEndedRef.current || mediaRecorderRef.current?.state === 'recording') return

    try {
      audioChunksRef.current = []
      finalTranscriptRef.current = ''
      setCurrentPartialTranscript('')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })
      streamRef.current = stream
      startSilenceDetection(stream)
      startRealtimeTranscription(stream)

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
          if (deepgramConnectionRef.current?.getReadyState() === 1) {
            deepgramConnectionRef.current.send(e.data)
          }
        }
      }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        cleanupSilenceDetection()
        deepgramConnectionRef.current?.finish()
        deepgramConnectionRef.current = null
        streamRef.current?.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
        setCurrentPartialTranscript('')
        void handleRecordingComplete(blob, finalTranscriptRef.current.trim())
      }
      mr.start(100)
      setIsRecording(true)
      setPhase('recording-answer')
    } catch (err) {
      console.error('Mic error:', err)
      toast.dismiss()
      toast.error('Microphone access required', { duration: 4000 })
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // ── Handle recording complete ──────────────────────────────────────────────
  async function handleRecordingComplete(audioBlob: Blob, deepgramTranscript?: string) {
    if (sessionEndedRef.current || !currentQuestion) return
    setPhase('processing-answer')

    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      if (!auth) return

      let transcribedText = deepgramTranscript ?? ''
      if (!transcribedText.trim()) {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'answer.webm')
        formData.append('sessionId', params.sessionId)

        const transcribeRes = await fetch('/api/interview/voice/transcribe', {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.access_token}` },
          body: formData,
        })
        if (transcribeRes.ok) transcribedText = (await transcribeRes.json()).transcript || ''
      }

      if (!transcribedText.trim()) {
        setPhase('waiting-for-answer')
        toast.error(t.hearError, { duration: 4000 })
        return
      }

      showUniqueToast('answer-recorded', () =>
        toast.success('Answer recorded!', { duration: 2000, icon: '✅', style: { background: '#065f46', color: '#fff', border: '1px solid #059669' } })
      )
      setCurrentQuestionEntryId(null) // question is now answered — show full text in transcript

      addToTranscript({
        role: 'user',
        speakerId: 'user',
        speakerName: t.you,
        speakerAvatar: '🧑',
        text: transcribedText,
      })

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
    stopRecording()
    cleanupSilenceDetection()
    deepgramConnectionRef.current?.finish()
    deepgramConnectionRef.current = null

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
  const isUserRecording = phase === 'recording-answer'
  const isUserProcessing = phase === 'processing-answer'
  const isAISpeaking = phase === 'speaking-question' || phase === 'speaking-feedback'
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
  const formatTime = (value: number): string => {
    const mins = Math.floor(value / 60).toString().padStart(2, '0')
    const secs = (value % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }
  const displayMessages = transcript.filter((entry) => !(entry.role === 'interviewer' && entry.id === currentQuestionEntryId))
  const questionText = currentQuestion ? stripMarkdown(currentQuestion.question) : ''
  const cleanedQuestionText = questionText.replace(/^(Got it|Good answer|Great answer|Interesting|I see|Noted|Perfect|Excellent)[.,!]?\s*/i, '')
  const isSpeaking = isAISpeaking
  const isRecordingUser = isUserRecording
  const isProcessing = isUserProcessing

  const badgeLabel = isSpeaking
    ? t.badgeSpeaking
    : isRecordingUser
      ? t.badgeListening
      : t.badgeWaiting

  const statusUnderName = isSpeaking
    ? t.speaking
    : isRecordingUser
      ? t.listening
      : isProcessing
        ? t.processingShort
        : t.waitingShort

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden text-gray-200"
      style={{ backgroundColor: '#0d0d1a' }}
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
      <header className="z-50 grid h-14 flex-shrink-0 grid-cols-3 items-center px-6">
        <div
          className="flex max-w-full items-center gap-2 justify-self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Shield className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="max-w-[10rem] truncate text-sm font-medium text-gray-200 sm:max-w-[14rem]">
            {userName}
          </span>
        </div>
        <div className="flex justify-center justify-self-center">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                timeRemaining < 60 ? 'animate-pulse bg-red-500' : timeRemaining < 120 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
            <span className="font-mono text-sm font-semibold tabular-nums text-gray-200">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <div className="w-32 justify-self-end" aria-hidden />
      </header>

      {/* Stage + transcript column */}
      <div className="relative flex min-h-0 flex-1 flex-row">
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6">
          <div
            className="relative flex-shrink-0 overflow-hidden rounded-2xl"
            style={{
              width: '540px',
              height: '380px',
              backgroundColor: '#13132a',
              border: '1px solid rgba(147, 51, 234, 0.4)',
              boxShadow: '0 0 40px rgba(147, 51, 234, 0.15)',
            }}
          >
            {/* Speaking / listening / waiting badge */}
            <div
              className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: 'rgba(147, 51, 234, 0.3)',
                border: '1px solid rgba(147, 51, 234, 0.5)',
              }}
            >
              <div className="flex items-end gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-purple-400"
                    style={{
                      height: isSpeaking ? `${[8, 12, 8][i]}px` : '4px',
                      animation: isSpeaking
                        ? `voice-badge-bounce 0.6s ease-in-out ${i * 0.1}s infinite alternate`
                        : 'none',
                      transition: 'height 0.2s',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-purple-300">{badgeLabel}</span>
            </div>

            <div
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <Sparkles className="h-4 w-4 text-gray-400" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pt-10">
              <div className="relative flex h-28 w-28 items-center justify-center">
                {isSpeaking && (
                  <div className="pointer-events-none absolute inset-0 scale-110 rounded-full border-2 border-purple-500/50 animate-ping" />
                )}
                <div
                  className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: '#1e1e3a',
                    border: isSpeaking
                      ? '2px solid rgba(147, 51, 234, 0.8)'
                      : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isSpeaking ? '0 0 30px rgba(147, 51, 234, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span className="text-5xl font-black text-white">{interviewerInitials || 'AI'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  {currentInterviewer.name} · {currentInterviewer.title}
                </span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              </div>

              <span className="text-sm text-gray-400">{statusUnderName}</span>

              {(isSpeaking || isRecordingUser) && (
                <div className="flex h-8 items-center gap-0.5">
                  {VOICE_TILE_WAVE_HEIGHTS.map((baseH, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full"
                      style={{
                        backgroundColor: isSpeaking ? '#7c3aed' : '#6b7280',
                        height: `${baseH}px`,
                        transformOrigin: 'bottom',
                        animation: `audioWave 0.5s ease-in-out ${i * 0.04}s infinite alternate`,
                        transition: 'height 0.1s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {currentQuestion && (
            <div
              className="rounded-xl px-6 py-4 text-center"
              style={{
                width: '540px',
                flexShrink: 0,
                backgroundColor: '#13132a',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                {t.question} {questionCount}
              </p>
              <p className="text-sm leading-relaxed text-white">{cleanedQuestionText || questionText}</p>
            </div>
          )}
        </main>

        {showTranscript && (
          <aside
            className="flex w-80 flex-shrink-0 flex-col"
            style={{ backgroundColor: '#0d0d1a', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex h-14 flex-shrink-0 items-center justify-between px-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-0.5">
                  {TRANSCRIPT_HEADER_BARS.map((h, i) => (
                    <div key={i} className="w-0.5 rounded-full bg-purple-400" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <h3 className="font-semibold text-white">{t.liveTranscript}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="rounded p-1 text-gray-400 hover:text-white"
                aria-label="Close transcript"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {displayMessages.length === 0 && (
                <div className="flex h-32 items-center justify-center">
                  <p className="px-2 text-center text-sm text-gray-500">{t.emptyTranscript}</p>
                </div>
              )}
              {displayMessages.map((msg) => {
                const isUser = msg.role === 'user'
                const isFeedback = msg.role === 'feedback'
                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                        <span className="text-xs font-bold text-white">
                          {(interviewerInitials || 'M').slice(0, 1)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'rounded-tr-sm bg-purple-600 text-white'
                          : isFeedback
                            ? 'rounded-tl-sm text-gray-200'
                            : 'rounded-tl-sm bg-gray-800/80 text-gray-100'
                      }`}
                      style={
                        isFeedback
                          ? {
                              backgroundColor: '#1a1a3a',
                              border: '1px solid rgba(147,51,234,0.3)',
                            }
                          : undefined
                      }
                    >
                      {isFeedback && (
                        <span className="mb-1 block text-xs font-semibold text-purple-400">{t.feedback}</span>
                      )}
                      {msg.text}
                    </div>
                    {isUser && (
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
                        <span className="text-xs font-bold text-white">{userInitials}</span>
                      </div>
                    )}
                  </div>
                )
              })}
              {currentPartialTranscript && (
                <div className="flex justify-end gap-3">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm border border-purple-500/30 bg-purple-600/50 px-4 py-3 text-sm italic leading-relaxed text-white/70">
                    {currentPartialTranscript}...
                  </div>
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
                    <span className="text-xs font-bold text-white">{userInitials}</span>
                  </div>
                </div>
              )}
              <div ref={transcriptBottomRef} />
            </div>
            <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="flex-1 text-sm text-gray-500">{t.transcriptLive}</span>
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom toolbar */}
      <footer
        className="flex h-16 flex-shrink-0 items-center justify-between px-8"
        style={{ backgroundColor: '#0d0d1a', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <Mic className={`h-5 w-5 ${isRecording ? 'text-red-400' : 'text-gray-400'}`} />
          {isRecording ? (
            <div className="flex h-4 items-end gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-red-400 transition-all"
                  style={{
                    height: `${Math.max(2, audioLevel * 16 * (0.5 + (i + 1) / 12))}px`,
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">{t.mic}</span>
          )}
          {isRecording && (
            <>
              <span className="text-sm text-red-400">Recording...</span>
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </>
          )}
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
              showTranscript ? 'bg-purple-500/10 text-purple-400' : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{t.chat}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm(t.confirmEnd)) handleEndSession('cancelled')
          }}
          className="flex min-w-[220px] items-center justify-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition hover:opacity-95 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #cf3f32 0%, #b12f26 100%)',
            boxShadow: '0 6px 22px rgba(192, 57, 43, 0.42), inset 0 1px 0 rgba(255,255,255,0.14)',
          }}
        >
          <PhoneOff className="h-5 w-5" />
          <span>{t.leave}</span>
        </button>
      </footer>
    </div>
  )
}
