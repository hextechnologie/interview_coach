'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Button, LoadingSpinner } from '@/components/ui'
import CoachNavbar from '@/components/CoachNavbar'
import { supabase, getFirstName } from '@/lib/supabase'
import { format, isWithinInterval, subMinutes, addMinutes } from 'date-fns'
import { Users, Star, DollarSign, CalendarCheck, MessageSquare, Video, Plus, ArrowRight, Clock, BookOpen } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type Booking = {
  id: string
  candidate_id: string
  scheduled_at: string | null
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  session_type: string | null
  candidate?: { full_name: string | null; email: string; avatar_url: string | null } | null
}

type Review = {
  id: string; rating: number; comment: string | null; created_at: string
  candidate?: { full_name: string | null; email: string } | null
}
type Earning = { id: string; net_amount: number; status: 'pending' | 'paid_out'; created_at: string }
type Stats = { totalClients: number; totalSessions: number; avgRating: number; monthEarnings: number }

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl p-5 border border-white/10 ${className}`} style={{ background: '#111827' }}>{children}</div>
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl p-5 border border-white/10 hover:border-purple-500/30 transition-colors" style={{ background: '#111827' }}>
      <div className="flex items-start justify-between">
        <div><p className="text-gray-400 text-xs mb-1">{label}</p><p className="text-2xl font-bold">{value}</p></div>
        <div className={`w-10 h-10 ${accent} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  )
}

function sessionTypeBadge(type: string | null) {
  const map: Record<string, string> = {
    'Mock Interview': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Feedback Review': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'CV Review': 'bg-green-500/20 text-green-300 border-green-500/30',
  }
  const cls = (type && map[type]) || 'bg-white/10 text-gray-300 border-white/10'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{type || 'Session'}</span>
}

function statusIcon(status: string) {
  if (status === 'confirmed') return '🟢'
  if (status === 'completed') return '✅'
  if (status === 'cancelled') return '❌'
  return '⏳'
}

export default function CoachDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'clients'>('upcoming')
  const displayName = getFirstName(profile?.full_name, user?.email)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
    if (!authLoading && user && profile && profile.user_type !== 'coach') router.replace('/dashboard')
  }, [authLoading, user, profile, router])

  useEffect(() => {
    if (!authLoading && user) fetchAll()
  }, [authLoading, user])

  const fetchAll = async () => {
    if (!user) return
    try {
      const [{ data: bData }, { data: rData }, { data: eData }] = await Promise.all([
        supabase.from('bookings').select('id, candidate_id, scheduled_at, duration_minutes, status, notes, session_type, candidate:profiles!bookings_candidate_id_fkey(full_name, email, avatar_url)').eq('coach_id', user.id).order('scheduled_at', { ascending: true }),
        supabase.from('reviews').select('id, rating, comment, created_at, candidate:profiles!reviews_candidate_id_fkey(full_name, email)').eq('coach_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('earnings').select('id, net_amount, status, created_at').eq('coach_id', user.id),
      ])
      setBookings((bData || []) as unknown as Booking[])
      setReviews((rData || []) as unknown as Review[])
      setEarnings((eData || []) as Earning[])
    } catch (err) { console.error('Coach dashboard fetch error:', err) }
    finally { setLoading(false) }
  }

  const stats: Stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed')
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEarnings = earnings.filter((e) => new Date(e.created_at) >= monthStart).reduce((sum, e) => sum + Number(e.net_amount), 0)
    const avgRating = reviews.length ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) : 0
    return { totalClients: new Set(bookings.map((b) => b.candidate_id).filter(Boolean)).size, totalSessions: completed.length, avgRating, monthEarnings }
  }, [bookings, earnings, reviews])

  const upcomingSessions = useMemo(() => bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending'), [bookings])

  const myClients = useMemo(() => {
    const seen = new Map<string, Booking>()
    bookings.forEach((b) => { if (!seen.has(b.candidate_id)) seen.set(b.candidate_id, b) })
    return Array.from(seen.values())
  }, [bookings])

  const earningsChartData = useMemo(() => {
    const months: Record<string, number> = {}
    earnings.forEach((e) => { const key = format(new Date(e.created_at), 'MMM yy'); months[key] = (months[key] || 0) + Number(e.net_amount) })
    return Object.entries(months).slice(-6).map(([month, amount]) => ({ month, amount }))
  }, [earnings])

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.net_amount), 0)
  const pendingEarnings = earnings.filter((e) => e.status === 'pending').reduce((sum, e) => sum + Number(e.net_amount), 0)

  const isJoinable = (scheduledAt: string | null) => {
    if (!scheduledAt) return false
    const t = new Date(scheduledAt)
    return isWithinInterval(new Date(), { start: subMinutes(t, 10), end: addMinutes(t, 60) })
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}><LoadingSpinner size="lg" /></div>
  }
  if (!user || !profile) return null

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1e' }}>
      <CoachNavbar />
      <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* WELCOME */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{displayName}</span>! 👋
            </h1>
            <p className="text-gray-400">Here's an overview of your coaching activity today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/coach/availability"><Button variant="outline" className="gap-2"><Clock className="w-4 h-4" /> Set Availability</Button></Link>
            <Link href="/coach/profile"><Button variant="primary" className="gap-2"><Plus className="w-4 h-4" /> Edit Profile</Button></Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Clients Coached" value={String(stats.totalClients)} icon={<Users className="w-5 h-5 text-purple-400" />} accent="bg-purple-500/20" />
          <StatCard label="Sessions Completed" value={String(stats.totalSessions)} icon={<CalendarCheck className="w-5 h-5 text-blue-400" />} accent="bg-blue-500/20" />
          <StatCard label="Avg Client Rating" value={stats.avgRating ? `${stats.avgRating} ⭐` : '—'} icon={<Star className="w-5 h-5 text-yellow-400" />} accent="bg-yellow-500/20" />
          <StatCard label="Earnings This Month" value={`$${stats.monthEarnings.toFixed(0)}`} icon={<DollarSign className="w-5 h-5 text-green-400" />} accent="bg-green-500/20" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">

            {/* SESSION MANAGER */}
            <DarkCard>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">Session Manager</h2>
                  <p className="text-gray-400 text-sm">Manage upcoming sessions and your client roster</p>
                </div>
                <div className="flex gap-2">
                  {(['upcoming', 'clients'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'border border-white/10 text-gray-300 hover:border-purple-500/40'}`}>
                      {tab === 'upcoming' ? `Upcoming (${upcomingSessions.length})` : `Clients (${myClients.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'upcoming' ? (
                upcomingSessions.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarCheck className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-300 font-semibold mb-1">No upcoming sessions yet</p>
                    <p className="text-gray-500 text-sm mb-4">Share your profile link with candidates to receive bookings.</p>
                    <Link href="/coach/availability"><Button variant="primary">Set Your Availability</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((b) => {
                      const candidateName = b.candidate?.full_name || b.candidate?.email || 'Candidate'
                      const sessionTime = b.scheduled_at ? new Date(b.scheduled_at) : null
                      const joinable = isJoinable(b.scheduled_at)
                      return (
                        <div key={b.id} className="rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors" style={{ background: '#0a0f1e' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0 uppercase">{candidateName.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-semibold">{candidateName}</p>
                                {sessionTypeBadge(b.session_type)}
                                <span className="text-xs text-gray-400">{statusIcon(b.status)} {b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                              </div>
                              <p className="text-sm text-gray-400">{sessionTime ? format(sessionTime, 'MMM d, yyyy · HH:mm') : 'Date TBD'} · {b.duration_minutes} min</p>
                              {b.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{b.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link href={`/coach/messages?candidate=${b.candidate_id}`}>
                                <button className="p-2 rounded-lg border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors" title="Chat">
                                  <MessageSquare className="w-4 h-4 text-blue-400" />
                                </button>
                              </Link>
                              {joinable ? (
                                <Link href={`/session/${b.id}`}>
                                  <Button variant="primary" className="text-xs px-3 py-1.5 gap-1"><Video className="w-3 h-3" /> Join</Button>
                                </Link>
                              ) : (
                                <button disabled className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-500 cursor-not-allowed">
                                  <Video className="w-3 h-3 inline mr-1" />Join
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              ) : (
                myClients.length === 0 ? (
                  <div className="py-10 text-center">
                    <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No clients yet. Complete sessions to build your roster.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {myClients.map((b) => {
                      const candidateName = b.candidate?.full_name || b.candidate?.email || 'Candidate'
                      const sessionCount = bookings.filter((x) => x.candidate_id === b.candidate_id).length
                      const lastB = bookings.filter((x) => x.candidate_id === b.candidate_id && x.status === 'completed').at(-1)
                      return (
                        <div key={b.candidate_id} className="rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors" style={{ background: '#0a0f1e' }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0 uppercase">{candidateName.charAt(0)}</div>
                            <div className="flex-1 min-w-0"><p className="font-semibold truncate">{candidateName}</p><p className="text-xs text-gray-400">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</p></div>
                          </div>
                          {lastB?.scheduled_at && <p className="text-xs text-gray-500 mb-3">Last session: {format(new Date(lastB.scheduled_at), 'MMM d, yyyy')}</p>}
                          <Link href={`/coach/messages?candidate=${b.candidate_id}`}>
                            <Button variant="outline" fullWidth className="text-xs gap-1"><MessageSquare className="w-3 h-3" /> Message</Button>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </DarkCard>

            {/* EARNINGS OVERVIEW */}
            <DarkCard>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">Earnings Overview</h2>
                  <p className="text-gray-400 text-sm">Your revenue over the last 6 months</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">Total: <span className="text-white font-semibold">${totalEarnings.toFixed(0)}</span></span>
                  <span className="text-gray-400">Pending: <span className="text-yellow-300 font-semibold">${pendingEarnings.toFixed(0)}</span></span>
                </div>
              </div>
              {earningsChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsChartData}>
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} formatter={(v: number) => [`$${v.toFixed(0)}`, 'Earned']} />
                      <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fill="url(#earningsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                  Complete paid sessions to see your earnings chart here.
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="gap-2 text-sm" onClick={() => router.push('/coach/earnings')}>
                  <DollarSign className="w-4 h-4" /> Withdraw Earnings
                </Button>
              </div>
            </DarkCard>

            {/* RECENT REVIEWS */}
            <DarkCard>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">Recent Reviews</h2>
                  <p className="text-gray-400 text-sm">What your candidates say about you</p>
                </div>
                <Link href="/coach/profile#reviews" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">View All →</Link>
              </div>
              {reviews.length === 0 ? (
                <div className="py-8 text-center">
                  <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No reviews yet. After completing sessions, candidates can leave reviews.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((r) => {
                    const name = r.candidate?.full_name || r.candidate?.email || 'Candidate'
                    return (
                      <div key={r.id} className="rounded-xl border border-white/10 p-4" style={{ background: '#0a0f1e' }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm">{name}</p>
                          <span className="text-yellow-300 text-sm">{'⭐'.repeat(Math.min(r.rating, 5))}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{r.comment || 'No written comment.'}</p>
                        <p className="text-xs text-gray-500 mt-2">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </DarkCard>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <DarkCard>
              <h2 className="text-xl font-bold mb-1">Interview Templates</h2>
              <p className="text-gray-400 text-sm mb-4">Create and assign custom interview templates to candidates.</p>
              <Link href="/coach/templates">
                <Button variant="primary" fullWidth className="gap-2 mb-2"><BookOpen className="w-4 h-4" /> Manage Templates</Button>
              </Link>
              <p className="text-xs text-gray-500 text-center">Custom templates · Live scoring · Auto feedback</p>
            </DarkCard>

            <DarkCard>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/coach/availability"><Button variant="outline" fullWidth className="justify-start gap-2 text-sm"><Clock className="w-4 h-4" /> Update Availability</Button></Link>
                <Link href="/coach/messages"><Button variant="outline" fullWidth className="justify-start gap-2 text-sm"><MessageSquare className="w-4 h-4" /> Messages</Button></Link>
                <Link href="/coach/profile"><Button variant="outline" fullWidth className="justify-start gap-2 text-sm"><ArrowRight className="w-4 h-4" /> Edit Public Profile</Button></Link>
              </div>
            </DarkCard>

            <DarkCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold uppercase shrink-0">{displayName.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{profile.full_name || displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Coach account · {stats.avgRating ? `${stats.avgRating} ⭐ avg rating` : 'No ratings yet'}</p>
                <p>{stats.totalSessions} session{stats.totalSessions !== 1 ? 's' : ''} completed</p>
              </div>
            </DarkCard>
          </div>
        </div>
      </div>
    </div>
  )
}
