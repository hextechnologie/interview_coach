-- Migration: Structured Profile Data
-- Created: 2026-04-18
-- Description: Add tables for structured experience, education, skills, and achievements

-- Coach/Candidate Experience Entries
CREATE TABLE IF NOT EXISTS public.user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract', 'Self-employed')),
  location TEXT,
  start_month INTEGER CHECK (start_month >= 1 AND start_month <= 12),
  start_year INTEGER NOT NULL CHECK (start_year >= 1950 AND start_year <= 2050),
  end_month INTEGER CHECK (end_month >= 1 AND end_month <= 12),
  end_year INTEGER CHECK (end_year >= 1950 AND end_year <= 2050),
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Coach/Candidate Education Entries
CREATE TABLE IF NOT EXISTS public.user_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  education_type TEXT NOT NULL CHECK (education_type IN (
    'University',
    'Certification', 
    'High School',
    'Online Course',
    'Bootcamp',
    'Vocational',
    'Other'
  )),
  institution_name TEXT NOT NULL,
  degree TEXT, -- Bachelor's, Master's, PhD, etc.
  field_of_study TEXT,
  start_year INTEGER CHECK (start_year >= 1950 AND start_year <= 2050),
  end_year INTEGER CHECK (end_year >= 1950 AND end_year <= 2050),
  is_ongoing BOOLEAN DEFAULT false,
  grade TEXT, -- Excellent, Very Good, Good, Pass
  credential_id TEXT,
  credential_url TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Coach/Candidate Skills
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT CHECK (skill_category IN ('Technical', 'Soft Skills', 'Languages', 'Tools')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, skill_name)
);

-- Coach/Candidate Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT CHECK (achievement_type IN (
    'Professional Achievement',
    'Project',
    'Public Speaking',
    'Publication',
    'Award',
    'Other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  achievement_month INTEGER CHECK (achievement_month >= 1 AND achievement_month <= 12),
  achievement_year INTEGER CHECK (achievement_year >= 1950 AND achievement_year <= 2050),
  url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_experience_user_id ON public.user_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON public.user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own data
CREATE POLICY "Users can view their own experience"
  ON public.user_experience FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experience"
  ON public.user_experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experience"
  ON public.user_experience FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experience"
  ON public.user_experience FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own education"
  ON public.user_education FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education"
  ON public.user_education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
  ON public.user_education FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
  ON public.user_education FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own skills"
  ON public.user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON public.user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.user_skills FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);
