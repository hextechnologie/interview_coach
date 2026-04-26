import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { INTERVIEWERS } from '@/lib/interviewers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
}

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

    const { sessionId, interviewerId, questionNumber = 1, previousAnswers = [] } = await req.json()

    if (!sessionId || !interviewerId) {
      return NextResponse.json({ error: 'sessionId and interviewerId are required' }, { status: 400 })
    }

    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    if (!interviewer) {
      return NextResponse.json({ error: 'Interviewer not found' }, { status: 404 })
    }

    const userProfile = session.user_profile || {}
    const language = session.language || 'en'
    const languageName = LANGUAGE_NAMES[language] || 'English'

    const contextMessages: { role: 'user' | 'assistant'; content: string }[] = []
    for (const qa of previousAnswers as { question: string; answer: string }[]) {
      contextMessages.push({ role: 'assistant', content: qa.question })
      contextMessages.push({ role: 'user', content: qa.answer })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are ${interviewer.name}, a ${interviewer.title}.
Personality: ${interviewer.personality}
Question style: ${interviewer.questionStyle}

Candidate:
- Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}
- Target Role: ${userProfile.targetRole || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
${userProfile.resume ? `- Resume: ${String(userProfile.resume).slice(0, 500)}` : ''}
${userProfile.companyPresentation ? `- Company context: ${String(userProfile.companyPresentation).slice(0, 300)}` : ''}
${userProfile.jobRequirements ? `- Job requirements: ${String(userProfile.jobRequirements).slice(0, 300)}` : ''}

CRITICAL: You MUST respond entirely in ${languageName}. Every single word must be in ${languageName}.

Rules:
- Ask ONE focused question (1-2 sentences max)
- ${questionNumber === 1 ? 'Start with a brief warm greeting in ' + languageName + ', then ask your first question.' : 'Ask the next question based on the conversation.'}
- Return ONLY the question text, nothing else`,
      messages: [
        ...contextMessages,
        { role: 'user', content: `Ask interview question #${questionNumber}.` },
      ],
    })

    const questionText =
      response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    const { data: qaRecord, error: qaError } = await supabase
      .from('voice_session_qa')
      .insert({
        session_id: sessionId,
        interviewer_id: interviewerId,
        question: questionText,
      })
      .select('id')
      .single()

    if (qaError) {
      console.error('Failed to save question to DB:', qaError)
      return NextResponse.json({ question: questionText, questionId: null })
    }

    await supabase
      .from('voice_sessions')
      .update({ total_questions: questionNumber })
      .eq('id', sessionId)

    return NextResponse.json({ question: questionText, questionId: qaRecord.id })
  } catch (error) {
    console.error('Error generating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
