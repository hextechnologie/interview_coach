'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'
import { Button } from '@/components/ui'

interface MicrophoneRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  disabled?: boolean
}

export default function MicrophoneRecorder({
  onRecordingComplete,
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false
}: MicrophoneRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [silenceTimer, setSilenceTimer] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const silenceDetectionRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (silenceDetectionRef.current) {
        clearInterval(silenceDetectionRef.current)
      }
    }
  }, [])

  const analyzeAudioLevel = () => {
    if (!analyzerRef.current || !isRecording) return

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
    analyzerRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const normalizedLevel = Math.min(100, (average / 255) * 100)
    
    setAudioLevel(normalizedLevel)

    // Silence detection (< 5% audio level for 3 seconds)
    if (normalizedLevel < 5) {
      setSilenceTimer(prev => prev + 1)
    } else {
      setSilenceTimer(0)
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel)
  }

  const startRecording = async () => {
    try {
      audioChunksRef.current = []
      setRecordingDuration(0)
      setSilenceTimer(0)

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      streamRef.current = stream

      // Setup audio analyzer for visual feedback
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256
      source.connect(analyzer)
      analyzerRef.current = analyzer

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        setAudioLevel(0)
        setRecordingDuration(0)
        setSilenceTimer(0)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      onStartRecording()

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      // Start audio level analysis
      analyzeAudioLevel()

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      onStopRecording()
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  // Auto-stop after 3 seconds of silence
  useEffect(() => {
    if (isRecording && silenceTimer >= 30) { // 30 * 100ms = 3 seconds
      stopRecording()
    }
  }, [silenceTimer, isRecording])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {isRecording ? (
        <div className="space-y-4">
          {/* Recording indicator */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold">Recording... {formatDuration(recordingDuration)}</span>
          </div>

          {/* Audio level visualizer */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 text-center">Voice level</div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            {audioLevel < 10 && (
              <p className="text-xs text-yellow-400 text-center">
                Speak louder - low audio detected
              </p>
            )}
          </div>

          {/* Stop button */}
          <div className="flex justify-center gap-3">
            <Button 
              onClick={stopRecording}
              variant="danger"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Recording will auto-stop after 3 seconds of silence
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={startRecording}
            disabled={disabled}
            variant="primary"
            className="gap-2 px-8 py-4 text-lg"
          >
            <Mic className="w-6 h-6" />
            Start Speaking
          </Button>
          <p className="text-sm text-gray-400 text-center">
            Click to record your answer
          </p>
        </div>
      )}
    </div>
  )
}
