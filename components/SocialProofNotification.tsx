'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Star, Trophy, Target } from 'lucide-react'

const NOTIFICATIONS = [
  { icon: Briefcase, text: 'Ahmed from Morocco just landed a job at Microsoft!', color: 'from-blue-600 to-cyan-600' },
  { icon: Star, text: 'Sarah just completed her mock interview with 9/10 score!', color: 'from-yellow-600 to-orange-600' },
  { icon: Trophy, text: 'Marcus just got an offer from Google after 3 coaching sessions!', color: 'from-green-600 to-emerald-600' },
  { icon: Target, text: 'Priya just booked a session with an Ex-Amazon coach!', color: 'from-purple-600 to-pink-600' },
  { icon: Briefcase, text: 'Jessica from Canada just landed a Product Manager role!', color: 'from-blue-600 to-purple-600' },
  { icon: Star, text: 'Raj improved his interview score from 6 to 9 in 2 weeks!', color: 'from-orange-600 to-red-600' },
]

export function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialDelay = setTimeout(() => {
      setIsVisible(true)
    }, 5000)

    return () => clearTimeout(initialDelay)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    // Show next notification after 30 seconds total (5s show + 25s hidden)
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length)
      setIsVisible(true)
    }, 30000)

    return () => {
      clearTimeout(dismissTimer)
      clearTimeout(nextTimer)
    }
  }, [isVisible, currentIndex])

  const notification = NOTIFICATIONS[currentIndex]
  const Icon = notification.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="fixed bottom-24 left-6 z-40 max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl">
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${notification.color} opacity-10`} />
            
            {/* Content */}
            <div className="relative p-4 flex items-start gap-4">
              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${notification.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-white leading-relaxed">
                  {notification.text}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className={`h-1 bg-gradient-to-r ${notification.color}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
