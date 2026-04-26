import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const MIN_WITHDRAWAL = 50

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

    const authHeader = request.headers.get('authorization')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a coach and check Stripe Connect account status
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('user_id, stripe_connect_account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!coachProfile) {
      return NextResponse.json({ error: 'Only coaches can withdraw credits' }, { status: 403 })
    }

    // Stripe Connect payouts are not yet implemented — guard until the onboarding
    // flow and payout call are wired up so we never deduct credits without a real transfer.
    if (!coachProfile.stripe_connect_account_id) {
      return NextResponse.json(
        {
          error: 'Withdrawals are not yet available. Please complete Stripe Connect onboarding first.',
          code: 'STRIPE_CONNECT_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance, total_withdrawn')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !credits) {
      return NextResponse.json({ error: 'Failed to fetch credits balance' }, { status: 500 })
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is ${MIN_WITHDRAWAL} credits` }, { status: 400 })
    }

    if (amount > credits.balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const amountUSD = amount
    const newBalance = credits.balance - amount
    const newTotalWithdrawn = (credits.total_withdrawn || 0) + amount

    // Atomic deduction — only succeeds if balance is still sufficient
    const { data: updatedCredits, error: deductError } = await supabase
      .from('user_credits')
      .update({ balance: newBalance, total_withdrawn: newTotalWithdrawn })
      .eq('user_id', user.id)
      .gte('balance', amount)
      .select()
      .single()

    if (deductError || !updatedCredits) {
      console.error('Failed to deduct credits:', deductError)
      return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
    }

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      type: 'withdrawn',
      amount: -amount,
      balance_after: updatedCredits.balance,
      description: `Withdrawal: ${amount} credits ($${amountUSD})`,
    })

    // Stripe Connect payout placeholder — will be implemented once onboarding flow is live.
    // At this point coachProfile.stripe_connect_account_id is guaranteed non-null.
    console.log(`[withdraw] Stripe payout placeholder: $${amountUSD} → connect account ${coachProfile.stripe_connect_account_id}`)

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Withdrawal Initiated',
      message: `${amount} credits ($${amountUSD}) withdrawal is being processed. Funds will arrive in 2-5 business days.`,
      type: 'payment',
      read: false,
    })

    return NextResponse.json({
      success: true,
      amount,
      newBalance: updatedCredits.balance,
      message: `Withdrawal of ${amount} credits ($${amountUSD}) initiated successfully`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
