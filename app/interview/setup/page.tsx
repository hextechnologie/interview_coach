'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, LoadingSpinner } from '@/components/ui'
import { Sparkles, ChevronRight, ChevronLeft, Upload, Briefcase, FileText, ShieldCheck, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { canStartInterview, getMissingRequiredFields } from '@/lib/profile-utils'
import InterviewModeSelector from '@/components/interview/InterviewModeSelector'
import VoicePanelSelector, { INTERVIEWERS } from '@/components/interview/VoicePanelSelector'
import VoiceDurationSelector, { checkCreditsForVoiceInterview } from '@/components/interview/VoiceDurationSelector'

export default function InterviewSetupPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()

  const ROLES = [
    t('interviewSetup.roles.softwareEngineer'),
    t('interviewSetup.roles.productManager'),
    t('interviewSetup.roles.dataScientist'),
    t('interviewSetup.roles.frontendEngineer'),
    t('interviewSetup.roles.backendEngineer'),
    t('interviewSetup.roles.devOpsEngineer'),
    t('interviewSetup.roles.marketingManager'),
    t('interviewSetup.roles.salesManager'),
    t('interviewSetup.roles.customerSuccessManager'),
    t('interviewSetup.roles.other'),
  ]

  const EXPERIENCE_LEVELS = [
    { value: 'junior', label: t('interviewSetup.experienceLevels.junior') },
    { value: 'mid', label: t('interviewSetup.experienceLevels.mid') },
    { value: 'senior', label: t('interviewSetup.experienceLevels.senior') }
  ]
  
  const INTERVIEW_TYPES = [
    { value: 'Technical', label: t('interviewSetup.interviewTypes.technical') },
    { value:'Behavioral', label: t('interviewSetup.interviewTypes.behavioral') },
    { value: 'Mixed', label: t('interviewSetup.interviewTypes.mixed') }
  ]
  
  const LANGUAGES = [
    { value: 'English', label: t('interviewSetup.languages.english') },
    { value: 'French', label: t('interviewSetup.languages.french') },
    { value: 'Spanish', label: t('interviewSetup.languages.spanish') },
    { value: 'Arabic', label: t('interviewSetup.languages.arabic') }
  ]

  const STEP_NAMES = [
    t('interviewSetup.intro.steps.0'),
    t('interviewSetup.intro.steps.1'),
    t('interviewSetup.intro.steps.2')
  ]

  // Map locale code to display label for interview language dropdown
  const getLanguageLabelFromLocale = (localeCode: string): string => {
    const map: Record<string, string> = {
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish',
      'ar': 'Arabic',
    }
    return map[localeCode] || 'English'
  }

  const [step, setStep] = useState(0) // Start at 0 for mode selection
  const [loading, setLoading] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resumeStatus, setResumeStatus] = useState('')
  const [showResumeEditor, setShowResumeEditor] = useState(false)

  // Interview mode
  const [interviewMode, setInterviewMode] = useState<'chat' | 'voice'>('chat')
  
  // Voice interview specific states
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([])
  const [voiceDuration, setVoiceDuration] = useState(5) // Default to free 5 min

  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [language, setLanguage] = useState(getLanguageLabelFromLocale(locale))
  const [interviewType, setInterviewType] = useState('Mixed')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [realCompanyMode, setRealCompanyMode] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [mainSkills, setMainSkills] = useState<string[]>([])
  
  // Custom role fields when "Other" is selected
  const [customRole, setCustomRole] = useState('')
  const [companyPresentation, setCompanyPresentation] = useState('')
  const [companyPresentationFile, setCompanyPresentationFile] = useState<string>('')
  const [jobRequirements, setJobRequirements] = useState('')
  const [jobRequirementsFile, setJobRequirementsFile] = useState<string>('')
  const [uploadingDoc, setUploadingDoc] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Sync interview language with user's selected UI language
  useEffect(() => {
    setLanguage(getLanguageLabelFromLocale(locale))
  }, [locale])

  const limitReached = !!profile && profile.interviews_used_this_month >= profile.interviews_limit

  // Check if profile has required fields to start interview (only 5 fields required)
  const profileIncomplete = !canStartInterview(profile)
  const missingRequiredFields = getMissingRequiredFields(profile)

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {}

    // Step 0: Mode selection - always valid
    if (currentStep === 0) {
      return true
    }

    // For voice mode - same steps as chat mode (resume, role) then panel/duration
    if (interviewMode === 'voice') {
      if (currentStep === 1 && resumeText.trim().length < 30) {
        nextErrors.resumeText = t('interviewSetup.step1.error')
      }

      if (currentStep === 2) {
        if (!jobTitle) {
          nextErrors.jobTitle = t('interviewSetup.step2Role.error')
        } else if (jobTitle === t('interviewSetup.roles.other') && !customRole.trim()) {
          nextErrors.customRole = t('interviewSetup.step2Role.error')
        }
      }

      if (currentStep === 3 && selectedPanelIds.length === 0) {
        nextErrors.panel = 'Please select at least one interviewer'
      }

      if (currentStep === 4) {
        const { canStart, creditsNeeded } = checkCreditsForVoiceInterview(
          voiceDuration,
          profile?.credits || 0
        )
        if (!canStart) {
          nextErrors.credits = `You need ${creditsNeeded} more credits`
        }
      }
    }

    // For chat mode (existing logic)
    if (interviewMode === 'chat') {
      if (currentStep === 1 && resumeText.trim().length < 30) {
        nextErrors.resumeText = t('interviewSetup.step1.error')
      }

      if (currentStep === 2) {
        if (!jobTitle) {
          nextErrors.jobTitle = t('interviewSetup.step2Role.error')
        } else if (jobTitle === t('interviewSetup.roles.other') && !customRole.trim()) {
          nextErrors.customRole = t('interviewSetup.step2Role.error')
        }
      }

      if (currentStep === 3 && !experienceLevel) {
        nextErrors.experienceLevel = t('interviewSetup.step3FinalExperience.error')
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setErrors({})
    setStep((prev) => prev - 1)
  }

  const handleTogglePanel = (interviewerId: string) => {
    setSelectedPanelIds(prev => {
      if (prev.includes(interviewerId)) {
        return prev.filter(id => id !== interviewerId)
      } else if (prev.length < 3) {
        return [...prev, interviewerId]
      }
      return prev
    })
  }

  const extractPdfText = async (file: File) => {
    // Use PDF.js so uploaded PDF resumes are converted into readable text instead of raw binary data.
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
      pages.push(pageText)
    }

    return pages.join('\n').replace(/\s+/g, ' ').trim()
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingResume(true)
    setResumeStatus('')
    setResumeFileName(file.name)
    setShowResumeEditor(false)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      let text = ''

      if (file.type === 'application/pdf' || extension === 'pdf') {
        text = await extractPdfText(file)
      } else if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md') {
        text = await file.text()
      } else {
        setResumeText('')
        setResumeStatus('This file type is not supported for automatic parsing yet. Please upload a PDF or paste your resume text.')
        return
      }

      if (!text || text.trim().length < 30) {
        setResumeText('')
        setResumeStatus('I could not extract enough readable text from that file. Please paste your resume text or upload a text-based PDF.')
        return
      }

      setResumeText(text)
      setResumeStatus('Resume imported successfully. No extra text entry is needed unless you want to edit it.')
      setErrors((prev) => ({ ...prev, resumeText: '' }))
    } catch (error) {
      console.error('Resume upload error:', error)
      setResumeText('')
      setResumeStatus('That resume could not be parsed. Please paste your resume text or use a text-based PDF.')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'company' | 'requirements'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingDoc(true)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      let text = ''

      if (file.type === 'application/pdf' || extension === 'pdf') {
        text = await extractPdfText(file)
      } else if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md') {
        text = await file.text()
      } else {
        alert('This file type is not supported. Please upload a PDF or text file.')
        return
      }

      if (type === 'company') {
        setCompanyPresentation(text)
        setCompanyPresentationFile(file.name)
      } else {
        setJobRequirements(text)
        setJobRequirementsFile(file.name)
      }
    } catch (error) {
      console.error('Document upload error:', error)
      alert('Could not parse the document. Please try again or paste the text manually.')
    } finally {
      setUploadingDoc(false)
    }
  }

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!mainSkills.includes(skillInput.trim())) {
        setMainSkills((prev) => [...prev, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setMainSkills((prev) => prev.filter((item) => item !== skill))
  }

  const handleStartInterview = async () => {
    if (!validateStep(3) || limitReached) return

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          resumeText,
          resumeFileName,
          jobTitle: jobTitle === t('interviewSetup.roles.other') ? customRole : jobTitle,
          industry: 'Tech',
          experienceLevel,
          language: language === 'French' ? 'fr' : language === 'Spanish' ? 'es' : language === 'Arabic' ? 'ar' : 'en',
          interviewerType: realCompanyMode ? 'Real Company Panel' : 'Hiring Manager',
          interviewType,
          interviewRound: realCompanyMode ? 'Final Round' : 'First Round',
          yearsOfExperience: parseInt(yearsOfExperience || '0', 10),
          mainSkills,
          weakAreas: [],
          targetCompany,
          realCompanyMode,
          companyPresentation: companyPresentation || null,
          jobRequirements: jobRequirements || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create interview')
        return
      }

      if (data.sessionId) {
        router.push(`/interview/${data.sessionId}`)
      }
    } catch (error) {
      console.error('Error creating interview:', error)
      alert('Failed to create interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartVoiceInterview = async () => {
    if (!validateStep(4) || limitReached) return

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Check microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
      } catch (micError) {
        alert('Microphone access is required for voice interviews. Please allow microphone access in your browser.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/interview/voice/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          panelMemberIds: selectedPanelIds,
          durationMinutes: voiceDuration,
          userProfile: {
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            targetRole: jobTitle === t('interviewSetup.roles.other') ? customRole : jobTitle,
            experienceLevel: profile?.experience_level,
            currentStatus: profile?.current_status,
            resume: resumeText,
            companyPresentation: companyPresentation || companyPresentationFile,
            jobRequirements: jobRequirements || jobRequirementsFile,
            targetCompany: targetCompany,
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create voice interview')
        return
      }

      if (data.sessionId) {
        router.push(`/interview/voice/${data.sessionId}`)
      }
    } catch (error) {
      console.error('Error creating voice interview:', error)
      alert('Failed to create voice interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (profileIncomplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0f1e' }}>
        <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Almost Ready!
          </h2>

          {/* Subtitle */}
          <p className="text-gray-400 mb-6">
            Fill in {missingRequiredFields.length} required field{missingRequiredFields.length > 1 ? 's' : ''} to start your AI interview
          </p>

          {/* Missing fields list */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            {missingRequiredFields.map((field, i) => (
              <div
                key={field}
                className="flex items-center gap-2 py-2 border-b border-gray-700 last:border-0"
              >
                <span className="text-red-400">⚠️</span>
                <span className="text-white text-sm">{field}</span>
                <span className="ml-auto text-xs text-gray-500">Required</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Link href="/profile" className="flex-1">
              <Button variant="primary" fullWidth>
                Complete Now →
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" fullWidth>
                Back
              </Button>
            </Link>
          </div>

          {/* Reassurance */}
          <p className="text-gray-500 text-xs mt-4">
            Takes less than 1 minute ⚡
          </p>
        </div>
      </div>
    )
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-20 max-w-3xl">
          <Card className="text-center border-primary/30 bg-primary/5">
            <ShieldCheck className="w-14 h-14 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">{t('interviewSetup.limitReached.title')}</h1>
            <p className="text-gray-400 mb-6">
              {t('interviewSetup.limitReached.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/pricing">
                <Button variant="primary">{t('interviewSetup.limitReached.seePricing')}</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">{t('interviewSetup.limitReached.backToDashboard')}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              title="Press Alt+← to go back"
              aria-label={t('nav.dashboard')}
              className="group inline-flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 shadow-sm transition-all duration-200 hover:scale-105 hover:border-purple-500 hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
            >
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="sm:hidden">{t('nav.dashboardShort') || 'Dashboard'}</span>
              <span className="hidden sm:inline">{t('nav.dashboard')}</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
          </div>
          <p className="text-sm text-gray-400">{t('interviewSetup.header.freePlan')} {profile?.interviews_used_this_month || 0} / {profile?.interviews_limit === 999999 || (profile?.interviews_limit || 0) >= 999 ? t('profile.accountSettings.unlimited') : (profile?.interviews_limit || 3)} {t('interviewSetup.header.sessionsUsed')}</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
          <Card className="p-6 md:p-8 transition-all duration-300">
            <div className="mb-8">
              <p className="text-primary text-sm font-semibold mb-2">{t('interviewSetup.intro.label')}</p>
              <h1 className="text-4xl font-bold mb-2">{t('interviewSetup.intro.title')}</h1>
              <p className="text-gray-400">{t('interviewSetup.intro.description')}</p>
            </div>

            {step > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-primary font-semibold">
                    {interviewMode === 'voice' ? `Step ${step} of 3` : t('interviewSetup.intro.stepOf').replace('{step}', step.toString())}
                  </span>
                  <span className="text-gray-400">
                    {interviewMode === 'voice' 
                      ? step === 1 ? 'Select Panel' : step === 2 ? 'Duration' : 'Start'
                      : STEP_NAMES[step - 1]
                    }
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Step 0: Mode Selection */}
            {step === 0 && (
              <div className="space-y-6 animate-fadeIn">
                <InterviewModeSelector
                  selectedMode={interviewMode}
                  onSelectMode={(mode) => setInterviewMode(mode)}
                />
              </div>
            )}

            {/* Voice Interview Steps - Same as Chat for resume and job role */}
            {interviewMode === 'voice' && step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('interviewSetup.step1.title')}</h2>
                  <p className="text-gray-400">{t('interviewSetup.step1.description')}</p>
                </div>

                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm cursor-pointer hover:bg-primary/10 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingResume ? 'Reading resume...' : resumeFileName ? `Uploaded: ${resumeFileName}` : 'Upload a resume file'}
                  <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleResumeUpload} />
                </label>

                {resumeFileName && !showResumeEditor ? (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-sm text-green-400 font-medium mb-2">{resumeStatus || t('interviewSetup.step1.resumeDetected')}</p>
                    <p className="text-sm text-gray-300 mb-3">{t('interviewSetup.step1.resumeLoaded')}</p>
                    <Button variant="outline" className="text-sm px-4 py-2" onClick={() => setShowResumeEditor(true)}>
                      {t('interviewSetup.step1.editResume')}
                    </Button>
                  </div>
                ) : (
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.resumeText ? 'border-red-500' : 'border-border'}`}
                    placeholder={t('interviewSetup.step1.placeholder')}
                  />
                )}
                {resumeStatus && !resumeFileName && (
                  <p className={`text-sm ${resumeText ? 'text-green-400' : 'text-yellow-300'}`}>
                    {resumeStatus}
                  </p>
                )}
                {resumeFileName && showResumeEditor && (
                  <button
                    type="button"
                    onClick={() => setShowResumeEditor(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Hide extracted text
                  </button>
                )}
                {errors.resumeText && <p className="text-sm text-red-400">{errors.resumeText}</p>}
              </div>
            )}

            {interviewMode === 'voice' && step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('interviewSetup.step2Role.title')}</h2>
                  <p className="text-gray-400">{t('interviewSetup.step2Role.description')}</p>
                </div>
                <select
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value)
                    setErrors((prev) => ({ ...prev, jobTitle: '' }))
                  }}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.jobTitle ? 'border-red-500' : 'border-border'}`}
                >
                  <option value="">Select your role...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.jobTitle && <p className="text-sm text-red-400">{errors.jobTitle}</p>}

                {/* Show custom role fields when "Other" is selected */}
                {jobTitle === t('interviewSetup.roles.other') && (
                  <div className="space-y-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                    {/* Custom role name */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.customRoleLabel')} *</label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => {
                          setCustomRole(e.target.value)
                          setErrors((prev) => ({ ...prev, customRole: '' }))
                        }}
                        className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.customRole ? 'border-red-500' : 'border-border'}`}
                        placeholder={t('interviewSetup.step2Role.customRolePlaceholder')}
                      />
                      {errors.customRole && <p className="text-sm text-red-400">{errors.customRole}</p>}
                    </div>

                        {/* Company presentation */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.companyPresentationLabel')}</label>
                      {companyPresentationFile ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300 flex-1">{t('interviewSetup.step2Role.fileUploaded').replace('{filename}', companyPresentationFile)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCompanyPresentation('')
                              setCompanyPresentationFile('')
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-primary/10 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">{uploadingDoc ? 'Uploading...' : t('interviewSetup.step2Role.uploadFile')}</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.txt,.md"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, 'company')}
                              disabled={uploadingDoc}
                            />
                          </label>
                          <textarea
                            value={companyPresentation}
                            onChange={(e) => setCompanyPresentation(e.target.value)}
                            className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            placeholder={t('interviewSetup.step2Role.companyPresentationPlaceholder')}
                          />
                        </>
                      )}
                    </div>

                    {/* Job requirements */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.jobRequirementsLabel')}</label>
                      {jobRequirementsFile ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300 flex-1">{t('interviewSetup.step2Role.fileUploaded').replace('{filename}', jobRequirementsFile)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setJobRequirements('')
                              setJobRequirementsFile('')
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-primary/10 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">{uploadingDoc ? 'Uploading...' : t('interviewSetup.step2Role.uploadFile')}</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.txt,.md"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, 'requirements')}
                              disabled={uploadingDoc}
                            />
                          </label>
                          <textarea
                            value={jobRequirements}
                            onChange={(e) => setJobRequirements(e.target.value)}
                            className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            placeholder={t('interviewSetup.step2Role.jobRequirementsPlaceholder')}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {interviewMode === 'voice' && step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Choose Your Interview Panel</h2>
                  <p className="text-gray-400">Select up to 3 AI interviewers to conduct your voice interview</p>
                </div>
                <VoicePanelSelector
                  selectedPanelIds={selectedPanelIds}
                  onTogglePanel={handleTogglePanel}
                />
                {errors.panel && <p className="text-sm text-red-400">{errors.panel}</p>}
              </div>
            )}

            {interviewMode === 'voice' && step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">How long do you want to practice?</h2>
                  <p className="text-gray-400">Choose your interview duration</p>
                </div>
                <VoiceDurationSelector
                  selectedDuration={voiceDuration}
                  onSelectDuration={setVoiceDuration}
                  userCredits={profile?.credits || 0}
                />
                {errors.credits && <p className="text-sm text-red-400 text-center">{errors.credits}</p>}
              </div>
            )}

            {/* Chat Interview Steps (existing) */}
            {interviewMode === 'chat' && step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('interviewSetup.step1.title')}</h2>
                  <p className="text-gray-400">{t('interviewSetup.step1.description')}</p>
                </div>

                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm cursor-pointer hover:bg-primary/10 transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingResume ? 'Reading resume...' : resumeFileName ? `Uploaded: ${resumeFileName}` : 'Upload a resume file'}
                  <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleResumeUpload} />
                </label>

                {resumeFileName && !showResumeEditor ? (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-sm text-green-400 font-medium mb-2">{resumeStatus || t('interviewSetup.step1.resumeDetected')}</p>
                    <p className="text-sm text-gray-300 mb-3">{t('interviewSetup.step1.resumeLoaded')}</p>
                    <Button variant="outline" className="text-sm px-4 py-2" onClick={() => setShowResumeEditor(true)}>
                      {t('interviewSetup.step1.editResume')}
                    </Button>
                  </div>
                ) : (
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                    className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.resumeText ? 'border-red-500' : 'border-border'}`}
                    placeholder={t('interviewSetup.step1.placeholder')}
                  />
                )}
                {resumeStatus && !resumeFileName && (
                  <p className={`text-sm ${resumeText ? 'text-green-400' : 'text-yellow-300'}`}>
                    {resumeStatus}
                  </p>
                )}
                {resumeFileName && showResumeEditor && (
                  <button
                    type="button"
                    onClick={() => setShowResumeEditor(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Hide extracted text
                  </button>
                )}
                {errors.resumeText && <p className="text-sm text-red-400">{errors.resumeText}</p>}
              </div>
            )}

            {interviewMode === 'chat' && step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('interviewSetup.step2Role.title')}</h2>
                  <p className="text-gray-400">{t('interviewSetup.step2Role.description')}</p>
                </div>
                <select
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value)
                    setErrors((prev) => ({ ...prev, jobTitle: '' }))
                  }}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.jobTitle ? 'border-red-500' : 'border-border'}`}
                >
                  <option value="">Select your role...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.jobTitle && <p className="text-sm text-red-400">{errors.jobTitle}</p>}

                {/* Show custom role fields when "Other" is selected */}
                {jobTitle === t('interviewSetup.roles.other') && (
                  <div className="space-y-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                    {/* Custom role name */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.customRoleLabel')} *</label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => {
                          setCustomRole(e.target.value)
                          setErrors((prev) => ({ ...prev, customRole: '' }))
                        }}
                        className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.customRole ? 'border-red-500' : 'border-border'}`}
                        placeholder={t('interviewSetup.step2Role.customRolePlaceholder')}
                      />
                      {errors.customRole && <p className="text-sm text-red-400">{errors.customRole}</p>}
                    </div>

                    {/* Company presentation */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.companyPresentationLabel')}</label>
                      {companyPresentationFile ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300 flex-1">{t('interviewSetup.step2Role.fileUploaded').replace('{filename}', companyPresentationFile)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCompanyPresentation('')
                              setCompanyPresentationFile('')
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-primary/10 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">{uploadingDoc ? 'Uploading...' : t('interviewSetup.step2Role.uploadFile')}</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.txt,.md"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, 'company')}
                              disabled={uploadingDoc}
                            />
                          </label>
                          <textarea
                            value={companyPresentation}
                            onChange={(e) => setCompanyPresentation(e.target.value)}
                            className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            placeholder={t('interviewSetup.step2Role.companyPresentationPlaceholder')}
                          />
                        </>
                      )}
                    </div>

                    {/* Job requirements */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step2Role.jobRequirementsLabel')}</label>
                      {jobRequirementsFile ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300 flex-1">{t('interviewSetup.step2Role.fileUploaded').replace('{filename}', jobRequirementsFile)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setJobRequirements('')
                              setJobRequirementsFile('')
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-primary/10 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">{uploadingDoc ? 'Uploading...' : t('interviewSetup.step2Role.uploadFile')}</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.txt,.md"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, 'requirements')}
                              disabled={uploadingDoc}
                            />
                          </label>
                          <textarea
                            value={jobRequirements}
                            onChange={(e) => setJobRequirements(e.target.value)}
                            className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            placeholder={t('interviewSetup.step2Role.jobRequirementsPlaceholder')}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {interviewMode === 'chat' && step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('interviewSetup.step3FinalExperience.title')}</h2>
                  <p className="text-gray-400">{t('interviewSetup.step3FinalExperience.description')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step4.experienceLevelLabel')}</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className={`w-full bg-background border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.experienceLevel ? 'border-red-500' : 'border-border'}`}
                    >
                      <option value="">{t('interviewSetup.step4.selectLevel')}</option>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step4.interviewTypeLabel')}</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {INTERVIEW_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step4.interviewLanguageLabel')}</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {LANGUAGES.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step4.yearsOfExperienceLabel')}</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('interviewSetup.step4.yearsPlaceholder')}
                  />
                </div>

                <div className="rounded-xl border border-border bg-card/40 p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={realCompanyMode}
                      onChange={(e) => setRealCompanyMode(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{t('interviewSetup.step4.realCompanyMode')}</span>
                  </label>
                  <p className="text-sm text-gray-400 mt-2">{t('interviewSetup.step4.realCompanyModeDescription')}</p>
                </div>

                {realCompanyMode && (
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('interviewSetup.step4.targetCompanyPlaceholder')}
                  />
                )}

                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('interviewSetup.step4.focusSkillsLabel')}</label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('interviewSetup.step4.focusSkillsPlaceholder')}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mainSkills.map((skill) => (
                      <span key={skill} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {step > 0 ? (
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button variant="outline">{t('interviewSetup.navigation.cancel')}</Button>
                </Link>
              )}

              {/* Mode selection step */}
              {step === 0 && (
                <Button onClick={handleNext}>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {/* Voice interview flow */}
              {interviewMode === 'voice' && step > 0 && step < 4 && (
                <Button
                  onClick={handleNext}
                  disabled={uploadingResume || uploadingDoc || (step === 3 && selectedPanelIds.length === 0)}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {interviewMode === 'voice' && step === 4 && (
                <Button onClick={handleStartVoiceInterview} loading={loading}>
                  {!loading && '🎙️ '}
                  Start Voice Interview
                  {!loading && <Sparkles className="w-4 h-4" />}
                </Button>
              )}

              {/* Chat interview flow */}
              {interviewMode === 'chat' && step > 0 && step < 3 && (
                <Button onClick={handleNext}>
                  {t('interviewSetup.navigation.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {interviewMode === 'chat' && step === 3 && (
                <Button onClick={handleStartInterview} loading={loading}>
                  {t('interviewSetup.navigation.startInterview')}
                  {!loading && <Sparkles className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">{t('interviewSetup.preview.title')}</h3>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{t('interviewSetup.preview.resumeContext')}</p>
                    <p className="text-gray-400">{resumeText ? t('interviewSetup.preview.resumeLoaded') : t('interviewSetup.preview.resumeMissing')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Briefcase className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{t('interviewSetup.preview.targetRole')}</p>
                    <p className="text-gray-400">{jobTitle || t('interviewSetup.preview.notSelected')}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">{t('interviewSetup.preview.coachWillTailor')}</p>
                  <ul className="text-gray-400 space-y-1 list-disc pl-5">
                    <li>{experienceLevel ? t('interviewSetup.preview.levelDifficulty').replace('{level}', experienceLevel) : t('interviewSetup.preview.yourExperience')}</li>
                    <li>{t('interviewSetup.preview.interviewQuestions').replace('{type}', interviewType)}</li>
                    <li>{realCompanyMode && targetCompany ? t('interviewSetup.preview.companyPressure').replace('{company}', targetCompany) : t('interviewSetup.preview.generalStyle')}</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="bg-primary/5 border-primary/30">
              <h3 className="text-lg font-bold mb-2">{t('interviewSetup.benefits.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• {t('interviewSetup.benefits.benefit1')}</li>
                <li>• {t('interviewSetup.benefits.benefit2')}</li>
                <li>• {t('interviewSetup.benefits.benefit3')}</li>
                <li>• {t('interviewSetup.benefits.benefit4')}</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
