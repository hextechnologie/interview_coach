'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { format } from 'date-fns'

type NotifItem = {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) loadNotifications()
  }, [user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setItems((data || []) as NotifItem[])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
      
      if (!error) {
        setItems((prev) => prev.map((i) => i.id === notificationId ? { ...i, read: true } : i))
      }
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      
      if (!error) {
        setItems((prev) => prev.map((i) => ({ ...i, read: true })))
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅'
      case 'review': return '⭐'
      case 'payment': return '💳'
      case 'reminder': return '🔔'
      default: return '📬'
    }
  }

  const unreadCount = items.filter((i) => !i.read).length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-white/10 bg-white/5 p-2 text-gray-200 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-purple-600 px-1.5 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn"
          style={{ background: '#111827' }}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-all duration-200 relative ${
                    !item.read ? 'bg-purple-500/5' : ''
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!item.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500"></div>
                  )}
                  
                  <div className={`flex items-start gap-3 ${!item.read ? 'pl-3' : ''}`}>
                    <span className="text-xl shrink-0">{getTypeIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!item.read ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.message}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {format(new Date(item.created_at), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}