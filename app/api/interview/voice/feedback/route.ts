import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { INTERVIEWERS } from '@/components/interview/VoicePanelSelector'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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

    if (!sessionId || !questionId || !question || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get interviewer details
    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    if (!interviewer) {
      return NextResponse.json({ error: 'Interviewer not found' }, { status: 404 })
    }

    // Generate feedback using Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `You are ${interviewer.name}, a ${interviewer.title} providing brief feedback on an interview answer.

Instructions:
- Provide 1-2 sentences of feedback that sounds natural when spoken
- Give a score from 1-10
- Be encouraging but honest
- Focus on one key strength and one improvement area
- Keep it conversational and warm
- Return JSON format: { "feedback": "your feedback", "score": 7.5 }`,
      messages: [
        { 
          role: 'user', 
          content: `Question: ${question}\n\nCandidate's Answer: ${answer}\n\nProvide brief spoken feedback and a score.` 
        }
      ]
    })

    const feedbackText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    // Parse JSON from response
    let parsedFeedback
    try {
      parsedFeedback = JSON.parse(feedbackText)
    } catch {
      // Fallback if not valid JSON
      parsedFeedback = {
        feedback: feedbackText,
        score: 7.0
      }
    }

    // Update the Q&A record with feedback and score
    const { error: updateError } = await supabase
      .from('voice_session_qa')
      .update({
        score: parsedFeedback.score,
        feedback: parsedFeedback.feedback,
      })
      .eq('id', questionId)

    if (updateError) {
      console.error('Failed to update Q&A:', updateError)
    }

    return NextResponse.json({
      feedback: parsedFeedback.feedback,
      score: parsedFeedback.score
    })

  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
