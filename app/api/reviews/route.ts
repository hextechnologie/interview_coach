import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromBearer } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, rating, comment, recommendCoach } = body as {
      bookingId: string
      rating: number
      comment?: string
      recommendCoach?: boolean
    }

    if (!bookingId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'bookingId and a rating between 1 and 5 are required' },
        { status: 400 }
      )
    }

    // Verify the booking belongs to this candidate
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, candidate_id, coach_id, status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.candidate_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Reviews can only be submitted for completed sessions' },
        { status: 400 }
      )
    }

    // Upsert review (one per booking)
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .upsert(
        {
          booking_id: bookingId,
          candidate_id: user.id,
          coach_id: booking.coach_id,
          rating,
          comment: comment ?? null,
          recommend_coach: recommendCoach ?? null,
        },
        { onConflict: 'booking_id' }
      )
      .select()
      .single()

    if (reviewError) {
      console.error('Error saving review:', reviewError)
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    // Refresh coach aggregate rating
    const { data: coachReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('coach_id', booking.coach_id)

    if (coachReviews && coachReviews.length > 0) {
      const avgRating =
        coachReviews.reduce((sum, r) => sum + r.rating, 0) / coachReviews.length
      await supabaseAdmin
        .from('coach_profiles')
        .update({ rating: Math.round(avgRating * 10) / 10 })
        .eq('user_id', booking.coach_id)
    }

    return NextResponse.json({ success: true, review })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}