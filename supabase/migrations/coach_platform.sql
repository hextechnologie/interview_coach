-- ============================================================
-- Coach Platform Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name text;

-- 2. Extend bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'video';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_notes text;

-- 3. Messages (coach <-> candidate chat) -----------------------
CREATE TABLE IF NOT EXISTS messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content       text NOT NULL,
  read          boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx   ON messages(sender_id);

-- RLS: users can only read/write their own messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);  -- receivers mark as read

-- 4. Notifications --------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title      text NOT NULL,
  message    text,
  type       text DEFAULT 'info',   -- 'info' | 'booking' | 'review' | 'payment'
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
-- allow server-side inserts via service role (no user policy needed)

-- 5. Coach availability ----------------------------------------
CREATE TABLE IF NOT EXISTS coach_availability (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  slots           jsonb NOT NULL DEFAULT '[]',   -- [{day:0,hour:9}, ...]
  blocked_dates   jsonb NOT NULL DEFAULT '[]',   -- ["2025-01-20", ...]
  buffer_minutes  int NOT NULL DEFAULT 15,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coach_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coach_availability_select" ON coach_availability;
CREATE POLICY "coach_availability_select" ON coach_availability
  FOR SELECT USING (true);   -- publicly readable
DROP POLICY IF EXISTS "coach_availability_write" ON coach_availability;
CREATE POLICY "coach_availability_write" ON coach_availability
  FOR ALL USING (auth.uid() = coach_id);

-- 6. Coach profiles (extended info) ----------------------------
CREATE TABLE IF NOT EXISTS coach_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id             uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title                text,
  bio                  text,
  linkedin_url         text,
  hourly_rate          numeric(10,2),
  years_experience     int,
  specializations      jsonb NOT NULL DEFAULT '[]',
  companies_worked     jsonb NOT NULL DEFAULT '[]',
  avatar_url           text,
  profile_completed    boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coach_profiles_select" ON coach_profiles;
CREATE POLICY "coach_profiles_select" ON coach_profiles
  FOR SELECT USING (true);   -- public profiles
DROP POLICY IF EXISTS "coach_profiles_write" ON coach_profiles;
CREATE POLICY "coach_profiles_write" ON coach_profiles
  FOR ALL USING (auth.uid() = coach_id);

-- 7. Interview templates ---------------------------------------
CREATE TABLE IF NOT EXISTS interview_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  job_role         text,
  industry         text,
  difficulty       text DEFAULT 'mid',   -- 'junior' | 'mid' | 'senior'
  duration_minutes int NOT NULL DEFAULT 45,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_select" ON interview_templates;
CREATE POLICY "templates_select" ON interview_templates
  FOR SELECT USING (auth.uid() = coach_id);
DROP POLICY IF EXISTS "templates_write" ON interview_templates;
CREATE POLICY "templates_write" ON interview_templates
  FOR ALL USING (auth.uid() = coach_id);

-- 8. Template questions ----------------------------------------
CREATE TABLE IF NOT EXISTS template_questions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id         uuid REFERENCES interview_templates(id) ON DELETE CASCADE,
  question            text NOT NULL,
  order_index         int NOT NULL DEFAULT 0,
  time_limit_seconds  int NOT NULL DEFAULT 120
);

ALTER TABLE template_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "template_questions_select" ON template_questions;
CREATE POLICY "template_questions_select" ON template_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interview_templates t
      WHERE t.id = template_id AND t.coach_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "template_questions_write" ON template_questions;
CREATE POLICY "template_questions_write" ON template_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interview_templates t
      WHERE t.id = template_id AND t.coach_id = auth.uid()
    )
  );

-- 9. Session notes (shared between coach & candidate) ----------
CREATE TABLE IF NOT EXISTS session_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  coach_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "session_notes_select" ON session_notes;
CREATE POLICY "session_notes_select" ON session_notes
  FOR SELECT USING (
    auth.uid() = coach_id OR
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.candidate_id = auth.uid())
  );
DROP POLICY IF EXISTS "session_notes_write" ON session_notes;
CREATE POLICY "session_notes_write" ON session_notes
  FOR ALL USING (auth.uid() = coach_id);

-- 10. Answer scores (per-question scoring during live sessions) -
CREATE TABLE IF NOT EXISTS answer_scores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid REFERENCES bookings(id) ON DELETE CASCADE,
  question_id  uuid REFERENCES template_questions(id) ON DELETE CASCADE,
  score        int CHECK (score >= 1 AND score <= 10),
  coach_notes  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE answer_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "answer_scores_write" ON answer_scores;
CREATE POLICY "answer_scores_write" ON answer_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN profiles p ON p.id = auth.uid()
      WHERE b.id = booking_id AND p.role = 'coach'
    )
  );

-- 11. Earnings -------------------------------------------------
CREATE TABLE IF NOT EXISTS earnings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  amount     numeric(10,2) NOT NULL,
  status     text NOT NULL DEFAULT 'paid',   -- 'paid' | 'pending'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "earnings_select" ON earnings;
CREATE POLICY "earnings_select" ON earnings
  FOR SELECT USING (auth.uid() = coach_id);

-- 12. Supabase Realtime: enable for new tables -----------------
-- Run these in the Supabase Dashboard → Database → Replication
-- or uncomment if using supabase CLI:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
