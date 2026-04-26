-- ============================================================
-- Voice Sessions Setup (idempotent — safe to run on any DB)
-- Creates voice_sessions and voice_session_qa tables with RLS.
-- ============================================================

-- Voice interview sessions
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interviewers           TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes       INT NOT NULL DEFAULT 5,
  actual_duration_minutes INT,
  credits_charged        INT NOT NULL DEFAULT 0,
  is_free                BOOLEAN NOT NULL DEFAULT true,
  status                 TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'completed', 'cancelled')),
  user_profile           JSONB DEFAULT '{}'::jsonb,
  total_questions        INT NOT NULL DEFAULT 0,
  overall_score          DECIMAL(3,1),
  started_at             TIMESTAMPTZ DEFAULT NOW(),
  ended_at               TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Individual Q&A records within a voice session
CREATE TABLE IF NOT EXISTS public.voice_session_qa (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES public.voice_sessions(id) ON DELETE CASCADE NOT NULL,
  interviewer_id TEXT NOT NULL,
  question      TEXT NOT NULL,
  answer        TEXT,
  score         DECIMAL(3,1),
  feedback      TEXT,
  asked_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id   ON public.voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status    ON public.voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_session_qa_session ON public.voice_session_qa(session_id);

-- Row Level Security
ALTER TABLE public.voice_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_session_qa  ENABLE ROW LEVEL SECURITY;

-- voice_sessions policies
DROP POLICY IF EXISTS "Users can view own voice sessions"    ON public.voice_sessions;
DROP POLICY IF EXISTS "Users can insert own voice sessions"  ON public.voice_sessions;
DROP POLICY IF EXISTS "Users can update own voice sessions"  ON public.voice_sessions;

CREATE POLICY "Users can view own voice sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice sessions"
  ON public.voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice sessions"
  ON public.voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- voice_session_qa policies
DROP POLICY IF EXISTS "Users can view own voice qa"    ON public.voice_session_qa;
DROP POLICY IF EXISTS "Users can insert own voice qa"  ON public.voice_session_qa;
DROP POLICY IF EXISTS "Users can update own voice qa"  ON public.voice_session_qa;

CREATE POLICY "Users can view own voice qa"
  ON public.voice_session_qa FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voice_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own voice qa"
  ON public.voice_session_qa FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voice_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own voice qa"
  ON public.voice_session_qa FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.voice_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_voice_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_voice_sessions_updated_at ON public.voice_sessions;
CREATE TRIGGER trg_voice_sessions_updated_at
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_voice_sessions_updated_at();
