import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a professional interview coach. Evaluate the candidate's answer and provide structured feedback.

Provide feedback in this EXACT JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improved_answer": "A better version of their answer with specific improvements"
}

Be encouraging but honest. Provide actionable feedback.`

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer, questionNumber, questionText } = await request.json()

    // Fetch session and current question
    const { data: session } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get the last question from messages (no longer needed, we pass questionText)
    // const { data: answers } = await supabaseAdmin
    //   .from('interview_answers')
    //   .select('*')
    //   .eq('session_id', sessionId)
    //   .order('created_at', { ascending: false })
    //   .limit(1)

    // Generate feedback using Claude
    const prompt = `Job Role: ${session.job_role}
Difficulty Level: ${session.difficulty_level}
Question Number: ${questionNumber}

The candidate answered an interview question with: "${answer}"

Provide detailed structured feedback in JSON format.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
      ],
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    // Extract JSON feedback
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    const feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 5,
      strengths: ['Answer provided'],
      weaknesses: ['Could be more detailed'],
      improved_answer: 'Consider expanding your answer with specific examples.',
    }

    // Save answer and feedback to database
    const { error: insertError } = await supabaseAdmin
      .from('interview_answers')
      .insert({
        session_id: sessionId,
        question_number: questionNumber,
        question_text: questionText || 'Interview question',
        user_answer: answer,
        ai_feedback: feedback,
        score: feedback.score,
      })

    if (insertError) {
      console.error('Error saving answer:', insertError)
    }

    // Update session
    await supabaseAdmin
      .from('interview_sessions')
      .update({ questions_answered: questionNumber })
      .eq('id', sessionId)

    return NextResponse.json({ feedback, completed: questionNumber >= 6 })
  } catch (error: any) {
    console.error('Error processing answer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
