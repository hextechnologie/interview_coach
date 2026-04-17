'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, LoadingSpinner } from '@/components/ui'
import { Sparkles, Send, CheckCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Message = {
  role: 'user' | 'assistant' | 'feedback'
  content: string
  feedback?: {
    score: number
    strengths: string[]
    weaknesses: string[]
    ideal_answer?: string
    improved_answer: string
    metrics?: {
      confidence: number
      clarity: number
      filler_words: number
    }
  }
}

export default function InterviewPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [waitingForFeedback, setWaitingForFeedback] = useState(false)
  const [hasLoadedFirstQuestion, setHasLoadedFirstQuestion] = useState(false)
  const [revealedFeedback, setRevealedFeedback] = useState<Record<number, { ideal: boolean; improved: boolean }>>({})
  const [isListening, setIsListening] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isLoadingQuestionRef = useRef(false)
  const recognitionRef = useRef<any>(null)

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && sessionId) {
      fetchSession()
    }
  }, [user, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')

    if (speechEnabled && latestAssistantMessage && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(latestAssistantMessage.content)
      utterance.rate = 0.95
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }, [messages, speechEnabled])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`)
      const data = await response.json()
      
      if (data.session) {
        setSession(data.session)
        setQuestionCount(data.session.questions_answered)
        
        // Load existing messages
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
          setHasLoadedFirstQuestion(true)
        } else if (!hasLoadedFirstQuestion) {
          // Get first question only once
          setHasLoadedFirstQuestion(true)
          getNextQuestion()
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const getNextQuestion = async () => {
    // Prevent duplicate calls
    if (isLoadingQuestionRef.current || loading) {
      console.log('Already loading question, skipping duplicate call')
      return
    }

    isLoadingQuestionRef.current = true
    setLoading(true)
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error getting question:', data)
        alert(`Error: ${data.error || 'Failed to get question'}`)
        return
      }

      if (data.question) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.question }])
        setQuestionCount(data.questionNumber)
      }

      if (data.completed) {
        router.push(`/interview/summary/${sessionId}`)
      }
    } catch (error) {
      console.error('Error getting question:', error)
      alert('Failed to get next question')
    } finally {
      setLoading(false)
      isLoadingQuestionRef.current = false
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || waitingForFeedback) return

    const answer = currentAnswer.trim()
    
    // Get the current question (last assistant message)
    const lastQuestion = messages
      .slice()
      .reverse()
      .find((m) => m.role === 'assistant')
    
    const questionText = lastQuestion?.content || ''
    
    setCurrentAnswer('')
    setMessages((prev) => [...prev, { role: 'user', content: answer }])
    setWaitingForFeedback(true)
    setLoading(true)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          answer,
          questionNumber: questionCount,
          questionText,
        }),
      })

      const data = await response.json()

      if (data.feedback) {
        // Add feedback message
        setMessages((prev) => [
          ...prev,
          {
            role: 'feedback',
            content: 'Feedback received',
            feedback: data.feedback,
          },
        ])

        setLoading(false)
        setWaitingForFeedback(false)

        // Check if interview should end
        if (questionCount >= 6 || data.completed) {
          setTimeout(() => {
            router.push(`/interview/summary/${sessionId}`)
          }, 2000)
        } else {
          // Get next question after a brief pause
          setTimeout(() => {
            getNextQuestion()
          }, 1500)
        }
      } else {
        setLoading(false)
        setWaitingForFeedback(false)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      setWaitingForFeedback(false)
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const toggleFeedbackPanel = (messageIndex: number, panel: 'ideal' | 'improved') => {
    setRevealedFeedback((prev) => ({
      ...prev,
      [messageIndex]: {
        ideal: panel === 'ideal' ? !prev[messageIndex]?.ideal : !!prev[messageIndex]?.ideal,
        improved: panel === 'improved' ? !prev[messageIndex]?.improved : !!prev[messageIndex]?.improved,
      },
    }))
  }

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.')
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setCurrentAnswer(transcript.trim())
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const replayLastQuestion = () => {
    const lastQuestion = [...messages].reverse().find((message) => message.role === 'assistant')
    if (!lastQuestion || !('speechSynthesis' in window) || !speechEnabled) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(lastQuestion.content)
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeechEnabled((prev) => !prev)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            {session && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Question {questionCount} of ~6</p>
                  <p className="text-sm font-semibold">{session.job_role} • {session.difficulty_level} • {session.interview_config?.interviewType || 'Mixed'}</p>
                </div>
                <Button variant="outline" className="px-3 py-2" onClick={toggleSpeech}>
                  {speechEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {speechEnabled ? 'Mute' : 'Unmute'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-6 py-8 flex flex-col max-w-4xl">
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="animate-fadeIn">
              {message.role === 'assistant' && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <Card className="flex-1 bg-gradient-to-br from-primary/10 via-card/50 to-card/30 border-primary/20 shadow-lg">
                    <div className="flex justify-end mb-3">
                      <Button variant="outline" className="px-3 py-2 text-xs" onClick={replayLastQuestion} disabled={!speechEnabled}>
                        <Volume2 className="w-3 h-3" />
                        Read aloud
                      </Button>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      {message.content.split('\n\n').map((paragraph, idx) => {
                        // Check if it's a heading (starts with #)
                        if (paragraph.startsWith('#')) {
                          const level = paragraph.match(/^#+/)?.[0].length || 1
                          const text = paragraph.replace(/^#+\s*/, '')
                          if (level === 1) {
                            return (
                              <h2 key={idx} className="text-2xl font-bold text-primary mb-3 flex items-center gap-2">
                                <span className="text-3xl">👋</span> {text}
                              </h2>
                            )
                          } else if (level === 2) {
                            return (
                              <h3 key={idx} className="text-xl font-semibold text-blue-400 mt-4 mb-2 flex items-center gap-2">
                                <span className="text-2xl">📝</span> {text}
                              </h3>
                            )
                          }
                        }
                        
                        // Check if it's a bold text (starts with **)
                        if (paragraph.includes('**')) {
                          const formatted = paragraph.split('**').map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="text-primary font-bold">{part}</strong> : part
                          )
                          return <p key={idx} className="text-gray-200 leading-relaxed mb-3">{formatted}</p>
                        }
                        
                        // Check if it's a tip (starts with >)
                        if (paragraph.startsWith('>')) {
                          return (
                            <div key={idx} className="bg-blue-500/10 border-l-4 border-blue-400 pl-4 py-2 mb-3 rounded-r">
                              <p className="text-blue-300 text-sm italic">
                                {paragraph.replace(/^>\s*/, '')}
                              </p>
                            </div>
                          )
                        }
                        
                        // Regular paragraph
                        return paragraph.trim() ? (
                          <p key={idx} className="text-gray-200 leading-relaxed mb-2">
                            {paragraph}
                          </p>
                        ) : null
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {message.role === 'user' && (
                <div className="flex gap-4 justify-end">
                  <Card className="bg-primary/10 border-primary/30 max-w-2xl">
                    <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              )}

              {message.role === 'feedback' && message.feedback && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <Card className="flex-1 bg-green-500/5 border-green-500/30">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold text-primary">
                            {message.feedback.score}/10
                          </span>
                          <span className="text-gray-400">Score</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400 mb-1">Confidence</p>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-green-400" style={{ width: `${message.feedback.metrics?.confidence || 0}%` }} /></div>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Clarity</p>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-blue-400" style={{ width: `${message.feedback.metrics?.clarity || 0}%` }} /></div>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Filler words</p>
                            <p className="font-semibold text-yellow-300">{message.feedback.metrics?.filler_words || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {message.feedback.strengths.map((strength, i) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">Areas to Improve</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {message.feedback.weaknesses.map((weakness, i) => (
                            <li key={i}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="text-sm px-4 py-2" onClick={() => toggleFeedbackPanel(index, 'ideal')}>
                          Show Ideal Answer
                        </Button>
                        <Button variant="outline" className="text-sm px-4 py-2" onClick={() => toggleFeedbackPanel(index, 'improved')}>
                          Improve My Answer
                        </Button>
                      </div>

                      {revealedFeedback[index]?.ideal && (
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 transition-all duration-300">
                          <h4 className="font-semibold text-blue-400 mb-2">Ideal Answer</h4>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.feedback.ideal_answer || 'No ideal answer available yet.'}</p>
                        </div>
                      )}

                      {revealedFeedback[index]?.improved && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all duration-300">
                          <h4 className="font-semibold text-primary mb-2">Improved Answer</h4>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.feedback.improved_answer}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <Card className="flex-1 bg-card/50">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-400">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <Card className="bg-card/80 backdrop-blur">
          <div className="flex gap-3">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here or use the microphone..."
              disabled={loading || waitingForFeedback}
              rows={3}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-50"
            />
            <div className="flex flex-col gap-2 self-end">
              <Button
                variant={isListening ? 'danger' : 'outline'}
                onClick={toggleVoiceInput}
                disabled={loading || waitingForFeedback}
                className="px-4"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || loading || waitingForFeedback}
                className="px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: You can answer by typing or using the microphone. The AI can also read questions aloud.
          </p>
        </Card>
      </div>
    </div>
  )
}
