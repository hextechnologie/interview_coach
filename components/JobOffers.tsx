'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, ExternalLink, Globe, Loader2, MapPin, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { fetchAllJobs } from '@/lib/jobs-api'
import type { Job } from '@/lib/types/jobs'

export interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  company_logo?: string
  category: string
  salary?: string
  job_type: string
  publication_date: string
  candidate_required_location: string
  description: string
}

interface Props {
  targetRole?: string
  limit?: number
  userCountry?: string
  userCity?: string
  /** if true, renders as a full-page layout with pagination */
  fullPage?: boolean
}

function typeColor(type: string) {
  if (type.includes('full')) return 'bg-green-500/20 text-green-300 border-green-500/30'
  if (type.includes('part')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  if (type.includes('contract')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function JobOffers({ targetRole = '', limit = 6, fullPage = false, userCountry = '', userCity = '' }: Props) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(targetRole || 'software engineer')
  const [input, setInput] = useState(targetRole || 'software engineer')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Helper function to calculate location match score (higher = better match)
  const calculateLocationScore = (jobLocation: string): number => {
    if (!userCountry) return 0
    
    // Normalize both strings: lowercase, remove extra spaces, remove special chars
    const normalizeLocation = (loc: string) => 
      loc.toLowerCase()
        .trim()
        .replace(/[,.-]/g, ' ')
        .replace(/\s+/g, ' ')
    
    const location = normalizeLocation(jobLocation)
    const country = normalizeLocation(userCountry)
    const city = userCity ? normalizeLocation(userCity) : ''
    
    // Split location into words for better matching
    const locationWords = location.split(' ')
    const countryWords = country.split(' ')
    
    // Exact city match - highest priority
    if (city && location.includes(city)) {
      return 1000
    }
    
    // Country match - check if all country words are in location
    const countryMatches = countryWords.every(word => 
      word.length > 2 && locationWords.includes(word)
    )
    
    if (countryMatches) {
      return 500
    }
    
    // Partial country match (e.g., "France" matches "French")
    if (location.includes(country.substring(0, 4))) {
      return 400
    }
    
    // No match - lower priority but still show
    return 0
  }

  const fetchJobs = async (query: string) => {
    setLoading(true)
    setError('')
    setDebugInfo('') // Clear previous debug info
    try {
      // Use our new multi-API integration
      let fetchedJobs = await fetchAllJobs(query)
      
      console.log(`📊 Fetched ${fetchedJobs.length} total jobs`)
      
      // Sort by location proximity if user has a country set (France jobs first)
      if (userCountry) {
        console.log(`🌍 Filtering by country: "${userCountry}", city: "${userCity}"`)
        
        // Sample first 10 jobs to show in debug
        const sampleJobs = fetchedJobs.slice(0, 10).map(job => ({
          title: job.title.substring(0, 40),
          location: job.location,
          score: calculateLocationScore(job.location)
        }))
        
        console.log('BEFORE FILTERING (first 5):')
        fetchedJobs.slice(0, 5).forEach((job, i) => {
          const score = calculateLocationScore(job.location)
          console.log(`  ${i+1}. "${job.title}" at "${job.location}" - Score: ${score}`)
        })
        
        // FILTER: Only show jobs with score > 0 (matching country)
        const matchingJobs = fetchedJobs.filter(job => calculateLocationScore(job.location) > 0)
        const nonMatchingCount = fetchedJobs.length - matchingJobs.length
        
        console.log(`✅ ${matchingJobs.length} jobs match "${userCountry}", ❌ ${nonMatchingCount} filtered out`)
        
        // Set debug info for UI display
        setDebugInfo(`Country: "${userCountry}" | City: "${userCity}" | Total fetched: ${fetchedJobs.length} | Matching: ${matchingJobs.length} | Filtered out: ${nonMatchingCount}
Sample locations: ${sampleJobs.map((j, i) => `\n${i+1}. "${j.location}" (score: ${j.score})`).join('')}`)
        
        // If we have matching jobs, use only those. Otherwise show all (fallback)
        if (matchingJobs.length > 0) {
          fetchedJobs = matchingJobs
        } else {
          console.log(`⚠️ No jobs found for "${userCountry}", showing all jobs as fallback`)
          setDebugInfo(debugInfo + `\n⚠️ NO MATCHES FOUND - Showing all jobs as fallback`)
        }
        
        // Sort by score (city matches first, then country)
        fetchedJobs.sort((a: Job, b: Job) => {
          const scoreA = calculateLocationScore(a.location)
          const scoreB = calculateLocationScore(b.location)
          return scoreB - scoreA // Higher score first
        })
        
        // Log first 5 jobs AFTER filtering and sorting
        console.log('AFTER FILTERING & SORTING (first 5):')
        fetchedJobs.slice(0, 5).forEach((job, i) => {
          const score = calculateLocationScore(job.location)
          console.log(`  ${i+1}. "${job.title}" at "${job.location}" - Score: ${score}`)
        })
      }
      
      setJobs(fetchedJobs)
    } catch {
      setError('Could not load job listings. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, userCountry]) // Re-fetch when search OR userCountry changes

  const filtered = typeFilter === 'all' ? jobs : jobs.filter((j) => j.job_type?.toLowerCase().includes(typeFilter))

  if (!fullPage) {
    // Dashboard widget — compact view
    return (
      <div>
        {/* Search + refresh */}
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearch(input) }}
            placeholder="Search remote jobs..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={() => setSearch(input)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-gray-300 hover:border-purple-500/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading jobs...
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 py-4 text-center">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No remote jobs found for "{search}". Try a different search.</p>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, limit).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/jobs">
            <Button variant="outline" className="text-sm gap-2">
              <Briefcase className="w-4 h-4" /> Browse All Remote Jobs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Full-page view
  return (
    <div>
      {/* Debug Info Banner (only show if filtering is active) */}
      {debugInfo && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs font-mono text-yellow-200">
          <div className="font-bold text-yellow-300 mb-2">🐛 DEBUG INFO (Location Filtering)</div>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setSearch(input) }}
          placeholder="Job title, technology, or keyword..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Button variant="primary" onClick={() => setSearch(input)} className="gap-2 shrink-0">
          <RefreshCw className="w-4 h-4" /> Search
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'full', 'part', 'contract'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${typeFilter === t ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-gray-400 hover:border-purple-500/40'}`}
          >
            {t === 'all' ? 'All Types' : t === 'full' ? 'Full-time' : t === 'part' ? 'Part-time' : 'Contract'}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} jobs</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Searching remote jobs...
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchJobs(search)}>Try Again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No results for "{search}". Try a broader search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

function formatJobType(type: string): string {
  // Convert API job types to readable format: "full_time" → "Full Time"
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  // Truncate title to max 60 characters for compact view
  const displayTitle = compact && job.title.length > 60 
    ? job.title.slice(0, 60) + '...' 
    : job.title

  // Format salary display
  const salaryDisplay = job.salary_min && job.salary_max 
    ? `${job.salary_currency || '$'}${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}`
    : job.salary_min 
    ? `${job.salary_currency || '$'}${job.salary_min.toLocaleString()}+`
    : null

  return (
    <div className={`rounded-xl border border-white/10 hover:border-purple-500/30 transition-all ${compact ? 'p-4' : 'p-5'}`} style={{ background: '#0a0f1e' }}>
      <div className="flex items-start gap-3">
        {/* Company logo / fallback */}
        <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-white/10 overflow-hidden flex items-center justify-center">
          {job.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
          ) : (
            <Briefcase className="w-4 h-4 text-purple-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-semibold text-white leading-tight line-clamp-1 ${compact ? 'text-sm' : 'text-base'}`}
            title={job.title} // Tooltip shows full title
          >
            {displayTitle}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">{job.company}</p>
        </div>
        <span className="text-xs text-gray-500 shrink-0">{timeAgo(job.posted_at)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.job_type && (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${typeColor(job.job_type.toLowerCase())}`}>
            {formatJobType(job.job_type)}
          </span>
        )}
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" /> {job.location.length > 30 ? job.location.slice(0, 30) + '…' : job.location}
          </span>
        )}
        {salaryDisplay && (
          <span className="text-xs text-green-400">{salaryDisplay}</span>
        )}
        {job.source && (
          <span className="text-xs text-purple-400/70">via {job.source}</span>
        )}
      </div>

      {!compact && job.category && (
        <p className="mt-2 text-xs text-purple-400">{job.category}</p>
      )}

      <div className="mt-3 flex gap-2">
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="primary" fullWidth className={`gap-1 ${compact ? 'text-xs py-1.5' : 'text-sm'}`}>
            <ExternalLink className="w-3 h-3" /> View Job
          </Button>
        </a>
        {!compact && (
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-1 text-sm">
              <Globe className="w-3 h-3" />
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
