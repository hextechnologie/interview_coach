'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Badge, Button, Card } from '@/components/ui'
import { getCoachById } from '@/lib/coach-marketplace'
import { Calendar, CheckCircle2, CreditCard } from 'lucide-react'

export default function BookingPage() {
  const params = useParams<{ coachId: string }>()
  const coach = getCoachById(params.coachId)
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