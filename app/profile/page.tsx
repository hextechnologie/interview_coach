'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle, Loader2, Globe, Clock, Key, Bell, Trash2, Briefcase, Building, GraduationCap, Wrench, Trophy } from 'lucide-react'
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
import TimezoneSelector from '@/components/TimezoneSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import ExperienceCardsSection from '@/components/coach/ExperienceCardsSection'
import EducationCardsSection from '@/components/coach/EducationCardsSection'
import SkillsSelector from '@/components/coach/SkillsSelector'
import AchievementsCardsSection from '@/components/coach/AchievementsCardsSection'
import { getCountryOptions, getRegionsForCountry, getCitiesForRegion } from '@/lib/locations'
import { JOB_TITLES } from '@/lib/types/profile'
import { capitalizeName, getTimezoneFromCountry, isValidUrl } from '@/lib/profile-utils'

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
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

  const translateWithFallback = (key: string, fallback: string) => {
    const value = t(key)
    return value === key ? fallback : value
  }

  const experienceLevelOptions = [
    { value: 'junior', label: `${translateWithFallback('profile.experienceLevels.junior', 'Junior')} (0–2 yrs)` },
    { value: 'mid', label: `${translateWithFallback('profile.experienceLevels.mid', 'Mid')} (3–5 yrs)` },
    { value: 'senior', label: `${translateWithFallback('profile.experienceLevels.senior', 'Senior')} (6+ yrs)` },
  ]


  // Personal info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [timezone, setTimezone] = useState('')
  const [detectedTimezone, setDetectedTimezone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Bio
  const [bio, setBio] = useState('')

  // Career info
  const [currentStatus, setCurrentStatus] = useState('')
  const [statusDetail, setStatusDetail] = useState('')
  const [targetJobRole, setTargetJobRole] = useState('')
  const [customJobRole, setCustomJobRole] = useState('')
  const [showCustomJobSuggestions, setShowCustomJobSuggestions] = useState(false)
  const [experienceLevel, setExperienceLevel] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')

  // Notification preferences
  const [notifyCoachMessage, setNotifyCoachMessage] = useState(true)
  const [notifySessionReminder, setNotifySessionReminder] = useState(true)
  const [notifyJobOffers, setNotifyJobOffers] = useState(true)
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(false)

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  const customJobSuggestions = targetJobRole === 'Other'
    ? Array.from(new Set([
        ...jobRoleOptions.filter((role) => role.value !== 'Other').map((role) => role.value),
        ...JOB_TITLES,
        'FPGA Engineer',
        'Embedded Systems Engineer',
        'RTL Design Engineer',
        'Hardware Engineer',
      ])).filter((role) => {
        const query = customJobRole.trim().toLowerCase()
        return query.length > 0 && role.toLowerCase().includes(query) && role.toLowerCase() !== query
      }).slice(0, 8)
    : []

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
    setDetectedTimezone(browserTimezone)
    if (!timezone) {
      setTimezone(browserTimezone)
    }
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
        targetJobRole, customJobRole
      }
      localStorage.setItem(`profile-draft-${user?.id}`, JSON.stringify(draft))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [hasUnsaved, firstName, lastName, bio, currentStatus, statusDetail, targetJobRole, customJobRole, user])

  // Handle form changes
  const handleFirstNameChange = (value: string) => {
    setFirstName(capitalizeName(value))
    setHasUnsaved(true)
  }

  const handleLastNameChange = (value: string) => {
    setLastName(capitalizeName(value))
    setHasUnsaved(true)
  }

  // Validation helpers
  const validateField = (fieldName: string): Record<string, string> => {
    const fieldErrors: Record<string, string> = {}
    
    switch (fieldName) {
      case 'firstName':
        if (!firstName || firstName.trim().length === 0) {
          fieldErrors.firstName = t('profile.personalInfo.firstName') + ' is required'
        }
        break
      case 'lastName':
        if (!lastName || lastName.trim().length === 0) {
          fieldErrors.lastName = t('profile.personalInfo.lastName') + ' is required'
        }
        break
      case 'country':
        if (!country) {
          fieldErrors.country = 'Please select your country'
        }
        break
      case 'region':
        if (!region) {
          fieldErrors.region = 'Region/State is required'
        }
        break
      case 'city':
        if (!city) {
          fieldErrors.city = 'City is required'
        }
        break
      case 'bio':
        if (!bio || bio.trim().length === 0) {
          fieldErrors.bio = 'Professional summary is required'
        } else if (bio.trim().length < 50) {
          fieldErrors.bio = `Too short! Please write at least 50 characters (${bio.trim().length}/50 currently)`
        }
        break
      case 'linkedinUrl':
        if (linkedinUrl && !isValidUrl(linkedinUrl)) {
          fieldErrors.linkedinUrl = 'Please enter a valid URL (or leave empty)'
        }
        break
    }
    
    return fieldErrors
  }

  const validateForm = (): Record<string, string> => {
    const allErrors: Record<string, string> = {}

    // First name validation
    if (!firstName || firstName.trim().length === 0) {
      allErrors.firstName = t('profile.personalInfo.firstName') + ' is required'
    }

    // Last name validation
    if (!lastName || lastName.trim().length === 0) {
      allErrors.lastName = t('profile.personalInfo.lastName') + ' is required'
    }

    // Country validation
    if (!country) {
      allErrors.country = 'Please select your country'
    }

    // Region validation
    if (!region) {
      allErrors.region = 'Region/State is required'
    }

    // City validation
    if (!city) {
      allErrors.city = 'City is required'
    }

    // Bio validation - STRICT minimum 50
    if (!bio || bio.trim().length === 0) {
      allErrors.bio = 'Professional summary is required'
    } else if (bio.trim().length < 50) {
      allErrors.bio = `Too short! Please write at least 50 characters (${bio.trim().length}/50 currently)`
    }

    // LinkedIn URL validation
    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      allErrors.linkedinUrl = 'Please enter a valid URL (or leave empty)'
    }

    return allErrors
  }

  const scrollToField = (fieldName: string) => {
    const element = document.getElementById(`field-${fieldName}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add temporary highlight animation
      element.classList.add('highlight-field')
      setTimeout(() => element.classList.remove('highlight-field'), 2000)
      // Focus the input
      const input = element.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      input?.focus()
    }
  }

  const handleFieldBlur = (fieldName: string) => {
    const fieldErrors = validateField(fieldName)
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }))
  }

  const handleFieldChange = (fieldName: string) => {
    // Clear error for this field as user types
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!user) return

    // Validate form
    const formErrors = validateForm()
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(formErrors)[0]
      scrollToField(firstErrorField)
      return // Stop save
    }

    setError('')
    setErrors({})
    setSaved(false)
    setSaving(true)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      
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
          notification_coach_message: notifyCoachMessage,
          notification_session_reminder: notifySessionReminder,
          notification_job_offers: notifyJobOffers,
          notification_weekly_report: notifyWeeklyReport,
          last_profile_save: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Refresh the profile in the auth context
      await refreshProfile()

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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href="/dashboard"
              title="Press Alt+← to go back"
              aria-label={t('profile.nav.backToDashboard')}
              className="group inline-flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 shadow-sm transition-all duration-200 hover:scale-105 hover:border-purple-500 hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="sm:hidden">{translateWithFallback('profile.nav.dashboardShort', 'Dashboard')}</span>
              <span className="hidden sm:inline">{t('profile.nav.backToDashboard')}</span>
            </Link>
          </div>
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
              {/* Error Summary Banner (Validation Errors) */}
              {Object.keys(errors).length > 0 && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-300 font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                    </svg>
                    Please fix the following errors:
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-red-300">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>
                        <button
                          type="button"
                          onClick={() => scrollToField(field)}
                          className="text-left hover:underline focus:outline-none"
                        >
                          • {message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* General Error Banner (Save Errors) */}
              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

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
                  <div id="field-firstName">
                    <Input 
                      label={t('profile.personalInfo.firstName')} 
                      value={firstName} 
                      onChange={(v) => { handleFirstNameChange(v); handleFieldChange('firstName') }} 
                      placeholder={t('profile.personalInfo.firstNamePlaceholder')} 
                      required
                      error={errors.firstName}
                      style={{ textTransform: 'capitalize' }}
                    />
                  </div>
                  <div id="field-lastName">
                    <Input 
                      label={t('profile.personalInfo.lastName')} 
                      value={lastName} 
                      onChange={(v) => { handleLastNameChange(v); handleFieldChange('lastName') }} 
                      placeholder={t('profile.personalInfo.lastNamePlaceholder')} 
                      required
                      error={errors.lastName}
                      style={{ textTransform: 'capitalize' }}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div id="field-country">
                    <Select 
                      label={t('profile.personalInfo.country')} 
                      value={country}
                      onChange={(v) => { handleCountryChange(v); handleFieldChange('country') }} 
                      options={countryOptions} 
                      placeholder={country ? undefined : t('profile.personalInfo.selectCountry')}
                      required 
                      error={errors.country}
                    />
                  </div>
                  <div id="field-region">
                    <Select 
                      label={t('profile.personalInfo.region')} 
                      value={region} 
                      onChange={(v) => { handleRegionChange(v); handleFieldChange('region') }} 
                      options={regionOptions} 
                      placeholder={country ? (region ? undefined : t('profile.personalInfo.selectRegion')) : t('profile.personalInfo.selectCountryFirst')}
                      required 
                      disabled={!country}
                      error={errors.region}
                    />
                  </div>
                  <div id="field-city">
                    <Select 
                      label={t('profile.personalInfo.city')} 
                      value={city} 
                      onChange={(v) => { setCity(v); setHasUnsaved(true); handleFieldChange('city') }} 
                      options={cityOptions} 
                      placeholder={region ? (city ? undefined : t('profile.personalInfo.selectCity')) : t('profile.personalInfo.selectRegionFirst')}
                      required 
                      disabled={!region}
                      error={errors.city}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-2" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      {t('profile.personalInfo.timezone')}
                    </label>
                    <TimezoneSelector
                      value={timezone}
                      onChange={(v) => { setTimezone(v); setHasUnsaved(true) }}
                      detectedTimezone={detectedTimezone}
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('profile.personalInfo.timezoneHelper')}</p>
                  </div>
                </div>

                <div id="field-linkedinUrl">
                  <Input
                    label={t('profile.personalInfo.linkedinUrl')}
                    value={linkedinUrl}
                    onChange={(v) => { setLinkedinUrl(v); setHasUnsaved(true); handleFieldChange('linkedinUrl') }}
                    placeholder={t('profile.personalInfo.linkedinPlaceholder')}
                    error={errors.linkedinUrl}
                  />
                </div>
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
                
                <div id="field-bio">
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    {t('profile.bio.label')} <span className="text-red-400">{t('profile.bio.required')}</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); setHasUnsaved(true); handleFieldChange('bio') }}
                    rows={5}
                    placeholder={t('profile.bio.placeholder')}
                    className={`w-full rounded-lg border px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${errors.bio ? 'border-red-500' : 'border-white/10'}`}
                    style={{ background: '#0a0f1e' }}
                    required
                  />
                  
                  {/* Enhanced Character Counter */}
                  <div className="mt-2 space-y-2">
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          bio.length >= 50 ? 'bg-green-500' : 
                          bio.length >= 25 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((bio.length / 50) * 100, 100)}%` }}
                      />
                    </div>
                    
                    {/* Character Count & Status */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {bio.length >= 50 ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Minimum reached
                          </span>
                        ) : (
                          <span className={bio.length >= 25 ? 'text-yellow-400' : 'text-red-400'}>
                            {50 - bio.length} more character{50 - bio.length !== 1 ? 's' : ''} needed
                          </span>
                        )}
                      </div>
                      <span className={`${
                        bio.length >= 50 ? 'text-green-400' : 
                        bio.length >= 25 ? 'text-yellow-400' : 
                        'text-gray-400'
                      }`}>
                        {bio.length} / 500 {t('profile.bio.characters')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
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
                  onChange={(val) => {
                    setTargetJobRole(val)
                    if (val !== 'Other') {
                      setCustomJobRole('')
                      setShowCustomJobSuggestions(false)
                    }
                    setHasUnsaved(true)
                  }}
                  options={jobRoleOptions}
                  placeholder={t('profile.careerInfo.targetJobPlaceholder')}
                />
                
                {targetJobRole === 'Other' && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('profile.jobRoles.other')}
                    </label>
                    <input
                      type="text"
                      value={customJobRole}
                      onChange={(e) => {
                        setCustomJobRole(e.target.value)
                        setShowCustomJobSuggestions(true)
                        setHasUnsaved(true)
                      }}
                      onFocus={() => setShowCustomJobSuggestions(customJobSuggestions.length > 0)}
                      onBlur={() => window.setTimeout(() => setShowCustomJobSuggestions(false), 150)}
                      placeholder={t('profile.careerInfo.customRolePlaceholder')}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {showCustomJobSuggestions && customJobSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                        {customJobSuggestions.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setCustomJobRole(role)
                              setShowCustomJobSuggestions(false)
                              setHasUnsaved(true)
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label={t('profile.careerInfo.experienceLevel')}
                    value={experienceLevel}
                    onChange={(v) => { setExperienceLevel(v); setHasUnsaved(true) }}
                    options={experienceLevelOptions}
                    placeholder={t('profile.careerInfo.selectLevel') || 'Select level'}
                  />
                  
                  <Select
                    label={t('profile.careerInfo.yearsOfExperience')}
                    value={yearsOfExperience}
                    onChange={(v) => { setYearsOfExperience(v); setHasUnsaved(true) }}
                    options={yearsExperienceOptions}
                    placeholder={t('profile.careerInfo.selectYears')}
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

              {/* Success Message */}
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
