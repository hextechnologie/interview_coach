'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Sparkles } from 'lucide-react'
import JobOffers from '@/components/JobOffers'
import { createClient } from '@/lib/supabase'

export default function JobsPage() {
  const [userProfile, setUserProfile] = useState<{ country: string | null; city: string | null; targetRole: string | null }>({
    country: null,
    city: null,
    targetRole: null
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country, city, target_job_role')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserProfile({
            country: profile.country,
            city: profile.city,
            targetRole: profile.target_job_role
          })
        }
      }
    }
    
    fetchProfile()
  }, [])

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(10,15,30,0.92)' }}>
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Interview Coach</span>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-300 mb-4">
            <Briefcase className="w-4 h-4" /> Remote Jobs Board
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Find Your Next{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Remote Role</span>
          </h1>
          <p className="text-gray-400 max-w-xl">
            Browse thousands of jobs from LinkedIn, Indeed, Glassdoor, Remotive & more — updated daily.
          </p>
          {userProfile.country && (
            <p className="text-sm text-purple-400 mt-2">
              🌍 Prioritizing jobs in <strong>{userProfile.country}</strong>
              {userProfile.city && <> near <strong>{userProfile.city}</strong></>}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 p-6" style={{ background: '#111827' }}>
          <Suspense fallback={<div className="text-gray-400 text-sm text-center py-10">Loading jobs...</div>}>
            <JobOffers 
              fullPage 
              limit={20} 
              userCountry={userProfile.country || ''}
              userCity={userProfile.city || ''}
              targetRole={userProfile.targetRole || ''}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
