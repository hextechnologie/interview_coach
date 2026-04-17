'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Plus, Sparkles, X } from 'lucide-react'
import { Button, Card, Input, Badge } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const specializationOptions = ['Tech', 'Finance', 'Marketing', 'Sales', 'Healthcare', 'Operations', 'Design', 'Product']

export default function CoachSignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [experience, setExperience] = useState('8')
  const [selectedTags, setSelectedTags] = useState<string[]>(['Tech'])
  const [companyInput, setCompanyInput] = useState('')
  const [companies, setCompanies] = useState<string[]>([])
  const [price, setPrice] = useState(120)
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const platformFee = useMemo(() => (price * 0.2).toFixed(0), [price])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])
  }

  const addCompany = () => {
    if (!companyInput.trim()) return
    setCompanies((prev) => [...prev, companyInput.trim()])
    setCompanyInput('')
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim() || !email.includes('@') || password.length < 6 || !title.trim()) {
      setError('Please complete the required fields.')
      return
    }

    if (bio.length > 300) {
      setError('Bio must stay under 300 characters.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'coach',
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const userId = data.user.id

        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email,
            full_name: fullName,
            user_type: 'coach',
            avatar_url: avatarPreview || null,
            experience_level: Number(experience) >= 8 ? 'senior' : Number(experience) >= 4 ? 'mid' : 'junior',
          })

          await supabase.from('coach_profiles').upsert({
            user_id: userId,
            title,
            bio,
            years_experience: Number(experience),
            price_per_hour: price,
            linkedin_url: linkedinUrl,
            companies,
            is_verified: false,
          })

          if (selectedTags.length > 0) {
            await supabase.from('coach_specializations').insert(
              selectedTags.map((specialization) => ({ coach_id: userId, specialization }))
            )
          }
        } catch {
          await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
        }
      }

      if (data.session) {
        await supabase.auth.signOut()
      }

      setSuccess('Coach account created successfully. Please check your email, confirm your account, then log in again as a coach.')
      return
    } catch (err: any) {
      setError(err.message || 'Unable to create your coach account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/signup" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to signup options
        </Link>

        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">Interview Coach</span>
        </Link>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Badge>Platform fee: 20%</Badge>
            <span className="text-sm text-gray-400">Coaches receive 80% after each session.</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold">Coach signup</h1>
          <p className="mb-6 text-gray-400">Create your professional profile and start earning from mock interview sessions.</p>

          {success && <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300">{success}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Alex Morgan" required />
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="coach@example.com" required />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
              <Input label="Professional Title" value={title} onChange={setTitle} placeholder="Senior Google Engineer" required />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Years of Experience" type="number" value={experience} onChange={setExperience} placeholder="8" required />
              <Input label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Industries and specializations</label>
              <div className="flex flex-wrap gap-2">
                {specializationOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-2 text-sm ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-background border border-border text-gray-300'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Companies worked at</label>
              <div className="flex gap-2">
                <input value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} placeholder="Add company" className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <Button type="button" variant="outline" onClick={addCompany}><Plus className="h-4 w-4" />Add</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {companies.map((company) => (
                  <Badge key={company} className="flex items-center gap-1">{company}<button type="button" onClick={() => setCompanies((prev) => prev.filter((item) => item !== company))}><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Session price: ${price}/hour</label>
              <input type="range" min="10" max="500" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-primary" />
              <p className="mt-2 text-sm text-gray-400">Platform fee: ${platformFee} • You keep about ${(price * 0.8).toFixed(0)}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Short bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={4} placeholder="Describe your coaching style and areas of expertise." className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="mt-1 text-xs text-gray-400">{bio.length}/300</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Profile photo upload</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-background/40 px-4 py-4 text-sm text-gray-300 hover:bg-white/5">
                <Camera className="h-5 w-5 text-primary" />
                <span>Choose image</span>
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              {avatarPreview && <img src={avatarPreview} alt="Preview" className="mt-3 h-16 w-16 rounded-full object-cover" />}
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>Create coach account</Button>
          </form>
          ) : (
            <div className="space-y-4 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <p className="text-sm text-green-200">
                We sent a confirmation email to {email}. Open it, verify your address, then come back and log in.
              </p>
              <Link href="/login/coach">
                <Button variant="outline" fullWidth>Go to coach login</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}