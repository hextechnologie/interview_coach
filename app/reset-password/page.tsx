'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Card } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined

    const establishRecoverySession = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(t('resetPassword.errorInvalidLink'))
          return
        }
        window.history.replaceState({}, '', '/reset-password')
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
        return
      }

      const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (event === 'PASSWORD_RECOVERY' || nextSession) {
          setSessionReady(true)
        }
      })
      subscription = data.subscription
    }

    void establishRecoverySession()
    return () => subscription?.unsubscribe()
  }, [t])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push('/login'), 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError(t('resetPassword.errorTooShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.errorMismatch'))
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError(t('resetPassword.errorInvalidLink'))
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(t('resetPassword.successMessage'))
      setPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">Interview Coach</span>
        </Link>
        <Card>
          <h1 className="text-3xl font-bold text-center mb-2">{t('resetPassword.pageTitle')}</h1>
          <p className="text-gray-400 text-center mb-6">{t('resetPassword.subtitle')}</p>
          {success && <div className="mb-4 rounded-lg border border-green-500 bg-green-500/10 px-4 py-3 text-green-400">{success}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}
          {!sessionReady && !error && (
            <div className="mb-4 rounded-lg border border-border bg-background/50 px-4 py-3 text-gray-400 text-sm text-center">
              {t('resetPassword.verifyingLink')}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('resetPassword.newPasswordLabel')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('resetPassword.passwordPlaceholder')}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('resetPassword.confirmPasswordLabel')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('resetPassword.passwordPlaceholder')}
                required
              />
            </div>
            <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!sessionReady}>{t('resetPassword.updateButton')}</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
