'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Sparkles } from 'lucide-react'
import { Button, Card, Input, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const jobOptions = [
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'designer', label: 'Product Designer' },
  { value: 'marketing-manager', label: 'Marketing Manager' },
  { value: 'sales-executive', label: 'Sales Executive' },
]

export default function CandidateSignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [jobField, setJobField] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const strength = useMemo(() => {
    if (password.length < 6) return 'Weak'
    if (password.length < 10) return 'Medium'
    return 'Strong'
  }, [password])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim() || !email.includes('@') || !jobField || !experienceLevel) {
      setError('Please complete all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
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
            user_type: 'candidate',
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
            user_type: 'candidate',
            avatar_url: avatarPreview || null,
            target_job_field: jobField,
            experience_level: experienceLevel,
          })
        } catch {
          await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
        }
      }

      if (data.session) {
        await supabase.auth.signOut()
      }

      setSuccess('Account created successfully. Please confirm your email, then log in again.')
      return
    } catch (err: any) {
      setError(err.message || 'Unable to create your account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/signup" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to signup options
        </Link>

        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">Interview Coach</span>
        </Link>

        <Card>
          <h1 className="mb-2 text-3xl font-bold">Candidate signup</h1>
          <p className="mb-6 text-gray-400">Create your practice account and start preparing for real interviews.</p>

          {success && <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300">{success}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@example.com" required />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className={`mt-2 text-xs ${strength === 'Strong' ? 'text-green-400' : strength === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>Strength: {strength}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select label="Job field" value={jobField} onChange={setJobField} options={jobOptions} placeholder="Choose a target role" required />
              <Select
                label="Experience level"
                value={experienceLevel}
                onChange={setExperienceLevel}
                options={[
                  { value: 'junior', label: 'Junior' },
                  { value: 'mid', label: 'Mid' },
                  { value: 'senior', label: 'Senior' },
                ]}
                placeholder="Select level"
                required
              />
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

            <Button type="submit" variant="primary" fullWidth loading={loading}>Create candidate account</Button>
          </form>

          {success && (
            <div className="mt-4">
              <Link href="/login/candidate">
                <Button variant="outline" fullWidth>Go to login</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}