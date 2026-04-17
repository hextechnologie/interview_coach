'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, LoadingSpinner, Badge } from '@/components/ui'
import { supabase, InterviewSession } from '@/lib/supabase'
import {
  Sparkles,
  LogOut,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  CreditCard,
  Trash2,
  Flame,
  ArrowRight,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const DAILY_TIPS = [
  'Use the STAR method to keep your answers structured and memorable.',
  'Add numbers and outcomes to prove the impact of your work.',
  'Take a short pause before answering to sound more confident.',
  'Keep each answer focused on one strong example instead of many weak ones.',
]

function calculateStreak(completedSessions: InterviewSession[]) {
  if (completedSessions.length === 0) return 0

  const completedDates = new Set(
    completedSessions.map((session) =>
      format(new Date(session.completed_at || session.created_at), 'yyyy-MM-dd')
    )
  )

  let streak = 0
  let cursor = new Date()

  if (!completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1)
  }

  while (completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }

  return streak
}

function getInterviewType(session: InterviewSession) {
  return session.interview_config?.interviewType || 'Mixed'
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    interviewsThisMonth: 0,
    streakDays: 0,
  })
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])


  const fetchDashboardData = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (sessionsError) throw sessionsError

      const allSessions = (sessionsData || []) as InterviewSession[]
      setSessions(allSessions)

      const completed = allSessions.filter((s) => s.status === 'completed')
      const avgScore = completed.length
        ? completed.reduce((sum, s) => sum + Number(s.overall_score || 0), 0) / completed.length
        : 0

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const interviewsThisMonth = allSessions.filter(
        (s) => new Date(s.created_at) >= monthStart
      ).length

      setStats({
        totalInterviews: allSessions.length,
        avgScore: Math.round(avgScore * 10) / 10,
        interviewsThisMonth,
        streakDays: calculateStreak(completed),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInterview = async (sessionId: string) => {
    const confirmed = window.confirm(
      'Delete this interview? This action cannot be undone and credits will not be refunded.'
    )

    if (!confirmed) return

    setDeletingId(sessionId)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('Session expired. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/interview/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete interview')
        return
      }

      await fetchDashboardData()
      alert('Interview deleted. Credits were not refunded.')
    } catch (error) {
      console.error('Error deleting interview:', error)
      alert('Failed to delete interview')
    } finally {
      setDeletingId(null)
    }
  }

  const chartData = useMemo(() => {
    return sessions
      .filter((session) => session.status === 'completed' && typeof session.overall_score === 'number')
      .slice(0, 7)
      .reverse()
      .map((session) => ({
        date: format(new Date(session.completed_at || session.created_at), 'MMM d'),
        score: Number(session.overall_score || 0),
      }))
  }, [sessions])

  const dailyTip = useMemo(() => {
    return DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]
  }, [])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !profile) return null

  const canStartInterview = profile.interviews_used_this_month < profile.interviews_limit

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  await refreshProfile()
                  window.location.reload()
                }}
              >
                Refresh
              </Button>
              <Link href="/pricing">
                <Button variant="outline" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)} Plan
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile.full_name || 'there'}!
            </h1>
            <p className="text-gray-400 text-lg">
              You have used {profile.interviews_used_this_month} of {profile.interviews_limit === 999999 ? '∞' : profile.interviews_limit} interviews this month.
            </p>
          </div>
          <Link href="/interview/setup">
            <Button variant="primary" className="gap-2 text-lg">
              <Plus className="w-5 h-5" />
              Quick Start Interview
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Interviews Done</p>
                <p className="text-3xl font-bold">{stats.totalInterviews}</p>
              </div>
              <div className="w-11 h-11 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Average Score</p>
                <p className="text-3xl font-bold">{stats.avgScore}/10</p>
              </div>
              <div className="w-11 h-11 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Interviews This Month</p>
                <p className="text-3xl font-bold">{stats.interviewsThisMonth}</p>
              </div>
              <div className="w-11 h-11 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Streak (days)</p>
                <p className="text-3xl font-bold">{stats.streakDays}</p>
              </div>
              <div className="w-11 h-11 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Progress Overview</h2>
                  <p className="text-gray-400 text-sm">Your last 7 completed interview scores</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis domain={[0, 10]} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  Complete a few interviews to unlock your score trend chart.
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Recent Sessions</h2>
                  <p className="text-gray-400 text-sm">Track your latest practice sessions</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No interviews yet! Start your first mock interview</h3>
                  <p className="text-gray-400 mb-6">Begin practicing now and unlock AI-powered feedback on every answer.</p>
                  <Link href="/interview/setup">
                    <Button variant="primary" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Start Your First Interview
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-gray-400">
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Job Role</th>
                        <th className="py-3 pr-4">Level</th>
                        <th className="py-3 pr-4">Score</th>
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 10).map((session) => (
                        <tr key={session.id} className="border-b border-border/50 last:border-0">
                          <td className="py-4 pr-4 text-gray-300">
                            {format(new Date(session.created_at), 'MMM dd, yyyy')}
                          </td>
                          <td className="py-4 pr-4 font-medium">{session.job_role}</td>
                          <td className="py-4 pr-4">
                            <Badge variant="default">{session.difficulty_level}</Badge>
                          </td>
                          <td className="py-4 pr-4">
                            {session.overall_score ? (
                              <span className="text-primary font-semibold">{session.overall_score}/10</span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-4 pr-4">
                            <Badge variant="default">{getInterviewType(session)}</Badge>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex flex-col sm:flex-row items-end justify-end gap-2">
                              <Button
                                variant="danger"
                                className="px-3 py-2 text-xs gap-1"
                                onClick={() => handleDeleteInterview(session.id)}
                                loading={deletingId === session.id}
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>

                              <Link href={session.status === 'completed' ? `/interview/summary/${session.id}` : `/interview/${session.id}`}>
                                <Button variant="outline" className="px-3 py-2 text-xs gap-1">
                                  {session.status === 'completed' ? 'View' : 'Continue'}
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Credits are not refunded.</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold mb-3">Quick Start</h2>
              <p className="text-gray-400 mb-4">
                Jump into a fresh interview tailored to your role and experience.
              </p>
              {canStartInterview ? (
                <Link href="/interview/setup">
                  <Button variant="primary" fullWidth className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Interview Setup
                  </Button>
                </Link>
              ) : (
                <Link href="/pricing">
                  <Button variant="primary" fullWidth>
                    Upgrade to Continue
                  </Button>
                </Link>
              )}
            </Card>

            <Card>
              <h2 className="text-2xl font-bold mb-4">Daily Tip</h2>
              <div className="rounded-xl border border-border p-4 bg-background/40">
                <p className="text-primary text-xs font-semibold mb-2">TODAY’S INTERVIEW TIP</p>
                <p className="text-sm text-gray-300">{dailyTip}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
