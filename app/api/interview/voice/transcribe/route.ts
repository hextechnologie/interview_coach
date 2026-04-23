import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      return NextResponse.json({ error: 'Transcription service not configured' }, { status: 500 })
    }

    // Prepare form data for OpenAI Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile, 'audio.webm')
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('response_format', 'json')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Whisper error:', error)
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      transcript: data.text || '',
      success: true
    })

  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
