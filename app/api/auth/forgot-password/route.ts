import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { APP_URL } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const redirectTo = `${APP_URL}/reset-password`

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (error) {
      console.error('[forgot-password] generateLink error:', error.message)
      // Always return success to avoid email enumeration
      return NextResponse.json({ ok: true })
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      console.error('[forgot-password] generateLink returned no action_link')
      return NextResponse.json({ ok: true })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      // Fallback: Supabase default email (dashboard template must include {{ .ConfirmationURL }})
      const supabaseAnon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo })
      return NextResponse.json({ ok: true })
    }

    const resend = new Resend(resendApiKey)
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Interview Coach <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your Interview Coach password',
      html: resetPasswordEmail(resetLink),
    })

    if (sendError) {
      console.error('[forgot-password] Resend error:', sendError)
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function resetPasswordEmail(resetLink: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb">
  <div style="max-width:580px;margin:40px auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">
    <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 32px 24px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.7)">Interview Coach</p>
      <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff">Reset your password</h1>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 24px;line-height:1.6;color:#d1d5db">
        We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
      </p>
      <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:16px">
        Reset Password
      </a>
      <p style="margin:24px 0 0;line-height:1.6;color:#9ca3af;font-size:14px">
        If you didn't request this, you can safely ignore this email.
      </p>
      <p style="margin:16px 0 0;line-height:1.6;color:#6b7280;font-size:12px;word-break:break-all">
        Or copy this link: ${resetLink}
      </p>
    </div>
  </div>
</body>
</html>`
}
