import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json()

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId are required' }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate a unique deletion token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Store deletion request in database
    const { error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      // If table doesn't exist, create it first
      if (insertError.code === '42P01') {
        await supabase.rpc('create_deletion_requests_table')
        // Retry insert
        await supabase.from('account_deletion_requests').insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })
      } else {
        throw insertError
      }
    }

    // Generate confirmation URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const confirmUrl = `${baseUrl}/api/account/confirm-deletion?token=${token}`
    const cancelUrl = `${baseUrl}/api/account/cancel-deletion?token=${token}`

    // Send confirmation email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Interview Coach <no-reply@interviewcoach.app>',
      to: email,
      subject: '⚠️ Confirm Account Deletion - Interview Coach',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; }
            .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; padding: 16px 32px; margin: 10px 5px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
            .button-danger { background: #ef4444; color: white; }
            .button-safe { background: #10b981; color: white; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            ul { line-height: 1.8; }
            .expires { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">⚠️ Account Deletion Request</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-top: 0;">Hello,</p>
              
              <div class="warning-box">
                <strong>⚠️ Action Required</strong><br>
                You requested to delete your Interview Coach account associated with <strong>${email}</strong>.
              </div>

              <p><strong>This action will permanently delete:</strong></p>
              <ul>
                <li>👤 Your profile and personal information</li>
                <li>🎯 All interview history and AI feedback</li>
                <li>🎥 All session recordings</li>
                <li>💼 Saved job applications and notes</li>
                <li>👨‍💼 Coach bookings and reviews</li>
                <li>💳 Subscription and credits balance</li>
                <li>📧 All messages and conversations</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" class="button button-danger">
                  🗑️ Confirm Deletion
                </a>
                <br>
                <a href="${cancelUrl}" class="button button-safe">
                  ✅ Keep My Account
                </a>
              </div>

              <div class="expires">
                ⏰ This link expires in <strong>24 hours</strong>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Didn't request this?</strong><br>
                If you didn't request account deletion, you can safely ignore this email or click "Keep My Account" above to cancel this request.
              </p>
            </div>

            <div class="footer">
              <p>
                © ${new Date().getFullYear()} Interview Coach<br>
                This email was sent to ${email}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Email error:', emailError)
      throw new Error('Failed to send confirmation email')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Confirmation email sent successfully',
      expiresAt: expiresAt.toISOString()
    })
  } catch (error: any) {
    console.error('Delete request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}
