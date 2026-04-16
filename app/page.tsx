'use client'

import { Button } from '@/components/ui'
import { Sparkles, Target, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function HomePage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-secondary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/10 blur-3xl rounded-full" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl font-bold mb-6 animate-fadeIn">
            Master Your Next Interview with{' '}
            <span className="gradient-text">AI Coaching</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fadeIn">
            Practice realistic job interviews with Claude AI. Get instant feedback,
            improve your answers, and land your dream job with confidence.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fadeIn">
            {user ? (
              <Link href="/dashboard">
                <Button variant="primary" className="text-lg px-8 py-4">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="primary" className="text-lg px-8 py-4">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="text-lg px-8 py-4">
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl text-center animate-fadeIn">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Role-Specific Questions</h3>
              <p className="text-gray-400">
                Get tailored interview questions for Software Engineering, Marketing,
                Sales, Finance, and more.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl text-center animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed AI Feedback</h3>
              <p className="text-gray-400">
                Receive structured feedback with scores, strengths, weaknesses, and
                improved answer examples.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Progress</h3>
              <p className="text-gray-400">
                Monitor your improvement over time with comprehensive stats and
                session history.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Choose Your Role', desc: 'Select job role and difficulty level' },
              { step: 2, title: 'Start Interview', desc: 'Answer AI-generated questions' },
              { step: 3, title: 'Get Feedback', desc: 'Receive instant AI coaching' },
              { step: 4, title: 'Improve & Repeat', desc: 'Track progress and master interviews' },
            ].map((item, i) => (
              <div key={i} className="text-center animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="glass p-12 rounded-3xl text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of job seekers improving their interview skills with AI
            </p>
            <Link href="/signup">
              <Button variant="primary" className="text-lg px-10 py-4">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-border mt-20">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 Interview Coach. Powered by Claude AI.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
