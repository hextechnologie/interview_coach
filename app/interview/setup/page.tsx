'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Button, Card, Select, LoadingSpinner } from '@/components/ui'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const JOB_ROLES = [
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'marketing-manager', label: 'Marketing Manager' },
  { value: 'sales-representative', label: 'Sales Representative' },
  { value: 'financial-analyst', label: 'Financial Analyst' },
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'hr-manager', label: 'HR Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'business-analyst', label: 'Business Analyst' },
]

const DIFFICULTY_LEVELS = [
  { value: 'junior', label: 'Junior Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
]

export default function InterviewSetupPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [jobRole, setJobRole] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleStartInterview = async () => {
    if (!jobRole || !difficultyLevel) return

    setLoading(true)

    try {
      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobRole: JOB_ROLES.find((r) => r.value === jobRole)?.label,
          difficultyLevel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to create interview'}`)
        console.error('API error:', data)
        return
      }

      if (data.sessionId) {
        router.push(`/interview/${data.sessionId}`)
      } else {
        alert('Error: No session ID returned')
      }
    } catch (error) {
      console.error('Error creating interview:', error)
      alert('Error: Failed to connect to server. Check browser console for details.')
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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Setup Your Mock Interview</h1>
            <p className="text-gray-400 text-lg">
              Choose your target role and difficulty level to get started
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <Select
                label="Job Role"
                value={jobRole}
                onChange={setJobRole}
                options={JOB_ROLES}
                placeholder="Select a job role"
                required
              />

              <Select
                label="Difficulty Level"
                value={difficultyLevel}
                onChange={setDifficultyLevel}
                options={DIFFICULTY_LEVELS}
                placeholder="Select difficulty"
                required
              />

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-primary">What to expect:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• You'll be asked 5-7 interview questions</li>
                  <li>• Each answer will receive detailed AI feedback</li>
                  <li>• Get scored on each response (1-10)</li>
                  <li>• Receive an overall summary at the end</li>
                  <li>• Average session takes 15-20 minutes</li>
                </ul>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleStartInterview}
                disabled={!jobRole || !difficultyLevel || loading}
                loading={loading}
                className="text-lg py-4"
              >
                Start Interview
              </Button>

              <div className="text-center">
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
