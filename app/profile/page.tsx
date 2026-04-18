'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, CheckCircle, Loader2, Sparkles, X } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

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

  // A - B
  const [aboutMe, setAboutMe] = useState('')
  const [address, setAddress] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [birthDate, setBirthDate] = useState('')
  
  // C
  const [certificationsInput, setCertificationsInput] = useState('')
  const [certificationsList, setCertificationsList] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [customJobRole, setCustomJobRole] = useState('')
  
  // E
  const [educationInput, setEducationInput] = useState('')
  const [educationList, setEducationList] = useState<string[]>([])
  const [experienceInput, setExperienceInput] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [experienceList, setExperienceList] = useState<string[]>([])
  
  // F - H
  const [firstName, setFirstName] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [hasNoExperience, setHasNoExperience] = useState(false)
  const [headline, setHeadline] = useState('')
  
  // I - L
  const [instagramUrl, setInstagramUrl] = useState('')
  const [languages, setLanguages] = useState('')
  const [lastName, setLastName] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  
  // N - P
  const [nationality, setNationality] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [projectsDetails, setProjectsDetails] = useState('')
  
  // R - S
  const [resumeUrl, setResumeUrl] = useState('')
  const [salaryExpectation, setSalaryExpectation] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [statusDetail, setStatusDetail] = useState('')
  
  // T - Z
  const [targetJobRole, setTargetJobRole] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')

  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Pre-fill form from existing profile
  useEffect(() => {
    if (!profile) return
    // A - B
    setAboutMe((profile as any).about_me ?? '')
    setAddress((profile as any).address ?? '')
    setAvatarPreview(profile.avatar_url ?? '')
    setBirthDate((profile as any).birth_date ?? '')
    
    // C
    const certs = (profile as any).certifications
    if (certs) {
      setCertificationsList(certs.split('\n').filter((c: string) => c.trim()))
    }
    setCity(profile.city ?? '')
    setCountry(profile.country ?? '')
    setCurrentStatus(profile.current_status ?? '')
    
    // E
    const edu = (profile as any).education_details
    if (edu) {
      setEducationList(edu.split('\n').filter((e: string) => e.trim()))
    }
    const exp = (profile as any).experience_details
    if (exp) {
      const expList = exp.split('\n').filter((e: string) => e.trim())
      setExperienceList(expList)
      setHasNoExperience(expList.length === 0)
    }
    setExperienceLevel(profile.experience_level ?? '')
    
    // F - H
    setFirstName(profile.first_name || (profile.full_name?.split(' ')[0] ?? ''))
    setGithubUrl((profile as any).github_url ?? '')
    setHeadline((profile as any).professional_headline ?? '')
    
    // I - L
    setInstagramUrl((profile as any).instagram_url ?? '')
    setLanguages((profile as any).languages ?? '')
    setLastName(profile.last_name || (profile.full_name?.split(' ').slice(1).join(' ') ?? ''))
    setLinkedinUrl(profile.linkedin_url ?? '')
    
    // N - P
    setNationality((profile as any).nationality ?? '')
    setPhoneNumber((profile as any).phone_number ?? '')
    setPortfolioUrl((profile as any).portfolio_url ?? '')
    setPostalCode((profile as any).postal_code ?? '')
    setProjectsDetails((profile as any).projects_details ?? '')
    
    // R - S
    setResumeUrl((profile as any).resume_url ?? '')
    setSalaryExpectation((profile as any).salary_expectation ?? '')
    setSkillsText(Array.isArray((profile as any).skills) ? (profile as any).skills.join(', ') : '')
    setStatusDetail(profile.status_detail ?? '')
    
    // T - Z
    const savedRole = profile.target_job_role ?? ''
    const isKnownRole = jobRoleOptions.some(o => o.value === savedRole)
    if (isKnownRole || savedRole === '') {
      setTargetJobRole(savedRole)
    } else {
      setTargetJobRole('Other')
      setCustomJobRole(savedRole)
    }
    setTwitterUrl((profile as any).twitter_url ?? '')
    setWebsiteUrl((profile as any).website_url ?? '')
    setYearsExperience((profile as any).years_experience ?? '')
  }, [profile])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const addCertification = () => {
    if (certificationsInput.trim() && !certificationsList.includes(certificationsInput.trim())) {
      setCertificationsList([...certificationsList, certificationsInput.trim()])
      setCertificationsInput('')
    }
  }

  const removeCertification = (cert: string) => setCertificationsList(certificationsList.filter(c => c !== cert))

  const addExperience = () => {
    if (experienceInput.trim() && !experienceList.includes(experienceInput.trim())) {
      setExperienceList([...experienceList, experienceInput.trim()])
      setExperienceInput('')
    }
  }

  const removeExperience = (exp: string) => setExperienceList(experienceList.filter(e => e !== exp))

  const addEducation = () => {
    if (educationInput.trim() && !educationList.includes(educationInput.trim())) {
      setEducationList([...educationList, educationInput.trim()])
      setEducationInput('')
    }
  }

  const removeEducation = (edu: string) => setEducationList(educationList.filter(e => e !== edu))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!country.trim()) {
      setError('Country is required')
      return
    }
    if (!city.trim()) {
      setError('City is required')
      return
    }
    if (!headline.trim()) {
      setError('Professional headline is required')
      return
    }
    if (!aboutMe.trim()) {
      setError('About section is required')
      return
    }
    if (!hasNoExperience && experienceList.length === 0) {
      setError('Please add at least one experience entry or check "I have no experience"')
      return
    }
    if (educationList.length === 0) {
      setError('Please add at least one education entry')
      return
    }
    if (!skillsText.trim()) {
      setError('Skills are required')
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
          // A - B
          about_me: aboutMe.trim(),
          address: address.trim() || null,
          avatar_url: avatarUrl,
          birth_date: birthDate || null,
          
          // C
          certifications: certificationsList.length > 0 ? certificationsList.join('\n') : null,
          city: city || null,
          country: country || null,
          current_status: currentStatus || null,
          
          // E
          education_details: educationList.join('\n'),
          experience_details: hasNoExperience ? 'No experience' : experienceList.join('\n'),
          experience_level: (experienceLevel as 'junior' | 'mid' | 'senior') || null,
          
          // F - H
          first_name: firstName.trim() || null,
          full_name: fullName || null,
          github_url: githubUrl.trim() || null,
          
          // I - L
          instagram_url: instagramUrl.trim() || null,
          languages: languages.trim() || null,
          last_name: lastName.trim() || null,
          linkedin_url: linkedinUrl ||null,
          
          // N - P
          nationality: nationality.trim() || null,
          phone_number: phoneNumber.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          postal_code: postalCode.trim() || null,
          professional_headline: headline.trim(),
          projects_details: projectsDetails.trim() || null,
          
          // R - S
          resume_url: resumeUrl.trim() || null,
          salary_expectation: salaryExpectation.trim() || null,
          skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
          status_detail: statusDetail || null,
          
          // T - Z
          target_job_field: targetJobRole === 'Other' ? (customJobRole.trim().toLowerCase().replace(/\s+/g, '-') || null) : (targetJobRole?.toLowerCase().replace(/\s+/g, '-') || null),
          target_job_role: targetJobRole === 'Other' ? (customJobRole.trim() || null) : (targetJobRole || null),
          twitter_url: twitterUrl.trim() || null,
          updated_at: new Date().toISOString(),
          website_url: websiteUrl.trim() || null,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
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
          {/* A - B: About, Address, Birth Date */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">A - B</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">About <span className="text-red-400">*</span></label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={4}
                placeholder="Write a short summary about yourself, your goals, and what makes you stand out..."
                className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{ background: '#0a0f1e' }}
                required
              />
            </div>
            <Input
              label="Address / Street Address"
              value={address}
              onChange={setAddress}
              placeholder="e.g. 123 Main Street, Apartment 4B"
            />
            <Input
              label="Birth Date"
              type="date"
              value={birthDate}
              onChange={setBirthDate}
              placeholder="YYYY-MM-DD"
            />
          </div>

          {/* C: Certifications, City, Country, Current Status */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">C</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {certificationsList.map(cert => (
                  <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-green-600/20 text-green-200 border border-green-500/30">
                    {cert}
                    <button type="button" onClick={() => removeCertification(cert)} className="hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certificationsInput}
                  onChange={(e) => setCertificationsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
                <Button type="button" onClick={addCertification} variant="outline">Add</Button>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="City *" value={city} onChange={setCity} placeholder="e.g. San Francisco" required />
              <Input label="Country *" value={country} onChange={setCountry} placeholder="e.g. United States" required />
            </div>
            <Select
              label="Current Status"
              value={currentStatus}
              onChange={setCurrentStatus}
              options={statusOptions}
              placeholder="What describes you best?"
            />
            {currentStatus && (
              <Input
                label="Current Status Details"
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
          </div>

          {/* E - F: Education, Experience, First/Last Name */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">E - F</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Education <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {educationList.map(edu => (
                  <span key={edu} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-blue-600/20 text-blue-200 border border-blue-500/30">
                    {edu}
                    <button type="button" onClick={() => removeEducation(edu)} className="hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={educationInput}
                  onChange={(e) => setEducationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                  placeholder="e.g. BSc Computer Science - MIT (2016-2020)"
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
                <Button type="button" onClick={addEducation} variant="outline">Add</Button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Experience {!hasNoExperience && <span className="text-red-400">*</span>}
              </label>
              <label className="flex items-center gap-2 mb-3 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNoExperience}
                  onChange={(e) => {
                    setHasNoExperience(e.target.checked)
                    if (e.target.checked) setExperienceList([])
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                I have no professional experience yet
              </label>
              {!hasNoExperience && (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {experienceList.map(exp => (
                      <span key={exp} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-purple-600/20 text-purple-200 border border-purple-500/30">
                        {exp}
                        <button type="button" onClick={() => removeExperience(exp)} className="hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={experienceInput}
                      onChange={(e) => setExperienceInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExperience())}
                      placeholder="e.g. Software Engineer at Google (2020-2023)"
                      className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: '#0a0f1e' }}
                    />
                    <Button type="button" onClick={addExperience} variant="outline">Add</Button>
                  </div>
                </>
              )}
            </div>
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
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="Jane" />
              <Input label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
            </div>
          </div>

          {/* G - I: GitHub, Instagram */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">G - I</h2>
            <Input
              label="GitHub URL"
              value={githubUrl}
              onChange={setGithubUrl}
              placeholder="https://github.com/yourusername"
            />
            <Input
              label="Instagram URL"
              value={instagramUrl}
              onChange={setInstagramUrl}
              placeholder="https://instagram.com/yourusername"
            />
          </div>

          {/* L: Languages, LinkedIn */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">L</h2>
            <Input
              label="Languages Spoken"
              value={languages}
              onChange={setLanguages}
              placeholder="e.g. English (Native), Spanish (Fluent), French (Intermediate)"
            />
            <Input
              label="LinkedIn URL"
              value={linkedinUrl}
              onChange={setLinkedinUrl}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* N - P: Nationality, Phone, Portfolio, Postal Code, Professional Headline, Projects */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">N - P</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Nationality"
                value={nationality}
                onChange={setNationality}
                placeholder="e.g. American"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Input
              label="Portfolio Website URL"
              value={portfolioUrl}
              onChange={setPortfolioUrl}
              placeholder="https://yourportfolio.com"
            />
            <Input
              label="Postal / ZIP Code"
              value={postalCode}
              onChange={setPostalCode}
              placeholder="e.g. 94102"
            />
            <Input
              label="Professional Headline"
              value={headline}
              onChange={setHeadline}
              placeholder="e.g. Software Engineer focused on backend systems and distributed apps"
              required
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Projects</label>
              <textarea
                value={projectsDetails}
                onChange={(e) => setProjectsDetails(e.target.value)}
                rows={3}
                placeholder="Mention the most important projects you built or contributed to..."
                className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                style={{ background: '#0a0f1e' }}
              />
            </div>
          </div>

          {/* R - S: Resume, Salary, Skills, Status */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">R - S</h2>
            <Input
              label="Resume / CV URL"
              value={resumeUrl}
              onChange={setResumeUrl}
              placeholder="https://drive.google.com/your-resume.pdf"
            />
            <Input
              label="Salary Expectation"
              value={salaryExpectation}
              onChange={setSalaryExpectation}
              placeholder="e.g. $120,000 - $150,000 per year"
            />
            <Input
              label="Skills"
              value={skillsText}
              onChange={setSkillsText}
              placeholder="e.g. React, TypeScript, SQL, Leadership, Public Speaking"
              required
            />
          </div>

          {/* T - W: Target Role, Twitter, Website, Years of Experience */}
          <div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
            <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">T - W</h2>
            <Select
              label="Target Job Role"
              value={targetJobRole}
              onChange={(val) => { setTargetJobRole(val); if (val !== 'Other') setCustomJobRole('') }}
              options={jobRoleOptions}
              placeholder="What role are you aiming for?"
            />
            {targetJobRole === 'Other' && (
              <Input
                label="Custom Job Role"
                value={customJobRole}
                onChange={setCustomJobRole}
                placeholder="e.g. Growth Hacker, AI Researcher, Prompt Engineer…"
              />
            )}
            <Input
              label="Twitter / X URL"
              value={twitterUrl}
              onChange={setTwitterUrl}
              placeholder="https://twitter.com/yourusername"
            />
            <Input
              label="Website / Blog URL"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://yourblog.com"
            />
            <Input
              label="Years of Experience"
              type="number"
              value={yearsExperience}
              onChange={setYearsExperience}
              placeholder="e.g. 5"
            />
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
