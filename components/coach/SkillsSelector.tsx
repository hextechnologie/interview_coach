'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageProvider'
import type { CoachSkill, SkillCategory } from '@/lib/types/profile'
import { SKILL_SUGGESTIONS } from '@/lib/types/profile'


const MAX_SKILLS = 15

const CATEGORY_COLORS: Record<SkillCategory, {dot: string, bg: string}> = {
  'Technical': { dot: 'bg-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
  'Soft Skills': { dot: 'bg-green-500', bg: 'bg-green-500/10 border-green-500/30' },
  'Languages': { dot: 'bg-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
  'Tools': { dot: 'bg-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
}

interface SkillsSelectorProps {
  coachId?: string
  userId?: string
}

export default function SkillsSelector({ coachId, userId }: SkillsSelectorProps) {
  const { t } = useLanguage()
  const [skills, setSkills] = useState<CoachSkill[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{skill: string, category: SkillCategory}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine which table and ID field to use
  const tableName = coachId ? 'coach_skills' : 'user_skills'
  const idField = coachId ? 'coach_id' : 'user_id'
  const idValue = coachId || userId

  useEffect(() => {
    if (idValue) loadSkills()
  }, [coachId, userId])

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const allSuggestions: Array<{skill: string, category: SkillCategory}> = []
      
      Object.entries(SKILL_SUGGESTIONS).forEach(([category, skillsList]) => {
        const matching = skillsList.filter(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !skills.some(s => s.skill_name.toLowerCase() === skill.toLowerCase())
        )
        matching.forEach(skill => {
          allSuggestions.push({ skill, category: category as SkillCategory })
        })
      })

      setSuggestions(allSuggestions.slice(0, 10))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, skills])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSkills = async () => {
    if (!idValue) return
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, idValue)
      .order('order_index', { ascending: true })

    if (!error && data) {
      setSkills(data)
    }
  }

  const addSkill = async (skillName: string, category: SkillCategory) => {
    if (skills.length >= MAX_SKILLS) {
      alert(t('profile.skillsSection.maxAllowed').replace('{max}', String(MAX_SKILLS)))
      return
    }

    if (skills.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase())) {
      return // Already added
    }

    if (!idValue) return

    const { error } = await supabase
      .from(tableName)
      .insert([{
        [idField]: idValue,
        skill_name: skillName,
        skill_category: category,
        order_index: skills.length,
      }])

    if (!error) {
      await loadSkills()
      setSearchQuery('')
      setShowSuggestions(false)
      inputRef.current?.blur() // Blur input to close suggestions
    } else {
      console.error('Error adding skill:', error)
      alert(t('profile.skillsSection.addFailed'))
    }
  }

  const removeSkill = async (id: string) => {
    if (!idValue) return
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq(idField, idValue)

    if (!error) {
      await loadSkills()
    } else {
      console.error('Error removing skill:', error)
      alert(t('profile.skillsSection.removeFailed'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault()
      // Add as custom skill (detect category or default to Technical)
      const category = detectCategory(searchQuery)
      addSkill(searchQuery.trim(), category)
    }
  }

  const getCategoryLabel = (category: SkillCategory) => {
    const keyMap: Record<SkillCategory, string> = {
      'Technical': 'technical',
      'Soft Skills': 'softSkills',
      'Languages': 'languages',
      'Tools': 'tools',
    }

    return t(`profile.skillsSection.categories.${keyMap[category]}`)
  }

  const detectCategory = (skill: string): SkillCategory => {
    const lowerSkill = skill.toLowerCase()
    
    for (const [category, skills] of Object.entries(SKILL_SUGGESTIONS)) {
      if (skills.some(s => s.toLowerCase() === lowerSkill)) {
        return category as SkillCategory
      }
    }
    
    // Default to Technical
    return 'Technical'
  }

  return (
    <div className="overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{t('profile.skillsSection.title')}</h3>
          <p className="text-sm text-gray-400">
            {t('profile.skillsSection.countAdded').replace('{count}', String(skills.length)).replace('{max}', String(MAX_SKILLS))}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4 max-w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            placeholder={t('profile.skillsSection.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            disabled={skills.length >= MAX_SKILLS}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute z-10 left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden"
          >
            {suggestions.map(({ skill, category }) => (
              <button
                key={skill}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent input blur
                  addSkill(skill, category)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[category].dot}`}></div>
                <span>{skill}</span>
                <span className="ml-auto text-xs text-gray-400">{getCategoryLabel(category)}</span>
              </button>
            ))}
            {searchQuery && !suggestions.some(s => s.skill.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent input blur
                  const category = detectCategory(searchQuery)
                  addSkill(searchQuery.trim(), category)
                }}
                className="w-full px-4 py-2 text-left text-blue-400 hover:bg-gray-700 transition border-t border-gray-700"
              >
                {t('profile.skillsSection.pressEnter').replace('{query}', searchQuery)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Skills Tags */}
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 min-h-[3rem]">
          {skills.map((skill) => (
            <SkillTag
              key={skill.id}
              skill={skill}
              onRemove={() => removeSkill(skill.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-gray-700 rounded-lg min-h-[3rem]">
          {t('profile.skillsSection.emptyState')}
        </div>
      )}

      {/* Category Legend */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-3">{t('profile.skillsSection.categoriesLabel')}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
              <span className="text-gray-300">{getCategoryLabel(category as SkillCategory)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillTag({ skill, onRemove }: { skill: CoachSkill; onRemove: () => void }) {
  const { t } = useLanguage()
  const colors = CATEGORY_COLORS[skill.skill_category]

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition max-w-full ${colors.bg}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}></div>
      <span className="text-white text-sm truncate">{skill.skill_name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-gray-700 rounded transition flex-shrink-0"
        title={t('profile.skillsSection.removeSkill')}
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  )
}
