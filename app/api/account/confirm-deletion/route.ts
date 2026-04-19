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
            <p>This deletion link is invalid or has expired.</p>
            <a href="/">Return to Homepage</a>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find deletion request
    const { data: request, error: findError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('token', token)
      .single()

    if (findError || !request) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found</title>
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
            <h1>Link Not Found</h1>
            <p>This deletion link does not exist or has already been used.</p>
            <a href="/">Return to Homepage</a>
          </div>
        </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Check if expired
    const expiresAt = new Date(request.expires_at)
    if (expiresAt < new Date()) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
            .container { text-align: center; max-width: 500px; padding: 40px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { margin-bottom: 10px; }
            p { color: #9ca3af; }
            a { color: #8b5cf6; text-decoration: none; margin-top: 20px; display: inline-block; padding: 12px 24px; background: #8b5cf6; border-radius: 8px; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⏰</div>
            <h1>Link Expired</h1>
            <p>This deletion link has expired. Please submit a new deletion request if you still want to delete your account.</p>
            <a href="/profile">Go to Profile Settings</a>
          </div>
        </body>
        </html>
        `,
        { status: 410, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Delete user data
    const userId = request.user_id

    // Delete from all related tables (handled by CASCADE in database)
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      console.error('Profile deletion error:', deleteProfileError)
    }

    // Delete auth user (requires service role key)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Auth deletion error:', deleteAuthError)
      throw new Error('Failed to delete user account')
    }

    // Delete the deletion request
    await supabase
      .from('account_deletion_requests')
      .delete()
      .eq('token', token)

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Deleted</title>
        <meta http-equiv="refresh" content="5;url=/">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
          .container { text-align: center; max-width: 600px; padding: 40px; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { margin-bottom: 10px; color: #ef4444; }
          p { color: #9ca3af; margin-bottom: 30px; }
          .success-box { background: #1f2937; border: 1px solid #374151; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .redirect { font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Account Deleted</h1>
          <p>Your Interview Coach account has been permanently deleted.</p>
          
          <div class="success-box">
            <p style="margin: 0; color: white;">All your data has been removed from our systems:</p>
            <ul style="text-align: left; margin-top: 15px; color: #9ca3af;">
              <li>Profile and personal information</li>
              <li>Interview history and recordings</li>
              <li>Job applications and notes</li>
              <li>Bookings and reviews</li>
              <li>Subscription data</li>
            </ul>
          </div>

          <p class="redirect">You will be redirected to the homepage in 5 seconds...</p>
        </div>
      </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error: any) {
    console.error('Confirm deletion error:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-center; min-height: 100vh; margin: 0; background: #0a0f1e; color: white; }
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
          <h1>Deletion Failed</h1>
          <p>We encountered an error while deleting your account. Please contact support for assistance.</p>
          <a href="/">Return to Homepage</a>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
