'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { useLanguage } from '@/components/LanguageProvider'

export default function TermsPage() {
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
              <Button variant="outline">{t('terms.dashboardButton')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">{t('terms.pageTitle')}</h1>
            <p className="text-gray-400 mb-8">{t('terms.lastUpdated')}</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section1Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section1Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section2Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section2Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section2Item1')}</li>
                  <li>{t('terms.section2Item2')}</li>
                  <li>{t('terms.section2Item3')}</li>
                  <li>{t('terms.section2Item4')}</li>
                  <li>{t('terms.section2Item5')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section3Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section3_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section3_1Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section3_1Item1')}</li>
                  <li>{t('terms.section3_1Item2')}</li>
                  <li>{t('terms.section3_1Item3')}</li>
                  <li>{t('terms.section3_1Item4')}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">{t('terms.section3_2Title')}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section3_2Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section4Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section4_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section4_1Text')}
                </p>

                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section4_2Title')}</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section4_2Item1')}</li>
                  <li>{t('terms.section4_2Item2')}</li>
                  <li>{t('terms.section4_2Item3')}</li>
                  <li>{t('terms.section4_2Item4')}</li>
                  <li>{t('terms.section4_2Item5')}</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">{t('terms.section4_3Title')}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section4_3Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section5Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section5Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section5Item1')}</li>
                  <li>{t('terms.section5Item2')}</li>
                  <li>{t('terms.section5Item3')}</li>
                  <li>{t('terms.section5Item4')}</li>
                  <li>{t('terms.section5Item5')}</li>
                  <li>{t('terms.section5Item6')}</li>
                  <li>{t('terms.section5Item7')}</li>
                  <li>{t('terms.section5Item8')}</li>
                  <li>{t('terms.section5Item9')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section6Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section6_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section6_1Text')}
                </p>

                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section6_2Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section6_2Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section6_2Item1')}</li>
                  <li>{t('terms.section6_2Item2')}</li>
                  <li>{t('terms.section6_2Item3')}</li>
                </ul>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section7Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section7Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section8Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section8_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section8_1Text')}
                </p>

                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section8_2Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section8_2Text')}
                </p>

                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section8_3Title')}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section8_3Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section9Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section9Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section10Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section10Intro')}
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>{t('terms.section10Item1')}</li>
                  <li>{t('terms.section10Item2')}</li>
                  <li>{t('terms.section10Item3')}</li>
                  <li>{t('terms.section10Item4')}</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  {t('terms.section10Outro')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section11Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section11Text')} <Link href="/privacy" className="text-primary hover:underline">{t('terms.section11Link')}</Link>{t('terms.section11Text2')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section12Title')}</h2>
                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section12_1Title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section12_1Text')} <a href="mailto:legal@interviewcoach.com" className="text-primary hover:underline">legal@interviewcoach.com</a> {t('terms.section12_1Text2')}
                </p>

                <h3 className="text-xl font-semibold mb-3 text-primary">{t('terms.section12_2Title')}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section12_2Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section13Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section13Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section14Title')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.section14Text')}
                </p>
              </section>

              <section className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{t('terms.section15Title')}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('terms.section15Intro')}
                </p>
                <p className="text-gray-300">
                  {t('terms.section15Email')} <a href="mailto:legal@interviewcoach.com" className="text-primary hover:underline">legal@interviewcoach.com</a><br />
                  {t('terms.section15Company')}<br />
                  {t('terms.section15Contact')} <Link href="/contact" className="text-primary hover:underline">{t('terms.section15ContactLink')}</Link>
                </p>
              </section>

              <section className="glass p-8 rounded-xl bg-gradient-primary/10 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">{t('terms.agreementTitle')}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {t('terms.agreementText')}
                </p>
              </section>
            </div>

            <div className="mt-12 text-center">
              <Link href="/">
                <Button variant="outline">{t('terms.backToHome')}</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border mt-20 py-8">
          <div className="container mx-auto px-6">
            <div className="text-center text-gray-400 text-sm">
              <p>{t('terms.copyright')}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
