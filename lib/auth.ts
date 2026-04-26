import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Canonical app URL — always use this instead of NEXT_PUBLIC_URL or NEXT_PUBLIC_SITE_URL.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_URL ||
  'https://interview-coach-tau.vercel.app'

/**
 * Validate a Bearer token from the Authorization header and return the
 * authenticated user, or null if missing / invalid.
 */
export async function getUserFromBearer(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

export async function getUserFromRequest() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    return null
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function getUserFromSession(request: Request) {
  const cookies = request.headers.get('cookie')
  
  if (!cookies) {
    return null
  }

  // Parse cookies to get access token
  const cookieObj: Record<string, string> = {}
  cookies.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=')
    cookieObj[key] = value
  })

  const accessToken = cookieObj['sb-access-token']

  if (!accessToken) {
    return null
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}
