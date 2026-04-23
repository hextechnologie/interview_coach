-- Voice interview sessions
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  panel_members TEXT[] NOT NULL,
  duration_minutes INT NOT NULL,
  credits_charged INT DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  overall_score DECIMAL(3,1),
  total_questions INT DEFAULT 0,
  user_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Individual Q&A in voice session
CREATE TABLE IF NOT EXISTS public.voice_session_qa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.voice_sessions(id) ON DELETE CASCADE NOT NULL,
  interviewer_type TEXT NOT NULL,
  interviewer_name TEXT NOT NULL,
  question TEXT NOT NULL,
  question_audio_url TEXT,
  answer_transcript TEXT,
  answer_audio_url TEXT,
  score DECIMAL(3,1),
  feedback TEXT,
  feedback_audio_url TEXT,
  question_number INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Credit transactions table (for tracking credit usage and refunds)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund', 'bonus')),
  description TEXT,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add credits column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'credits') THEN
    ALTER TABLE public.profiles ADD COLUMN credits INT DEFAULT 100;
  END IF;
END $$;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = GREATEST(credits - amount, 0),
      updated_at = TIMEZONE('utc', NOW())
  WHERE id = user_id;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (user_id, -amount, 'deduction', 'Voice interview session');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refund credits
CREATE OR REPLACE FUNCTION refund_credits(user_id UUID, amount INT, session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + amount,
      updated_at = TIMEZONE('utc', NOW())
  WHERE id = user_id;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, session_id)
  VALUES (user_id, amount, 'refund', 'Unused time refund', session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON public.voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_session_qa_session_id ON public.voice_session_qa(session_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
