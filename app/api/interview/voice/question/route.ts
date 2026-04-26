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

    const systemPrompt = `You are ${interviewer.name}, a ${interviewer.title} conducting a voice interview.
Personality: ${interviewer.personality}
Style: ${interviewer.questionStyle}

Candidate: ${userProfile.firstName || ''} ${userProfile.lastName || ''} | Role: ${userProfile.targetRole || 'not specified'} | Level: ${userProfile.experienceLevel || 'not specified'}
${userProfile.resume ? `Resume summary: ${String(userProfile.resume).slice(0, 400)}` : ''}
${userProfile.jobRequirements ? `Job requirements: ${String(userProfile.jobRequirements).slice(0, 200)}` : ''}

LANGUAGE: Respond entirely in ${languageName}. Every word must be ${languageName}.

STRICT FORMATTING — non-negotiable:
1. Maximum 25 words per question — be concise
2. Ask exactly ONE question per turn
3. NO markdown: no **, no *, no _, no # symbols
4. NO preamble or explanation — go straight to the question
5. Natural spoken language only (this is read aloud via TTS)

GOOD: "How did you handle clock domain crossings in your VHDL designs?"
BAD:  "In your experience at Airbus, considering the VHDL design process and **verification requirements**, how did you approach..." (too long, has markdown)

ANTI-REPETITION — non-negotiable:
- NEVER repeat or paraphrase a previous question
- Each question must explore a completely new topic
- This is question number ${questionNumber}

Questions already asked — DO NOT repeat these:
${previousQList}

${questionNumber === 1 ? 'Start with a very brief warm greeting (5 words max), then ask your first question on a new line.' : 'Ask the next question on a brand-new topic.'}
Return ONLY the question text. Nothing else.`

    // ── Generate with similarity retry (up to 3 attempts) ────────────────────
    let questionText = ''
    let attempts = 0
    const MAX_ATTEMPTS = 3

    do {
      questionText = await askClaude(systemPrompt, contextMessages, questionNumber)
      attempts++
    } while (
      attempts < MAX_ATTEMPTS &&
      questionText &&
      isTooSimilar(questionText, allPreviousQuestions)
    )

    if (!questionText) {
      return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
    }

    // ── Hard length cap: truncate at first sentence boundary if >150 chars ──
    if (questionText.length > 150) {
      const firstSentence = questionText.match(/^[^.!?]+[.!?]/)
      questionText = firstSentence ? firstSentence[0].trim() : questionText.slice(0, 150).trim()
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
