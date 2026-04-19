'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function AboutPage() {
  const { t } = useLanguage()
  
  const team = [
    { 
      name: t('about.team.productLead.name'), 
      role: t('about.team.productLead.role')
    },
    { 
      name: t('about.team.aiEngineer.name'), 
      role: t('about.team.aiEngineer.role')
    },
    { 
      name: t('about.team.growthLead.name'), 
      role: t('about.team.growthLead.role')
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />
      <div className="relative z-10">
        <header className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            <Link href="/dashboard"><Button variant="outline">{t('about.dashboard')}</Button></Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="text-center mb-14">
            <h1 className="text-5xl font-bold mb-4">{t('about.title')}</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <Card>
              <h2 className="text-2xl font-bold mb-3">{t('about.mission.heading')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('about.mission.content')}
              </p>
            </Card>
            <Card>
              <h2 className="text-2xl font-bold mb-3">{t('about.why.heading')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('about.why.content')}
              </p>
            </Card>
          </div>

          <Card className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{t('about.howItWorks.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="rounded-xl border border-border p-4">
                <p className="text-primary font-semibold mb-2">{t('about.howItWorks.step1Title')}</p>
                <p>{t('about.howItWorks.step1Desc')}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-primary font-semibold mb-2">{t('about.howItWorks.step2Title')}</p>
                <p>{t('about.howItWorks.step2Desc')}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-primary font-semibold mb-2">{t('about.howItWorks.step3Title')}</p>
                <p>{t('about.howItWorks.step3Desc')}</p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">{t('about.team.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {team.map((member) => (
                <Card key={member.name}>
                  <div className="w-14 h-14 rounded-full bg-gradient-primary mb-4" />
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
