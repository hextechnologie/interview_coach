import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Link</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
            .container { text-align: center; max-width: 500px; padding: 40px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { margin-bottom: 10px; }
            p { color: #9ca3af; }
            a { color: #8b5cf6; text-decoration: none; margin-top: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Invalid Link</h1>
            <p>This cancellation link is invalid.</p>
            <a href="/">Return to Homepage</a>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Delete the deletion request (cancel it)
    const { error: deleteError } = await supabase
      .from('account_deletion_requests')
      .delete()
      .eq('token', token)

    if (deleteError) {
      console.error('Cancel deletion error:', deleteError)
    }

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Deletion Cancelled</title>
        <meta http-equiv="refresh" content="5;url=/profile">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
          .container { text-align: center; max-width: 500px; padding: 40px; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { margin-bottom: 10px; color: #10b981; }
          p { color: #9ca3af; }
          .success-box { background: #064e3b; border: 1px solid #10b981; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .redirect { font-size: 14px; color: #6b7280; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Deletion Cancelled</h1>
          
          <div class="success-box">
            <p style="margin: 0; color: white; font-size: 18px;">
              <strong>Your account is safe!</strong>
            </p>
            <p style="color: #d1fae5; margin-top: 10px;">
              The account deletion request has been cancelled. Your account and all data remain intact.
            </p>
          </div>

          <p class="redirect">Redirecting to your profile page in 5 seconds...</p>
        </div>
      </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error: any) {
    console.error('Cancel deletion error:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
          .container { text-align: center; max-width: 500px; padding: 40px; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { margin-bottom: 10px; color: #ef4444; }
          p { color: #9ca3af; }
          a { color: #8b5cf6; text-decoration: none; margin-top: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">⚠️</div>
          <h1>Error</h1>
          <p>We encountered an error while canceling the deletion request. Please contact support if needed.</p>
          <a href="/">Return to Homepage</a>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
