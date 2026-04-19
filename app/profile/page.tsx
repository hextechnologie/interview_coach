'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle, Loader2, Globe, Clock, DollarSign, Calendar, Key, Bell, Trash2, Briefcase, Building, GraduationCap, Wrench, Trophy } from 'lucide-react'
import { Button, Input, Select, Toggle } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import ProfileCompletionBar from '@/components/ProfileCompletionBar'
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader'
import SidebarNav from '@/components/SidebarNav'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import UnsavedChangesWarning from '@/components/UnsavedChangesWarning'
import ExperienceCardsSection from '@/components/coach/ExperienceCardsSection'
import EducationCardsSection from '@/components/coach/EducationCardsSection'
import SkillsSelector from '@/components/coach/SkillsSelector'
import AchievementsCardsSection from '@/components/coach/AchievementsCardsSection'
import { getCountryOptions, getRegionsForCountry, getCitiesForRegion } from '@/lib/locations'
import { capitalizeName, getTimezoneFromCountry, isValidUrl } from '@/lib/profile-utils'

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

const yearsExperienceOptions = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
]

const currencyOptions = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'CAD', label: 'C$ CAD' },
  { value: 'AUD', label: 'A$ AUD' },
  { value: 'INR', label: '₹ INR' },
]

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  // Personal info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [timezone, setTimezone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Bio
  const [bio, setBio] = useState('')

  // Career info
  const [currentStatus, setCurrentStatus] = useState('')
  const [statusDetail, setStatusDetail] = useState('')
  const [targetJobRole, setTargetJobRole] = useState('')
  const [customJobRole, setCustomJobRole] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [workTypeRemote, setWorkTypeRemote] = useState(false)
  const [workTypeHybrid, setWorkTypeHybrid] = useState(false)
  const [workTypeOnsite, setWorkTypeOnsite] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('USD')
  const [availableFrom, setAvailableFrom] = useState('')
  const [availabilityMode, setAvailabilityMode] = useState<'immediately' | 'specific'>('immediately')
  const [preferredJobLocation, setPreferredJobLocation] = useState('')

  // Social/Portfolio URLs
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [behanceUrl, setBehanceUrl] = useState('')
  const [dribbbleUrl, setDribbbleUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')

  // Notification preferences
  const [notifyCoachMessage, setNotifyCoachMessage] = useState(true)
  const [notifySessionReminder, setNotifySessionReminder] = useState(true)
  const [notifyJobOffers, setNotifyJobOffers] = useState(true)
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(false)

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  // Get location options
  const countryOptions = useMemo(() => getCountryOptions(), [])
  const regionOptions = useMemo(() => {
    if (!country) return []
    const regions = getRegionsForCountry(country)
    if (region && !regions.some(opt => opt.value === region)) {
      return [{ value: region, label: region }, ...regions]
    }
    return regions
  }, [country, region])
  const cityOptions = useMemo(() => {
    if (!country || !region) return []
    const cities = getCitiesForRegion(country, region)
    if (city && !cities.some(opt => opt.value === city)) {
      return [{ value: city, label: city }, ...cities]
    }
    return cities
  }, [country, region, city])

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    // Extract country name from flag emoji + name format
    const countryName = newCountry.includes(' ') ? newCountry.split(' ').slice(1).join(' ') : newCountry
    
    if (country !== newCountry) {
      setCountry(newCountry)
      setRegion('')
      setCity('')
      // Auto-set timezone
      setTimezone(getTimezoneFromCountry(countryName))
      setHasUnsaved(true)
    }
  }

  // Handle region change
  const handleRegionChange = (newRegion: string) => {
    if (region !== newRegion) {
      setRegion(newRegion)
      setCity('')
      setHasUnsaved(true)
    }
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Auto-detect timezone from browser on mount
  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(browserTimezone)
  }, [])

  // Pre-fill form from profile
  useEffect(() => {
    if (!profile) return
    
    setFirstName(profile.first_name || '')
    setLastName(profile.last_name || '')
    setCountry(profile.country || '')
    setRegion((profile as any).region || '')
    setCity(profile.city || '')
    setTimezone((profile as any).timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
    setLinkedinUrl(profile.linkedin_url || '')
    setBio((profile as any).bio || '')
    setAvatarUrl(profile.avatar_url || '')
    
    setCurrentStatus(profile.current_status || '')
    setStatusDetail(profile.status_detail || '')
    
    const savedRole = profile.target_job_role || ''
    const isKnownRole = jobRoleOptions.some(o => o.value === savedRole)
    if (isKnownRole || savedRole === '') {
      setTargetJobRole(savedRole)
    } else {
      setTargetJobRole('Other')
      setCustomJobRole(savedRole)
    }
    
    setExperienceLevel(profile.experience_level || '')
    setYearsOfExperience((profile as any).years_of_experience || '')
    
    // Work type preferences
    const workTypes = (profile as any).work_type_preferences || []
    setWorkTypeRemote(workTypes.includes('Remote'))
    setWorkTypeHybrid(workTypes.includes('Hybrid'))
    setWorkTypeOnsite(workTypes.includes('On-site'))
    
    setSalaryMin((profile as any).salary_min ? String((profile as any).salary_min) : '')
    setSalaryMax((profile as any).salary_max ? String((profile as any).salary_max) : '')
    setSalaryCurrency((profile as any).salary_currency || 'USD')
    setAvailableFrom((profile as any).available_from || '')
    setAvailabilityMode((profile as any).available_from && (profile as any).available_from !== 'immediately' ? 'specific' : 'immediately')
    setPreferredJobLocation((profile as any).preferred_job_location || '')
    
    // Social URLs
    setPortfolioUrl((profile as any).portfolio_url || '')
    setGithubUrl((profile as any).github_url || '')
    setBehanceUrl((profile as any).behance_url || '')
    setDribbbleUrl((profile as any).dribbble_url || '')
    setTwitterUrl((profile as any).twitter_url || '')
    
    // Notifications
    setNotifyCoachMessage((profile as any).notification_coach_message !== false)
    setNotifySessionReminder((profile as any).notification_session_reminder !== false)
    setNotifyJobOffers((profile as any).notification_job_offers !== false)
    setNotifyWeeklyReport((profile as any).notification_weekly_report === true)
  }, [profile])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsaved) return
    
    const interval = setInterval(() => {
      // Save to localStorage
      const draft = {
        firstName, lastName, bio, currentStatus, statusDetail,
        targetJobRole, customJobRole, preferredJobLocation
      }
      localStorage.setItem(`profile-draft-${user?.id}`, JSON.stringify(draft))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [hasUnsaved, firstName, lastName, bio, currentStatus, statusDetail, targetJobRole, customJobRole, preferredJobLocation, user])

  // Handle form changes
  const handleFirstNameChange = (value: string) => {
    setFirstName(capitalizeName(value))
    setHasUnsaved(true)
  }

  const handleLastNameChange = (value: string) => {
    setLastName(capitalizeName(value))
    setHasUnsaved(true)
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
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

    // Validate URLs
    if (!isValidUrl(linkedinUrl) || !isValidUrl(portfolioUrl) || !isValidUrl(githubUrl) || 
        !isValidUrl(behanceUrl) || !isValidUrl(dribbbleUrl) || !isValidUrl(twitterUrl)) {
      setError('Please enter valid URLs (or leave empty)')
      return
    }

    // Validate Available From date (must not be in the past)
    if (availabilityMode === 'specific' && availableFrom && availableFrom !== 'immediately') {
      const selectedDate = new Date(availableFrom)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare only dates
      
      if (selectedDate < today) {
        setError('Available From date cannot be in the past. Please select today or a future date.')
        return
      }
    }

    setError('')
    setSaved(false)
    setSaving(true)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      
      // Build work type preferences array
      const workTypePrefs: string[] = []
      if (workTypeRemote) workTypePrefs.push('Remote')
      if (workTypeHybrid) workTypePrefs.push('Hybrid')
      if (workTypeOnsite) workTypePrefs.push('On-site')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          country,
          region,
          city,
          timezone,
          linkedin_url: linkedinUrl || null,
          bio: bio.trim(),
          current_status: currentStatus || null,
          status_detail: statusDetail || null,
          target_job_role: targetJobRole === 'Other' ? (customJobRole.trim() || null) : (targetJobRole || null),
          target_job_field: targetJobRole === 'Other' ? (customJobRole.trim().toLowerCase().replace(/\s+/g, '-') || null) : (targetJobRole?.toLowerCase().replace(/\s+/g, '-') || null),
          experience_level: (experienceLevel as 'junior' | 'mid' | 'senior') || null,
          years_of_experience: yearsOfExperience || null,
          work_type_preferences: workTypePrefs.length > 0 ? workTypePrefs : null,
          salary_min: salaryMin ? parseInt(salaryMin) : null,
          salary_max: salaryMax ? parseInt(salaryMax) : null,
          salary_currency: salaryCurrency,
          available_from: availableFrom || null,
          preferred_job_location: preferredJobLocation || null,
          portfolio_url: portfolioUrl || null,
          github_url: githubUrl || null,
          behance_url: behanceUrl || null,
          dribbble_url: dribbbleUrl || null,
          twitter_url: twitterUrl || null,
          notification_coach_message: notifyCoachMessage,
          notification_session_reminder: notifySessionReminder,
          notification_job_offers: notifyJobOffers,
          notification_weekly_report: notifyWeeklyReport,
          last_profile_save: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSaved(true)
      setHasUnsaved(false)
      setLastSaved(new Date())
      
      // Clear draft from localStorage
      localStorage.removeItem(`profile-draft-${user.id}`)
      
      // Reload profile data from Supabase to get latest values and recalculate completion
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // Pre-fill form with updated data (this will trigger profile completion recalculation)
      if (updatedProfile) {
        setFirstName(updatedProfile.first_name || '')
        setLastName(updatedProfile.last_name || '')
        setCountry(updatedProfile.country || '')
        setRegion(updatedProfile.region || '')
        setCity(updatedProfile.city || '')
        setTimezone(updatedProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
        setLinkedinUrl(updatedProfile.linkedin_url || '')
        setBio(updatedProfile.bio || '')
        setAvatarUrl(updatedProfile.avatar_url || '')
        
        setCurrentStatus(updatedProfile.current_status || '')
        setStatusDetail(updatedProfile.status_detail || '')
        
        const savedRole = updatedProfile.target_job_role || ''
        const isKnownRole = jobRoleOptions.some(o => o.value === savedRole)
        if (isKnownRole || savedRole === '') {
          setTargetJobRole(savedRole)
        } else {
          setTargetJobRole('Other')
          setCustomJobRole(savedRole)
        }
        
        setExperienceLevel(updatedProfile.experience_level || '')
        setYearsOfExperience(updatedProfile.years_of_experience || '')
        
        // Work type preferences
        const workTypes = updatedProfile.work_type_preferences || []
        setWorkTypeRemote(workTypes.includes('Remote'))
        setWorkTypeHybrid(workTypes.includes('Hybrid'))
        setWorkTypeOnsite(workTypes.includes('On-site'))
        
        setSalaryMin(updatedProfile.salary_min ? String(updatedProfile.salary_min) : '')
        setSalaryMax(updatedProfile.salary_max ? String(updatedProfile.salary_max) : '')
        setSalaryCurrency(updatedProfile.salary_currency || 'USD')
        setAvailableFrom(updatedProfile.available_from || '')
    setAvailabilityMode(updatedProfile.available_from && updatedProfile.available_from !== 'immediately' ? 'specific' : 'immediately')
        setGithubUrl(updatedProfile.github_url || '')
        setBehanceUrl(updatedProfile.behance_url || '')
        setDribbbleUrl(updatedProfile.dribbble_url || '')
        setTwitterUrl(updatedProfile.twitter_url || '')
        
        // Notifications
        setNotifyCoachMessage(updatedProfile.notification_coach_message !== false)
        setNotifySessionReminder(updatedProfile.notification_session_reminder !== false)
        setNotifyJobOffers(updatedProfile.notification_job_offers !== false)
        setNotifyWeeklyReport(updatedProfile.notification_weekly_report === true)
      }
      
      setTimeout(() => setSaved(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardChanges = () => {
    // Reload from profile
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      // ... (reset all fields)
      setHasUnsaved(false)
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

      {/* Unsaved Changes Warning */}
      <UnsavedChangesWarning
        hasUnsavedChanges={hasUnsaved}
        onSave={handleSave}
        onDiscard={handleDiscardChanges}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Sidebar Navigation - Desktop Only */}
          <aside className="hidden lg:block">
            <SidebarNav />
          </aside>

          {/* Main Form */}
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-1">My Profile</h1>
              <p className="text-gray-400 text-sm">Complete your profile to unlock all features and get better job matches.</p>
              {lastSaved && (
                <p className="text-xs text-gray-500 mt-2">
                  Last saved: {Math.floor((Date.now() - lastSaved.getTime()) / 60000)} minutes ago
                </p>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Photo & Completion */}
              <div className="grid md:grid-cols-[auto_1fr] gap-6">
                <ProfilePhotoUploader
                  currentPhotoUrl={avatarUrl}
                  firstName={firstName}
                  lastName={lastName}
                  email={user.email}
                  userId={user.id}
                  onPhotoUpdated={(url) => setAvatarUrl(url)}
                />
                <ProfileCompletionBar profile={profile} />
              </div>

              {/* Personal Info */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }} data-section="personal-info">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold">Personal Info</h2>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input 
                    label="First Name" 
                    value={firstName} 
                    onChange={handleFirstNameChange} 
                    placeholder="Jane" 
                    required
                    style={{ textTransform: 'capitalize' }}
                  />
                  <Input 
                    label="Last Name" 
                    value={lastName} 
                    onChange={handleLastNameChange} 
                    placeholder="Doe" 
                    required
                    style={{ textTransform: 'capitalize' }}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Select 
                    label="Country" 
                    value={country}
                    onChange={handleCountryChange} 
                    options={countryOptions} 
                    placeholder={country ? undefined : "Select country"}
                    required 
                  />
                  <Select 
                    label="Region/State" 
                    value={region} 
                    onChange={handleRegionChange} 
                    options={regionOptions} 
                    placeholder={country ? (region ? undefined : "Select region") : "Select country first"}
                    required 
                    disabled={!country}
                  />
                  <Select 
                    label="City" 
                    value={city} 
                    onChange={(v) => { setCity(v); setHasUnsaved(true) }} 
                    options={cityOptions} 
                    placeholder={region ? (city ? undefined : "Select city") : "Select region first"}
                    required 
                    disabled={!region}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-2" />
                  <div className="flex-1">
                    <Input
                      label="Timezone"
                      value={timezone}
                      onChange={(v) => { setTimezone(v); setHasUnsaved(true) }}
                      placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
                    />
                    <p className="text-xs text-gray-400 mt-1">Auto-detected from your browser. Important for scheduling coach sessions.</p>
                  </div>
                </div>

                <Input
                  label="LinkedIn URL (optional)"
                  value={linkedinUrl}
                  onChange={(v) => { setLinkedinUrl(v); setHasUnsaved(true) }}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              {/* Bio */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }} data-section="bio">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">Bio</h2>
                    <p className="text-sm text-gray-400">Tell us about yourself professionally</p>
                  </div>
                  <span className="text-red-400 text-sm">*</span>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Professional Summary <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); setHasUnsaved(true) }}
                    rows={5}
                    placeholder="Write a comprehensive professional summary about your background, experience, goals, and what makes you unique..."
                    className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: '#0a0f1e' }}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {bio.length} / 500 characters {bio.length < 50 && <span className="text-yellow-400">(Minimum 50)</span>}
                  </p>
                </div>
              </div>

              {/* Career Info */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }} data-section="career-info">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold">Career Info</h2>
                </div>

                <Select
                  label="Current Status"
                  value={currentStatus}
                  onChange={(v) => { setCurrentStatus(v); setHasUnsaved(true) }}
                  options={statusOptions}
                  placeholder="What describes you best?"
                />
                
                {currentStatus && (
                  <Input
                    label="Status Details"
                    value={statusDetail}
                    onChange={(v) => { setStatusDetail(v); setHasUnsaved(true) }}
                    placeholder={
                      currentStatus === 'student' ? 'e.g. MIT — Computer Science' :
                      currentStatus === 'employed' ? 'e.g. Software Engineer at Google' :
                      currentStatus === 'unemployed' ? 'e.g. Software Engineer — 3 months searching' :
                      currentStatus === 'career-change' ? 'e.g. Finance → Software Engineering' :
                      currentStatus === 'fresh-graduate' ? 'e.g. BSc Computer Science' :
                      'Brief description of your situation'
                    }
                  />
                )}

                <Select
                  label="Target Job Role"
                  value={targetJobRole}
                  onChange={(val) => { setTargetJobRole(val); if (val !== 'Other') setCustomJobRole(''); setHasUnsaved(true) }}
                  options={jobRoleOptions}
                  placeholder="What role are you aiming for?"
                />
                
                {targetJobRole === 'Other' && (
                  <Input
                    label="Custom Role"
                    value={customJobRole}
                    onChange={(v) => { setCustomJobRole(v); setHasUnsaved(true) }}
                    placeholder="e.g. Growth Hacker, AI Researcher, Prompt Engineer…"
                  />
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Experience Level"
                    value={experienceLevel}
                    onChange={(v) => { setExperienceLevel(v); setHasUnsaved(true) }}
                    options={[
                      { value: 'junior', label: 'Junior (0–2 yrs)' },
                      { value: 'mid', label: 'Mid-level (3–5 yrs)' },
                      { value: 'senior', label: 'Senior (6+ yrs)' },
                    ]}
                    placeholder="Select level"
                  />
                  
                  <Select
                    label="Years of Experience"
                    value={yearsOfExperience}
                    onChange={(v) => { setYearsOfExperience(v); setHasUnsaved(true) }}
                    options={yearsExperienceOptions}
                    placeholder="Select years"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Preferred Work Type
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeRemote ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeRemote}
                        onChange={(e) => { setWorkTypeRemote(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">🏠 Remote</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeHybrid ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeHybrid}
                        onChange={(e) => { setWorkTypeHybrid(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">🔄 Hybrid</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeOnsite ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeOnsite}
                        onChange={(e) => { setWorkTypeOnsite(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">🏢 On-site</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Expected Salary Range (optional)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
                    <Input
                      label="Minimum"
                      type="number"
                      value={salaryMin}
                      onChange={(v) => { setSalaryMin(v); setHasUnsaved(true) }}
                      placeholder="50000"
                    />
                    <Input
                      label="Maximum"
                      type="number"
                      value={salaryMax}
                      onChange={(v) => { setSalaryMax(v); setHasUnsaved(true) }}
                      placeholder="80000"
                    />
                    <Select
                      label="Currency"
                      value={salaryCurrency}
                      onChange={(v) => { setSalaryCurrency(v); setHasUnsaved(true) }}
                      options={currencyOptions}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Available From
                    </label>
                    <div className="space-y-2">
                      <Select
                        value={availabilityMode}
                        onChange={(val) => {
                          const mode = val as 'immediately' | 'specific'
                          setAvailabilityMode(mode)
                          if (mode === 'immediately') {
                            setAvailableFrom('immediately')
                          } else {
                            // Don't clear the date if one exists
                            if (availableFrom === 'immediately' || !availableFrom) {
                              setAvailableFrom('')
                            }
                          }
                          setHasUnsaved(true)
                        }}
                        options={[
                          { value: 'immediately', label: '✅ Immediately' },
                          { value: 'specific', label: '📅 Specific Date' },
                        ]}
                      />
                      {availabilityMode === 'specific' && (
                        <input
                          type="date"
                          value={availableFrom === 'immediately' ? '' : availableFrom}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => { setAvailableFrom(e.target.value); setHasUnsaved(true) }}
                          className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ background: '#0a0f1e' }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <Input
                    label="Preferred Job Location"
                    value={preferredJobLocation}
                    onChange={(v) => { setPreferredJobLocation(v); setHasUnsaved(true) }}
                    placeholder="e.g. Paris, France or Remote"
                  />
                </div>
              </div>

              {/* Social & Portfolio Links */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">Social & Portfolio Links</h2>
                    <p className="text-sm text-gray-400">Showcase your work and online presence</p>
                  </div>
                </div>

                <Input
                  label="Portfolio / Website"
                  value={portfolioUrl}
                  onChange={(v) => { setPortfolioUrl(v); setHasUnsaved(true) }}
                  placeholder="https://yourportfolio.com"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="GitHub"
                    value={githubUrl}
                    onChange={(v) => { setGithubUrl(v); setHasUnsaved(true) }}
                    placeholder="https://github.com/yourusername"
                  />
                  <Input
                    label="Twitter / X"
                    value={twitterUrl}
                    onChange={(v) => { setTwitterUrl(v); setHasUnsaved(true) }}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Behance (Designers)"
                    value={behanceUrl}
                    onChange={(v) => { setBehanceUrl(v); setHasUnsaved(true) }}
                    placeholder="https://behance.net/yourusername"
                  />
                  <Input
                    label="Dribbble (Designers)"
                    value={dribbbleUrl}
                    onChange={(v) => { setDribbbleUrl(v); setHasUnsaved(true) }}
                    placeholder="https://dribbble.com/yourusername"
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="experience">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold">Work Experience</h2>
                </div>
                <ExperienceCardsSection userId={user.id} />
              </div>

              {/* Education */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="education">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-bold">Education & Certifications</h2>
                </div>
                <EducationCardsSection userId={user.id} userCountry={country} />
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="skills">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-pink-400" />
                  </div>
                  <h2 className="text-xl font-bold">Skills & Expertise</h2>
                </div>
                <SkillsSelector userId={user.id} />
              </div>

              {/* Achievements */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="achievements">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold">Achievements & Highlights</h2>
                </div>
                <AchievementsCardsSection userId={user.id} />
              </div>

              {/* Account Settings */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="account">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-600/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold">Account Settings</h2>
                </div>

                {/* Plan Info */}
                <div className="rounded-lg border border-white/10 p-4" style={{ background: '#0a0f1e' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Current Plan</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white capitalize">
                      {profile.subscription_tier || 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Interviews this month</span>
                    <span className="text-white font-medium">
                      {profile.interviews_used_this_month || 0} / {profile.interviews_limit === 999999 ? 'Unlimited' : profile.interviews_limit}
                    </span>
                  </div>
                  <Link href="/pricing" className="mt-4 block">
                    <Button variant={profile.subscription_tier === 'pro' ? 'outline' : 'primary'} fullWidth>
                      {profile.subscription_tier === 'pro' ? 'Manage Plan' : 'Upgrade Plan'}
                    </Button>
                  </Link>
                </div>

                {/* Change Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Password
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    fullWidth
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-200">
                    <Bell className="w-4 h-4 inline mr-2" />
                    Notification Preferences
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">New coach message</span>
                      <Toggle
                        checked={notifyCoachMessage}
                        onChange={(checked) => { setNotifyCoachMessage(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">Session reminder (1 hour before)</span>
                      <Toggle
                        checked={notifySessionReminder}
                        onChange={(checked) => { setNotifySessionReminder(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">New job offers matching profile</span>
                      <Toggle
                        checked={notifyJobOffers}
                        onChange={(checked) => { setNotifyJobOffers(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">Weekly progress report</span>
                      <Toggle
                        checked={notifyWeeklyReport}
                        onChange={(checked) => { setNotifyWeeklyReport(checked); setHasUnsaved(true) }}
                      />
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-lg border-2 border-red-500/40 p-5" style={{ background: '#1a0505' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-red-300 mb-1">Danger Zone</h3>
                      <p className="text-sm text-red-200/80">
                        Once you delete your account, there is no going back. This action is permanent.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-4 py-2.5 rounded-lg bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
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

              {/* Save Button */}
              <div className="sticky bottom-4 z-30">
                <Button type="submit" variant="primary" fullWidth loading={saving} className="shadow-2xl">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        userEmail={user.email || ''}
      />
    </div>
  )
}
