import type { Job, JobSource } from './types/jobs'

// API configuration - add your keys to .env.local
const ADZUNA_APP_ID = process.env.NEXT_PUBLIC_ADZUNA_APP_ID || ''
const ADZUNA_API_KEY = process.env.NEXT_PUBLIC_ADZUNA_API_KEY || ''
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || ''

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000
const cache = new Map<string, { data: Job[]; timestamp: number }>()

/**
 * Normalize job data from different API sources into unified Job format
 */
function normalizeRemotiveJob(job: any): Job {
  return {
    id: `remotive-${job.id}`,
    title: job.title || '',
    company: job.company_name || '',
    company_logo: job.company_logo || null,
    location: job.candidate_required_location || 'Remote',
    job_type: normalizeJobType(job.job_type),
    experience_level: extractExperienceLevel(job.title + ' ' + job.description),
    category: job.category || 'Other',
    salary_min: extractSalaryMin(job.salary),
    salary_max: extractSalaryMax(job.salary),
    salary_currency: 'USD',
    description: job.description || '',
    apply_url: job.url || '',
    source: 'Remotive',
    posted_at: job.publication_date || new Date().toISOString(),
    is_remote: true,
    tags: job.tags || extractTags(job.description),
    raw_data: job
  }
}

function normalizeTheMuseJob(job: any): Job {
  return {
    id: `themuse-${job.id}`,
    title: job.name || '',
    company: job.company?.name || '',
    company_logo: job.company?.logo || null,
    location: job.locations?.[0]?.name || 'Remote',
    job_type: 'Full-time',
    experience_level: extractExperienceLevel(job.name + ' ' + job.contents),
    category: job.categories?.[0]?.name || 'Other',
    salary_min: null,
    salary_max: null,
    salary_currency: 'USD',
    description: job.contents || '',
    apply_url: job.refs?.landing_page || '',
    source: 'The Muse',
    posted_at: job.publication_date || new Date().toISOString(),
    is_remote: job.locations?.some((l: any) => l.name.toLowerCase().includes('remote')) || false,
    tags: job.tags?.map((t: any) => t.name) || [],
    raw_data: job
  }
}

function normalizeAdzunaJob(job: any): Job {
  return {
    id: `adzuna-${job.id}`,
    title: job.title || '',
    company: job.company?.display_name || '',
    company_logo: null,
    location: job.location?.display_name || 'Remote',
    job_type: normalizeJobType(job.contract_type),
    experience_level: extractExperienceLevel(job.title + ' ' + job.description),
    category: job.category?.label || 'Other',
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    salary_currency: 'USD',
    description: job.description || '',
    apply_url: job.redirect_url || '',
    source: 'Adzuna',
    posted_at: job.created || new Date().toISOString(),
    is_remote: job.location?.display_name?.toLowerCase().includes('remote') || false,
    tags: extractTags(job.description),
    raw_data: job
  }
}

function normalizeJSearchJob(job: any): Job {
  return {
    id: `jsearch-${job.job_id}`,
    title: job.job_title || '',
    company: job.employer_name || '',
    company_logo: job.employer_logo || null,
    location: job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : 'Remote',
    job_type: normalizeJobType(job.job_employment_type),
    experience_level: extractExperienceLevel(job.job_title + ' ' + job.job_description),
    category: extractCategory(job.job_title),
    salary_min: parseSalary(job.job_min_salary),
    salary_max: parseSalary(job.job_max_salary),
    salary_currency: job.job_salary_currency || 'USD',
    description: job.job_description || '',
    apply_url: job.job_apply_link || '',
    source: job.job_publisher?.includes('LinkedIn') ? 'LinkedIn' : job.job_publisher?.includes('Indeed') ? 'Indeed' : 'JSearch',
    posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
    is_remote: job.job_is_remote || false,
    tags: extractTags(job.job_description),
    raw_data: job
  }
}

function normalizeArbeitnowJob(job: any): Job {
  return {
    id: `arbeitnow-${job.slug}`,
    title: job.title || '',
    company: job.company_name || '',
    company_logo: job.company_logo || null,
    location: job.location || 'Remote',
    job_type: normalizeJobType(job.job_types?.[0]),
    experience_level: extractExperienceLevel(job.title + ' ' + job.description),
    category: extractCategory(job.title),
    salary_min: null,
    salary_max: null,
    salary_currency: 'EUR',
    description: job.description || '',
    apply_url: job.url || '',
    source: 'Arbeitnow',
    posted_at: job.created_at || new Date().toISOString(),
    is_remote: job.remote || false,
    tags: job.tags || [],
    raw_data: job
  }
}

/**
 * Helper functions to extract and normalize data
 */
function normalizeJobType(type: string | null): Job['job_type'] {
  if (!type) return null
  const t = type.toLowerCase()
  if (t.includes('full')) return 'Full-time'
  if (t.includes('part')) return 'Part-time'
  if (t.includes('contract')) return 'Contract'
  if (t.includes('freelance')) return 'Freelance'
  if (t.includes('intern')) return 'Internship'
  return 'Full-time'
}

function extractExperienceLevel(text: string): Job['experience_level'] {
  const t = text.toLowerCase()
  if (t.match(/\b(senior|sr|lead|principal|staff)\b/)) return 'Senior'
  if (t.match(/\b(mid|intermediate|experienced)\b/)) return 'Mid'
  if (t.match(/\b(junior|jr|entry|graduate)\b/)) return 'Entry'
  if (t.match(/\b(manager|director|head of|vp)\b/)) return 'Lead'
  return null
}

function extractCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('software') || t.includes('developer') || t.includes('engineer')) return 'Software Development'
  if (t.includes('design') || t.includes('ux') || t.includes('ui')) return 'Design & UX'
  if (t.includes('product manager') || t.includes('product owner')) return 'Product Management'
  if (t.includes('data') || t.includes('analytics') || t.includes('ai') || t.includes('ml')) return 'Data Science & AI'
  if (t.includes('marketing')) return 'Marketing'
  if (t.includes('sales') || t.includes('account')) return 'Sales'
  if (t.includes('finance') || t.includes('accounting')) return 'Finance'
  if (t.includes('hr') || t.includes('recruit')) return 'HR & Recruitment'
  if (t.includes('support') || t.includes('customer success')) return 'Customer Support'
  if (t.includes('devops') || t.includes('infrastructure') || t.includes('sre')) return 'DevOps & Infrastructure'
  return 'Other'
}

function extractSalaryMin(salaryStr: string | null): number | null {
  if (!salaryStr) return null
  const match = salaryStr.match(/\$?([\d,]+)/)
  return match ? parseInt(match[1].replace(/,/g, '')) : null
}

function extractSalaryMax(salaryStr: string | null): number | null {
  if (!salaryStr) return null
  const matches = salaryStr.match(/\$?([\d,]+)/g)
  if (!matches || matches.length < 2) return null
  return parseInt(matches[1].replace(/[$,]/g, ''))
}

function parseSalary(value: any): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseInt(value.replace(/[^0-9]/g, ''))
  return null
}

function extractTags(description: string): string[] {
  if (!description) return []
  const tags: string[] = []
  const commonTech = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST', 'API', 'Figma', 'Sketch', 'Git']
  commonTech.forEach(tech => {
    if (description.includes(tech)) tags.push(tech)
  })
  return tags.slice(0, 5)
}

/**
 * Fetch jobs from all sources and merge
 */
export async function fetchAllJobs(query: string = 'software', userCountry: string = ''): Promise<Job[]> {
  // Check cache first
  const cacheKey = `jobs-${query}-${userCountry}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const allJobs: Job[] = []

  // Fetch from all sources in parallel
  const results = await Promise.allSettled([
    fetchRemotiveJobs(query),
    fetchTheMuseJobs(query),
    fetchAdzunaJobs(query, userCountry),
    fetchJSearchJobs(query, userCountry),
    fetchArbeitnowJobs(),
  ])

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value)
    }
  })

  // Remove duplicates based on title + company
  const uniqueJobs = deduplicateJobs(allJobs)

  // Sort by date (newest first)
  uniqueJobs.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())

  // Cache the results
  cache.set(cacheKey, { data: uniqueJobs, timestamp: Date.now() })

  return uniqueJobs
}

function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>()
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`.replace(/[^a-z0-9-]/g, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Individual API fetchers
 */
async function fetchRemotiveJobs(query: string): Promise<Job[]> {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=50`)
    if (!res.ok) throw new Error('Remotive API failed')
    const data = await res.json()
    return (data.jobs || []).map(normalizeRemotiveJob)
  } catch (error) {
    console.error('Remotive API error:', error)
    return []
  }
}

async function fetchTheMuseJobs(query: string): Promise<Job[]> {
  try {
    const res = await fetch(`https://www.themuse.com/api/public/jobs?page=1&descending=true`)
    if (!res.ok) throw new Error('The Muse API failed')
    const data = await res.json()
    return (data.results || []).map(normalizeTheMuseJob).filter((job: Job) =>
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('The Muse API error:', error)
    return []
  }
}

async function fetchAdzunaJobs(query: string, userCountry: string = ''): Promise<Job[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.warn('Adzuna API credentials not configured')
    return []
  }
  
  // Map user country to Adzuna country code
  const countryMap: { [key: string]: string } = {
    'france': 'fr',
    'germany': 'de',
    'spain': 'es',
    'italy': 'it',
    'uk': 'gb',
    'united kingdom': 'gb',
    'usa': 'us',
    'united states': 'us',
    'canada': 'ca'
  }
  
  const adzunaCountry = userCountry ? countryMap[userCountry.toLowerCase()] || 'us' : 'us'
  
  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${adzunaCountry}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&what=${encodeURIComponent(query)}&results_per_page=50`
    )
    if (!res.ok) throw new Error('Adzuna API failed')
    const data = await res.json()
    return (data.results || []).map(normalizeAdzunaJob)
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

async function fetchJSearchJobs(query: string, userCountry: string = ''): Promise<Job[]> {
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not configured')
    return []
  }
  
  // Add country to search query for better location targeting
  const searchQuery = userCountry ? `${query} in ${userCountry}` : query
  
  try {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=3`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    )
    if (!res.ok) throw new Error('JSearch API failed')
    const data = await res.json()
    return (data.data || []).map(normalizeJSearchJob)
  } catch (error) {
    console.error('JSearch API error:', error)
    return []
  }
}

async function fetchArbeitnowJobs(): Promise<Job[]> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api')
    if (!res.ok) throw new Error('Arbeitnow API failed')
    const data = await res.json()
    return (data.data || []).map(normalizeArbeitnowJob)
  } catch (error) {
    console.error('Arbeitnow API error:', error)
    return []
  }
}

/**
 * Clear cache manually
 */
export function clearJobsCache() {
  cache.clear()
}
