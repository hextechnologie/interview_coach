'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button, Card, Input, LoadingSpinner } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import CoachNavbar from '@/components/CoachNavbar'

export default function CoachProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [price, setPrice] = useState('75')
  const [yearsExperience, setYearsExperience] = useState('3')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setTitle(data.title || '')
        setBio(data.bio || '')
        setLinkedinUrl(data.linkedin_url || '')
        setPrice(String(data.price_per_hour || 75))
        setYearsExperience(String(data.years_experience || 3))
      }
    }

    fetchProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')

    try {
      await supabase.from('profiles').update({ full_name: profile?.full_name || null }).eq('id', user.id)
      const { error } = await supabase.from('coach_profiles').upsert({
        user_id: user.id,
        title,
        bio,
        linkedin_url: linkedinUrl,
        price_per_hour: Number(price || 0),
        years_experience: Number(yearsExperience || 0),
      })

      if (error) throw error
      setMessage('Profile updated successfully.')
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <CoachNavbar />
      <div className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <h1 className="mb-2 text-3xl font-bold">Edit coach profile</h1>
          <p className="mb-6 text-gray-400">Update your public coaching details and pricing.</p>

          {message && <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div>}

          <div className="space-y-5">
            <Input label="Full name" value={profile?.full_name || ''} onChange={() => {}} disabled />
            <Input label="Professional title" value={title} onChange={setTitle} placeholder="Senior Engineer at Google" />
            <Input label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/yourname" />

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Price per hour" type="number" value={price} onChange={setPrice} placeholder="75" />
              <Input label="Years of experience" type="number" value={yearsExperience} onChange={setYearsExperience} placeholder="3" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <Button variant="primary" onClick={handleSave} loading={saving}>Save changes</Button>
          </div>
        </Card>
      </div>
      </div>
    </div>
  )
}