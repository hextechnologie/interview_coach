'use client'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

interface Skill {
  id: string
  skill_name: string
  skill_category: string
  order_index: number
}

const skillCategories = {
  'Technical': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: '🔵' },
  'Soft Skills': { color: 'bg-green-500/20 text-green-300 border-green-500/30', dot: '🟢' },
  'Languages': { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: '🟣' },
  'Tools': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: '🟠' },
}

const suggestedSkills = {
  'Technical': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'TypeScript', 'Java', 'C++', 'AWS', 'Docker'],
  'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Time Management', 'Critical Thinking'],
  'Languages': ['English', 'French', 'Arabic', 'Spanish', 'German', 'Chinese', 'Japanese'],
  'Tools': ['Figma', 'Jira', 'Git', 'VS Code', 'Salesforce', 'Tableau', 'Photoshop'],
}

export default function SkillsSection({ userId }: { userId: string }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof skillCategories>('Technical')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [userId])

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')
      
      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = async (skillName: string, category: string = selectedCategory) => {
    if (!skillName.trim() || skills.length >= 15) return
    if (skills.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase())) return

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert([{
          user_id: userId,
          skill_name: skillName.trim(),
          skill_category: category,
          order_index: skills.length
        }])
      
      if (error) throw error
      await loadSkills()
      setInputValue('')
      setShowSuggestions(false)
    } catch (error) {
      console.error('Error adding skill:', error)
    }
  }

  const removeSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadSkills()
    } catch (error) {
      console.error('Error removing skill:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addSkill(inputValue)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Skills <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-400">{skills.length}/15 skills added</p>
      </div>

      {/* Skill input with category selector */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as keyof typeof skillCategories)}
            className="rounded-lg border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: '#0a0f1e' }}
          >
            {Object.keys(skillCategories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              placeholder="Type a skill and press Enter"
              disabled={skills.length >= 15}
              className="w-full rounded-lg border border-white/10 px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              style={{ background: '#0a0f1e' }}
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 rounded-lg border border-white/10 max-h-40 overflow-y-auto" style={{ background: '#111827' }}>
                {suggestedSkills[selectedCategory]
                  .filter(skill => skill.toLowerCase().includes(inputValue.toLowerCase()))
                  .filter(skill => !skills.some(s => s.skill_name.toLowerCase() === skill.toLowerCase()))
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill, selectedCategory)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={() => addSkill(inputValue)}
            disabled={!inputValue.trim() || skills.length >= 15}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Skills display */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const category = skill.skill_category as keyof typeof skillCategories
            const style = skillCategories[category] || skillCategories['Technical']
            return (
              <span
                key={skill.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${style.color}`}
              >
                <span>{skillCategories[category]?.dot || '🔵'}</span>
                {skill.skill_name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="hover:text-white transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
