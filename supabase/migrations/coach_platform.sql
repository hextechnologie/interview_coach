-- ============================================================
-- Coach Platform Delta Migration
--
-- IMPORTANT: Run supabase/schema.sql FIRST if you haven't yet.
-- This file only adds new columns/tables on top of schema.sql.
-- ============================================================

-- 1. Extend profiles -------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name  text;
-- Add `role` column if not present (some DB setups omit it)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'candidate';
  END IF;
END $$;

-- 2. Extend bookings ------------------------------------------
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_type  text DEFAULT 'video';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_notes text;

-- 3. Extend messages (schema.sql table has booking_id NOT NULL)
--    Add receiver_id + read; make booking_id nullable for direct messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read        boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ALTER COLUMN booking_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);

-- Update RLS to cover direct (non-booking) messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- 4. Extend earnings (schema.sql uses gross/net/platform cols) -
--    Add a simple `amount` column our app reads directly
ALTER TABLE public.earnings ADD COLUMN IF NOT EXISTS amount numeric(10,2)
  GENERATED ALWAYS AS (net_amount) STORED;

-- 5. Extend coach_profiles (schema.sql uses user_id, not coach_id)
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS coach_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS specializations  jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS companies_worked jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;
-- Backfill coach_id from user_id for existing rows
UPDATE public.coach_profiles SET coach_id = user_id WHERE coach_id IS NULL;

-- 6. Coach availability (new — separate from schema.sql `availability`) ---
CREATE TABLE IF NOT EXISTS public.coach_availability (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  slots          jsonb NOT NULL DEFAULT '[]',   -- [{day:0,hour:9}, ...]
  blocked_dates  jsonb NOT NULL DEFAULT '[]',   -- ["2025-01-20", ...]
  buffer_minutes int   NOT NULL DEFAULT 15,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coach_availability_select" ON public.coach_availability;
CREATE POLICY "coach_availability_select" ON public.coach_availability
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "coach_availability_write" ON public.coach_availability;
CREATE POLICY "coach_availability_write" ON public.coach_availability
  FOR ALL USING (auth.uid() = coach_id);

-- 7. Interview templates --------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  job_role         text,
  industry         text,
  difficulty       text DEFAULT 'mid',
  duration_minutes int  NOT NULL DEFAULT 45,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_select" ON public.interview_templates;
CREATE POLICY "templates_select" ON public.interview_templates
  FOR SELECT USING (auth.uid() = coach_id);
DROP POLICY IF EXISTS "templates_write" ON public.interview_templates;
CREATE POLICY "templates_write" ON public.interview_templates
  FOR ALL USING (auth.uid() = coach_id);

-- 8. Template questions ----------------------------------------
CREATE TABLE IF NOT EXISTS public.template_questions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id        uuid REFERENCES public.interview_templates(id) ON DELETE CASCADE,
  question           text NOT NULL,
  order_index        int  NOT NULL DEFAULT 0,
  time_limit_seconds int  NOT NULL DEFAULT 120
);

ALTER TABLE public.template_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "template_questions_select" ON public.template_questions;
CREATE POLICY "template_questions_select" ON public.template_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.interview_templates t
            WHERE t.id = template_id AND t.coach_id = auth.uid())
  );
DROP POLICY IF EXISTS "template_questions_write" ON public.template_questions;
CREATE POLICY "template_questions_write" ON public.template_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.interview_templates t
            WHERE t.id = template_id AND t.coach_id = auth.uid())
  );

-- 9. Session notes --------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  coach_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "session_notes_select" ON public.session_notes;
CREATE POLICY "session_notes_select" ON public.session_notes
  FOR SELECT USING (
    auth.uid() = coach_id OR
    EXISTS (SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id AND b.candidate_id = auth.uid())
  );
DROP POLICY IF EXISTS "session_notes_write" ON public.session_notes;
CREATE POLICY "session_notes_write" ON public.session_notes
  FOR ALL USING (auth.uid() = coach_id);

-- 10. Answer scores -------------------------------------------
CREATE TABLE IF NOT EXISTS public.answer_scores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.template_questions(id) ON DELETE CASCADE,
  score       int CHECK (score >= 1 AND score <= 10),
  coach_notes text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.answer_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "answer_scores_write" ON public.answer_scores;
CREATE POLICY "answer_scores_write" ON public.answer_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE b.id = booking_id AND (p.role = 'coach' OR p.user_type = 'coach')
    )
  );

-- 11. Supabase Realtime ---------------------------------------
-- Enable in Supabase Dashboard → Database → Replication, or run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
