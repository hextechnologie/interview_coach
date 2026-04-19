'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Sparkles, UserRound } from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function SignupPage() {
  const { t } = useLanguage()
  
  const signupTypes = [
    {
      title: t('signup.candidateTitle'),
      description: t('signup.candidateDesc'),
      href: '/signup/candidate',
      icon: UserRound,
    },
    {
      title: t('signup.coachTitle'),
      description: t('signup.coachDesc'),
      href: '/signup/coach',
      icon: Briefcase,
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.24),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">Interview Coach</span>
        </Link>

        <div className="mb-10 text-center">
          <Badge className="mb-4">{t('signup.createAccount')}</Badge>
          <h1 className="mb-3 text-4xl font-bold">{t('signup.title')}</h1>
          <p className="text-lg text-gray-300">{t('signup.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {signupTypes.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="border-primary/20 bg-card/80 backdrop-blur">
                <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 p-3 w-fit">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">{item.title}</h2>
                <p className="mb-6 text-gray-300">{item.description}</p>
                <Link href={item.href}>
                  <Button variant="primary" className="gap-2">
                    {t('signup.continue')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
