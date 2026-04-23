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

    const { sessionId, interviewerId, questionNumber, previousAnswers } = await req.json()

    if (!sessionId || !interviewerId) {
      return NextResponse.json({ error: 'Session ID and interviewer ID are required' }, { status: 400 })
    }

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get interviewer details
    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    if (!interviewer) {
      return NextResponse.json({ error: 'Interviewer not found' }, { status: 404 })
    }

    const userProfile = session.user_profile || {}

    // Build conversation context
    let contextMessages = []
    if (previousAnswers && previousAnswers.length > 0) {
      contextMessages = previousAnswers.map((qa: any) => ({
        role: 'assistant',
        content: qa.question
      }))
    }

    // Generate question using Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: `You are ${interviewer.name}, a ${interviewer.title}.
Your personality: ${interviewer.personality}
Your question style: ${interviewer.questionStyle}

Candidate profile:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Target Role: ${userProfile.targetRole || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Current Status: ${userProfile.currentStatus || 'Not specified'}

Instructions:
- Ask ONE short, focused interview question (max 2 sentences)
- Make it relevant to the candidate's profile and target role
- For ${interviewer.questionStyle} questions specifically
- Return ONLY the question, no introduction or preamble
- Be conversational and professional`,
      messages: [
        ...contextMessages,
        { 
          role: 'user', 
          content: `Ask question #${questionNumber}. ${questionNumber === 1 ? 'Start with a warm greeting and your first question.' : 'Ask the next question based on the previous conversation.'}` 
        }
      ]
    })

    const questionText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    return NextResponse.json({
      question: questionText,
      interviewer: {
        id: interviewer.id,
        name: interviewer.name,
        title: interviewer.title,
        voice: interviewer.voice,
        avatar: interviewer.avatar
      }
    })

  } catch (error) {
    console.error('Error generating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
