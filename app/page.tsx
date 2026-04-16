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

        {/* Hero Section with Video */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fadeIn">
                Master Your Next Interview with{' '}
                <span className="gradient-text">AI Coaching</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 animate-fadeIn">
                Practice with a lifelike AI interviewer, get instant personalized feedback, 
                and prepare with real interview simulations that mirror how companies actually hire.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fadeIn mb-6">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                        Start Practicing Free
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
                        View Pricing
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 animate-fadeIn">
                ✨ Get 3 Free Mock Interviews · No Card Needed
              </p>
            </div>

            {/* Right: Video */}
            <div className="animate-fadeIn">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <div className="relative aspect-video bg-gray-900">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/demo-poster.jpg"
                  >
                    <source src="/demo.mp4" type="video/mp4" />
                    <source src="/demo.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-gray-400 text-sm">Always Available</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">10+</div>
              <p className="text-gray-400 text-sm">Languages Supported</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">AI</div>
              <p className="text-gray-400 text-sm">Powered by Claude</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <p className="text-gray-400 text-sm">Free to Start</p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose Our AI Interview Coach</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to practice smarter, improve faster, and walk into every interview with real confidence.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl animate-fadeIn">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time AI Coaching</h3>
              <p className="text-gray-400 mb-4">
                Get instant feedback on your responses with detailed analysis of content quality, 
                clarity, confidence, and speaking pace.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ STAR method structure analysis</p>
                <p>✓ Speaking pace & filler word detection</p>
                <p>✓ Confidence & clarity scoring</p>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real Interview Questions</h3>
              <p className="text-gray-400 mb-4">
                Practice with role-specific questions tailored to any industry or level.
                Choose from technical, behavioral, or mixed interviews.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Thousands of real questions</p>
                <p>✓ Tailored to your role & experience</p>
                <p>✓ Technical & behavioral focus</p>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Progress</h3>
              <p className="text-gray-400 mb-4">
                Monitor improvement with analytics and coaching tips to refine answers, 
                strengthen stories, and build confidence.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Progress dashboard & trends</p>
                <p>✓ Average score tracking</p>
                <p>✓ Session history & insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-20 bg-card/30 rounded-3xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold mb-2">HOW IT WORKS</p>
            <h2 className="text-4xl font-bold mb-4">Your Path to Interview Success</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Personalized AI interview coaching to guide you through every stage of preparation.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Your Role</h3>
              <p className="text-gray-400 text-sm">
                Select your job role, industry, experience level, and interview type. 
                Each session pulls from thousands of real interview questions.
              </p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Practice with AI</h3>
              <p className="text-gray-400 text-sm">
                Answer questions in your selected language just like a real interview. 
                Available 24/7, no scheduling needed.
              </p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Instant Feedback</h3>
              <p className="text-gray-400 text-sm">
                Receive clear insights on content quality, STAR method structure, 
                clarity, confidence, and areas for improvement.
              </p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Improve & Track Progress</h3>
              <p className="text-gray-400 text-sm">
                Use analytics and coaching tips to refine answers, strengthen stories, 
                and build confidence across every session.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold mb-2">TESTIMONIALS</p>
            <h2 className="text-4xl font-bold mb-4">Real People. Real Results.</h2>
            <p className="text-gray-400">
              Join professionals who landed their dream roles with AI-powered interview practice.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The instant feedback on my responses was a game-changer. I refined my 
                communication skills and highlighted achievements in a way I never could before."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-gray-400">Software Engineer · Google</p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "I was asked nearly identical questions in my real interview — and I was fully prepared. 
                The AI helped me craft compelling stories and build confidence."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div>
                  <p className="font-semibold">Jessica Williams</p>
                  <p className="text-sm text-gray-400">Product Manager · Amazon</p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The structured feedback helped me spot gaps I didn't know I had. 
                Got the offer with a massive comp bump! 40% salary increase."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <p className="font-semibold">Raj Patel</p>
                  <p className="text-sm text-gray-400">Senior Engineer · Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="glass p-12 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals using AI interview practice to land better roles faster.
              </p>
              {user ? (
                <Link href="/interview/setup">
                  <Button variant="primary" className="text-lg px-10 py-4">
                    Start Practicing Now
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button variant="primary" className="text-lg px-10 py-4">
                    Start Practicing Free
                  </Button>
                </Link>
              )}
              <p className="text-sm text-gray-500 mt-4">
                ✨ Get 3 Free Mock Interviews · No Card Needed
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-border mt-20">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold gradient-text">Interview Coach</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered interview practice platform to help you land your dream job with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm pt-8 border-t border-border">
            <p>&copy; 2026 Interview Coach. All rights reserved. Powered by Claude AI.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
