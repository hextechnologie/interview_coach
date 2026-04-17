'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { mockNotifications } from '@/lib/coach-marketplace'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(mockNotifications)

  const unreadCount = items.filter((item) => !item.read).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full border border-border bg-card/70 p-2 text-gray-200 hover:border-primary/40"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Notifications</p>
            <button type="button" onClick={() => setItems((prev) => prev.map((item) => ({ ...item, read: true })))} className="text-xs text-primary">
              Mark all read
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className={`rounded-xl border p-3 ${item.read ? 'border-border bg-background/30' : 'border-primary/30 bg-primary/5'}`}>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-gray-400">{item.message}</p>
                <p className="mt-1 text-[11px] text-gray-500">{item.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}