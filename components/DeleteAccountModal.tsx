'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, User, Target, Video, FileText, Calendar, CreditCard, Mail, Check, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export default function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [countdown, setCountdown] = useState(5)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isDeleteTyped = confirmText === 'DELETE'
  const canDelete = isDeleteTyped && countdown === 0

  // Handle countdown timer
  useEffect(() => {
    if (isDeleteTyped && !isCountingDown) {
      setIsCountingDown(true)
      setCountdown(5)
    }
    
    if (!isDeleteTyped) {
      setIsCountingDown(false)
      setCountdown(5)
    }
  }, [isDeleteTyped])

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isCountingDown, countdown])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText('')
      setCountdown(5)
      setIsCountingDown(false)
      setLoading(false)
      setError('')
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!canDelete) return

    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Delete user profile (CASCADE will handle related data)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()

      // Redirect to homepage with message
      router.push('/?account=deleted')
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const deletionItems = [
    { icon: User, text: 'Your profile and personal information', color: 'text-red-400' },
    { icon: Target, text: 'All interview history and AI feedback', color: 'text-orange-400' },
    { icon: Video, text: 'All session recordings', color: 'text-yellow-400' },
    { icon: FileText, text: 'Saved job applications and notes', color: 'text-blue-400' },
    { icon: Calendar, text: 'Coach bookings and reviews', color: 'text-purple-400' },
    { icon: CreditCard, text: 'Subscription and credits balance', color: 'text-green-400' },
    { icon: Mail, text: 'All messages and conversations', color: 'text-pink-400' },
  ]

  const progressPercentage = ((5 - countdown) / 5) * 100

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg rounded-2xl border border-red-500/40 shadow-2xl overflow-hidden"
          style={{ background: '#1a0a0a' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Account</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning */}
            <div className="rounded-lg border border-red-500 bg-red-950/50 p-4">
              <p className="text-base font-bold text-white mb-2 flex items-center gap-2">
                🔴 This action cannot be undone!
              </p>
              <p className="text-sm text-gray-300">
                Deleting your account will <strong className="text-white">permanently remove</strong>:
              </p>
            </div>

            {/* What gets deleted - Visual list */}
            <div className="space-y-2">
              {deletionItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-950/30 border border-red-900/30"
                >
                  <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-200">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Type <span className="font-bold text-red-400">DELETE</span> to confirm
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-red-500/40 px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-red-500 bg-black/60 pr-12"
                  placeholder="Type DELETE"
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmText && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      {isDeleteTyped ? (
                        <Check className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {confirmText === '' ? (
                  'Type DELETE in capital letters to confirm'
                ) : !isDeleteTyped ? (
                  <span className="text-red-400">✗ Please type exactly: DELETE</span>
                ) : (
                  <span className="text-green-400">✓ Confirmed - countdown started</span>
                )}
              </p>
            </div>

            {/* Email Display */}
            <div className="text-sm text-gray-400">
              Your email: <span className="text-white font-medium">{userEmail}</span>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              {/* Cancel Button - Prominent */}
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={onClose}
                disabled={loading}
                className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white !text-base !py-3"
              >
                ← Keep My Account
              </Button>
              
              {/* Delete Button with Countdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canDelete || loading}
                  className={`w-full px-4 py-3 rounded-lg text-white text-base font-medium transition-all ${
                    !canDelete
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    'Deleting Account...'
                  ) : countdown > 0 && isDeleteTyped ? (
                    `Delete Account (${countdown})`
                  ) : (
                    'Delete Account'
                  )}
                </button>
                
                {/* Progress Bar */}
                {isDeleteTyped && countdown > 0 && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="absolute bottom-0 left-0 h-1 bg-red-400 rounded-b-lg"
                    transition={{ duration: 1 }}
                  />
                )}
              </div>
              
              {countdown > 0 && isDeleteTyped && (
                <p className="text-xs text-center text-gray-400">
                  Wait {countdown} second{countdown !== 1 ? 's' : ''} to proceed...
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
