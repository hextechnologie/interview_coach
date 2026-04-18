// ============================================================
// Unified Jobs System Types
// ============================================================

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead'
export type JobSource = 'Remotive' | 'Adzuna' | 'LinkedIn' | 'Indeed' | 'The Muse' | 'Arbeitnow' | 'JSearch'
export type DateFilter = 'any' | '24h' | '7d' | '30d'

export interface Job {
  id: string
  title: string
  company: string
  company_logo: string | null
  location: string
  job_type: JobType | null
  experience_level: ExperienceLevel | null
  category: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  description: string
  apply_url: string
  source: JobSource
  posted_at: string  // ISO date string
  is_remote: boolean
  tags: string[]
  raw_data?: any  // Original API response for debugging
}

export interface JobFilters {
  search: string
  job_types: JobType[]
  experience_levels: ExperienceLevel[]
  categories: string[]
  locations: string[]
  salary_min: number
  salary_max: number
  only_with_salary: boolean
  is_remote_only: boolean
  date_filter: DateFilter
  sources: JobSource[]
}

export interface SavedJob {
  id: string
  user_id: string
  job_data: Job
  saved_at: string
}

export interface JobAlert {
  id: string
  user_id: string
  alert_name: string
  keywords: string[]
  job_types: JobType[]
  categories: string[]
  locations: string[]
  min_salary: number | null
  is_remote_only: boolean
  is_active: boolean
  email_frequency: 'instant' | 'daily' | 'weekly'
  last_sent_at: string | null
  created_at: string
  updated_at: string
}

// Popular categories for filtering
export const JOB_CATEGORIES = [
  'Software Development',
  'Design & UX',
  'Product Management',
  'Data Science & AI',
  'Marketing',
  'Sales',
  'Finance',
  'HR & Recruitment',
  'Customer Support',
  'DevOps & Infrastructure',
  'Security',
  'QA & Testing',
  'Mobile Development',
  'Frontend Development',
  'Backend Development',
  'Full Stack',
  'Other'
] as const

// Popular locations
export const JOB_LOCATIONS = [
  { label: 'Remote (Worldwide)', value: 'remote-worldwide' },
  { label: 'Remote (Europe)', value: 'remote-europe' },
  { label: 'Remote (US)', value: 'remote-us' },
  { label: 'Algeria 🇩🇿', value: 'algeria', emoji: '🇩🇿' },
  { label: 'Morocco 🇲🇦', value: 'morocco', emoji: '🇲🇦' },
  { label: 'Saudi Arabia 🇸🇦', value: 'saudi-arabia', emoji: '🇸🇦' },
  { label: 'UAE 🇦🇪', value: 'uae', emoji: '🇦🇪' },
  { label: 'Egypt 🇪🇬', value: 'egypt', emoji: '🇪🇬' },
  { label: 'Tunisia 🇹🇳', value: 'tunisia', emoji: '🇹🇳' },
  { label: 'France 🇫🇷', value: 'france', emoji: '🇫🇷' },
  { label: 'Germany 🇩🇪', value: 'germany', emoji: '🇩🇪' },
  { label: 'United Kingdom 🇬🇧', value: 'uk', emoji: '🇬🇧' },
  { label: 'United States 🇺🇸', value: 'usa', emoji: '🇺🇸' },
  { label: 'Canada 🇨🇦', value: 'canada', emoji: '🇨🇦' },
] as const

// Popular job search queries
export const POPULAR_SEARCHES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Mobile Developer',
  'React Developer',
  'Python Developer',
  'JavaScript Developer',
  'Marketing Manager',
  'Sales Executive',
  'Customer Success',
] as const

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'Entry', label: 'Entry Level (0-2 years)' },
  { value: 'Mid', label: 'Mid Level (2-5 years)' },
  { value: 'Senior', label: 'Senior Level (5+ years)' },
  { value: 'Lead', label: 'Manager / Lead' },
]

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'Full-time', label: 'Full Time' },
  { value: 'Part-time', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
]

export const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]
