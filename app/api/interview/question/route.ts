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

const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
  }
  return languages[code] || 'English'
}

const SYSTEM_PROMPT = `You are a professional interview coach. Your role is to conduct realistic job interviews and provide constructive feedback.

Instructions:
1. Ask ONE interview question at a time based on the job role and difficulty level
2. After the user answers, provide structured feedback in this EXACT JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improved_answer": "A better version of their answer with specific improvements"
}

3. After providing feedback, ask the next relevant interview question
4. Keep questions realistic and appropriate for the specified job role and level
5. Be encouraging but honest in your feedback
6. For junior level: Focus on fundamentals, attitude, and learning ability
7. For mid level: Expect solid technical knowledge and some experience
8. For senior level: Expect deep expertise, leadership, and strategic thinking

Always maintain a professional, supportive tone.`

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    // Fetch session details
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const questionNumber = session.questions_answered + 1

    // Check if we should end the interview
    if (questionNumber > 6) {
      await supabaseAdmin
        .from('interview_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId)

      return NextResponse.json({ completed: true })
    }

    // Get interview config
    const config = session.interview_config || {}
    const language = config.language || 'en'
    const languageInstruction = language !== 'en' 
      ? `\n\nIMPORTANT: Conduct this entire interview in ${getLanguageName(language)}. Ask questions and provide all responses in ${getLanguageName(language)}.`
      : ''

    // Generate question using Claude
    const contextMessage = questionNumber === 1
      ? `Start the interview for a ${session.difficulty_level} ${session.job_role} position${config.industry ? ` in ${config.industry}` : ''}. 
This is a ${config.interviewType || 'general'} interview with a ${config.interviewerType || 'hiring manager'}.
Interview Round: ${config.interviewRound || 'First Round'}
Candidate has ${config.yearsOfExperience || 'some'} years of experience.
${config.mainSkills && config.mainSkills.length > 0 ? `Main skills: ${config.mainSkills.join(', ')}` : ''}
${config.weakAreas && config.weakAreas.length > 0 ? `Areas to focus on: ${config.weakAreas.join(', ')}` : ''}
${config.jobDescription ? `\nJob Description:\n${config.jobDescription}` : ''}
${languageInstruction}

Ask the first question.`
      : `Continue the interview. This is question ${questionNumber} of 6 for a ${session.difficulty_level} ${session.job_role} position.${languageInstruction} Ask the next question.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextMessage },
      ],
    })

    const content = response.content[0]
    const question = content.type === 'text' ? content.text : ''

    return NextResponse.json({
      question,
      questionNumber,
      completed: false,
    })
  } catch (error: any) {
    console.error('Error generating question:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
