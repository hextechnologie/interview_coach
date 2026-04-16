import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Fetch session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch answers
    const { data: answers } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_number', { ascending: true })

    // Build message history
    const messages = []
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        messages.push({ role: 'assistant', content: answer.question_text })
        messages.push({ role: 'user', content: answer.user_answer })
        if (answer.ai_feedback) {
          messages.push({ role: 'feedback', content: 'Feedback', feedback: answer.ai_feedback })
        }
      }
    }

    return NextResponse.json({ session, messages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
