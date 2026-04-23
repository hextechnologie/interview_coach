'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui'
import { INTERVIEWERS, type Interviewer } from '@/components/interview/VoicePanelSelector'

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
  answer: string
  feedback: string
  score: number
  asked_at: string
}

interface InterviewerStats {
  interviewer: Interviewer
  questions: QuestionAnswer[]
  averageScore: number
}

export default function VoiceInterviewSummary({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [qaRecords, setQaRecords] = useState<QuestionAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const averageScore = qaRecords.length > 0
    ? qaRecords.reduce((sum, qa) => sum + (qa.score || 0), 0) / qaRecords.length
    : 0

  // Group by interviewer
  const interviewerStats: InterviewerStats[] = session.interviewers.map(interviewerId => {
    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    if (!interviewer) return null

    const questions = qaRecords.filter(qa => qa.interviewer_id === interviewerId)
    const averageScore = questions.length > 0
      ? questions.reduce((sum, qa) => sum + (qa.score || 0), 0) / questions.length
      : 0

    return {
      interviewer,
      questions,
      averageScore
    }
  }).filter(Boolean) as InterviewerStats[]

  function getScoreColor(score: number): string {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getScoreLabel(score: number): string {
    if (score >= 9) return 'Excellent'
    if (score >= 8) return 'Very Good'
    if (score >= 7) return 'Good'
    if (score >= 6) return 'Fair'
    if (score >= 5) return 'Needs Improvement'
    return 'Poor'
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-8 mb-8 text-center">
          <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Overall Performance</div>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(averageScore)}`}>
            {averageScore.toFixed(1)}/10
          </div>
          <div className="text-xl text-gray-300">{getScoreLabel(averageScore)}</div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-3 gap-4 mb-8">
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
        </div>

        {/* Per-Interviewer Performance */}
        <div className="mb-8">
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
        </div>

        {/* Detailed Q&A */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Question & Answer Details</h2>
          <div className="space-y-6">
            {qaRecords.map((qa, index) => {
              const interviewer = INTERVIEWERS.find(i => i.id === qa.interviewer_id)
              return (
                <div key={qa.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {interviewer?.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">Question {index + 1}</div>
                        <div className="text-sm text-gray-400">{interviewer?.name}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(qa.score)}`}>
                      {qa.score}/10
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Question:</div>
                    <div className="text-gray-200">{qa.question}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Your Answer:</div>
                    <div className="text-gray-300 bg-gray-900 rounded p-3">{qa.answer}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Feedback:</div>
                    <div className="text-gray-200 italic">"{qa.feedback}"</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={downloadTranscript} variant="secondary">
            Download Transcript
          </Button>
          <Button onClick={() => router.push('/interview/setup')}>
            Start New Interview
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="secondary">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
