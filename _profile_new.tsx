'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button, LoadingSpinner } from '@/components/ui'
import CoachNavbar from '@/components/CoachNavbar'
import { supabase, getFirstName } from '@/lib/supabase'
import { Save, Eye, Upload, Plus, X } from 'lucide-react'

const SPECIALIZATION_OPTIONS = [
  'Software Engineering', 'Product Management', 'Data Science', 'Machine Learning',
  'UX/UI Design', 'Marketing', 'Sales', 'Finance', 'Consulting', 'Leadership',
  'Behavioral Interviews', 'Technical Interviews', 'System Design', 'CV Review',
]

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl p-5 border border-white/10 ${className}`} style={{ background: '#111827' }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/40 transition-colors"
    />
  )
}

export default function CoachProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [price, setPrice] = useState('75')
  const [yearsExperience, setYearsExperience] = useState('5')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [newCompany, setNewCompany] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const displayName = getFirstName(profile?.full_name, user?.email)

  // Profile completion
  const fields = [fullName, title, bio, linkedinUrl, price, avatarUrl]
  const completedFields = fields.filter((f) => f.trim().length > 0).length
  const completionPct = Math.round((completedFields / fields.length) * 100)

  useEffect(() => {
    if (user) fetchCoachProfile()
  }, [user])

  const fetchCoachProfile = async () => {
    if (!user) return
    try {
      const [{ data: profileData }, { data: coachData }] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
        supabase.from('coach_profiles').select('*').eq('user_id', user.id).single(),
      ])
      if (profileData) {
        setFullName(profileData.full_name || '')
        setAvatarUrl(profileData.avatar_url || '')
      }
      if (coachData) {
        setTitle(coachData.title || '')
        setBio(coachData.bio || '')
        setLinkedinUrl(coachData.linkedin_url || '')
        setPrice(String(coachData.price_per_hour || 75))
        setYearsExperience(String(coachData.years_experience || 5))
        setSpecializations(coachData.specializations || [])
        setCompanies(coachData.companies || [])
      }
    } finally { setLoading(false) }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } finally { setUploadingAvatar(false) }
  }

  const toggleSpecialization = (sp: string) => {
    setSpecializations((prev) => prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp])
    setSaved(false)
  }

  const addCompany = () => {
    if (!newCompany.trim() || companies.includes(newCompany.trim())) return
    setCompanies((prev) => [...prev, newCompany.trim()])
    setNewCompany('')
    setSaved(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await Promise.all([
        supabase.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', user.id),
        supabase.from('coach_profiles').upsert({
          user_id: user.id,
          title,
          bio,
          linkedin_url: linkedinUrl,
          price_per_hour: Number(price),
          years_experience: Number(yearsExperience),
          specializations,
          companies,
        }, { onConflict: 'user_id' }),
      ])
      await refreshProfile()
      setSaved(true)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}><LoadingSpinner size="lg" /></div>
  if (!user) return null

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1e' }}>
      <CoachNavbar />
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Profile</h1>
            <p className="text-gray-400">This is what candidates see when they browse coaches.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 text-sm" onClick={() => window.open(`/coaches/${user.id}`, '_blank')}>
              <Eye className="w-4 h-4" /> Preview Profile
            </Button>
            <Button variant="primary" onClick={saveProfile} loading={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saved ? '✓ Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Profile completion bar */}
        <DarkCard className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Profile Completion</p>
            <span className={`text-sm font-bold ${completionPct === 100 ? 'text-green-400' : completionPct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{completionPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
          {completionPct < 100 && <p className="text-xs text-gray-500 mt-2">Complete your profile to attract more clients and rank higher in search results.</p>}
        </DarkCard>

        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          {/* Avatar */}
          <DarkCard className="flex flex-col items-center gap-4 h-fit">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/40" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold uppercase">
                  {displayName.charAt(0)}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <Button variant="outline" className="gap-2 text-sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload Photo
            </Button>
            <div className="text-center">
              <p className="font-semibold">{fullName || displayName}</p>
              <p className="text-xs text-gray-400">{profile?.email}</p>
            </div>
          </DarkCard>

          {/* Form */}
          <div className="space-y-5">
            <DarkCard className="space-y-4">
              <h2 className="text-lg font-bold">Basic Info</h2>
              <Field label="Full Name">
                <Input value={fullName} onChange={setFullName} placeholder="e.g. Karim Boudara" />
              </Field>
              <Field label="Professional Title">
                <Input value={title} onChange={setTitle} placeholder="e.g. Senior Software Engineer at Google" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price per Session ($)">
                  <Input value={price} onChange={setPrice} type="number" placeholder="75" />
                </Field>
                <Field label="Years of Experience">
                  <Input value={yearsExperience} onChange={setYearsExperience} type="number" placeholder="5" />
                </Field>
              </div>
              <Field label="LinkedIn URL">
                <Input value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/yourhandle" />
              </Field>
            </DarkCard>

            <DarkCard>
              <h2 className="text-lg font-bold mb-3">Bio</h2>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); setSaved(false) }}
                placeholder="Tell candidates about your background, coaching style, and what makes you unique..."
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/40 resize-y transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
            </DarkCard>

            <DarkCard>
              <h2 className="text-lg font-bold mb-3">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => toggleSpecialization(sp)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${specializations.includes(sp) ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/10 text-gray-300 hover:border-purple-500/40'}`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </DarkCard>

            <DarkCard>
              <h2 className="text-lg font-bold mb-3">Companies Worked At</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCompany() }}
                  placeholder="e.g. Google, Amazon..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/40"
                />
                <Button variant="outline" onClick={addCompany} className="px-3 gap-1 text-sm shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {companies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {companies.map((c) => (
                    <span key={c} className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-gray-200">
                      {c}
                      <button onClick={() => setCompanies((prev) => prev.filter((x) => x !== c))} className="text-gray-400 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </DarkCard>
          </div>
        </div>
      </div>
    </div>
  )
}
