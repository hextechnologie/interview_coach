import { NextRequest, NextResponse } from 'next/server'
import { getUserFromBearer } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, voice = 'nova' } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice, // nova, alloy, echo, fable, onyx, shimmer
        response_format: 'mp3',
        speed: 1.0
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI TTS error:', error)
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating speech:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
