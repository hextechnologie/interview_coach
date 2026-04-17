'use client'

import { useLanguage } from './LanguageProvider'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  )
}
