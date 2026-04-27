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

function cleanQuestion(question: string): string {
  const prefixesToRemove = [
    /^got it[.,]?\s*/i,
    /^good answer[.,]?\s*/i,
    /^interesting[.,]?\s*/i,
    /^i see[.,]?\s*/i,
    /^that'?s? (correct|right|great|good|nice)[.,]?\s*/i,
    /^perfect[.,]?\s*/i,
    /^excellent[.,]?\s*/i,
    /^noted[.,]?\s*/i,
  ]

  let cleaned = question.trim()
  for (const prefix of prefixesToRemove) {
    cleaned = cleaned.replace(prefix, '')
  }

  if (!cleaned) return ''
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

// ── Similarity guard: returns true if newQ shares >50% meaningful words with any previous Q
function isTooSimilar(newQ: string, previousQs: string[]): boolean {
  const meaningful = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 4))

  const newWords = meaningful(newQ)
  if (newWords.size === 0) return false

  return previousQs.some(prev => {
    const prevWords = meaningful(prev)
    const overlap = [...newWords].filter(w => prevWords.has(w)).length
    return overlap / newWords.size > 0.5
  })
}

// ── Generate one question from Claude ─────────────────────────────────────
async function askClaude(
  systemPrompt: string,
  contextMessages: { role: 'user' | 'assistant'; content: string }[],
  questionNumber: number,
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    system: systemPrompt,
    messages: [
      ...contextMessages,
      { role: 'user', content: `Ask interview question #${questionNumber} on a completely new topic.` },
    ],
  })
  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
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

    // ── Load session ─────────────────────────────────────────────────────────
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

    // ── Load ALL previously asked questions from DB (source of truth) ────────
    const { data: previousQARows } = await supabase
      .from('voice_session_qa')
      .select('question, answer')
      .eq('session_id', sessionId)
      .order('asked_at', { ascending: true })

    const dbPreviousQuestions: string[] = (previousQARows ?? [])
      .map(r => r.question)
      .filter(Boolean)

    // Also collect from the client-sent previousAnswers in case DB is slightly behind
    const clientPreviousQuestions: string[] = (previousAnswers as { question: string; answer: string }[])
      .map(qa => qa.question)
      .filter(Boolean)

    // Merge, deduplicate
    const allPreviousQuestions: string[] = [
      ...new Set([...dbPreviousQuestions, ...clientPreviousQuestions]),
    ]

    const userProfile = session.user_profile || {}
    const language = session.language || 'en'
    const languageName = LANGUAGE_NAMES[language] || 'English'

    // ── Build conversation history for Claude context ─────────────────────────
    const contextMessages: { role: 'user' | 'assistant'; content: string }[] = []
    for (const qa of previousAnswers as { question: string; answer: string }[]) {
      contextMessages.push({ role: 'assistant', content: qa.question })
      contextMessages.push({ role: 'user', content: qa.answer || '(no answer given)' })
    }

    // ── System prompt with explicit DO-NOT-REPEAT list ─────────────────────
    const previousQList = allPreviousQuestions.length > 0
      ? allPreviousQuestions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')
      : '  (none yet)'

    const systemPrompt = `You are ${interviewer.name}, a ${interviewer.title}.
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

FORMATTING RULES — strictly enforced:
- Do NOT use markdown formatting (**bold**, *italic*, _underline_, etc.)
- This is a VOICE interview — markdown symbols will be read aloud and sound broken
- Write in plain conversational text only, as if speaking out loud
- Keep questions short: maximum 2 sentences
- Be direct and natural

ANTI-REPETITION RULES — strictly enforced:
- NEVER ask a question that is the same or similar to a previous question
- NEVER ask about the same topic or concept twice
- Each question MUST cover a brand-new area not yet explored
- This is question number ${questionNumber}

Questions already asked — DO NOT repeat or paraphrase these:
${previousQList}

Rules:
- Ask ONE focused question (1-2 sentences max)
- Ask the next question on a completely new topic.
- Go DIRECTLY to the question with no preamble.
- Never start with acknowledgements like "Got it.", "Good answer.", "Interesting.", "I see.", "That's correct.", "Nice.", "Perfect.", or "Great."
- Return ONLY the question text, nothing else`

    // ── Generate with similarity retry (up to 3 attempts) ────────────────────
    let questionText = ''
    let attempts = 0
    const MAX_ATTEMPTS = 3

    do {
      questionText = cleanQuestion(await askClaude(systemPrompt, contextMessages, questionNumber))
      attempts++
    } while (
      attempts < MAX_ATTEMPTS &&
      questionText &&
      isTooSimilar(questionText, allPreviousQuestions)
    )

    if (!questionText) {
      return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
    }

    // ── Persist to DB ─────────────────────────────────────────────────────────
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
