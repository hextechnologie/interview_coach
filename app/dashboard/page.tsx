'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, LoadingSpinner, Badge } from '@/components/ui'
import { supabase, InterviewSession } from '@/lib/supabase'
import { Sparkles, LogOut, TrendingUp, Award, Calendar, Plus, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    completedThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

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
      // Fetch recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (sessionsError) throw sessionsError

      setSessions(sessionsData || [])

      // Calculate stats
      const completed = sessionsData?.filter((s) => s.status === 'completed') || []
      const avgScore = completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.overall_score || 0), 0) / completed.length
        : 0

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const completedThisMonth = sessionsData?.filter(
        (s) => s.status === 'completed' && new Date(s.created_at) >= thisMonth
      ).length || 0

      setStats({
        totalInterviews: completed.length,
        avgScore: Math.round(avgScore * 10) / 10,
        completedThisMonth,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            <div className="flex items-center gap-4">
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

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile.full_name || 'there'}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            You've used {profile.interviews_used_this_month} of {profile.interviews_limit === 999999 ? '∞' : profile.interviews_limit} interviews this month
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Interviews</p>
                <p className="text-4xl font-bold">{stats.totalInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Average Score</p>
                <p className="text-4xl font-bold">{stats.avgScore || 0}/10</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">This Month</p>
                <p className="text-4xl font-bold">{stats.completedThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Start Interview Button */}
        <div className="mb-12">
          <Card className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready for Your Next Interview?</h2>
            <p className="text-gray-400 mb-8">
              {canStartInterview
                ? 'Start a new mock interview and get AI-powered feedback'
                : 'You\'ve reached your interview limit. Upgrade to continue practicing.'}
            </p>
            {canStartInterview ? (
              <Link href="/interview/setup">
                <Button variant="primary" className="text-lg gap-2">
                  <Plus className="w-5 h-5" />
                  Start New Interview
                </Button>
              </Link>
            ) : (
              <Link href="/pricing">
                <Button variant="primary" className="text-lg">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </Card>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Interview Sessions</h2>
          {sessions.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-400">No interview sessions yet. Start your first one above!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} hover>
                  <Link href={session.status === 'completed' ? `/interview/summary/${session.id}` : `/interview/${session.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{session.job_role}</h3>
                          <Badge variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'default'}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="default">{session.difficulty_level}</Badge>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {format(new Date(session.created_at), 'MMM dd, yyyy • hh:mm a')}
                        </p>
                      </div>
                      {session.status === 'completed' && session.overall_score && (
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{session.overall_score}/10</p>
                          <p className="text-gray-400 text-sm">Overall Score</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
