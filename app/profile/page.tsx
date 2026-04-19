'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle, Loader2, Globe, Clock, DollarSign, Calendar, Key, Bell, Trash2, Briefcase, Building, GraduationCap, Wrench, Trophy } from 'lucide-react'
import { Button, Input, Select, Toggle } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
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

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  // Translation-dependent constants
  const statusOptions = [
    { value: 'student',        label: t('profile.statusOptions.student') },
    { value: 'employed',       label: t('profile.statusOptions.employed') },
    { value: 'unemployed',     label: t('profile.statusOptions.unemployed') },
    { value: 'career-change',  label: t('profile.statusOptions.careerChange') },
    { value: 'fresh-graduate', label: t('profile.statusOptions.freshGraduate') },
    { value: 'other',          label: t('profile.statusOptions.other') },
  ]

  const jobRoleOptions = [
    { value: 'Software Engineer',  label: t('profile.jobRoles.softwareEngineer') },
    { value: 'Product Manager',    label: t('profile.jobRoles.productManager') },
    { value: 'Data Analyst',       label: t('profile.jobRoles.dataAnalyst') },
    { value: 'Product Designer',   label: t('profile.jobRoles.productDesigner') },
    { value: 'Marketing Manager',  label: t('profile.jobRoles.marketingManager') },
    { value: 'Sales Executive',    label: t('profile.jobRoles.salesExecutive') },
    { value: 'Business Analyst',   label: t('profile.jobRoles.businessAnalyst') },
    { value: 'DevOps Engineer',    label: t('profile.jobRoles.devOpsEngineer') },
    { value: 'Data Scientist',     label: t('profile.jobRoles.dataScientist') },
    { value: 'UX Researcher',      label: t('profile.jobRoles.uxResearcher') },
    { value: 'Finance Analyst',    label: t('profile.jobRoles.financeAnalyst') },
    { value: 'HR Specialist',      label: t('profile.jobRoles.hrSpecialist') },
    { value: 'Other',              label: t('profile.jobRoles.other') },
  ]

  const yearsExperienceOptions = [
    { value: '0-1',  label: t('profile.yearsExperience.0-1') },
    { value: '1-3',  label: t('profile.yearsExperience.1-3') },
    { value: '3-5',  label: t('profile.yearsExperience.3-5') },
    { value: '5-10', label: t('profile.yearsExperience.5-10') },
    { value: '10+',  label: t('profile.yearsExperience.10+') },
  ]

  const currencyOptions = [
    { value: 'USD', label: t('profile.currencies.usd') },
    { value: 'EUR', label: t('profile.currencies.eur') },
    { value: 'GBP', label: t('profile.currencies.gbp') },
    { value: 'CAD', label: t('profile.currencies.cad') },
    { value: 'AUD', label: t('profile.currencies.aud') },
    { value: 'INR', label: t('profile.currencies.inr') },
  ]

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
            <ArrowLeft className="w-4 h-4" /> {t('profile.nav.backToDashboard')}
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
              <h1 className="text-3xl font-bold mb-1">{t('profile.title')}</h1>
              <p className="text-gray-400 text-sm">{t('profile.description')}</p>
              {lastSaved && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('profile.lastSaved')}: {Math.floor((Date.now() - lastSaved.getTime()) / 60000)} {t('profile.minutes ago')}
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
                  <h2 className="text-xl font-bold">{t('profile.personalInfo.title')}</h2>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input 
                    label={t('profile.personalInfo.firstName')} 
                    value={firstName} 
                    onChange={handleFirstNameChange} 
                    placeholder={t('profile.personalInfo.firstNamePlaceholder')} 
                    required
                    style={{ textTransform: 'capitalize' }}
                  />
                  <Input 
                    label={t('profile.personalInfo.lastName')} 
                    value={lastName} 
                    onChange={handleLastNameChange} 
                    placeholder={t('profile.personalInfo.lastNamePlaceholder')} 
                    required
                    style={{ textTransform: 'capitalize' }}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Select 
                    label={t('profile.personalInfo.country')} 
                    value={country}
                    onChange={handleCountryChange} 
                    options={countryOptions} 
                    placeholder={country ? undefined : t('profile.personalInfo.selectCountry')}
                    required 
                  />
                  <Select 
                    label={t('profile.personalInfo.region')} 
                    value={region} 
                    onChange={handleRegionChange} 
                    options={regionOptions} 
                    placeholder={country ? (region ? undefined : t('profile.personalInfo.selectRegion')) : t('profile.personalInfo.selectCountryFirst')}
                    required 
                    disabled={!country}
                  />
                  <Select 
                    label={t('profile.personalInfo.city')} 
                    value={city} 
                    onChange={(v) => { setCity(v); setHasUnsaved(true) }} 
                    options={cityOptions} 
                    placeholder={region ? (city ? undefined : t('profile.personalInfo.selectCity')) : t('profile.personalInfo.selectRegionFirst')}
                    required 
                    disabled={!region}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-2" />
                  <div className="flex-1">
                    <Input
                      label={t('profile.personalInfo.timezone')}
                      value={timezone}
                      onChange={(v) => { setTimezone(v); setHasUnsaved(true) }}
                      placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('profile.personalInfo.timezoneHelper')}</p>
                  </div>
                </div>

                <Input
                  label={t('profile.personalInfo.linkedinUrl')}
                  value={linkedinUrl}
                  onChange={(v) => { setLinkedinUrl(v); setHasUnsaved(true) }}
                  placeholder={t('profile.personalInfo.linkedinPlaceholder')}
                />
              </div>

              {/* Bio */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }} data-section="bio">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{t('profile.bio.title')}</h2>
                    <p className="text-sm text-gray-400">{t('profile.bio.subtitle')}</p>
                  </div>
                  <span className="text-red-400 text-sm">*</span>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    {t('profile.bio.label')} <span className="text-red-400">{t('profile.bio.required')}</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); setHasUnsaved(true) }}
                    rows={5}
                    placeholder={t('profile.bio.placeholder')}
                    className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: '#0a0f1e' }}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {bio.length} / 500 {t('profile.bio.characters')} {bio.length < 50 && <span className="text-yellow-400">({t('profile.bio.minimum')})</span>}
                  </p>
                </div>
              </div>

              {/* Career Info */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: '#111827' }} data-section="career-info">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.careerInfo.title')}</h2>
                </div>

                <Select
                  label={t('profile.careerInfo.currentStatus')}
                  value={currentStatus}
                  onChange={(v) => { setCurrentStatus(v); setHasUnsaved(true) }}
                  options={statusOptions}
                  placeholder={t('profile.careerInfo.statusPlaceholder')}
                />
                
                {currentStatus && (
                  <Input
                    label={t('profile.careerInfo.statusDetail')}
                    value={statusDetail}
                    onChange={(v) => { setStatusDetail(v); setHasUnsaved(true) }}
                    placeholder={
                      currentStatus === 'student' ? t('profile.careerInfo.statusDetailPlaceholder.student') :
                      currentStatus === 'employed' ? t('profile.careerInfo.statusDetailPlaceholder.employed') :
                      currentStatus === 'unemployed' ? t('profile.careerInfo.statusDetailPlaceholder.unemployed') :
                      currentStatus === 'career-change' ? t('profile.careerInfo.statusDetailPlaceholder.careerChange') :
                      currentStatus === 'fresh-graduate' ? t('profile.careerInfo.statusDetailPlaceholder.freshGraduate') :
                      t('profile.careerInfo.statusDetailPlaceholder.other')
                    }
                  />
                )}

                <Select
                  label={t('profile.careerInfo.targetJobRole')}
                  value={targetJobRole}
                  onChange={(val) => { setTargetJobRole(val); if (val !== 'Other') setCustomJobRole(''); setHasUnsaved(true) }}
                  options={jobRoleOptions}
                  placeholder={t('profile.careerInfo.targetJobPlaceholder')}
                />
                
                {targetJobRole === 'Other' && (
                  <Input
                    label={t('profile.jobRoles.other')}
                    value={customJobRole}
                    onChange={(v) => { setCustomJobRole(v); setHasUnsaved(true) }}
                    placeholder={t('profile.careerInfo.customRolePlaceholder')}
                  />
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label={t('profile.careerInfo.experienceLevel')}
                    value={experienceLevel}
                    onChange={(v) => { setExperienceLevel(v); setHasUnsaved(true) }}
                    options={[
                      { value: 'junior', label: `${t('profile.experienceLevels.junior')} (0–2 yrs)` },
                      { value: 'mid', label: `${t('profile.experienceLevels.mid')} (3–5 yrs)` },
                      { value: 'senior', label: `${t('profile.experienceLevels.senior')} (6+ yrs)` },
                    ]}
                    placeholder={t('profile.careerInfo.selectLevel') || 'Select level'}
                  />
                  
                  <Select
                    label={t('profile.careerInfo.yearsOfExperience')}
                    value={yearsOfExperience}
                    onChange={(v) => { setYearsOfExperience(v); setHasUnsaved(true) }}
                    options={yearsExperienceOptions}
                    placeholder="Select years"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    {t('profile.careerInfo.workTypePreferences')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeRemote ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeRemote}
                        onChange={(e) => { setWorkTypeRemote(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">{t('profile.careerInfo.remote')}</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeHybrid ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeHybrid}
                        onChange={(e) => { setWorkTypeHybrid(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">{t('profile.careerInfo.hybrid')}</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer transition-colors" style={{ background: workTypeOnsite ? '#7c3aed20' : '#0a0f1e' }}>
                      <input
                        type="checkbox"
                        checked={workTypeOnsite}
                        onChange={(e) => { setWorkTypeOnsite(e.target.checked); setHasUnsaved(true) }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">{t('profile.careerInfo.onsite')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    {t('profile.careerInfo.desiredSalary')}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
                    <Input
                      label={t('profile.careerInfo.salaryMin')}
                      type="number"
                      value={salaryMin}
                      onChange={(v) => { setSalaryMin(v); setHasUnsaved(true) }}
                      placeholder={t('profile.careerInfo.salaryMinPlaceholder')}
                    />
                    <Input
                      label={t('profile.careerInfo.salaryMax')}
                      type="number"
                      value={salaryMax}
                      onChange={(v) => { setSalaryMax(v); setHasUnsaved(true) }}
                      placeholder={t('profile.careerInfo.salaryMaxPlaceholder')}
                    />
                    <Select
                      label={t('profile.careerInfo.currency')}
                      value={salaryCurrency}
                      onChange={(v) => { setSalaryCurrency(v); setHasUnsaved(true) }}
                      options={currencyOptions}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      {t('profile.careerInfo.availableFrom')}
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
                          { value: 'immediately', label: t('profile.careerInfo.immediately') },
                          { value: 'specific', label: t('profile.careerInfo.specificDate') },
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
                    label={t('profile.careerInfo.preferredJobLocation')}
                    value={preferredJobLocation}
                    onChange={(v) => { setPreferredJobLocation(v); setHasUnsaved(true) }}
                    placeholder={t('profile.careerInfo.preferredLocationPlaceholder')}
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
                    <h2 className="text-xl font-bold">{t('profile.socialLinks.title')}</h2>
                    <p className="text-sm text-gray-400">{t('profile.socialLinks.subtitle')}</p>
                  </div>
                </div>

                <Input
                  label={t('profile.socialLinks.portfolioUrl')}
                  value={portfolioUrl}
                  onChange={(v) => { setPortfolioUrl(v); setHasUnsaved(true) }}
                  placeholder={t('profile.socialLinks.portfolioPlaceholder')}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={t('profile.socialLinks.githubUrl')}
                    value={githubUrl}
                    onChange={(v) => { setGithubUrl(v); setHasUnsaved(true) }}
                    placeholder={t('profile.socialLinks.githubPlaceholder')}
                  />
                  <Input
                    label={t('profile.socialLinks.twitterUrl')}
                    value={twitterUrl}
                    onChange={(v) => { setTwitterUrl(v); setHasUnsaved(true) }}
                    placeholder={t('profile.socialLinks.twitterPlaceholder')}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={t('profile.socialLinks.behanceUrl')}
                    value={behanceUrl}
                    onChange={(v) => { setBehanceUrl(v); setHasUnsaved(true) }}
                    placeholder={t('profile.socialLinks.behancePlaceholder')}
                  />
                  <Input
                    label={t('profile.socialLinks.dribbbleUrl')}
                    value={dribbbleUrl}
                    onChange={(v) => { setDribbbleUrl(v); setHasUnsaved(true) }}
                    placeholder={t('profile.socialLinks.dribbblePlaceholder')}
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="experience">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.workExperience.title')}</h2>
                </div>
                <ExperienceCardsSection userId={user.id} />
              </div>

              {/* Education */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="education">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.education.title')}</h2>
                </div>
                <EducationCardsSection userId={user.id} userCountry={country} />
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="skills">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-pink-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.skills.title')}</h2>
                </div>
                <SkillsSelector userId={user.id} />
              </div>

              {/* Achievements */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="achievements">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.achievements.title')}</h2>
                </div>
                <AchievementsCardsSection userId={user.id} />
              </div>

              {/* Account Settings */}
              <div className="rounded-2xl border border-white/10 p-6 space-y-6" style={{ background: '#111827' }} data-section="account">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-600/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold">{t('profile.accountSettings.title')}</h2>
                </div>

                {/* Plan Info */}
                <div className="rounded-lg border border-white/10 p-4" style={{ background: '#0a0f1e' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{t('profile.accountSettings.currentPlan')}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white capitalize">
                      {profile.subscription_tier || 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('profile.accountSettings.interviewsThisMonth')}</span>
                    <span className="text-white font-medium">
                      {profile.interviews_used_this_month || 0} / {profile.interviews_limit === 999999 ? t('profile.accountSettings.unlimited') : profile.interviews_limit}
                    </span>
                  </div>
                  <Link href="/pricing" className="mt-4 block">
                    <Button variant={profile.subscription_tier === 'pro' ? 'outline' : 'primary'} fullWidth>
                      {profile.subscription_tier === 'pro' ? t('profile.accountSettings.managePlan') : t('profile.accountSettings.upgradePlan')}
                    </Button>
                  </Link>
                </div>

                {/* Change Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    {t('profile.accountSettings.password')}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    fullWidth
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {t('profile.accountSettings.changePassword')}
                  </Button>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-200">
                    <Bell className="w-4 h-4 inline mr-2" />
                    {t('profile.accountSettings.notificationPreferences')}
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">{t('profile.accountSettings.notifyCoachMessage')}</span>
                      <Toggle
                        checked={notifyCoachMessage}
                        onChange={(checked) => { setNotifyCoachMessage(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">{t('profile.accountSettings.notifySessionReminder')}</span>
                      <Toggle
                        checked={notifySessionReminder}
                        onChange={(checked) => { setNotifySessionReminder(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">{t('profile.accountSettings.notifyJobOffers')}</span>
                      <Toggle
                        checked={notifyJobOffers}
                        onChange={(checked) => { setNotifyJobOffers(checked); setHasUnsaved(true) }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: '#0a0f1e' }}>
                      <span className="text-sm text-gray-200">{t('profile.accountSettings.notifyWeeklyReport')}</span>
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
                      <h3 className="text-lg font-bold text-red-300 mb-1">{t('profile.accountSettings.dangerZone')}</h3>
                      <p className="text-sm text-red-200/80">
                        {t('profile.accountSettings.deleteAccountWarning')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-4 py-2.5 rounded-lg bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('profile.accountSettings.deleteAccount')}
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
                  <CheckCircle className="w-4 h-4" /> {t('profile.savedSuccess')}
                </div>
              )}

              {/* Save Button */}
              <div className="sticky bottom-4 z-30">
                <Button type="submit" variant="primary" fullWidth loading={saving} className="shadow-2xl">
                  {t('profile.saveChanges')}
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
