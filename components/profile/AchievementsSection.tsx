'use client'

import { useState, useEffect } from 'react'
import { Trophy, X, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

interface Achievement {
  id: string
  achievement_type: string | null
  title: string
  description: string | null
  achievement_month: number | null
  achievement_year: number | null
  url: string | null
  order_index: number
}

const achievementTypes = [
  { value: 'Professional Achievement', label: '🏆 Professional Achievement', icon: '🏆' },
  { value: 'Project', label: '💻 Project', icon: '💻' },
  { value: 'Public Speaking', label: '📣 Public Speaking / Conference', icon: '📣' },
  { value: 'Publication', label: '📝 Publication / Article', icon: '📝' },
  { value: 'Award', label: '🥇 Award / Recognition', icon: '🥇' },
  { value: 'Other', label: '⭐ Other', icon: '⭐' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AchievementsSection({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    achievement_type: 'Professional Achievement',
    title: '',
    description: '',
    achievement_month: null as number | null,
    achievement_year: null as number | null,
    url: '',
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: false })
      
      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      achievement_type: 'Professional Achievement',
      title: '',
      description: '',
      achievement_month: null,
      achievement_year: null,
      url: '',
    })
    setShowModal(true)
  }

  const openEditModal = (ach: Achievement) => {
    setEditingId(ach.id)
    setFormData({
      achievement_type: ach.achievement_type || 'Professional Achievement',
      title: ach.title,
      description: ach.description || '',
      achievement_month: ach.achievement_month,
      achievement_year: ach.achievement_year,
      url: ach.url || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        user_id: userId,
        ...formData,
        order_index: achievements.length,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('user_achievements')
          .update(dataToSave)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_achievements')
          .insert([dataToSave])
        if (error) throw error
      }

      await loadAchievements()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving achievement:', error)
      alert('Failed to save achievement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return

    try {
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadAchievements()
    } catch (error) {
      console.error('Error deleting achievement:', error)
    }
  }

  const getIcon = (type: string | null) => {
    return achievementTypes.find(t => t.value === type)?.icon || '⭐'
  }

  if (loading) {
    return <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Projects & Achievements</label>
          {achievements.length > 0 && (
            <p className="text-xs text-gray-400">{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} added ✅</p>
          )}
        </div>
        <Button
          type="button"
          onClick={openAddModal}
          variant="outline"
          className="text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Achievement
        </Button>
      </div>

      {achievements.length > 0 && (
        <div className="space-y-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              style={{ background: '#111827' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{getIcon(ach.achievement_type)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{ach.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {ach.achievement_type}
                        {ach.achievement_year && ` · ${ach.achievement_month ? months[ach.achievement_month - 1] + ' ' : ''}${ach.achievement_year}`}
                      </p>
                      {ach.description && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{ach.description}</p>
                      )}
                      {ach.url && (
                        <a href={ach.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">
                          View link →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(ach)}
                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ach.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#111827' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} Achievement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Type <span className="text-red-400">*</span></label>
                <select
                  value={formData.achievement_type}
                  onChange={(e) => setFormData({ ...formData, achievement_type: e.target.value })}
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                >
                  {achievementTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Led migration to microservices saving $200k/year"
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your achievement..."
                  maxLength={200}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  style={{ background: '#0a0f1e' }}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Date (optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.achievement_month || ''}
                    onChange={(e) => setFormData({ ...formData, achievement_month: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Month</option>
                    {months.map((month, idx) => <option key={month} value={idx + 1}>{month}</option>)}
                  </select>
                  <select
                    value={formData.achievement_year || ''}
                    onChange={(e) => setFormData({ ...formData, achievement_year: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Year</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">URL / Link (optional)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="GitHub, article, or project link"
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" fullWidth>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} variant="primary" fullWidth loading={saving}>
                  {editingId ? 'Update' : 'Add'} Achievement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
