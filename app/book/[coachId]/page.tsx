'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

type CoachData = {
  id: string
  name: string
  title: string | null
  bio: string | null
  price: number
  yearsExperience: number
  avatar_url: string | null
  specializations: string[]
}

// Generate next 7 days date options
function getNextDays(n: number) {
  const days: { date: string; label: string }[] = []
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 1; i <= n; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const label = `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
    days.push({ date: iso, label })
  }
  return days
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export default function BookingPage() {
  const { coachId } = useParams<{ coachId: string }>()
  const { user } = useAuth()

  const [coach, setCoach]     = useState<CoachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration]         = useState(60)
  const [notes, setNotes]               = useState('')
  const [booking, setBooking]           = useState(false)
  const [confirmation, setConfirmation] = useState<{ bookingId: string } | null>(null)

  const days = useMemo(() => getNextDays(7), [])

  useEffect(() => {
    const fetchCoach = async () => {
      const { data: cp } = await supabase
        .from('coach_profiles')
        .select('user_id, title, bio, price_per_hour, years_experience')
        .eq('user_id', coachId)
        .maybeSingle()

      if (!cp) { setNotFound(true); setLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name, last_name, avatar_url')
        .eq('id', coachId)
        .maybeSingle()

      const { data: specs } = await supabase
        .from('coach_specializations')
        .select('specialization')
        .eq('coach_id', coachId)

      const name = profile?.full_name
        || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
        || 'Coach'

      setCoach({
        id: coachId,
        name,
        title: cp.title,
        bio: cp.bio,
        price: cp.price_per_hour ?? 100,
        yearsExperience: cp.years_experience ?? 0,
        avatar_url: profile?.avatar_url ?? null,
        specializations: (specs ?? []).map((s: any) => s.specialization),
      })
      setLoading(false)
    }
    fetchCoach()
  }, [coachId])

  const sessionPrice = useMemo(() => {
    if (!coach) return 0
    return Math.round((coach.price / 60) * duration)
  }, [coach, duration])

  const handleCheckout = async () => {
    if (!selectedDate || !selectedTime || !coach) return
    setBooking(true)
    try {
      const response = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.name,
          scheduledAt: `${selectedDate} ${selectedTime}`,
          durationMinutes: duration,
          notes,
          amount: sessionPrice,
        }),
      })
      const data = await response.json()
      if (data.url) { window.location.href = data.url; return }
      setConfirmation({ bookingId: data.bookingId || `booking-${Date.now()}` })
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !coach) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-white">
        <p className="text-xl font-semibold">Coach not found</p>
        <Link href="/coaches" className="text-primary hover:underline text-sm">Browse all coaches</Link>
      </div>
    )
  }

  const initials = coach.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-background text-white px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/coaches" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to coaches
        </Link>

        <div className="mb-6 flex items-center gap-4">
          {coach.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coach.avatar_url} alt={coach.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/40" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl font-bold border-2 border-primary/40">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">Book a session with {coach.name}</h1>
            {coach.title && <p className="text-sm text-gray-400 mt-0.5">{coach.title}</p>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            {/* Step 1: Date */}
            <Card>
              <h2 className="mb-4 text-xl font-bold">Step 1 — Choose a date</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {days.map((d) => (
                  <button key={d.date} type="button" onClick={() => { setSelectedDate(d.date); setSelectedTime('') }}
                    className={`rounded-xl border p-3 text-left text-sm transition-colors ${selectedDate === d.date ? 'border-primary bg-primary/10 text-white' : 'border-border bg-background/40 text-gray-300 hover:border-primary/40'}`}>
                    <Calendar className="h-4 w-4 text-primary mb-1" />
                    {d.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Step 2: Time + duration */}
            <Card>
              <h2 className="mb-4 text-xl font-bold">Step 2 — Choose time &amp; duration</h2>
              <p className="text-xs text-gray-500 mb-3">Time slots (your local time)</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {TIME_SLOTS.map((time) => (
                  <button key={time} type="button" onClick={() => setSelectedTime(time)} disabled={!selectedDate}
                    className={`rounded-full px-4 py-1.5 text-sm transition-colors disabled:opacity-30 ${selectedTime === time ? 'bg-primary text-white' : 'border border-border text-gray-300 hover:border-primary/40'}`}>
                    {time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-3">Duration</p>
              <div className="flex gap-2">
                {[30, 60, 90].map((val) => (
                  <button key={val} type="button" onClick={() => setDuration(val)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-colors ${duration === val ? 'bg-primary text-white' : 'border border-border text-gray-300 hover:border-primary/40'}`}>
                    {val} min
                  </button>
                ))}
              </div>
            </Card>

            {/* Step 3: Notes */}
            <Card>
              <h2 className="mb-4 text-xl font-bold">Step 3 — Session notes</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                placeholder="Tell your coach what you want to focus on (e.g. system design, behavioural questions, salary negotiation…)"
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </Card>

            {/* Step 4: Pay */}
            <Card>
              <h2 className="mb-4 text-xl font-bold">Step 4 — Payment</h2>
              <p className="text-sm text-gray-400 mb-4">Payments are processed securely with Stripe. The coach receives 80% after the session.</p>
              <Button variant="primary" className="gap-2" onClick={handleCheckout} loading={booking} disabled={!selectedDate || !selectedTime}>
                <CreditCard className="h-4 w-4" />
                Continue to Checkout — ${sessionPrice}
              </Button>
            </Card>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <h2 className="mb-4 text-lg font-bold">Booking summary</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between"><span className="text-gray-500">Coach</span><span>{coach.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{selectedDate || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{selectedTime || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{duration} min</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Rate</span><span>${coach.price}/hr</span></div>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-background/40 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-3xl font-bold text-primary">${sessionPrice}</p>
              </div>

              {coach.specializations.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {coach.specializations.map(s => <Badge key={s}>{s}</Badge>)}
                </div>
              )}

              {confirmation && (
                <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-green-300 text-sm font-semibold mb-1">
                    <CheckCircle2 className="h-4 w-4" /> Booking confirmed!
                  </div>
                  <p className="text-xs text-gray-400">Your coach will be in touch to confirm the slot.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{ bookingId: string; calendarUrl: string } | null>(null)

  const sessionPrice = useMemo(() => {
    const hourly = coach?.price || 100
    return Math.round((hourly / 60) * duration)
  }, [coach?.price, duration])

  if (!coach) {
    return <div className="min-h-screen flex items-center justify-center">Coach not found.</div>
  }

  const handleCheckout = async () => {
    if (!selectedDate || !selectedTime) return
    setLoading(true)

    try {
      const response = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.name,
          scheduledAt: `${selectedDate} ${selectedTime}`,
          durationMinutes: duration,
          notes,
          amount: sessionPrice,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
        return
      }

      setConfirmation({
        bookingId: data.bookingId || `mock-${Date.now()}`,
        calendarUrl: data.calendarUrl || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Session with ${coach.name}`)}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Book a session with {coach.name}</h1>
          <p className="mt-2 text-gray-400">Select a slot, share your goals, and complete payment.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Card>
              <h2 className="mb-4 text-2xl font-bold">Step 1: Select date</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {coach.availability.map((slot) => (
                  <button key={slot.date} type="button" onClick={() => { setSelectedDate(slot.date); setSelectedTime(slot.slots[0] || '') }} className={`rounded-xl border p-4 text-left ${selectedDate === slot.date ? 'border-primary bg-primary/10' : 'border-border bg-background/40'}`}>
                    <div className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span className="font-semibold">{slot.label}</span></div>
                    <p className="text-sm text-gray-400">{slot.slots.join(' • ')}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Step 2: Select time and duration</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {(coach.availability.find((slot) => slot.date === selectedDate)?.slots || []).map((time) => (
                  <button key={time} type="button" onClick={() => setSelectedTime(time)} className={`rounded-full px-4 py-2 ${selectedTime === time ? 'bg-primary text-white' : 'border border-border text-gray-300'}`}>
                    {time}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[30, 60, 90].map((value) => (
                  <button key={value} type="button" onClick={() => setDuration(value)} className={`rounded-full px-4 py-2 ${duration === value ? 'bg-primary text-white' : 'border border-border text-gray-300'}`}>
                    {value} min
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Step 3: Add session notes</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Tell your coach what you want to work on." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Step 4: Payment</h2>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-gray-300">
                Payments are processed with Stripe. Coaches receive 80% after the session and the platform keeps a 20% fee.
              </div>
              <Button variant="primary" className="mt-4 gap-2" onClick={handleCheckout} loading={loading} disabled={!selectedDate || !selectedTime}>
                <CreditCard className="h-4 w-4" />
                Continue to Stripe Checkout
              </Button>
            </Card>
          </div>

          <Card className="h-fit sticky top-6">
            <h2 className="mb-4 text-xl font-bold">Booking summary</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <p><span className="text-gray-500">Coach:</span> {coach.name}</p>
              <p><span className="text-gray-500">Date:</span> {selectedDate || 'Select a date'}</p>
              <p><span className="text-gray-500">Time:</span> {selectedTime || 'Select a slot'}</p>
              <p><span className="text-gray-500">Duration:</span> {duration} minutes</p>
            </div>
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-3xl font-bold text-primary">${sessionPrice}</p>
            </div>

            {confirmation && (
              <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-green-300"><CheckCircle2 className="h-4 w-4" />Booking confirmed</div>
                <div className="grid gap-2">
                  <Link href={`/session/${confirmation.bookingId}?coach=${coach.id}&duration=${duration}`}>
                    <Button variant="primary" fullWidth>Join session room</Button>
                  </Link>
                  <a href={confirmation.calendarUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" fullWidth>Add to Google Calendar</Button>
                  </a>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {coach.specializations.map((spec) => <Badge key={spec}>{spec}</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}