'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge, Button, Card } from '@/components/ui'
import { mockCoaches } from '@/lib/coach-marketplace'
import { Clock3, MonitorUp, PhoneOff, Send, Video } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const coachId = searchParams.get('coach') || mockCoaches[0].id
  const duration = Number(searchParams.get('duration') || 60)
  const coach = mockCoaches.find((item) => item.id === coachId) || mockCoaches[0]
  const [secondsLeft, setSecondsLeft] = useState(duration * 60)
  
  const initialMessages = [
    { sender: t('session.coach'), content: t('session.welcomeMessage') },
    { sender: t('session.you'), content: t('session.userMessage') },
  ]
  
  const [messages, setMessages] = useState(initialMessages)
  const [messageInput, setMessageInput] = useState('')
  const [sharedNotes, setSharedNotes] = useState(t('session.defaultNotes'))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [secondsLeft])

  const sendMessage = () => {
    if (!messageInput.trim()) return
    setMessages((prev) => [...prev, { sender: t('session.you'), content: messageInput.trim() }])
    setMessageInput('')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('session.liveSessionWith')} {coach.name}</h1>
            <p className="text-gray-400">{t('session.sessionId')} {params.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">{t('session.sessionRoomLive')}</Badge>
            <Badge><Clock3 className="h-3 w-3" />{formattedTime}</Badge>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Card className="overflow-hidden border-primary/20 bg-card/80">
              <div className={`mb-4 h-72 rounded-2xl bg-gradient-to-br ${coach.avatar} flex items-center justify-center text-center`}>
                <div>
                  <Video className="mx-auto mb-3 h-12 w-12 text-white" />
                  <p className="text-xl font-semibold text-white">{t('session.dailyRoomReady')}</p>
                  <p className="mt-2 max-w-md text-sm text-white/80">
                    {t('session.dailyRoomDesc')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline"><MonitorUp className="h-4 w-4" />{t('session.screenShare')}</Button>
                <Button variant="danger" onClick={() => router.push(`/review/${params.id}`)}><PhoneOff className="h-4 w-4" />{t('session.endSession')}</Button>
              </div>
            </Card>

            <Card>
              <h2 className="mb-3 text-2xl font-bold">{t('session.sharedNotes')}</h2>
              <textarea
                value={sharedNotes}
                onChange={(e) => setSharedNotes(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <h2 className="mb-4 text-xl font-bold">{t('session.chat')}</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={`${message.sender}-${index}`} className={`rounded-xl px-4 py-3 ${message.sender === t('session.you') ? 'bg-primary/20 text-white' : 'bg-background/50 text-gray-300'}`}>
                    <p className="mb-1 text-xs text-gray-400">{message.sender}</p>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder={t('session.sendMessage')} className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-white outline-none" />
                <Button variant="primary" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
              </div>
            </Card>

            <Card>
              <h2 className="mb-2 text-xl font-bold">{t('session.sessionDetails')}</h2>
              <p className="text-sm text-gray-400">{t('session.coachLabel')} {coach.title}</p>
              <p className="text-sm text-gray-400">{t('session.durationLabel')} {duration} {t('session.minutes')}</p>
              <p className="mt-3 text-sm text-gray-300">{t('session.sessionDetailsDesc')}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
