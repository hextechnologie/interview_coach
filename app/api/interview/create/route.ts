import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { jobRole, difficultyLevel } = await request.json()

    // Get user from cookies
    const cookieStore = cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          storage: {
            getItem: (key: string) => cookieStore.get(key)?.value ?? null,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role supabase client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check interview limit
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.interviews_used_this_month >= profile.interviews_limit) {
      return NextResponse.json({ error: 'Interview limit reached' }, { status: 403 })
    }

    // Create new session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        job_role: jobRole,
        difficulty_level: difficultyLevel.toLowerCase(),
        status: 'in_progress',
        total_questions: 6,
        questions_answered: 0,
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Update interview count
    await supabaseAdmin
      .from('profiles')
      .update({ interviews_used_this_month: profile.interviews_used_this_month + 1 })
      .eq('id', user.id)

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
