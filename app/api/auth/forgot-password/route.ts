import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RESET_PASSWORD_REDIRECT, withResetPasswordRedirect } from '@/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey)
}

function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey)
}

async function sendViaResend(email: string, resetLink: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return false

  const from = process.env.RESEND_FROM_EMAIL || 'Interview Coach <onboarding@resend.dev>'
  const subject = 'Reset your Interview Coach password'
  const text = [
    'We received a request to reset your Interview Coach password.',
    '',
    `Reset your password here: ${resetLink}`,
    '',
    'This link expires in 1 hour. If you did not request this, ignore this email.',
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
      html: resetPasswordEmail(resetLink),
    }),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    console.error('[forgot-password] Resend error:', errData)
    return false
  }

  return true
}

async function sendViaSupabase(email: string, redirectTo: string): Promise<boolean> {
  const supabaseAnon = getSupabaseAnon()
  if (!supabaseAnon) {
    console.error('[forgot-password] Supabase anon client not configured')
    return false
  }

  const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) {
    console.error('[forgot-password] resetPasswordForEmail error:', error.message)
    return false
  }

  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const redirectTo = RESET_PASSWORD_REDIRECT
    const supabaseAdmin = getSupabaseAdmin()

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      })

      if (!error) {
        const resetLink = data.properties?.action_link
          ? withResetPasswordRedirect(data.properties.action_link)
          : null
        if (resetLink && (await sendViaResend(email, resetLink))) {
          return NextResponse.json({ ok: true, via: 'resend' })
        }
      } else {
        console.error('[forgot-password] generateLink error:', error.message)
      }
    } else {
      console.error('[forgot-password] Supabase service role not configured')
    }

    // Fallback: Supabase built-in email (fix template in dashboard — see supabase/email-templates/reset-password.html)
    const sent = await sendViaSupabase(email, redirectTo)
    if (sent) {
      return NextResponse.json({ ok: true, via: 'supabase' })
    }

    return NextResponse.json(
      { error: 'Email service is not configured. Add RESEND_API_KEY in Vercel or fix Supabase email settings.' },
      { status: 503 }
    )
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function resetPasswordEmail(resetLink: string) {
  const escaped = resetLink.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
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
      <a href="${escaped}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:16px">
        Reset Password
      </a>
      <p style="margin:24px 0 0;line-height:1.6;color:#9ca3af;font-size:14px">
        If you didn't request this, you can safely ignore this email.
      </p>
      <p style="margin:16px 0 0;line-height:1.6;color:#6b7280;font-size:12px;word-break:break-all">
        Or copy this link:<br><a href="${escaped}" style="color:#a78bfa">${escaped}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
