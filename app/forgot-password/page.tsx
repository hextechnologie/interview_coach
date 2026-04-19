'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Input, Card } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(t('forgotPassword.errorMessage'))
    } else {
      setMessage(t('forgotPassword.successMessage'))
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
          <h1 className="text-3xl font-bold text-center mb-2">{t('forgotPassword.pageTitle')}</h1>
          <p className="text-gray-400 text-center mb-6">{t('forgotPassword.subtitle')}</p>
          {message && <div className="mb-4 rounded-lg border border-green-500 bg-green-500/10 px-4 py-3 text-green-400">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label={t('forgotPassword.emailLabel')} type="email" value={email} onChange={setEmail} placeholder={t('forgotPassword.emailPlaceholder')} required />
            <Button type="submit" variant="primary" fullWidth loading={loading}>{t('forgotPassword.sendButton')}</Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            <Link href="/login" className="text-primary hover:underline">{t('forgotPassword.backToLogin')}</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
