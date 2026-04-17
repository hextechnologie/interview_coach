'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui'
import { FAQPageSchema } from '@/components/StructuredData'

const faqs = [
  {
    question: "How does the AI interview coach work?",
    answer: "Our AI interview coach uses Claude, one of the most advanced AI models, to simulate real interview scenarios. You select your job role and experience level, then engage in a realistic conversation where the AI asks relevant questions, evaluates your answers, and provides detailed feedback on your performance."
  },
  {
    question: "Is my interview data private and secure?",
    answer: "Yes, absolutely. All your interview sessions, answers, and personal data are encrypted and stored securely. We never share your information with third parties. You can delete your data at any time from your account settings."
  },
  {
    question: "How many interviews can I practice for free?",
    answer: "Free users get 3 mock interview sessions per month. This allows you to experience the platform and see how AI coaching can improve your interview skills. For unlimited interviews, check out our Pro plan."
  },
  {
    question: "What languages are supported?",
    answer: "We currently support 10+ languages including English, French, Spanish, German, Italian, Portuguese, Arabic, Chinese, Japanese, and Korean. You can select your preferred language when setting up each interview session."
  },
  {
    question: "Can I practice for specific companies or roles?",
    answer: "Yes! You can customize your interview by specifying the job title, industry, company type, and experience level. The AI will tailor questions to match your target role, whether it's a software engineer at a tech startup or a marketing manager at a Fortune 500 company."
  },
  {
    question: "How is the AI feedback generated?",
    answer: "After each answer, our AI analyzes your response using multiple criteria: content quality, STAR method structure, clarity, confidence, and relevance. You receive a detailed score, strengths and weaknesses breakdown, and an improved version of your answer as a learning tool."
  },
  {
    question: "Can I review my past interview sessions?",
    answer: "Yes, your dashboard provides a complete history of all your interview sessions. You can review questions asked, your answers, AI feedback, scores, and track your improvement over time with detailed analytics."
  },
  {
    question: "What types of interviews can I practice?",
    answer: "You can practice Technical interviews, Behavioral interviews, or Mixed interviews. You can also choose the interview round (First Round, Second Round, Final Round) and the interviewer type (HR, Tech Lead, Manager, CEO/Founder)."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime from your account dashboard. Go to Settings → Subscription → Cancel Plan. You'll retain access until the end of your billing period, and no further charges will be made."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied within the first 7 days, contact our support team and we'll process a full refund, no questions asked."
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <FAQPageSchema />
      <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-secondary/10 blur-3xl rounded-full" />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about Interview Coach and how it works
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold pr-8">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center glass p-8 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-gray-400 mb-6">
              Can't find the answer you're looking for? Feel free to reach out to our support team.
            </p>
            <Link href="/contact">
              <Button variant="primary" className="px-8 py-3">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border mt-20 py-8">
          <div className="container mx-auto px-6">
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2026 Interview Coach. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}
