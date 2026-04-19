'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import CoachNavbar from '@/components/CoachNavbar'
import { useLanguage } from '@/components/LanguageProvider'

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const hours = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

type RecurringRule = { day: string; start: string; end: string }

export default function CoachAvailabilityPage() {
  const { t } = useLanguage()
  
  const weekDays = [
    t('coachAvailability.days.monday'),
    t('coachAvailability.days.tuesday'),
    t('coachAvailability.days.wednesday'),
    t('coachAvailability.days.thursday'),
    t('coachAvailability.days.friday'),
    t('coachAvailability.days.saturday')
  ]
  
  const [selected, setSelected] = useState<string[]>(['Monday-09:00', 'Monday-10:00', 'Wednesday-14:00'])
  const [blockedDate, setBlockedDate] = useState('')
  const [buffer, setBuffer] = useState(15)
  const [saved, setSaved] = useState(false)

  // Recurring modal state
  const [showRecurring, setShowRecurring] = useState(false)
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([
    { day: t('coachAvailability.days.monday'), start: '09:00', end: '17:00' },
    { day: t('coachAvailability.days.wednesday'), start: '13:00', end: '18:00' },
  ])
  const [newRule, setNewRule] = useState<RecurringRule>({ day: t('coachAvailability.days.monday'), start: '09:00', end: '17:00' })

  const toggleSlot = (key: string) => {
    setSaved(false)
    setSelected((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key])
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const applyRecurringRules = () => {
    const newSlots: string[] = []
    for (const rule of recurringRules) {
      const startIdx = timeSlots.indexOf(rule.start)
      const endIdx = timeSlots.indexOf(rule.end)
      for (let i = startIdx; i < endIdx && i >= 0; i++) {
        const key = `${rule.day}-${timeSlots[i]}`
        if (!newSlots.includes(key)) newSlots.push(key)
      }
    }
    // Merge with existing non-recurring slots
    setSelected((prev) => {
      const merged = [...prev.filter((s) => !recurringRules.some((r) => s.startsWith(r.day))), ...newSlots]
      return [...new Set(merged)]
    })
    setShowRecurring(false)
    setSaved(false)
  }

  const addRule = () => {
    setRecurringRules((prev) => [...prev, { ...newRule }])
  }

  const removeRule = (idx: number) => {
    setRecurringRules((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="min-h-screen bg-background">
      <CoachNavbar />
      <div className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Back button */}
          <Link
            href="/coach/dashboard"
            title="Press Alt+← to go back"
            aria-label={t('coachAvailability.backToDashboard')}
            className="group inline-flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 shadow-sm transition-all duration-200 hover:scale-105 hover:border-purple-500 hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">{t('coachAvailability.backToDashboard')}</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold">{t('coachAvailability.pageTitle')}</h1>
            <p className="mt-2 text-gray-400">{t('coachAvailability.pageDescription')}</p>
          </div>

          {/* Save confirmation banner */}
          {saved && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm text-green-400">
              {t('coachAvailability.saveSuccess')}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('coachAvailability.weeklyCalendarTitle')}</h2>
                <Button variant="primary" onClick={handleSave}>{t('coachAvailability.saveAvailability')}</Button>
              </div>
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
                          <button key={key} type="button" onClick={() => toggleSlot(key)} className={`rounded-lg p-3 transition-colors ${active ? 'bg-primary text-white' : 'border border-border bg-background/50 text-gray-400 hover:border-primary/40'}`}>
                            {active ? t('coachAvailability.available') : t('coachAvailability.notAvailable')}
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
                <h2 className="mb-4 text-xl font-bold">{t('coachAvailability.recurringTitle')}</h2>
                <div className="space-y-2 text-sm text-gray-300 mb-4">
                  {recurringRules.map((r, i) => (
                    <p key={i}>{t('coachAvailability.everyDay')} {r.day} {r.start} – {r.end}</p>
                  ))}
                </div>
                <Button variant="outline" fullWidth onClick={() => setShowRecurring(true)}>{t('coachAvailability.setRecurring')}</Button>
              </Card>

              <Card>
                <h2 className="mb-4 text-xl font-bold">{t('coachAvailability.blockDatesTitle')}</h2>
                <input type="date" value={blockedDate} onChange={(e) => setBlockedDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white outline-none" />
                {blockedDate && <Badge className="mt-3">{t('coachAvailability.blockedLabel')} {blockedDate}</Badge>}
              </Card>

              <Card>
                <h2 className="mb-4 text-xl font-bold">{t('coachAvailability.bufferTitle')}</h2>
                <input type="range" min="0" max="45" step="5" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className="w-full accent-primary" />
                <p className="mt-2 text-sm text-gray-300">{t('coachAvailability.currentBuffer')} {buffer} {t('coachAvailability.minutesBetween')}</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Recurring availability modal */}
      {showRecurring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl" style={{ background: '#111827' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('coachAvailability.modal.title')}</h2>
              <button onClick={() => setShowRecurring(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {/* Existing rules */}
            <div className="mb-4 space-y-2">
              {recurringRules.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  <span>{r.day} · {r.start} – {r.end}</span>
                  <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            {/* Add new rule */}
            <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-gray-300">{t('coachAvailability.modal.addRule')}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">{t('coachAvailability.modal.dayLabel')}</label>
                  <select value={newRule.day} onChange={(e) => setNewRule((r) => ({ ...r, day: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-white outline-none">
                    {weekDays.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">{t('coachAvailability.modal.fromLabel')}</label>
                  <select value={newRule.start} onChange={(e) => setNewRule((r) => ({ ...r, start: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-white outline-none">
                    {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">{t('coachAvailability.modal.toLabel')}</label>
                  <select value={newRule.end} onChange={(e) => setNewRule((r) => ({ ...r, end: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-white outline-none">
                    {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <Button variant="outline" fullWidth onClick={addRule}>{t('coachAvailability.modal.addRuleButton')}</Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowRecurring(false)}>{t('coachAvailability.modal.cancel')}</Button>
              <Button variant="primary" fullWidth onClick={applyRecurringRules}>{t('coachAvailability.modal.apply')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}