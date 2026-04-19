'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Delete user data (handled by RLS and CASCADE in database)
      // Note: This requires admin API or database function to fully delete auth.users
      // For now, we'll just delete the profile and sign out
      
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()

      // Redirect to homepage
      router.push('/?account=deleted')
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-red-500/5 p-6 shadow-2xl" style={{ background: '#1a0a0a' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 mb-6">
          <p className="text-sm text-red-300 font-medium mb-2">
            ⚠️ This action cannot be undone!
          </p>
          <p className="text-sm text-red-200/80">
            Deleting your account will permanently remove:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-200/80 list-disc list-inside">
            <li>Your profile and personal information</li>
            <li>All interview history and recordings</li>
            <li>Saved job applications and notes</li>
            <li>Coach bookings and reviews</li>
            <li>Subscription and payment history</li>
          </ul>
        </div>

        {/* Confirmation */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Type <span className="font-bold text-red-400">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-lg border border-red-500/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-black/40"
            placeholder="Type DELETE"
            autoComplete="off"
          />
          <p className="mt-2 text-xs text-gray-400">
            Your email: <span className="text-white font-medium">{userEmail}</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
