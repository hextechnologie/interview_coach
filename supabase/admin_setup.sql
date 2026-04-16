-- Admin Setup: Give unlimited interviews to test accounts
-- Run this in Supabase SQL Editor

-- Step 1: Check if the profile exists
SELECT 
  id,
  email, 
  subscription_tier, 
  interviews_limit, 
  interviews_used_this_month,
  created_at
FROM public.profiles
WHERE email LIKE '%boudara%' OR email LIKE '%boukane%';

-- Step 2: Update the profile (use the exact email from Step 1)
UPDATE public.profiles
SET 
  subscription_tier = 'pro',
  interviews_limit = 999999,
  interviews_used_this_month = 0,
  updated_at = NOW()
WHERE email = 'abdelkarim.boudara@gmail.com';

-- Step 3: Update additional admin account
UPDATE public.profiles
SET 
  subscription_tier = 'pro',
  interviews_limit = 999999,
  interviews_used_this_month = 0,
  updated_at = NOW()
WHERE email = 'moujahid.boukane@gmail.com';

-- Step 4: Force update for ALL matching emails (in case of typo)
UPDATE public.profiles
SET 
  subscription_tier = 'pro',
  interviews_limit = 999999,
  interviews_used_this_month = 0,
  updated_at = NOW()
WHERE email LIKE '%boudara%' OR email LIKE '%boukane%';

-- Step 5: Verify the update worked
SELECT 
  '✅ UPDATED:' as status,
  email, 
  subscription_tier, 
  interviews_limit, 
  interviews_used_this_month
FROM public.profiles
WHERE email LIKE '%boudara%' OR email LIKE '%boukane%';

-- If you see interviews_limit = 999999 above, the database is updated!
-- Then: LOG OUT from the website, clear browser cache, and LOG BACK IN
