import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { INTERVIEWERS } from '@/lib/interviewers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Detect if the answer is an audio/mic test rather than a real answer
function isTestPhrase(answer: string): boolean {
  const lower = answer.toLowerCase().trim()
  const testPatterns = [
    /^(hello|hi|hey)[\s?!.]*$/,
    /can you hear/,
    /do you hear/,
    /is this (working|on)/,
    /testing.*mic/,
    /mic.*test/,
    /audio.*test/,
    /test.*audio/,
    /^(test|testing)[\s\d?!.]*$/,
    /hello.*hello/,
    /hear me (well|now|or not)/,
    /low audio detected/,
    /^(one two three|1 2 3)[\s.]*$/,
  ]
  return testPatterns.some(p => p.test(lower))
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

    const { sessionId, questionId, question, answer, interviewerId } = await req.json()

    if (!sessionId || !question || !answer) {
      return NextResponse.json({ error: 'sessionId, question, and answer are required' }, { status: 400 })
    }

    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    const interviewerName = interviewer?.name ?? 'Sarah'

    // If it's just a mic test, redirect warmly without scoring
    if (isTestPhrase(answer)) {
      const redirects = [
        `Got it! Sounds like you're all set — go ahead and answer the question whenever you're ready.`,
        `I can hear you! Take a moment and answer the question when you're ready.`,
        `Loud and clear! Whenever you're ready, give me your answer.`,
      ]
      const feedback = redirects[Math.floor(Math.random() * redirects.length)]
      return NextResponse.json({ feedback, score: null, isRedirect: true })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You are ${interviewerName}, a real interviewer giving BRIEF spoken feedback.

CRITICAL RULES:
- Maximum ONE short sentence. Never more.
- Sound like a real person talking casually, not a corporate email.
- No filler openers like "Great answer!", "That's a solid point!", "Excellent!"
- Just react naturally to what they said, then give ONE concrete tip or acknowledgment.
- Return ONLY valid JSON: {"feedback": "one sentence here", "score": 7}
- Score 1-10: 1-3 poor, 4-6 okay, 7-8 good, 9-10 excellent.

Examples of GOOD feedback (natural, short):
{"feedback": "You explained the concept clearly — next time add a concrete example to make it stick.", "score": 7}
{"feedback": "Solid answer, though I'd like to hear more about how you measured the outcome.", "score": 6}
{"feedback": "That's exactly the kind of ownership mindset we look for.", "score": 9}

Examples of BAD feedback (too long, too formal — DO NOT do this):
"That was a wonderful response that demonstrated excellent communication skills and leadership..."`,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${answer}`,
        },
      ],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let feedback = 'Got it, let\'s keep going.'
    let score = 6.0

    // Extract JSON — handle ``` code blocks and extra whitespace
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
    const jsonMatch = cleaned.match(/\{[^{}]*"feedback"[^{}]*"score"[^{}]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.feedback && typeof parsed.feedback === 'string') {
          feedback = parsed.feedback.trim()
        }
        if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 10) {
          score = parsed.score
        }
      } catch {
        // fallback: try to extract feedback string directly
        const fbMatch = rawText.match(/"feedback"\s*:\s*"([^"]+)"/)
        if (fbMatch) feedback = fbMatch[1]
        const scMatch = rawText.match(/"score"\s*:\s*(\d+(?:\.\d+)?)/)
        if (scMatch) score = parseFloat(scMatch[1])
      }
    }

    // Save to DB
    if (questionId) {
      await supabase
        .from('voice_session_qa')
        .update({ answer, score, feedback })
        .eq('id', questionId)
    }

    return NextResponse.json({ feedback, score })
  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
