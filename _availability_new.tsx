'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import CoachNavbar from '@/components/CoachNavbar'
import { Button, LoadingSpinner } from '@/components/ui'
import { Save, Clock } from 'lucide-react'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const BUFFER_OPTIONS = [0, 15, 30, 45] as const

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl p-5 border border-white/10 ${className}`} style={{ background: '#111827' }}>{children}</div>
}

export default function CoachAvailabilityPage() {
  const { user, loading: authLoading } = useAuth()
  const [selected, setSelected] = useState<string[]>([])
  const [blockedDate, setBlockedDate] = useState('')
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [buffer, setBuffer] = useState<number>(15)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchAvailability()
  }, [user])

  const fetchAvailability = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('coach_id', user.id)
        .single()
      if (data) {
        setSelected(data.slots || [])
        setBlockedDates(data.blocked_dates || [])
        setBuffer(data.buffer_minutes ?? 15)
      }
    } catch { /* no record yet */ }
    finally { setLoading(false) }
  }

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`
    setSelected((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key])
    setSaved(false)
  }

  const toggleDay = (day: string) => {
    const daySlots = TIME_SLOTS.map((t) => `${day}-${t}`)
    const allSelected = daySlots.every((s) => selected.includes(s))
    setSelected((prev) => allSelected ? prev.filter((s) => !daySlots.includes(s)) : [...new Set([...prev, ...daySlots])])
    setSaved(false)
  }

  const addBlockedDate = () => {
    if (!blockedDate || blockedDates.includes(blockedDate)) return
    setBlockedDates((prev) => [...prev, blockedDate].sort())
    setBlockedDate('')
    setSaved(false)
  }

  const removeBlockedDate = (d: string) => {
    setBlockedDates((prev) => prev.filter((x) => x !== d))
    setSaved(false)
  }

  const saveAvailability = async () => {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('coach_availability').upsert({
        coach_id: user.id,
        slots: selected,
        blocked_dates: blockedDates,
        buffer_minutes: buffer,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'coach_id' })
      setSaved(true)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1e' }}>
      <CoachNavbar />
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Availability</h1>
            <p className="text-gray-400">Set your weekly schedule, block dates, and configure session buffers.</p>
          </div>
          <Button variant="primary" onClick={saveAvailability} loading={saving} className="gap-2 self-start">
            <Save className="w-4 h-4" /> {saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          {/* Weekly calendar grid */}
          <DarkCard>
            <h2 className="text-xl font-bold mb-1">Weekly Schedule</h2>
            <p className="text-gray-400 text-sm mb-4">Click time slots to toggle availability. Click a day name to select/deselect the entire day.</p>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header row */}
                <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
                  <div />
                  {WEEK_DAYS.map((day) => {
                    const daySlots = TIME_SLOTS.map((t) => `${day}-${t}`)
                    const allSelected = daySlots.every((s) => selected.includes(s))
                    return (
                      <button key={day} onClick={() => toggleDay(day)} className={`rounded-lg py-2 text-xs font-semibold transition-colors text-center ${allSelected ? 'bg-purple-600 text-white' : 'border border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'}`}>
                        {day.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
                {/* Time rows */}
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
                    <div className="flex items-center text-xs text-gray-500 pr-2">{time}</div>
                    {WEEK_DAYS.map((day) => {
                      const key = `${day}-${time}`
                      const active = selected.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleSlot(day, time)}
                          className={`h-9 rounded-lg text-xs font-medium transition-all ${active ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20' : 'border border-white/10 text-gray-600 hover:border-purple-500/30 hover:text-gray-400 hover:bg-white/5'}`}
                        >
                          {active ? '✓' : '—'}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {selected.length} slot{selected.length !== 1 ? 's' : ''} selected
            </p>
          </DarkCard>

          {/* Sidebar settings */}
          <div className="space-y-4">
            {/* Buffer time */}
            <DarkCard>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-bold">Buffer Between Sessions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BUFFER_OPTIONS.map((b) => (
                  <button key={b} onClick={() => { setBuffer(b); setSaved(false) }}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-colors border ${buffer === b ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/10 text-gray-300 hover:border-purple-500/40'}`}>
                    {b === 0 ? 'None' : `${b} min`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Break time between consecutive sessions booking.</p>
            </DarkCard>

            {/* Block dates */}
            <DarkCard>
              <h2 className="text-lg font-bold mb-3">Block Specific Dates</h2>
              <p className="text-gray-400 text-xs mb-3">Block holidays, vacations, or any unavailable days.</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={blockedDate}
                  onChange={(e) => setBlockedDate(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/40 transition-colors"
                />
                <Button variant="outline" onClick={addBlockedDate} className="px-3 py-2 text-sm shrink-0">Block</Button>
              </div>
              {blockedDates.length === 0 ? (
                <p className="text-xs text-gray-600">No blocked dates.</p>
              ) : (
                <div className="space-y-1">
                  {blockedDates.map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-sm text-gray-300">{d}</span>
                      <button onClick={() => removeBlockedDate(d)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </DarkCard>

            {/* Quick recurring */}
            <DarkCard>
              <h2 className="text-lg font-bold mb-3">Quick Set</h2>
              <div className="space-y-2">
                <Button variant="outline" fullWidth className="text-sm justify-start" onClick={() => {
                  const weekdays = WEEK_DAYS.slice(0, 5)
                  const slots = weekdays.flatMap((d) => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((t) => `${d}-${t}`))
                  setSelected((prev) => [...new Set([...prev, ...slots])])
                  setSaved(false)
                }}>
                  📅 Weekdays 9am–5pm
                </Button>
                <Button variant="outline" fullWidth className="text-sm justify-start" onClick={() => {
                  setSelected([])
                  setSaved(false)
                }}>
                  🗑️ Clear All
                </Button>
              </div>
            </DarkCard>
          </div>
        </div>
      </div>
    </div>
  )
}
