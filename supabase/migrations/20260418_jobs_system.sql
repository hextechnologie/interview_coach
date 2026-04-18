-- Migration: Jobs System Tables
-- Created: 2026-04-18
-- Description: Add tables for saved jobs and job alerts

-- Saved Jobs Table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_data JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, (job_data->>'id'))
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at ON public.saved_jobs(saved_at DESC);

-- Job Alerts Table  
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alert_name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  is_remote_only BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'daily' CHECK (email_frequency IN ('instant', 'daily', 'weekly')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(is_active) WHERE is_active = true;

-- RLS Policies for Saved Jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Job Alerts
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job alerts"
  ON public.job_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create job alerts"
  ON public.job_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job alerts"
  ON public.job_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job alerts"
  ON public.job_alerts FOR DELETE
  USING (auth.uid() = user_id);
