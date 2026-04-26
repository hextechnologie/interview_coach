import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateCreditsRequired } from '@/lib/credits'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { panelMemberIds, durationMinutes, userProfile } = body

    if (!panelMemberIds || panelMemberIds.length === 0) {
      return NextResponse.json({ error: 'At least one panel member must be selected' }, { status: 400 })
    }

    if (panelMemberIds.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 panel members allowed' }, { status: 400 })
    }

    // Get user's profile and credits in parallel
    const [{ data: profile, error: profileError }, { data: userCredits }] = await Promise.all([
      supabase
        .from('profiles')
        .select('interviews_used_this_month, interviews_limit')
        .eq('id', user.id)
        .single(),
      supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single(),
    ])

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    const currentCredits = userCredits?.balance ?? 0

    // Check interview limit
    if (profile.interviews_used_this_month >= profile.interviews_limit) {
      return NextResponse.json({ error: 'Interview limit reached for this month' }, { status: 403 })
    }

    // Calculate and check credits
    const creditsRequired = calculateCreditsRequired(durationMinutes)
    const isFree = durationMinutes === 5

    if (!isFree && currentCredits < creditsRequired) {
      return NextResponse.json({
        error: `Insufficient credits. You need ${creditsRequired} credits but have ${currentCredits}.`,
        creditsNeeded: creditsRequired - currentCredits
      }, { status: 402 })
    }

    // Deduct credits if not free (update user_credits directly — consistent with credits_system schema)
    if (!isFree) {
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({ balance: currentCredits - creditsRequired })
        .eq('user_id', user.id)

      if (deductError) {
        console.error('Failed to deduct credits:', deductError)
        return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
      }
    }

    // Create voice session — column is `interviewers` (matches voice_interviews.sql migration)
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: user.id,
        interviewers: panelMemberIds,
        duration_minutes: durationMinutes,
        credits_charged: creditsRequired,
        is_free: isFree,
        status: 'active',
        user_profile: userProfile || {},
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to create voice session:', sessionError)

      // Refund credits if session creation failed
      if (!isFree) {
        await supabase
          .from('user_credits')
          .update({ balance: currentCredits })
          .eq('user_id', user.id)
      }

      // Surface the real DB error so it's visible in the browser alert
      const dbMsg = (sessionError as { message?: string })?.message || 'unknown DB error'
      return NextResponse.json(
        { error: `Failed to create voice session: ${dbMsg}` },
        { status: 500 }
      )
    }

    // Increment interviews_used_this_month
    await supabase
      .from('profiles')
      .update({ interviews_used_this_month: profile.interviews_used_this_month + 1 })
      .eq('id', user.id)

    return NextResponse.json({
      sessionId: session.id,
      creditsCharged: creditsRequired,
      isFree,
      durationMinutes
    })

  } catch (error) {
    console.error('Error creating voice interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
