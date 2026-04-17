import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { coachId, coachName, scheduledAt, durationMinutes, notes, amount } = await request.json()

    const bookingId = `booking-${Date.now()}`
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Session with ${coachName}`)}&details=${encodeURIComponent(notes || 'Coaching session')}`

    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Coaching session with ${coachName}`,
                description: `${durationMinutes} minute coaching session`,
              },
              unit_amount: Math.max(1000, Math.round(Number(amount || 0) * 100)),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/session/${bookingId}?coach=${coachId}&duration=${durationMinutes}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/${coachId}`,
        metadata: {
          bookingId,
          coachId,
          scheduledAt,
        },
      })

      return NextResponse.json({ url: session.url, bookingId, calendarUrl })
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Interview Coach <onboarding@resend.dev>',
        to: ['candidate@example.com'],
        subject: `Booking confirmed with ${coachName}`,
        html: `<p>Your ${durationMinutes}-minute session with ${coachName} is booked for ${scheduledAt}.</p><p>Notes: ${notes || 'None'}</p>`,
      })
    }

    return NextResponse.json({ bookingId, calendarUrl, message: 'Mock checkout completed' })
  } catch (error: any) {
    console.error('Booking checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}