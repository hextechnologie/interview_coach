-- ============================================================
-- Account Deletion Requests Table
-- Stores pending account deletion requests with email confirmation
-- Date: 2026-01-19
-- ============================================================

-- Create account deletion requests table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_deletion_requests_token ON public.account_deletion_requests(token);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON public.account_deletion_requests(user_id);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_deletion_requests_expires_at ON public.account_deletion_requests(expires_at);

-- Enable RLS (only admins can access this table)
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (admin) only
CREATE POLICY "Service role can manage deletion requests"
  ON public.account_deletion_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to automatically delete expired requests
CREATE OR REPLACE FUNCTION public.cleanup_expired_deletion_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM public.account_deletion_requests
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function for API route (if table doesn't exist)
CREATE OR REPLACE FUNCTION public.create_deletion_requests_table()
RETURNS void AS $$
BEGIN
  -- This function is called from the API if needed
  -- The table creation is handled above
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
