'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background to-background" />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Interview Coach</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">{t('privacy.dashboardButton')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">{t('privacy.pageTitle')}</h1>
            <p className="text-gray-400 mb-8">{t('privacy.lastUpdated')}</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section1Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section1Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section2Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('privacy.section2_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section2_1Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section2_1Item1')}</li>
                  <li>{t('privacy.section2_1Item2')}</li>
                  <li>{t('privacy.section2_1Item3')}</li>
                  <li>{t('privacy.section2_1Item4')}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">{t('privacy.section2_2Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section2_2Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section2_2Item1')}</li>
                  <li>{t('privacy.section2_2Item2')}</li>
                  <li>{t('privacy.section2_2Item3')}</li>
                  <li>{t('privacy.section2_2Item4')}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">{t('privacy.section2_3Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section2_3Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section2_3Item1')}</li>
                  <li>{t('privacy.section2_3Item2')}</li>
                  <li>{t('privacy.section2_3Item3')}</li>
                  <li>{t('privacy.section2_3Item4')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section3Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section3Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section3Item1')}</li>
                  <li>{t('privacy.section3Item2')}</li>
                  <li>{t('privacy.section3Item3')}</li>
                  <li>{t('privacy.section3Item4')}</li>
                  <li>{t('privacy.section3Item5')}</li>
                  <li>{t('privacy.section3Item6')}</li>
                  <li>{t('privacy.section3Item7')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section4Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section4Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section4Item1')}</li>
                  <li>{t('privacy.section4Item2')}</li>
                  <li>{t('privacy.section4Item3')}</li>
                  <li>{t('privacy.section4Item4')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section5Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section5Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>{t('privacy.section5Item1')}</strong></li>
                  <li><strong>{t('privacy.section5Item2')}</strong></li>
                  <li><strong>{t('privacy.section5Item3')}</strong></li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section6Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section6Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-4">
                  <li>{t('privacy.section6Item1')}</li>
                  <li>{t('privacy.section6Item2')}</li>
                  <li>{t('privacy.section6Item3')}</li>
                  <li>{t('privacy.section6Item4')}</li>
                  <li>{t('privacy.section6Item5')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section7Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section7Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('privacy.section7Item1')}</li>
                  <li>{t('privacy.section7Item2')}</li>
                  <li>{t('privacy.section7Item3')}</li>
                  <li>{t('privacy.section7Item4')}</li>
                  <li>{t('privacy.section7Item5')}</li>
                  <li>{t('privacy.section7Item6')}</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  {t('privacy.section7Outro')} <a href="mailto:privacy@interviewcoach.com" className="text-primary hover:underline">privacy@interviewcoach.com</a>
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section8Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section8Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section9Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section9Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section10Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section10Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section11Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section11Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section12Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('privacy.section12Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('privacy.section13Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('privacy.section13Intro')}
                </p>
                <p className="text-gray-300">
                  {t('privacy.section13Email')} <a href="mailto:privacy@interviewcoach.com" className="text-primary hover:underline">privacy@interviewcoach.com</a><br />
                  {t('privacy.section13Address')}<br />
                  {t('privacy.section13Contact')} <Link href="/contact" className="text-primary hover:underline">{t('privacy.section13ContactLink')}</Link>
                </p>
              </section>
            </div>

            <div className="mt-12 text-center">
              <Link href="/">
                <Button variant="outline">{t('privacy.backToHome')}</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border mt-20 py-8">
          <div className="container mx-auto px-6">
            <div className="text-center text-gray-400 text-sm">
              <p>{t('privacy.copyright')}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
