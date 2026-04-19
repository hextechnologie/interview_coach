-- ============================================================
-- Enhanced Profile Fields Migration
-- Adds new fields for comprehensive profile system
-- Date: 2026-01-19
-- ============================================================

-- Add new career fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_type_preferences TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary_min INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary_max INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_job_location TEXT;

-- Add social/portfolio URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS behance_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dribbble_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Add notification preferences (defaults to true for important notifications)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_coach_message BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_session_reminder BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_job_offers BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_weekly_report BOOLEAN DEFAULT false;

-- Add profile metadata
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_profile_save TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Create index on profile completion for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON public.profiles(profile_completion_percentage);

-- Create index on timezone for coach matching
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON public.profiles(timezone);
