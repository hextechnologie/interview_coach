'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, LoadingSpinner } from '@/components/ui'
import { Sparkles, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant' | 'feedback'
  content: string
  feedback?: {
    score: number
    strengths: string[]
    weaknesses: string[]
    improved_answer: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        } else {
          // Get first question
          getNextQuestion()
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const getNextQuestion = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (data.question) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.question }])
        setQuestionCount(data.questionNumber)
      }

      if (data.completed) {
        router.push(`/interview/summary/${sessionId}`)
      }
    } catch (error) {
      console.error('Error getting question:', error)
    } finally {
      setLoading(false)
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
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

        // Check if interview should end
        if (questionCount >= 6 || data.completed) {
          setTimeout(() => {
            router.push(`/interview/summary/${sessionId}`)
          }, 2000)
        } else {
          // Get next question after a brief pause
          setTimeout(() => {
            getNextQuestion()
            setWaitingForFeedback(false)
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      setWaitingForFeedback(false)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
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
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            {session && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Question {questionCount} of ~6</p>
                  <p className="text-sm font-semibold">{session.job_role} - {session.difficulty_level}</p>
                </div>
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
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <Card className="flex-1 bg-card/50">
                    <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
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
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-3xl font-bold text-primary">
                            {message.feedback.score}/10
                          </span>
                          <span className="text-gray-400">Score</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">✓ Strengths</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {message.feedback.strengths.map((strength, i) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">⚠ Areas to Improve</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {message.feedback.weaknesses.map((weakness, i) => (
                            <li key={i}>• {weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-400 mb-2">💡 Improved Answer Example</h4>
                        <p className="text-sm text-gray-300 italic">
                          "{message.feedback.improved_answer}"
                        </p>
                      </div>
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
              placeholder="Type your answer here... (Press Enter to send)"
              disabled={loading || waitingForFeedback}
              rows={3}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-50"
            />
            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || loading || waitingForFeedback}
              className="self-end"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: Be specific and use examples from your experience
          </p>
        </Card>
      </div>
    </div>
  )
}
