'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Sparkles, Target, TrendingUp, Play, Menu, X, Twitter, Linkedin, Instagram } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { VideoModal } from '@/components/VideoModal'
import { useLanguage } from '@/components/LanguageProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { TryDemo } from '@/components/TryDemo'

const demoMessages = [
  'AI: Based on your resume, tell me about the React project you led.',
  'User: I improved load time by 42% and worked closely with design...',
  'AI: Strong impact. Confidence 84%. Here is your ideal answer...',
]

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demoMessages.length)
    }, 1600)

    return () => clearInterval(interval)
  }, [])

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

            <div className="hidden md:flex items-center gap-4">
              <Link href="/pricing" className="text-sm text-gray-300 hover:text-primary">Pricing</Link>
              <Link href="/faq" className="text-sm text-gray-300 hover:text-primary">FAQ</Link>
              <Link href="/contact" className="text-sm text-gray-300 hover:text-primary">Contact</Link>
              <LanguageSwitcher />
              {user ? (
                <Link href="/dashboard">
                  <Button variant="primary">{t('nav.dashboard')}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">{t('nav.login')}</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary">{t('nav.getStarted')}</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 glass rounded-xl p-4 space-y-3">
              <Link href="/pricing" className="block text-gray-300" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/faq" className="block text-gray-300" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link href="/contact" className="block text-gray-300" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="pt-2"><LanguageSwitcher /></div>
            </div>
          )}
        </header>

        {/* Hero Section with Video */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fadeIn">
                {t('hero.title')}{' '}
                <span className="gradient-text">{t('hero.titleHighlight')}</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 animate-fadeIn">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fadeIn mb-6">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                        {t('hero.startFree')}
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
                        {t('hero.viewPricing')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{t('hero.watchDemo')}</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 animate-fadeIn">
                ✨ {t('hero.freeInterviews')}
              </p>
            </div>

            {/* Right: Demo Mockup */}
            <div className="animate-fadeIn">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 group cursor-pointer bg-slate-950"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <div className="relative aspect-video p-4 md:p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                  <div className="relative h-full rounded-xl border border-border bg-black/40 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold">Live Interview Demo</p>
                        <p className="text-xs text-gray-400">Animated mock interview preview</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      {demoMessages.map((message, index) => (
                        <div
                          key={message}
                          className={`rounded-xl px-4 py-3 text-sm transition-all duration-500 ${
                            index === 0 ? 'bg-primary/15 text-white' : index === 1 ? 'bg-secondary/15 text-white ml-6' : 'bg-green-500/10 text-green-300'
                          } ${index <= demoStep ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-2'}`}
                        >
                          {message}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-700"
                        style={{ width: `${((demoStep + 1) / demoMessages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">{t('stats.available')}</div>
              <p className="text-gray-400 text-sm">{t('stats.availableLabel')}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">{t('stats.languages')}</div>
              <p className="text-gray-400 text-sm">{t('stats.languagesLabel')}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">{t('stats.aiPowered')}</div>
              <p className="text-gray-400 text-sm">{t('stats.aiPoweredLabel')}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-4xl font-bold gradient-text mb-2">{t('stats.users')}</div>
              <p className="text-gray-400 text-sm">{t('stats.usersLabel')}</p>
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
            <h2 className="text-4xl font-bold mb-4">Three simple steps to feel interview-ready</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Turn your resume and target role into a personalized mock interview in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Add your target job</h3>
              <p className="text-gray-400 text-sm">
                Paste your resume and job description so the AI understands your background and the role you want.
              </p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Practice realistic questions</h3>
              <p className="text-gray-400 text-sm">
                Rehearse technical, behavioral, or mixed interviews tailored to your skills and experience level.
              </p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get coached to improve</h3>
              <p className="text-gray-400 text-sm">
                See your confidence, clarity, ideal answers, and next-step feedback after every response.
              </p>
            </div>
          </div>
        </section>

        {/* Try Demo Section */}
        <TryDemo />

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
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" className="w-10 h-10 rounded-full bg-white" />
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
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" alt="Jessica" className="w-10 h-10 rounded-full bg-white" />
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
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Raj" alt="Raj" className="w-10 h-10 rounded-full bg-white" />
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
              <div className="flex justify-center">
                {user ? (
                  <Link href="/interview/setup">
                    <Button variant="primary" className="text-lg px-10 py-4 justify-center">
                      Start Practicing Now
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button variant="primary" className="text-lg px-10 py-4 justify-center">
                      Start Practicing Free
                    </Button>
                  </Link>
                )}
              </div>
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
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 pb-6">
            <a href="#" className="text-gray-400 hover:text-primary"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Instagram className="w-5 h-5" /></a>
          </div>
          <div className="text-center text-gray-400 text-sm pt-8 border-t border-border">
            <p>&copy; 2026 Interview Coach. All rights reserved. Powered by Claude AI.</p>
          </div>
        </footer>
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </div>
  )
}
