'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
import { motion } from 'framer-motion'
import { Linkedin } from 'lucide-react'

interface VoiceSession {
  id: string
  user_id: string
  mode: string
  interviewers: string[]
  duration_minutes: number
  actual_duration_minutes: number
  credits_charged: number
  started_at: string
  ended_at: string
  status: string
  is_free: boolean
}

interface QuestionAnswer {
  id: string
  session_id: string
  interviewer_id: string
  question: string
  answer: string | null
  feedback: string | null
  score: number
  asked_at: string
  feedback_data?: FeedbackData | null
  strengths?: string[] | null
  improvements?: string[] | null
}

interface FeedbackData {
  strengths?: string[]
  improvements?: string[]
  weaknesses?: string[]
}

interface InterviewerStats {
  interviewer: Interviewer
  questions: QuestionAnswer[]
  averageScore: number
}

export default function VoiceInterviewSummary({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [qaRecords, setQaRecords] = useState<QuestionAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    async function fetchResults() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        if (!authSession) {
          router.push('/login')
          return
        }

        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('id', params.sessionId)
          .eq('user_id', authSession.user.id)
          .single()

        if (sessionError || !sessionData) {
          setError('Session not found')
          setLoading(false)
          return
        }

        // Fetch Q&A records
        const { data: qaData, error: qaError } = await supabase
          .from('voice_session_qa')
          .select('*')
          .eq('session_id', params.sessionId)
          .order('asked_at', { ascending: true })

        if (qaError) {
          setError('Failed to load results')
          setLoading(false)
          return
        }

        setSession(sessionData)
        setQaRecords(qaData || [])
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch results:', err)
        setError('Failed to load results')
        setLoading(false)
      }
    }

    fetchResults()
  }, [params.sessionId, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Results</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const averageScore = qaRecords.length > 0
    ? qaRecords.reduce((sum, qa) => sum + Number(qa.score || 0), 0) / qaRecords.length
    : 0

  // Group by interviewer
  const interviewerStats: InterviewerStats[] = session.interviewers.map(interviewerId => {
    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    if (!interviewer) return null

    const questions = qaRecords.filter(qa => qa.interviewer_id === interviewerId)
    const averageScore = questions.length > 0
      ? questions.reduce((sum, qa) => sum + Number(qa.score || 0), 0) / questions.length
      : 0

    return {
      interviewer,
      questions,
      averageScore
    }
  }).filter(Boolean) as InterviewerStats[]

  function getScoreColor(score: number): string {
    if (score >= 8) return '#22c55e'
    if (score >= 6) return '#eab308'
    if (score >= 4) return '#f97316'
    return '#ef4444'
  }

  function getScoreTextClass(score: number): string {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    if (score >= 4) return 'text-orange-400'
    return 'text-red-400'
  }

  function getScoreLabel(score: number): string {
    if (score >= 9) return 'Excellent! 🏆'
    if (score >= 8) return 'Very Good! 👏'
    if (score >= 7) return 'Good Job! 👍'
    if (score >= 6) return 'Above Average'
    if (score >= 5) return 'Average'
    if (score >= 4) return 'Needs Improvement'
    if (score >= 3) return 'Needs Work'
    return 'Keep Practicing 💪'
  }

  function cleanQuestion(text: string | null | undefined): string {
    if (!text || typeof text !== 'string') return ''
    const prefixes = [
      /^got it[.,!]?\s*/i,
      /^good answer[.,!]?\s*/i,
      /^great answer[.,!]?\s*/i,
      /^interesting[.,!]?\s*/i,
      /^i see[.,!]?\s*/i,
      /^noted[.,!]?\s*/i,
      /^perfect[.,!]?\s*/i,
      /^excellent[.,!]?\s*/i,
      /^that'?s? (correct|right|great|good)[.,!]?\s*/i,
    ]
    let cleaned = text.trim()
    for (const prefix of prefixes) {
      while (prefix.test(cleaned)) {
        cleaned = cleaned.replace(prefix, '').trim()
      }
    }
    if (!cleaned) return ''
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  function getBarHeight(score: number): number {
    const MIN_HEIGHT = 24
    const MAX_HEIGHT = 80
    const safeScore = Number.isFinite(score) ? score : 1
    const normalized = Math.min(10, Math.max(1, safeScore || 1))
    return MIN_HEIGHT + ((normalized - 1) / 9) * (MAX_HEIGHT - MIN_HEIGHT)
  }

  function downloadTranscript() {
    const transcript = qaRecords.map((qa, index) => {
      const interviewer = INTERVIEWERS.find(i => i.id === qa.interviewer_id)
      return `
Question ${index + 1} (${interviewer?.name || 'Interviewer'})
${'-'.repeat(50)}
${qa.question}

Your Answer:
${qa.answer}

Feedback (Score: ${qa.score}/10):
${qa.feedback}

${'='.repeat(50)}
      `.trim()
    }).join('\n\n')

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-transcript-${params.sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function parseFeedbackData(record: QuestionAnswer): FeedbackData {
    if (Array.isArray(record.strengths) || Array.isArray(record.improvements)) {
      return {
        strengths: Array.isArray(record.strengths) ? record.strengths : [],
        improvements: Array.isArray(record.improvements) ? record.improvements : [],
      }
    }

    if (record.feedback_data && typeof record.feedback_data === 'object') {
      return record.feedback_data
    }

    if (!record.feedback) return {}

    const raw = record.feedback.trim()
    if (!raw.startsWith('{')) return {}

    try {
      const parsed = JSON.parse(raw) as FeedbackData
      return parsed
    } catch {
      return {}
    }
  }

  function cleanFeedbackText(feedback: string | null): string {
    if (!feedback) return ''
    return feedback.replace(/^["']|["']$/g, '').trim()
  }

  const questionScores = qaRecords.map((qa) => Number(qa.score || 0))
  const qaWithFeedbackData = qaRecords.map((qa) => ({
    ...qa,
    feedbackData: parseFeedbackData(qa),
  }))

  const allStrengths = qaWithFeedbackData
    .flatMap((q) => q.feedbackData.strengths || [])
    .filter(Boolean)
    .slice(0, 3)

  const allImprovements = qaWithFeedbackData
    .flatMap((q) => q.feedbackData.improvements || q.feedbackData.weaknesses || [])
    .filter(Boolean)
    .slice(0, 3)

  const getPracticeRecommendations = (records: QuestionAnswer[]) => {
    const weakQuestions = records.filter((q) => (q.score || 0) < 6)
    const hasLowScores = weakQuestions.length > 0

    return [
      {
        icon: '🎤',
        title: 'Voice Clarity',
        description: hasLowScores ? 'Practice speaking more concisely' : 'Keep your answers crisp and focused',
      },
      {
        icon: '⭐',
        title: 'STAR Method',
        description: 'Structure answers with concrete examples',
      },
      {
        icon: '🔢',
        title: 'Add Numbers',
        description: 'Quantify your impact with measurable outcomes',
      },
    ]
  }

  const practiceRecommendations = getPracticeRecommendations(qaRecords)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      setAnimatedScore(Math.max(0, Math.min(10, averageScore)))
      return
    }

    const target = Math.max(0, Math.min(10, averageScore))
    const durationMs = 1200
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now()

    const tick = (now: number) => {
      const nowTs = typeof performance !== 'undefined' ? now : Date.now()
      const progress = Math.min(1, (nowTs - start) / durationMs)
      // Ease-out cubic for smoother finish.
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(target * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }

    setAnimatedScore(0)
    requestAnimationFrame(tick)
  }, [averageScore])

  function shareOnLinkedIn() {
    const score = averageScore.toFixed(1)
    const text = `I just completed an AI mock interview and scored ${score}/10! 🎯 Practicing with Interview Coach to land my dream job. #InterviewPrep #AI`
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://interview-coach-tau.vercel.app')}&summary=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Interview Complete! 🎉</h1>
          <p className="text-gray-400">
            {new Date(session.started_at).toLocaleDateString()} • {qaRecords.length} questions answered
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 mb-8"
        >
          <div className="relative flex flex-col items-center py-2">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="10" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={getScoreColor(averageScore)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="339"
                  initial={{ strokeDashoffset: 339 }}
                  animate={{ strokeDashoffset: 339 - (averageScore / 10) * 339 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className={`text-5xl font-black ${getScoreTextClass(averageScore)}`}
                >
                  {animatedScore.toFixed(1)}
                </motion.span>
                <span className="text-gray-400 text-sm font-medium">/10</span>
              </div>
            </div>

            <h2 className={`text-2xl font-bold mb-1 ${getScoreTextClass(averageScore)}`}>
              {getScoreLabel(averageScore)}
            </h2>
            <p className="text-gray-400 text-sm">
              Based on {qaRecords.length} questions answered
            </p>

            <div className="flex gap-2 mt-4 items-end">
              {questionScores.map((s, i) => (
                <div key={`${i}-${s}`} className="flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
                    className="text-xs font-bold"
                    style={{ color: getScoreColor(s) }}
                  >
                    {s}
                  </motion.span>
                  <motion.div
                    className="w-10 rounded-t-md"
                    initial={{ height: 0, opacity: 0.6 }}
                    animate={{ height: getBarHeight(s), opacity: 1 }}
                    transition={{ duration: 0.75, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                    style={{
                      backgroundColor: getScoreColor(s),
                    }}
                  />
                  <span className="text-xs text-gray-400">Q{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{qaRecords.length}</div>
            <div className="text-sm text-gray-400">Questions</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{session.actual_duration_minutes} min</div>
            <div className="text-sm text-gray-400">Duration</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {session.is_free ? 'Free' : `${session.credits_charged} credits`}
            </div>
            <div className="text-sm text-gray-400">Cost</div>
          </div>
        </motion.div>

        {/* Strengths and Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-green-950/30 border border-green-500/30 rounded-2xl p-5">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>✅</span> Your Strengths
            </h3>
            <ul className="space-y-2">
              {allStrengths.map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </li>
              ))}
              {allStrengths.length === 0 && (
                <li className="text-gray-500 text-sm">
                  Complete more interviews to surface strengths
                </li>
              )}
            </ul>
          </div>

          <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-5">
            <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
              <span>📈</span> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {allImprovements.map((imp, i) => (
                <li key={`${imp}-${i}`} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-300 text-sm">{imp}</span>
                </li>
              ))}
              {allImprovements.length === 0 && (
                <li className="text-gray-500 text-sm">
                  Keep practicing to get richer improvement insights
                </li>
              )}
            </ul>
          </div>
        </motion.div>

        {/* Per-Interviewer Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Performance by Interviewer</h2>
          <div className="space-y-4">
            {interviewerStats.map((stats) => (
              <div key={stats.interviewer.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                      {stats.interviewer.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{stats.interviewer.name}</div>
                      <div className="text-sm text-gray-400">{stats.interviewer.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                      {stats.averageScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">{stats.questions.length} questions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Q&A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Question & Answer Details</h2>
          <div className="space-y-6">
            {qaRecords.map((qa, index) => {
              const interviewer = INTERVIEWERS.find(i => i.id === qa.interviewer_id)
              const scoreClasses = qa.score >= 7
                ? 'bg-green-900/40 border-green-500/40 text-green-400'
                : qa.score >= 6
                  ? 'bg-yellow-900/40 border-yellow-500/40 text-yellow-400'
                  : qa.score >= 4
                    ? 'bg-orange-900/40 border-orange-500/40 text-orange-400'
                  : 'bg-red-900/40 border-red-500/40 text-red-400'
              return (
                <div key={qa.id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center">
                        <span className="text-purple-300 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Question {index + 1}</p>
                        <p className="text-gray-400 text-xs">
                          {interviewer?.name || 'Interviewer'} · {interviewer?.title || 'AI Interviewer'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border font-bold text-sm ${scoreClasses}`}>
                      {qa.score}/10
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Question</p>
                    <p className="text-gray-200 text-sm leading-relaxed bg-gray-900/40 rounded-lg p-3">
                      {cleanQuestion(qa.question)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Your Answer</p>
                    <p className="text-gray-300 text-sm leading-relaxed bg-purple-950/20 border border-purple-500/20 rounded-lg p-3">
                      {qa.answer || 'No answer recorded'}
                    </p>
                  </div>

                  {qa.feedback && (
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">💡 Coach Feedback</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {cleanFeedbackText(qa.feedback)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Practice Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="bg-gray-800/40 border border-purple-500/20 rounded-2xl p-5 mb-6"
        >
          <h3 className="text-purple-400 font-bold mb-3">🎯 What to Practice Next</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {practiceRecommendations.map((rec) => (
              <div key={rec.title} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <span className="text-2xl mb-2 block">{rec.icon}</span>
                <p className="text-white text-sm font-medium">{rec.title}</p>
                <p className="text-gray-400 text-xs mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/interview/setup')}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            Practice Again →
          </button>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <button
            onClick={downloadTranscript}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
          >
            📥 Download Transcript
          </button>

          <button
            onClick={() => router.push('/interview/setup')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition text-sm"
          >
            🎯 Practice Again
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
          >
            🏠 Dashboard
          </button>

          <button
            onClick={shareOnLinkedIn}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white transition text-sm font-medium"
          >
            <Linkedin className="w-4 h-4" />
            Share
          </button>
        </motion.div>
      </div>
    </div>
  )
}
