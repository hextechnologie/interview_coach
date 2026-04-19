'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui'
import { Cookie, X } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
  }

  const rejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10" />
            
            {/* Content */}
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Icon */}
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-purple-400" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">We use cookies 🍪</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    We use cookies to improve your experience, analyze site traffic, and show you relevant job opportunities. 
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setIsManageOpen(!isManageOpen)}
                    className="px-4 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-gray-300 hover:bg-white/5 hover:border-white/30 transition-all"
                  >
                    Manage Preferences
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-600/20"
                  >
                    Accept All
                  </button>
                </div>

                {/* Close button */}
                <button
                  onClick={rejectAll}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Manage Preferences Panel */}
              <AnimatePresence>
                {isManageOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Essential Cookies */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white text-sm">Essential Cookies</p>
                          <p className="text-xs text-gray-400 mt-1">Required for the site to function properly</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-xs font-medium">
                          Always On
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white text-sm">Analytics Cookies</p>
                          <p className="text-xs text-gray-400 mt-1">Help us understand how you use our site</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 transition-colors">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                          </div>
                        </label>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white text-sm">Marketing Cookies</p>
                          <p className="text-xs text-gray-400 mt-1">Used to show you relevant job offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 transition-colors">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={rejectAll}
                        className="flex-1 px-4 py-2 rounded-xl border border-white/20 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all"
                      >
                        Reject All
                      </button>
                      <button
                        onClick={acceptAll}
                        className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
