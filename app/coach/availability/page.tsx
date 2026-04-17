'use client'

import { useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

export default function CoachAvailabilityPage() {
  const [selected, setSelected] = useState<string[]>(['Monday-09:00', 'Monday-10:00', 'Wednesday-14:00'])
  const [blockedDate, setBlockedDate] = useState('')
  const [buffer, setBuffer] = useState(15)

  const toggleSlot = (key: string) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key])
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Coach availability</h1>
          <p className="mt-2 text-gray-400">Set recurring availability, block dates, and add buffer time between sessions.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <h2 className="mb-4 text-2xl font-bold">Weekly calendar grid</h2>
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px] grid-cols-7 gap-2 text-sm">
                <div />
                {weekDays.map((day) => <div key={day} className="p-2 text-center font-semibold text-gray-300">{day}</div>)}
                {timeSlots.map((time) => (
                  <>
                    <div key={`${time}-label`} className="p-2 text-gray-500">{time}</div>
                    {weekDays.map((day) => {
                      const key = `${day}-${time}`
                      const active = selected.includes(key)
                      return (
                        <button key={key} type="button" onClick={() => toggleSlot(key)} className={`rounded-lg p-3 ${active ? 'bg-primary text-white' : 'border border-border bg-background/50 text-gray-400'}`}>
                          {active ? 'Available' : '—'}
                        </button>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-xl font-bold">Recurring settings</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Every Monday 9am - 5pm</p>
                <p>Every Wednesday 1pm - 6pm</p>
                <Button variant="outline" fullWidth>Set recurring availability</Button>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-bold">Block specific dates</h2>
              <input type="date" value={blockedDate} onChange={(e) => setBlockedDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white outline-none" />
              {blockedDate && <Badge className="mt-3">Blocked: {blockedDate}</Badge>}
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-bold">Session buffer time</h2>
              <input type="range" min="0" max="45" step="5" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className="w-full accent-primary" />
              <p className="mt-2 text-sm text-gray-300">Current buffer: {buffer} minutes between sessions</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}