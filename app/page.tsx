'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import { Sparkles, TrendingUp, Play, Menu, X, Twitter, Linkedin, Instagram, ChevronDown, Send, ArrowRight, Check, Users, Star as StarIcon, Globe, Award, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { VideoModal } from '@/components/VideoModal'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CookieConsent } from '@/components/CookieConsent'
import { SocialProofNotification } from '@/components/SocialProofNotification'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// Count-up animation hook
function useCountUp(end: number, duration: number = 2000, isInView: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, isInView])

  return count
}

const demoMessages = [
  { role: 'ai',    label: 'AI 🤖',      text: 'Tell me about a challenging project you led.' },
  { role: 'user',  label: 'You',         text: 'I led a team of 5 to rebuild our payment system...' },
  { role: 'ai',    label: 'AI 🤖',      text: 'Score: 7/10 — Good structure! Add more metrics.' },
  { role: 'coach', label: 'Coach 👨‍💼', text: 'Great start! In real interviews, pause here and make eye contact.' },
]

const STATS = [
  { icon: Users, value: 2500, suffix: '+', label: 'Active Users', color: 'text-blue-400' },
  { icon: Briefcase, value: 50, suffix: '+', label: 'Expert Coaches', color: 'text-purple-400' },
  { icon: Globe, value: 10, suffix: '+', label: 'Languages', color: 'text-green-400' },
  { icon: StarIcon, value: 4.9, suffix: '/5', label: 'Average Rating', color: 'text-yellow-400', decimal: true },
  { icon: Award, value: 500, suffix: '+', label: 'Jobs Landed', color: 'text-pink-400' },
]

const MOCK_COACHES = [
  {
    name: 'Sarah Chen',
    title: 'Ex-Google Tech Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen&backgroundColor=b6e3f4',
    tags: ['Tech', 'System Design', 'Behavioral'],
    rating: 4.9,
    sessions: 142,
    price: 80,
  },
  {
    name: 'Marcus Williams',
    title: 'Ex-McKinsey Consultant',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusWilliams&backgroundColor=c0aede',
    tags: ['Consulting', 'Finance', 'Case Interviews'],
    rating: 4.8,
    sessions: 98,
    price: 100,
  },
  {
    name: 'Priya Sharma',
    title: 'Ex-Amazon PM',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma&backgroundColor=d1d4f9',
    tags: ['Product', 'Behavioral', 'Leadership'],
    rating: 5.0,
    sessions: 201,
    price: 90,
  },
]

const AI_STEPS = [
  { step: '1', icon: '🎯', title: 'Choose Your Role', desc: 'Select your target job, industry, and level. The AI adapts everything to you.' },
  { step: '2', icon: '💬', title: 'Practice with AI', desc: 'Answer realistic questions in real-time. The AI responds like a real interviewer.' },
  { step: '3', icon: '⚡', title: 'Get Instant Feedback', desc: 'See your score, confidence level, ideal answer, and what to improve after each question.' },
  { step: '4', icon: '📈', title: 'Improve & Repeat', desc: 'Track scores over time and keep practising until you feel completely ready.' },
]

const COACH_STEPS = [
  { step: '1', icon: '🔍', title: 'Browse Coaches', desc: 'Filter by industry, experience level, price, and rating. Read reviews from past candidates.' },
  { step: '2', icon: '📅', title: 'Book a Session', desc: 'Choose a date, time, and session length that works for you. Pay securely online.' },
  { step: '3', icon: '🎥', title: 'Live 1-on-1 Session', desc: 'Join a video call with your expert coach. Practice interview scenarios in real time.' },
  { step: '4', icon: '✨', title: 'Get Expert Feedback', desc: 'Receive a personalised report with actionable next steps and improvement areas.' },
]

export default function HomePage() {
  const { user } = useAuth()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [getStartedOpen, setGetStartedOpen] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [howItWorksTab, setHowItWorksTab] = useState<'ai' | 'coach'>('ai')
  const [scrolled, setScrolled] = useState(false)
  const getStartedRef = useRef<HTMLDivElement>(null)

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demoMessages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (getStartedRef.current && !getStartedRef.current.contains(e.target as Node)) {
        setGetStartedOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-secondary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/10 blur-3xl rounded-full" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ 
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">


        {/* ══ NAVBAR ══ */}
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''
        }`}>
          <div className="container mx-auto px-6 py-6">
            <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/pricing"  className="text-sm text-gray-300 hover:text-primary transition-colors">Pricing</Link>
              <Link href="/coaches"  className="text-sm text-gray-300 hover:text-primary transition-colors">Coaches</Link>
              <Link href="/faq"      className="text-sm text-gray-300 hover:text-primary transition-colors">FAQ</Link>
              <Link href="/contact"  className="text-sm text-gray-300 hover:text-primary transition-colors">Contact</Link>
              <LanguageSwitcher />
              {user ? (
                <Link href="/dashboard">
                  <Button variant="primary">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  {/* Get Started dropdown */}
                  <div className="relative" ref={getStartedRef}>
                    <button
                      onClick={() => setGetStartedOpen((v) => !v)}
                      className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                    >
                      Get Started
                      <ChevronDown className={`w-4 h-4 transition-transform ${getStartedOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {getStartedOpen && (
                      <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50" style={{ background: '#111827' }}>
                        <Link href="/signup/candidate" onClick={() => setGetStartedOpen(false)}>
                          <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="text-sm font-semibold text-white">🤖 Practice with AI</p>
                            <p className="text-xs text-gray-400 mt-0.5">Start mock interviews free</p>
                          </div>
                        </Link>
                        <div className="border-t border-white/10" />
                        <Link href="/signup/coach" onClick={() => setGetStartedOpen(false)}>
                          <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="text-sm font-semibold text-white">👨‍💼 Become a Coach</p>
                            <p className="text-xs text-gray-400 mt-0.5">Earn from your expertise</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 glass rounded-xl p-4 space-y-3">
              <Link href="/pricing"  className="block text-gray-300 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/coaches"  className="block text-gray-300 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Coaches</Link>
              <Link href="/faq"      className="block text-gray-300 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link href="/contact"  className="block text-gray-300 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/signup/candidate" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>🤖 Practice with AI</Button>
                </Link>
                <Link href="/signup/coach" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>👨‍💼 Become a Coach</Button>
                </Link>
              </div>
              <div className="pt-2"><LanguageSwitcher /></div>
            </div>
          )}
          </div>
        </header>

        {/* ══ HERO ══ */}
        <section className="container mx-auto px-6 py-32 min-h-[85vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                Land your dream job with{' '}
                <span className="gradient-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                  AI Coaching + Real Expert Coaches
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
              >
                Practice unlimited mock interviews with AI, then book a 1-on-1 session with a real interview coach. 
                Get personalised feedback, improve faster, and walk into every interview with <span className="text-purple-400 font-semibold">real confidence</span>.
              </motion.p>

              {/* CTA buttons - Conditional based on auth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              >
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="primary" className="text-lg px-10 py-4 w-full sm:w-auto shadow-2xl shadow-purple-600/30">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href="/coaches">
                      <Button variant="outline" className="text-lg px-10 py-4 w-full sm:w-auto">
                        Find a Coach
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup/candidate">
                      <Button variant="primary" className="text-lg px-10 py-4 w-full sm:w-auto shadow-2xl shadow-purple-600/30 hover:scale-105 transition-transform">
                        Start Practicing Free
                      </Button>
                    </Link>
                    <Link href="/coaches">
                      <Button variant="outline" className="text-lg px-10 py-4 w-full sm:w-auto hover:border-purple-400 hover:text-purple-400 transition-all">
                        Find a Coach
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Watch demo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors group mx-auto lg:mx-0 mb-8"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 group-hover:scale-110 transition-all">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-base font-medium">Watch Demo Video</span>
                </button>
              </motion.div>

              {/* Social proof badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col items-center lg:items-start gap-3"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-black" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">👥 Join 2,500+ professionals already practicing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Rated <span className="text-white font-semibold">4.9/5</span> by our users</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: chat demo with animations */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Live badge */}
              <motion.div
                className="absolute -top-4 -right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/40 backdrop-blur-xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-400">Live Demo</span>
              </motion.div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-slate-950">
                <div className="relative p-4 md:p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                  <div className="relative rounded-xl border border-border bg-black/40 p-4 flex flex-col">

                    {/* Demo header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-white">AI Practice + Coach Feedback</p>
                        <p className="text-xs text-gray-400">Live mock interview preview</p>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      </div>
                    </div>

                    {/* Messages with enhanced avatars */}
                    <div className="space-y-3 flex-1 min-h-[200px]">
                      {demoMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: index <= demoStep ? 1 : 0.2,
                            y: index <= demoStep ? 0 : 10
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex items-start gap-2"
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            msg.role === 'ai'    ? 'bg-purple-600/30 border border-purple-500/40' :
                            msg.role === 'coach' ? 'bg-green-600/30 border border-green-500/40' :
                                                   'bg-blue-600/30 border border-blue-500/40'
                          }`}>
                            {msg.role === 'ai' ? '🤖' : msg.role === 'coach' ? '👨‍💼' : '👤'}
                          </div>
                          <div className={`flex-1 rounded-xl px-3 py-2 text-xs ${
                            msg.role === 'ai'    ? 'bg-purple-500/15 text-purple-200 border border-purple-500/20' :
                            msg.role === 'coach' ? 'bg-green-500/15 text-green-200 border border-green-500/20' :
                                                   'bg-blue-500/15 text-blue-200 border border-blue-500/20 ml-4'
                          }`}>
                            <span className="font-semibold block mb-0.5 opacity-60">{msg.label}</span>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((demoStep + 1) / demoMessages.length) * 100}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <StatsSection />

        {/* ══ WHY CHOOSE US ══ */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Why Choose Interview Coach</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The only platform that combines unlimited AI practice with real human coaching — so you're always one step ahead.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Practice */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
              className="glass p-10 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/30">
                🤖
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Mock Interviews 🤖</h3>
              <p className="text-base text-gray-300 mb-6 leading-relaxed">
                Practice 24/7 with our AI that adapts to your role, experience level, and target company. Get instant scoring and detailed feedback on every answer.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">STAR method structure analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Confidence & clarity scoring</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Filler word detection</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Unlimited practice sessions</p>
                </div>
              </div>
            </motion.div>

            {/* Human Coaches */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
              className="glass p-10 rounded-3xl border-2 border-green-500/30 hover:border-green-500/60 transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Animated NEW badge */}
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-6 right-6 text-xs font-bold rounded-full bg-green-600/20 border border-green-500/40 px-3 py-1.5 text-green-400"
              >
                NEW
              </motion.span>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform shadow-lg shadow-green-600/30" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))', border: '2px solid rgba(16,185,129,0.4)' }}>
                👨‍💼
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Real Expert Coaches 👨‍💼</h3>
              <p className="text-base text-gray-300 mb-6 leading-relaxed">
                Book 1-on-1 sessions with experienced coaches from top companies. Get personalised advice, live feedback, and insider tips you can't get from AI.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Coaches from Google, Amazon, McKinsey</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Video & audio sessions</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">CV & cover letter review</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Salary negotiation coaching</p>
                </div>
              </div>
            </motion.div>

            {/* Track & Improve */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
              className="glass p-10 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Track & Improve 📈</h3>
              <p className="text-base text-gray-300 mb-6 leading-relaxed">
                Monitor your progress across both AI sessions and coach feedback. See your scores improve over time with detailed analytics and personalised coaching plans.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">AI + Coach combined analytics</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Score trend charts</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Personalised improvement plan</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-base text-gray-400">Full session history</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="container mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/10 via-black/40 to-blue-900/10 border border-white/10 p-8 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-purple-400 text-sm font-bold mb-3 uppercase tracking-wider">HOW IT WORKS</p>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">Two ways to get interview-ready</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Use AI practice, book a coach session, or combine both for the best results.
              </p>

              {/* Enhanced Tab bar */}
              <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-black/40 backdrop-blur-sm p-2">
                <button
                  onClick={() => setHowItWorksTab('ai')}
                  className={`rounded-xl px-8 py-4 text-base font-bold transition-all relative ${
                    howItWorksTab === 'ai'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-600/50 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🤖 AI Practice
                </button>
                <button
                  onClick={() => setHowItWorksTab('coach')}
                  className={`rounded-xl px-8 py-4 text-base font-bold transition-all relative ${
                    howItWorksTab === 'coach'
                      ? 'text-white shadow-2xl shadow-green-600/50 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={howItWorksTab === 'coach' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                >
                  👨‍💼 Coach Session
                </button>
              </div>
            </motion.div>

            {/* Steps with smooth transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={howItWorksTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-4 gap-8 relative"
              >
                {(howItWorksTab === 'ai' ? AI_STEPS : COACH_STEPS).map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Connecting arrow (desktop only, except last) */}
                    {index < 3 && (
                      <div className="hidden md:block absolute top-12 left-[calc(100%+1rem)] w-8 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent">
                        <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-purple-500/50" />
                      </div>
                    )}

                    <div className={`text-center p-8 glass rounded-2xl border hover:border-purple-500/30 transition-all group hover:scale-105 ${
                      howItWorksTab === 'coach' ? 'border-green-500/20 hover:border-green-500/40' : ''
                    }`}>
                      {/* Step number with icon */}
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-bold mb-6 shadow-lg ${
                        howItWorksTab === 'ai'
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-600/30'
                          : 'shadow-green-600/30'
                      }`}
                      style={howItWorksTab === 'coach' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                      >
                        <span className="text-white text-2xl">{item.icon}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>

                      {/* Description */}
                      <p className="text-base text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ══ MEET OUR COACHES ══ */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-green-400 text-sm font-bold mb-3 uppercase tracking-wider">EXPERT COACHES</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Learn From the Best 👨‍💼</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our coaches have helped candidates land roles at top companies worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {MOCK_COACHES.map((coach, index) => (
              <motion.div
                key={coach.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                className="glass p-8 rounded-3xl border border-white/10 hover:border-green-500/40 transition-all group cursor-pointer h-full flex flex-col"
              >
                <div className="flex items-center gap-5 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-20 h-20 rounded-2xl bg-white/10 ring-2 ring-white/10 group-hover:ring-green-500/50 transition-all group-hover:scale-110"
                  />
                  <div>
                    <p className="font-bold text-xl text-white mb-1">{coach.name}</p>
                    <p className="text-sm text-gray-400">{coach.title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {coach.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs rounded-full border border-green-500/30 bg-green-600/10 px-3 py-1.5 text-green-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm mb-6">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{coach.rating}</span>
                    <span className="text-gray-500">({coach.sessions} sessions)</span>
                  </div>
                  <span className="text-purple-400 font-bold text-base">${coach.price}/session</span>
                </div>

                <Link href="/coaches" className="mt-auto">
                  <Button
                    variant="outline"
                    fullWidth
                    className="group-hover:border-green-500 group-hover:text-green-400 transition-all text-base py-3"
                  >
                    View Profile
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/coaches">
              <Button
                variant="primary"
                className="gap-3 px-10 py-4 text-lg shadow-2xl shadow-green-600/30 hover:shadow-green-600/50 hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                Browse All Coaches <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-blue-400 text-sm font-bold mb-3 uppercase tracking-wider">TESTIMONIALS</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Real People. Real Results.</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join professionals who landed their dream roles with AI practice + expert coaching.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* T1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.2)' }}
              className="relative glass p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all group"
            >
              {/* Large decorative quotation mark */}
              <div className="absolute top-6 left-6 text-8xl text-purple-500/10 font-serif leading-none">"</div>
              
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-gray-200 mb-6 leading-relaxed">
                  "The AI practice helped me nail the basics, then my coach session gave me the edge I needed. Got the Google offer! 🎉"
                </p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Sarah"
                    className="w-14 h-14 rounded-full bg-white ring-2 ring-purple-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Sarah Chen</p>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Verified User</span>
                    </div>
                    <p className="text-sm text-gray-400">Software Engineer · Google</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* T2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
              className="relative glass p-8 rounded-3xl border border-blue-500/20 hover:border-blue-500/40 transition-all group"
            >
              <div className="absolute top-6 left-6 text-8xl text-blue-500/10 font-serif leading-none">"</div>
              
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-gray-200 mb-6 leading-relaxed">
                  "My coach had worked at Amazon and knew exactly what they look for. 3 sessions later, I had the offer."
                </p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica"
                    alt="Jessica"
                    className="w-14 h-14 rounded-full bg-white ring-2 ring-blue-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Jessica Williams</p>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Verified User</span>
                    </div>
                    <p className="text-sm text-gray-400">Product Manager · Amazon</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* T3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
              className="relative glass p-8 rounded-3xl border border-green-500/20 hover:border-green-500/40 transition-all group"
            >
              <div className="absolute top-6 left-6 text-8xl text-green-500/10 font-serif leading-none">"</div>
              
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-gray-200 mb-6 leading-relaxed">
                  "I used the AI every day for 2 weeks, then booked one coach session the day before my interview. Perfect combo!"
                </p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Raj"
                    alt="Raj"
                    className="w-14 h-14 rounded-full bg-white ring-2 ring-green-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Raj Patel</p>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Verified User</span>
                    </div>
                    <p className="text-sm text-gray-400">Senior Engineer · Stripe</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* T4 — Coach perspective */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2)' }}
              className="relative glass p-8 rounded-3xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group"
            >
              <div className="absolute top-6 left-6 text-8xl text-yellow-500/10 font-serif leading-none">"</div>
              
              <div className="relative z-10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-gray-200 mb-6 leading-relaxed">
                  "I've coached 50+ candidates through this platform. The AI pre-screens them so when they arrive, we can focus on the hard stuff."
                </p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                    alt="Michael"
                    className="w-14 h-14 rounded-full bg-white ring-2 ring-yellow-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Michael Torres</p>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Verified User</span>
                    </div>
                    <p className="text-sm text-gray-400">Career Coach · Ex-McKinsey</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%]"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

            {/* Floating decorative elements */}
            <motion.div
              className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm"
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"
              animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold mb-6 text-white"
              >
                Ready to Land Your Dream Job?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Start with free AI practice, then supercharge your prep with a real expert coach.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5 justify-center mb-8"
              >
                {user ? (
                  <Link href="/interview/setup">
                    <Button
                      variant="outline"
                      className="text-lg px-12 py-5 bg-white/10 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-purple-600 transition-all shadow-2xl hover:scale-105 font-bold"
                    >
                      Start Practicing Now
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup/candidate">
                      <Button
                        variant="outline"
                        className="text-lg px-12 py-5 bg-white/10 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-purple-600 transition-all shadow-2xl hover:scale-105 font-bold"
                      >
                        Start Practicing Free
                      </Button>
                    </Link>
                    <Link href="/coaches">
                      <Button
                        variant="outline"
                        className="text-lg px-12 py-5 bg-white/10 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-blue-600 transition-all shadow-2xl hover:scale-105 font-bold"
                      >
                        Find a Coach
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Social proof counter */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-base">
                  Join 2,500+ professionals →
                </span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="container mx-auto px-6 py-16 border-t border-border mt-20">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Brand + Newsletter */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold gradient-text">Interview Coach</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                AI mock interviews + real expert coaches. Land your dream job faster.
              </p>
              
              {/* Newsletter Signup */}
              <div className="space-y-3">
                <p className="text-white font-semibold flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Get weekly interview tips
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-600/20">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link href="/coaches" className="hover:text-purple-400 transition-colors">Find a Coach</Link></li>
                <li><Link href="/jobs" className="hover:text-purple-400 transition-colors">Browse Jobs</Link></li>
                <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* For Coaches */}
            <div>
              <h4 className="font-bold text-white mb-4">For Coaches</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/signup/coach" className="hover:text-purple-400 transition-colors">Become a Coach</Link></li>
                <li><Link href="/coach/dashboard" className="hover:text-purple-400 transition-colors">Coach Dashboard</Link></li>
                <li><Link href="/coach/earnings" className="hover:text-purple-400 transition-colors">Earnings & Payouts</Link></li>
              </ul>
            </div>

            {/* Support + Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400 mb-6">
                <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
              </ul>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/about" className="hover:text-purple-400 transition-colors">About</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-5 pb-8 border-b border-border">
            <a
              href="https://twitter.com/interviewcoach"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-400/50 hover:bg-purple-600/10 transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/company/interviewcoach"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-400/50 hover:bg-purple-600/10 transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/interviewcoach"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:border-purple-400/50 hover:bg-purple-600/10 transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright + Tagline */}
          <div className="text-center text-gray-400 pt-8 space-y-2">
            <p className="text-sm">
              Made with <span className="text-red-500">❤️</span> for job seekers worldwide
            </p>
            <p className="text-xs">
              &copy; 2026 Interview Coach. All rights reserved. Powered by Claude AI.
            </p>
          </div>
        </footer>
      </div>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
      <CookieConsent />
      <SocialProofNotification />
    </div>
  )
}

// Stats Section Component with count-up animations
function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="container mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Background card with gradient */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-900/20 via-black/40 to-blue-900/20 backdrop-blur-sm p-8 md:p-12">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <StatCard key={stat.label} stat={stat} Icon={Icon} index={index} isInView={isInView} />
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// Individual Stat Card with count-up
function StatCard({ stat, Icon, index, isInView }: { stat: typeof STATS[0], Icon: any, index: number, isInView: boolean }) {
  const count = useCountUp(stat.value, 2000, isInView)
  const displayValue = stat.decimal ? count.toFixed(1) : count

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center group"
    >
      {/* Separator line (except first) */}
      {index > 0 && index < 5 && (
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      )}
      
      <div className="relative">
        {/* Icon with glow */}
        <motion.div
          animate={isInView ? {
            boxShadow: [
              `0 0 20px ${stat.color.replace('text-', 'rgba(').replace('-400', ', 0.3)')}`,
              `0 0 30px ${stat.color.replace('text-', 'rgba(').replace('-400', ', 0.5)')}`,
              `0 0 20px ${stat.color.replace('text-', 'rgba(').replace('-400', ', 0.3)')}`,
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 group-hover:border-white/20 transition-all"
        >
          <Icon className={`w-7 h-7 ${stat.color}`} />
        </motion.div>

        {/* Value with count-up */}
        <div className="text-3xl md:text-4xl font-bold mb-2">
          <span className={`bg-gradient-to-r ${stat.color.replace('text-', 'from-')} to-white bg-clip-text text-transparent`}>
            {displayValue}{stat.suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
      </div>
    </motion.div>
  )
}
