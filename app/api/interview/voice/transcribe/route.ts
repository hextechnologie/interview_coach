import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Whisper language codes (ISO 639-1)
const WHISPER_LANG: Record<string, string> = {
  en: 'en',
  fr: 'fr',
  es: 'es',
  ar: 'ar',
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('sessionId') as string | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Transcription service not configured' }, { status: 500 })
    }

    // Determine language from session if available
    let language: string | undefined
    if (sessionId && token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        const { data: session } = await supabase
          .from('voice_sessions')
          .select('language')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single()
        if (session?.language) {
          language = WHISPER_LANG[session.language]
        }
      }
    }

    const whisperForm = new FormData()
    whisperForm.append('file', audioFile, 'audio.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('response_format', 'json')
    if (language) whisperForm.append('language', language)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: whisperForm,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Whisper error:', error)
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ transcript: data.text || '', success: true })
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
