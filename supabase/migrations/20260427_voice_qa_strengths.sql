ALTER TABLE public.voice_session_qa
  ADD COLUMN IF NOT EXISTS strengths text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS improvements text[] DEFAULT '{}';
