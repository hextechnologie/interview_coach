import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromBearer } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const user = await getUserFromBearer(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: notifications, error } = await supabaseAdmin
    .from('notifications')
    .select('id, title, message, type, read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  return NextResponse.json({ notifications: notifications ?? [] })
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromBearer(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { id?: string; markAllRead?: boolean }

  if (body.markAllRead) {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    return NextResponse.json({ success: true })
  }

  if (body.id) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', body.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
