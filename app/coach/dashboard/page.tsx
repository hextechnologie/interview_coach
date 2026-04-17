'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { NotificationBell } from '@/components/NotificationBell'
import { mockCoaches } from '@/lib/coach-marketplace'
import { CalendarDays, DollarSign, PencilLine, Wallet } from 'lucide-react'

export default function CoachDashboardPage() {
  const coach = mockCoaches[0]
  const [welcome, setWelcome] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWelcome(new URLSearchParams(window.location.search).get('welcome') === '1')
    }
  }, [])

  const upcoming = [
    { candidate: 'Maya Carter', focus: 'System design', when: 'Apr 18 • 11:30 AM' },
    { candidate: 'Sam Ortega', focus: 'Behavioral rounds', when: 'Apr 19 • 2:00 PM' },
  ]

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {welcome && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-primary">
            Welcome aboard. Complete your profile and connect Stripe to start accepting bookings.
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Coach dashboard</h1>
            <p className="mt-2 text-gray-400">Manage bookings, earnings, and candidate relationships from one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationBell />
            <Link href="/coach/availability"><Button variant="outline"><CalendarDays className="h-4 w-4" />Availability</Button></Link>
            <Button variant="outline"><PencilLine className="h-4 w-4" />Edit profile</Button>
            <Button variant="primary"><Wallet className="h-4 w-4" />Withdraw earnings</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total earned', value: '$12,480', icon: DollarSign },
            { label: 'This month', value: '$3,260', icon: DollarSign },
            { label: 'Pending', value: '$960', icon: Wallet },
            { label: 'Withdrawn', value: '$8,260', icon: Wallet },
          ].map((item) => (
            <Card key={item.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-3xl font-bold">{item.value}</p>
                </div>
                <item.icon className="h-6 w-6 text-primary" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-2xl font-bold">Upcoming bookings</h2>
              <div className="space-y-3">
                {upcoming.map((session) => (
                  <div key={`${session.candidate}-${session.when}`} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{session.candidate}</p>
                        <p className="text-sm text-gray-400">Focus: {session.focus}</p>
                      </div>
                      <Badge variant="success">{session.when}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Recent reviews</h2>
              <div className="space-y-3">
                {coach.reviews.map((review) => (
                  <div key={`${review.author}-${review.comment}`} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-semibold">{review.author}</p>
                      <span className="text-yellow-300">⭐ {review.rating}</span>
                    </div>
                    <p className="text-sm text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-2xl font-bold">Quick stats</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Total sessions: <span className="font-semibold text-white">{coach.sessionsBooked}</span></p>
                <p>Average rating: <span className="font-semibold text-white">{coach.rating}</span></p>
                <p>Repeat clients: <span className="font-semibold text-white">48</span></p>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-bold">Payout status</h2>
              <p className="text-sm text-gray-300">Stripe Connect is ready for onboarding and payouts.</p>
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-gray-300">
                Platform fee: 20% • Coach payout: 80%
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}