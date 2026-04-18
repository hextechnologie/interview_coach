-- ============================================================
-- Fix Profile Signup Migration
-- Adds missing profile columns, updates trigger, and adds RLS policy
-- Date: 2026-01-19
-- ============================================================

-- Add missing profile columns (safe to run multiple times)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_detail TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_job_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_me TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS projects_details TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Update the handle_new_user trigger to save all profile data from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    user_type,
    full_name,
    first_name,
    last_name,
    avatar_url,
    current_status,
    status_detail,
    target_job_role,
    target_job_field,
    experience_level,
    country,
    region,
    city,
    linkedin_url
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'user_type', 'candidate'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'current_status',
    new.raw_user_meta_data->>'status_detail',
    new.raw_user_meta_data->>'target_job_role',
    new.raw_user_meta_data->>'target_job_field',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'region',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'linkedin_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add INSERT RLS policy for profiles (allows users to insert their own profile)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Back-fill first_name / last_name from existing full_name where not yet set
UPDATE public.profiles
SET
  first_name = TRIM(SPLIT_PART(full_name, ' ', 1)),
  last_name = TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
WHERE full_name IS NOT NULL
  AND first_name IS NULL;
