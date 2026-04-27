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

function isTestPhrase(answer: string): boolean {
  const lower = answer.toLowerCase().trim()
  const testPatterns = [
    /^(hello|hi|hey|bonjour|hola|مرحبا)[\s?!.]*$/,
    /can you hear/,
    /do you hear/,
    /vous m['']entendez/,
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

    // Get session language
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('language')
      .eq('id', sessionId)
      .single()

    const language = session?.language || 'en'
    const languageName = LANGUAGE_NAMES[language] || 'English'

    const interviewer = INTERVIEWERS.find(i => i.id === interviewerId)
    const interviewerName = interviewer?.name ?? 'Sarah'
    const interviewerTitle = interviewer?.title ?? 'Interviewer'

    // Redirect mic tests without scoring
    if (isTestPhrase(answer)) {
      const redirects: Record<string, string[]> = {
        en: [
          "Got it! Sounds like you're all set — go ahead and answer the question.",
          "Loud and clear! Take your time and answer whenever you're ready.",
          "I can hear you! Go ahead with your answer.",
        ],
        fr: [
          "Je vous entends bien ! Prenez votre temps et répondez quand vous êtes prêt.",
          "Très bien ! Allez-y avec votre réponse.",
          "Parfait, je vous entends ! Vous pouvez répondre à la question.",
        ],
        es: [
          "¡Te escucho bien! Tómate tu tiempo y responde cuando estés listo.",
          "¡Perfecto! Adelante con tu respuesta.",
          "¡Puedo escucharte! Responde la pregunta cuando quieras.",
        ],
        ar: [
          "أسمعك بوضوح! خذ وقتك وأجب على السؤال.",
          "ممتاز، أسمعك! تفضل بالإجابة.",
          "سمعتك! يمكنك الإجابة على السؤال الآن.",
        ],
      }
      const pool = redirects[language] || redirects.en
      const feedback = pool[Math.floor(Math.random() * pool.length)]
      return NextResponse.json({ feedback, score: null, isRedirect: true })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are ${interviewerName}, a ${interviewerTitle} giving brief spoken feedback.

CRITICAL: You MUST respond entirely in ${languageName}. Every single word must be in ${languageName}.

Rules:
- Sound like a real person talking while staying concise.
- No filler openers ("Great answer!", "That's excellent!")
- React naturally to what they said + give ONE concrete tip.
- Return ONLY valid JSON in this exact shape:
  {"feedback":"one sentence","score":7,"strengths":["..."],"improvements":["..."]}
- strengths and improvements must each be 1-2 short items.
- Score 1-10: 1-3 poor, 4-6 okay, 7-8 good, 9-10 excellent.

Good examples (${languageName}, short, natural, valid JSON):
${language === 'fr'
  ? '{"feedback":"Bonne réponse — la prochaine fois, donnez un exemple concret.","score":7,"strengths":["Réponse claire"],"improvements":["Ajouter un résultat chiffré"]}'
  : language === 'es'
  ? '{"feedback":"Buena respuesta — la próxima vez, da un ejemplo concreto.","score":7,"strengths":["Respuesta clara"],"improvements":["Añadir un resultado medible"]}'
  : language === 'ar'
  ? '{"feedback":"إجابة جيدة — في المرة القادمة، أضف مثالاً ملموساً.","score":7,"strengths":["إجابة واضحة"],"improvements":["أضف نتيجة رقمية"]}'
  : '{"feedback":"Solid point — next time add a concrete example to make it land.","score":7,"strengths":["Clear answer"],"improvements":["Add measurable impact"]}'}`,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${answer}`,
        },
      ],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let feedback = language === 'fr' ? "Très bien, continuons." :
                   language === 'es' ? "Bien, sigamos." :
                   language === 'ar' ? "حسناً، لنكمل." : "Got it, let's keep going."
    let score = 6.0
    let strengths: string[] = []
    let improvements: string[] = []

    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*"feedback"[\s\S]*"score"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          feedback?: unknown
          score?: unknown
          strengths?: unknown
          improvements?: unknown
        }
        if (parsed.feedback && typeof parsed.feedback === 'string') feedback = parsed.feedback.trim()
        if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 10) score = parsed.score
        if (Array.isArray(parsed.strengths)) {
          strengths = parsed.strengths.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 3)
        }
        if (Array.isArray(parsed.improvements)) {
          improvements = parsed.improvements.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 3)
        }
      } catch {
        const fbMatch = rawText.match(/"feedback"\s*:\s*"([^"]+)"/)
        if (fbMatch) feedback = fbMatch[1]
        const scMatch = rawText.match(/"score"\s*:\s*(\d+(?:\.\d+)?)/)
        if (scMatch) score = parseFloat(scMatch[1])
      }
    }

    if (questionId) {
      await supabase
        .from('voice_session_qa')
        .update({ answer, score, feedback, strengths, improvements })
        .eq('id', questionId)
    }

    return NextResponse.json({ feedback, score, strengths, improvements })
  } catch (error) {
    console.error('Error generating feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
