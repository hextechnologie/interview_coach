import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { estimateCommunicationMetrics, normalizeFeedback } from '@/lib/interview-personalization'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are a senior interview coach.
Evaluate the answer and return ONLY valid JSON in this exact shape:
{
  "score": 1-10,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "ideal_answer": "A concise high-quality example answer that directly addresses the question.",
  "improved_answer": "Rewrite the candidate's answer using the STAR method and stronger wording.",
  "metrics": {
    "confidence": 0-100,
    "clarity": 0-100,
    "filler_words": 0
  }
}
Be encouraging, practical, and specific.`

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer, questionNumber, questionText } = await request.json()

    const { data: session } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const config = session.interview_config || {}
    const fallbackMetrics = estimateCommunicationMetrics(answer)

    let feedback = normalizeFeedback({
      score: 6,
      strengths: ['You answered the question directly'],
      weaknesses: ['Use a more specific example and outcome'],
      ideal_answer: 'A strong answer should briefly set the context, explain your action, and show the measurable result.',
      improved_answer: `Here is a stronger STAR-style version: ${answer}`,
      metrics: fallbackMetrics,
    }, answer)

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const prompt = `
Job Role: ${session.job_role}
Difficulty Level: ${session.difficulty_level}
Interview Type: ${config.interviewType || 'Mixed'}
Question Number: ${questionNumber}
Question Asked: ${questionText}
Relevant Skills: ${(config.personalizationKeywords || config.mainSkills || []).join(', ')}
Candidate Answer: ${answer}

Return the coaching feedback as valid JSON only.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      const text = content.type === 'text' ? content.text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        try {
          feedback = normalizeFeedback(JSON.parse(jsonMatch[0]), answer)
        } catch (parseError) {
          console.error('Feedback JSON parse error:', parseError)
        }
      }
    }

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

    const completed = questionNumber >= 6

    if (completed) {
      const { data: allAnswers } = await supabaseAdmin
        .from('interview_answers')
        .select('*')
        .eq('session_id', sessionId)

      const averageScore = allAnswers && allAnswers.length > 0
        ? Number((allAnswers.reduce((sum, item) => sum + Number(item.score || 0), 0) / allAnswers.length).toFixed(1))
        : Number(feedback.score || 0)

      await supabaseAdmin
        .from('interview_sessions')
        .update({
          questions_answered: questionNumber,
          status: 'completed',
          overall_score: averageScore,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', session.user_id)
        .single()

      if (process.env.RESEND_API_KEY && profile?.email) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'Interview Coach <onboarding@resend.dev>',
            to: profile.email,
            subject: `Your interview summary for ${session.job_role}`,
            html: `
              <h2>Interview Summary</h2>
              <p><strong>Job role:</strong> ${session.job_role}</p>
              <p><strong>Overall score:</strong> ${averageScore}/10</p>
              <p><strong>Confidence:</strong> ${feedback.metrics.confidence}%</p>
              <p><strong>Clarity:</strong> ${feedback.metrics.clarity}%</p>
              <p><strong>Top strengths:</strong></p>
              <ul>${(feedback.strengths || []).slice(0, 3).map((item: string) => `<li>${item}</li>`).join('')}</ul>
              <p><strong>Top areas to improve:</strong></p>
              <ul>${(feedback.weaknesses || []).slice(0, 3).map((item: string) => `<li>${item}</li>`).join('')}</ul>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://interview-coach.vercel.app'}/interview/summary/${sessionId}">View full session</a></p>
            `,
          })
        } catch (emailError) {
          console.error('Summary email error:', emailError)
        }
      }
    } else {
      await supabaseAdmin
        .from('interview_sessions')
        .update({ questions_answered: questionNumber })
        .eq('id', sessionId)
    }

    return NextResponse.json({ feedback, completed })
  } catch (error: any) {
    console.error('Error processing answer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
