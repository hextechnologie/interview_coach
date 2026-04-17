'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase, getFirstName } from '@/lib/supabase'
import { Button, LoadingSpinner } from '@/components/ui'
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, PhoneOff, Clock, Send } from 'lucide-react'

type SessionMessage = { id: string; sender_id: string; content: string; created_at: string }
type Booking = {
  id: string; scheduled_at: string | null; duration_minutes: number; notes: string | null; session_type: string | null
  candidate?: { full_name: string | null; email: string } | null
  coach?: { full_name: string | null; email: string } | null
}

export default function SessionRoomPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [notes, setNotes] = useState('')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [ending, setEnding] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const displayName = getFirstName(profile?.full_name, user?.email)

  useEffect(() => {
    if (!id || !user) return
    fetchBooking()
  }, [id, user])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      })
      .catch(() => {})
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()) }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchBooking = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('id, scheduled_at, duration_minutes, notes, session_type, candidate:profiles!bookings_candidate_id_fkey(full_name, email), coach:profiles!bookings_coach_id_fkey(full_name, email)')
      .eq('id', id)
      .single()
    setBooking(data as unknown as Booking)
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !id) return
    const msg: SessionMessage = { id: Date.now().toString(), sender_id: user.id, content: newMsg.trim(), created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, msg])
    setNewMsg('')
    await supabase.from('session_notes').insert({ booking_id: id, coach_id: user.id, notes: newMsg.trim() })
  }

  const toggleAudio = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !audioOn })
    setAudioOn((v) => !v)
  }

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !videoOn })
    setVideoOn((v) => !v)
  }

  const endSession = async () => {
    setEnding(true)
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    router.push(profile?.user_type === 'coach' ? '/coach/dashboard' : '/dashboard')
  }

  const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}><LoadingSpinner size="lg" /></div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#0a0f1e' }}>Session not found.</div>

  const partnerName = profile?.user_type === 'coach'
    ? (booking.candidate?.full_name || booking.candidate?.email || 'Candidate')
    : (booking.coach?.full_name || booking.coach?.email || 'Coach')

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: '#0a0f1e' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ background: '#111827' }}>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold">{booking.session_type || 'Session'}</span>
          <span className="text-xs text-gray-400">with {partnerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(elapsedSec)}</span>
          <span className="text-gray-500">/ {booking.duration_minutes} min</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col gap-3 p-4">
          {/* Remote video */}
          <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative" style={{ background: '#0d1220' }}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold mx-auto mb-3 uppercase">
                {partnerName.charAt(0)}
              </div>
              <p className="text-gray-300 font-semibold">{partnerName}</p>
              <p className="text-gray-500 text-sm mt-1">Video call powered by Daily.co</p>
              <p className="text-xs text-gray-600 mt-1">Add NEXT_PUBLIC_DAILY_DOMAIN env var to enable</p>
            </div>
            <div className="absolute top-3 left-3">
              <span className="text-xs bg-red-600/80 rounded-full px-2 py-1">🔴 LIVE</span>
            </div>
          </div>

          {/* Local preview */}
          <div className="h-36 rounded-xl border border-white/10 overflow-hidden relative flex items-center justify-center bg-black">
            <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!videoOn ? 'hidden' : ''}`} />
            {!videoOn && <div className="flex flex-col items-center text-gray-500 text-sm"><VideoOff className="w-8 h-8 mb-1" /> Camera off</div>}
            <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/60 rounded px-2 py-0.5">{displayName} (You)</div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 py-2">
            <button onClick={toggleAudio} className={`p-3 rounded-full border transition-colors ${audioOn ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-red-500/50 bg-red-500/20 text-red-400'}`}>
              {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button onClick={toggleVideo} className={`p-3 rounded-full border transition-colors ${videoOn ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-red-500/50 bg-red-500/20 text-red-400'}`}>
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button className="p-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-colors" title="Share screen (requires Daily.co)">
              <MonitorUp className="w-5 h-5" />
            </button>
            <button onClick={() => setChatOpen((v) => !v)} className={`p-3 rounded-full border transition-colors ${chatOpen ? 'border-purple-500/50 bg-purple-500/20 text-purple-400' : 'border-white/20 bg-white/5 text-white'}`}>
              <MessageSquare className="w-5 h-5" />
            </button>
            <button onClick={endSession} disabled={ending} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat + Notes */}
        {chatOpen && (
          <div className="w-72 border-l border-white/10 flex flex-col shrink-0" style={{ background: '#111827' }}>
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs text-gray-400 font-semibold mb-2">SHARED NOTES</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type shared notes here..."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500/40 resize-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p className="text-xs text-gray-500 font-semibold mb-2">SESSION CHAT</p>
              {messages.length === 0 && <p className="text-xs text-gray-600">No messages yet</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.sender_id === user?.id ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage() } }}
                placeholder="Message..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500/40"
              />
              <button onClick={sendMessage} className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
