'use client'

import { ChangeEvent, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, CheckCircle, Loader2, Sparkles, X } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import ExperienceCardsSection from '@/components/coach/ExperienceCardsSection'
import EducationCardsSection from '@/components/coach/EducationCardsSection'
import SkillsSelector from '@/components/coach/SkillsSelector'
import AchievementsCardsSection from '@/components/coach/AchievementsCardsSection'
import { getCountryOptions, getRegionsForCountry, getCitiesForRegion } from '@/lib/locations'

const statusOptions = [
  { value: 'student',        label: '🎓 Student' },
  { value: 'employed',       label: '👨‍💼 Employed' },
  { value: 'unemployed',     label: '🔍 Actively Job Seeking' },
  { value: 'career-change',  label: '🔄 Career Change' },
  { value: 'fresh-graduate', label: '💼 Fresh Graduate' },
  { value: 'other',          label: '🌍 Other' },
]

const jobRoleOptions = [
  { value: 'Software Engineer',  label: 'Software Engineer' },
  { value: 'Product Manager',    label: 'Product Manager' },
  { value: 'Data Analyst',       label: 'Data Analyst' },
  { value: 'Product Designer',   label: 'Product Designer' },
  { value: 'Marketing Manager',  label: 'Marketing Manager' },
  { value: 'Sales Executive',    label: 'Sales Executive' },
  { value: 'Business Analyst',   label: 'Business Analyst' },
  { value: 'DevOps Engineer',    label: 'DevOps Engineer' },
  { value: 'Data Scientist',     label: 'Data Scientist' },
  { value: 'UX Researcher',      label: 'UX Researcher' },
  { value: 'Finance Analyst',    label: 'Finance Analyst' },
  { value: 'HR Specialist',      label: 'HR Specialist' },
  { value: 'Other',              label: 'Other' },
]

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName]     = useState('')
  const [lastName,  setLastName]      = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [statusDetail,  setStatusDetail]  = useState('')
  const [targetJobRole, setTargetJobRole] = useState('')
  const [customJobRole, setCustomJobRole] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [city,    setCity]    = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)

  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  // Get cascading location options
  const countryOptions = useMemo(() => getCountryOptions(), [])
  const regionOptions = useMemo(() => {
    if (!country) return []
    const regions = getRegionsForCountry(country)
    // If current region is set but not in the list (legacy data), add it
    if (region && !regions.some(opt => opt.value === region)) {
      return [{ value: region, label: region }, ...regions]
    }
    return regions
  }, [country, region])
  const cityOptions = useMemo(() => {
    if (!country || !region) return []
    const cities = getCitiesForRegion(country, region)
    // If current city is set but not in the list (legacy data), add it
    if (city && !cities.some(opt => opt.value === city)) {
      return [{ value: city, label: city }, ...cities]
    }
    return cities
  }, [country, region, city])

  // Reset region and city when country changes
  const handleCountryChange = (newCountry: string) => {
    const oldCountry = country
    setCountry(newCountry)
    // Only reset if country actually changed
    if (oldCountry !== newCountry) {
      setRegion('')
      setCity('')
    }
  }

  // Reset city when region changes
  const handleRegionChange = (newRegion: string) => {
    const oldRegion = region
    setRegion(newRegion)
    // Only reset city if region actually changed
    if (oldRegion !== newRegion) {
      setCity('')
    }
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Pre-fill form from existing profile
  useEffect(() => {
    if (!profile) return
    setFirstName(profile.first_name || (profile.full_name?.split(' ')[0] ?? ''))
    setLastName(profile.last_name  || (profile.full_name?.split(' ').slice(1).join(' ') ?? ''))
    setCurrentStatus(profile.current_status  ?? '')
    setStatusDetail(profile.status_detail    ?? '')
    const savedRole = profile.target_job_role ?? ''
    const isKnownRole = jobRoleOptions.some(o => o.value === savedRole)
    if (isKnownRole || savedRole === '') {
      setTargetJobRole(savedRole)
    } else {
      setTargetJobRole('Other')
      setCustomJobRole(savedRole)
    }
    setExperienceLevel(profile.experience_level ?? '')
    setCountry(profile.country ?? '')
    setRegion((profile as any).region ?? '')
    setCity(profile.city       ?? '')
    setLinkedinUrl(profile.linkedin_url ?? '')
    setBio((profile as any).bio ?? '')

    setAvatarPreview(profile.avatar_url ?? '')
  }, [profile])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!lastName.trim()) {
      setError('Last name is required')
      return
    }
    if (!country.trim()) {
      setError('Country is required')
      return
    }
    if (!region.trim()) {
      setError('Region/State is required')
      return
    }
    if (!city.trim()) {
      setError('City is required')
      return
    }
    if (!bio.trim()) {
      setError('Bio is required')
      return
    }

    setError('')
    setSaved(false)
    setSaving(true)

    try {
      let avatarUrl = profile?.avatar_url ?? null

      // Upload new avatar if chosen
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}.${ext}`, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
        avatarUrl = urlData.publicUrl
      }

      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name:      firstName.trim() || null,
          last_name:       lastName.trim()  || null,
          full_name:       fullName         || null,
          current_status:  currentStatus    || null,
          status_detail:   statusDetail     || null,
          target_job_role: targetJobRole === 'Other' ? (customJobRole.trim() || null) : (targetJobRole || null),
          target_job_field: targetJobRole === 'Other' ? (customJobRole.trim().toLowerCase().replace(/\s+/g, '-') || null) : (targetJobRole?.toLowerCase().replace(/\s+/g, '-') || null),
          experience_level: (experienceLevel as 'junior' | 'mid' | 'senior') || null,
          country:         country    || null,
          region:          region     || null,
          city:            city       || null,
          linkedin_url:    linkedinUrl || null,
          bio:             bio.trim(),
          avatar_url:      avatarUrl,
          updated_at:      new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1e' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Interview Coach
            </span>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">My Profile</h1>
          <p className="text-gray-400 text-sm">Update your personal info and job preferences.</p>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
                {(firstName || user.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer border-2 border-[#0a0f1e] hover:bg-purple-500 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
          </div>
          <div>
            <p className="font-semibold">{[firstName, lastName].filter(Boolean).join(' ') || 'Your Name'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{profile.subscription_tier} plan</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Personal Info <span className="text-red-400">*</span></h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="Jane" required />
              <Input label="Last Name"  value={lastName}  onChange={setLastName}  placeholder="Doe" required />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Select 
                label="Country" 
                value={country} 
                onChange={handleCountryChange} 
                options={countryOptions} 
                placeholder="Select country" 
                required 
              />
              <Select 
                label="Region/State" 
                value={region} 
                onChange={handleRegionChange} 
                options={regionOptions} 
                placeholder={country ? "Select region" : "Select country first"} 
                required 
                disabled={!country}
              />
              <Select 
                label="City" 
                value={city} 
                onChange={setCity} 
                options={cityOptions} 
                placeholder={region ? "Select city" : "Select region first"} 
                required 
                disabled={!region}
              />
            </div>
            <Input
              label="LinkedIn URL (optional)"
              value={linkedinUrl}
              onChange={setLinkedinUrl}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* Bio */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Bio <span className="text-red-400">*</span></h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">About You <span className="text-red-400">*</span></label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder="Write a professional summary about yourself, your background, goals, and what makes you unique..."
                className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{ background: '#0a0f1e' }}
                required
              />
            </div>
          </div>

          {/* Career */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Career Info</h2>
            <Select
              label="Current Status"
              value={currentStatus}
              onChange={setCurrentStatus}
              options={statusOptions}
              placeholder="What describes you best?"
            />
            {currentStatus && (
              <Input
                label="Status Details"
                value={statusDetail}
                onChange={setStatusDetail}
                placeholder={
                  currentStatus === 'student'        ? 'e.g. MIT — Computer Science' :
                  currentStatus === 'employed'       ? 'e.g. Software Engineer at Google' :
                  currentStatus === 'unemployed'     ? 'e.g. Software Engineer — 3 months searching' :
                  currentStatus === 'career-change'  ? 'e.g. Finance → Software Engineering' :
                  currentStatus === 'fresh-graduate' ? 'e.g. BSc Computer Science' :
                  'Brief description of your situation'
                }
              />
            )}
            <Select
              label="Target Job Role"
              value={targetJobRole}
              onChange={(val) => { setTargetJobRole(val); if (val !== 'Other') setCustomJobRole('') }}
              options={jobRoleOptions}
              placeholder="What role are you aiming for?"
            />
            {targetJobRole === 'Other' && (
              <Input
                label="What's your exact role?"
                value={customJobRole}
                onChange={setCustomJobRole}
                placeholder="e.g. Growth Hacker, AI Researcher, Prompt Engineer…"
              />
            )}
            {targetJobRole && (
              <Select
                label="Experience Level"
                value={experienceLevel}
                onChange={setExperienceLevel}
                options={[
                  { value: 'junior', label: 'Junior (0–2 yrs)' },
                  { value: 'mid',    label: 'Mid-level (3–5 yrs)' },
                  { value: 'senior', label: 'Senior (6+ yrs)' },
                ]}
                placeholder="Select level"
              />
            )}
          </div>

          {/* Experience Section */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-8" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Work Experience</h2>
            <ExperienceCardsSection userId={user!.id} />
          </div>

          {/* Education Section */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-8" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Education & Certifications</h2>
            <EducationCardsSection userId={user!.id} userCountry={country} />
          </div>

          {/* Skills Section */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-8" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Skills & Expertise</h2>
            <SkillsSelector userId={user!.id} />
          </div>

          {/* Achievements Section */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-8" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Achievements & Highlights</h2>
            <AchievementsCardsSection userId={user!.id} />
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              <CheckCircle className="w-4 h-4" /> Profile saved successfully!
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth loading={saving}>
            Save Changes
          </Button>
        </form>

        {/* Account info (read-only) */}
        <div className="mt-8 rounded-2xl border border-white/10 p-5" style={{ background: '#111827' }}>
          <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-white capitalize">{profile.subscription_tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Interviews this month</span>
              <span className="text-white">{profile.interviews_used_this_month} / {profile.interviews_limit === 999999 ? '∞' : profile.interviews_limit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Member since</span>
              <span className="text-white">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" fullWidth className="text-sm">Upgrade Plan</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
