import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name?: string
  subscription_tier: 'free' | 'basic' | 'pro' | 'team'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  interviews_used_this_month: number
  interviews_limit: number
  created_at: string
  updated_at: string
}

export type InterviewSession = {
  id: string
  user_id: string
  job_role: string
  industry?: string
  difficulty_level: 'junior' | 'mid' | 'senior'
  status: 'in_progress' | 'completed' | 'abandoned'
  overall_score?: number
  started_at: string
  completed_at?: string
  total_questions: number
  questions_answered: number
  created_at: string
  interview_config?: {
    resumeText?: string
    resumeFileName?: string
    jobDescription?: string
    language?: string
    interviewerType?: string
    interviewType?: string
    interviewRound?: string
    yearsOfExperience?: number
    mainSkills?: string[]
    weakAreas?: string[]
    role?: string
    targetCompany?: string
    realCompanyMode?: boolean
    personalizationKeywords?: string[]
  }
}

export type InterviewAnswer = {
  id: string
  session_id: string
  question_number: number
  question_text: string
  user_answer: string
  ai_feedback?: {
    score: number
    strengths: string[]
    weaknesses: string[]
    ideal_answer?: string
    improved_answer: string
    metrics?: {
      confidence: number
      clarity: number
      filler_words: number
    }
  }
  score?: number
  created_at: string
}
