-- Add language support to voice sessions
ALTER TABLE public.voice_sessions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'fr', 'es', 'ar'));
