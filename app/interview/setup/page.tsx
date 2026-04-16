'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, LoadingSpinner } from '@/components/ui'
import { Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Marketing', 'Sales', 'Education', 'Other'
]

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior']

const INTERVIEWER_TYPES = ['HR', 'Tech Lead', 'Manager', 'CEO/Founder']

const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'Mixed']

const INTERVIEW_ROUNDS = ['First Round', 'Second Round', 'Final Round']

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
]

export default function InterviewSetupPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Form state
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  
  // Step 1 - Job Information
  const [jobTitle, setJobTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [language, setLanguage] = useState('en')
  
  // Step 2 - Interview Information
  const [interviewerType, setInterviewerType] = useState('')
  const [interviewType, setInterviewType] = useState('')
  const [interviewRound, setInterviewRound] = useState('')
  
  // Step 3 - About You
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [mainSkills, setMainSkills] = useState<string[]>([])
  const [weakAreas, setWeakAreas] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [weakAreaInput, setWeakAreaInput] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile && profile.interviews_used_this_month >= profile.interviews_limit) {
      router.push('/pricing')
    }
  }, [profile, router])

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {}
    
    if (current Step === 1) {
      if (!jobTitle.trim()) newErrors.jobTitle = true
      if (!industry) newErrors.industry = true
      if (!experienceLevel) newErrors.experienceLevel = true
      if (!language) newErrors.language = true
    }
    
    if (currentStep === 2) {
      if (!interviewerType) newErrors.interviewerType = true
      if (!interviewType) newErrors.interviewType = true
      if (!interviewRound) newErrors.interviewRound = true
    }
    
    if (currentStep === 3) {
      if (!yearsOfExperience) newErrors.yearsOfExperience = true
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!mainSkills.includes(skillInput.trim())) {
        setMainSkills([...mainSkills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setMainSkills(mainSkills.filter(s => s !== skill))
  }

  const addWeakArea = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && weakAreaInput.trim()) {
      e.preventDefault()
      if (!weakAreas.includes(weakAreaInput.trim())) {
        setWeakAreas([...weakAreas, weakAreaInput.trim()])
      }
      setWeakAreaInput('')
    }
  }

  const removeWeakArea = (area: string) => {
    setWeakAreas(weakAreas.filter(a => a !== area))
  }

  const handleStartInterview = async () => {
    if (!validateStep(3)) return

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Error: Session expired. Please log out and log back in.')
        router.push('/login')
        return
      }

      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          jobTitle,
          industry,
          experienceLevel,
          jobDescription,
          language,
          interviewerType,
          interviewType,
          interviewRound,
          yearsOfExperience: parseInt(yearsOfExperience),
          mainSkills,
          weakAreas,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to create interview'}`)
        return
      }

      if (data.sessionId) {
        router.push(`/interview/${data.sessionId}`)
      }
    } catch (error) {
      console.error('Error creating interview:', error)
      alert('Error: Failed to connect to server.')
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">Interview Coach</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-primary">Step {step} of 3</span>
            <span className="text-sm text-gray-400">
              {step === 1 && 'Job Information'}
              {step === 2 && 'Interview Details'}
              {step === 3 && 'About You'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: Job Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">Job Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full bg-background border ${errors.jobTitle ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry <span className="text-red-400">*</span>
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`w-full bg-background border ${errors.industry ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Experience Level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        experienceLevel === level
                          ? 'bg-gradient-primary text-white'
                          : 'bg-card border border-border text-gray-300 hover:border-primary'
                      } ${errors.experienceLevel ? 'ring-2 ring-red-500' : ''}`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Language <span className="text-red-400">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full bg-background border ${errors.language ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Paste the job description here for more tailored questions..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Interview Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">Interview Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interviewer Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={interviewerType}
                  onChange={(e) => setInterviewerType(e.target.value)}
                  className={`w-full bg-background border ${errors.interviewerType ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">Select interviewer type...</option>
                  {INTERVIEWER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className={`w-full bg-background border ${errors.interviewType ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">Select interview type...</option>
                  {INTERVIEW_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interview Round <span className="text-red-400">*</span>
                </label>
                <select
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  className={`w-full bg-background border ${errors.interviewRound ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">Select interview round...</option>
                  {INTERVIEW_ROUNDS.map((round) => (
                    <option key={round} value={round}>{round}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: About You */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text mb-6">About You</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className={`w-full bg-background border ${errors.yearsOfExperience ? 'border-red-500' : 'border-border'} rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Main Skills
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type a skill and press Enter..."
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {mainSkills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weak Areas to Practice
                </label>
                <input
                  type="text"
                  value={weakAreaInput}
                  onChange={(e) => setWeakAreaInput(e.target.value)}
                  onKeyDown={addWeakArea}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type an area and press Enter..."
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {weakAreas.map((area) => (
                    <span
                      key={area}
                      className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {area}
                      <button onClick={() => removeWeakArea(area)} className="hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
            )}

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleStartInterview} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Start Interview
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-primary/5 border-primary/30">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary mb-1">Interview Format</h4>
              <p className="text-sm text-gray-400">
                You'll go through 6 questions with detailed AI feedback after each answer. 
                The interview will be conducted in your selected language.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
