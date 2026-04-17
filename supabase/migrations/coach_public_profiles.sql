-- ============================================================
-- Coach Public Profiles Policy
-- Allows anyone to read profiles of users who are coaches
-- Required for the /coaches browse page to work
-- Safe to run multiple times (DROP IF EXISTS guards)
-- ============================================================

DROP POLICY IF EXISTS "Coach profile rows are publicly readable" ON public.profiles;

CREATE POLICY "Coach profile rows are publicly readable"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles
      WHERE coach_profiles.user_id = profiles.id
    )
  );
