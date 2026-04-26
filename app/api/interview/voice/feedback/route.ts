import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { INTERVIEWERS } from '@/lib/interviewers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, questionId, question, answer, interviewerId } = await req.json()

    if (!sessionId || !question || !answer) {
      return NextResponse.json({ error: 'sessionId, question, and answer are required' }, { status: 400 })
    }

    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    const interviewerName = interviewer?.name || 'Interviewer'
    const interviewerTitle = interviewer?.title || 'Interviewer'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are ${interviewerName}, a ${interviewerTitle} giving spoken feedback on an interview answer.

Rules:
- Write 1-2 sentences of natural spoken feedback
- Give a score from 1 to 10
- Be encouraging but honest
- Highlight one strength and one improvement area
- Sound warm and conversational — this will be read aloud
- Respond with valid JSON only: {"feedback": "...", "score": 7.5}`,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nCandidate answer: ${answer}\n\nProvide feedback and score as JSON.`,
        },
      ],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let feedback = rawText
    let score = 7.0

    // Try to extract JSON — Claude sometimes wraps it in ```json ... ```
    const jsonMatch = rawText.match(/\{[\s\S]*"feedback"[\s\S]*"score"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        feedback = parsed.feedback || rawText
        score = typeof parsed.score === 'number' ? parsed.score : 7.0
      } catch {
        // Keep raw text as feedback
      }
    }

    // Save answer + feedback to DB if we have a questionId
    if (questionId) {
      const { error: updateError } = await supabase
        .from('voice_session_qa')
        .update({ answer, score, feedback })
        .eq('id', questionId)

      if (updateError) {
        console.error('Failed to save feedback to DB:', updateError)
      }
    }

    return NextResponse.json({ feedback, score })
  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
