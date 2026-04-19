'use client'

import { useEffect, useState } from 'react'
import { User, FileText, Briefcase, Building, GraduationCap, Wrench, Trophy, Settings } from 'lucide-react'

const sections = [
  { id: 'personal-info', label: 'Personal Info', icon: User },
  { id: 'bio', label: 'Bio', icon: FileText },
  { id: 'career-info', label: 'Career Info', icon: Briefcase },
  { id: 'experience', label: 'Work Experience', icon: Building },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'account', label: 'Account', icon: Settings },
]

export default function SidebarNav() {
  const [activeSection, setActiveSection] = useState('personal-info')

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]')
      let currentSection = 'personal-info'

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        // Check if section is in viewport (top half of screen)
        if (rect.top <= window.innerHeight / 3 && rect.bottom >= 0) {
          currentSection = section.getAttribute('data-section') || 'personal-info'
        }
      })

      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`)
    if (element) {
      const yOffset = -80 // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-24 h-fit rounded-xl border border-white/10 p-4" style={{ background: '#111827' }}>
      <div className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{section.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
