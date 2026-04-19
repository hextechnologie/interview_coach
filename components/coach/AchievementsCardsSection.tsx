'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Trophy, Code, Mic, FileText, Award, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageProvider'
import type { CoachAchievement, AchievementType } from '@/lib/types/profile'
import { MONTHS, YEARS } from '@/lib/types/profile'


const ACHIEVEMENT_TYPES: Array<{ value: AchievementType; label: string; icon: any; emoji: string }> = [
  { value: 'Professional Achievement', label: 'Professional', icon: Trophy, emoji: '🏆' },
  { value: 'Project', label: 'Project', icon: Code, emoji: '💻' },
  { value: 'Public Speaking', label: 'Public Speaking', icon: Mic, emoji: '📣' },
  { value: 'Publication', label: 'Publication', icon: FileText, emoji: '📝' },
  { value: 'Award', label: 'Award', icon: Award, emoji: '🥇' },
  { value: 'Other', label: 'Other', icon: Star, emoji: '⭐' },
]

interface AchievementsCardsSectionProps {
  coachId?: string
  userId?: string
}

export default function AchievementsCardsSection({ coachId, userId }: AchievementsCardsSectionProps) {
  const { t } = useLanguage()
  const [achievements, setAchievements] = useState<CoachAchievement[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<CoachAchievement | null>(null)

  // Determine which table and ID field to use
  const tableName = coachId ? 'coach_achievements' : 'user_achievements'
  const idField = coachId ? 'coach_id' : 'user_id'
  const idValue = coachId || userId

  useEffect(() => {
    if (idValue) loadAchievements()
  }, [coachId, userId])

  const loadAchievements = async () => {
    if (!idValue) return
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, idValue)
      .order('achievement_year', { ascending: false, nullsFirst: false })
      .order('achievement_month', { ascending: false, nullsFirst: false })

    if (!error && data) {
      setAchievements(data)
    }
  }

  const openAddModal = () => {
    setEditingAchievement(null)
    setIsModalOpen(true)
  }

  const openEditModal = (achievement: CoachAchievement) => {
    setEditingAchievement(achievement)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAchievement(null)
  }

  const handleSave = async () => {
    await loadAchievements()
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('profile.achievementsSection.deleteConfirm'))) return

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (!error) {
      await loadAchievements()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{t('profile.achievementsSection.subtitle')}</p>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          {t('profile.achievementsSection.addButton')}
        </button>
      </div>

      {achievements.length > 0 ? (
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onEdit={() => openEditModal(achievement)}
              onDelete={() => handleDelete(achievement.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-700 rounded-lg">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 mb-2">{t('profile.achievementsSection.emptyState')}</p>
          <button
            type="button"
            onClick={openAddModal}
            className="text-blue-500 hover:text-blue-400 transition"
          >
            {t('profile.achievementsSection.addFirst')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && idValue && (
          <AchievementModal
            tableName={tableName}
            idField={idField}
            idValue={idValue}
            achievement={editingAchievement}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AchievementCard({
  achievement,
  onEdit,
  onDelete,
}: {
  achievement: CoachAchievement
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useLanguage()
  const safeAchievementType: AchievementType = achievement.achievement_type ?? 'Other'
  const typeConfig = ACHIEVEMENT_TYPES.find(t => t.value === safeAchievementType)

  const getAchievementTypeLabel = (type?: AchievementType) => {
    const safeType = type ?? 'Other'

    const keyMap: Record<AchievementType, string> = {
      'Professional Achievement': 'professional',
      'Project': 'project',
      'Public Speaking': 'publicSpeaking',
      'Publication': 'publication',
      'Award': 'award',
      'Other': 'other',
    }

    return t(`profile.achievementsSection.types.${keyMap[safeType]}`)
  }
  const Icon = typeConfig?.icon || Star

  const formatDate = () => {
    if (!achievement.achievement_year) return null
    if (achievement.achievement_month) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[achievement.achievement_month - 1]} ${achievement.achievement_year}`
    }
    return achievement.achievement_year.toString()
  }

  return (
    <div className="group relative bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
          {typeConfig?.emoji || '⭐'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1">{achievement.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  {getAchievementTypeLabel(safeAchievementType)}
                </span>
                {formatDate() && (
                  <>
                    <span>•</span>
                    <span>{formatDate()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 hover:bg-gray-700 rounded transition"
                title={t('profile.shared.edit')}
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 hover:bg-gray-700 rounded transition"
                title={t('profile.shared.delete')}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {achievement.description && (
            <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
          )}

          {achievement.url && (
            <a
              href={achievement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-1"
            >
              {t('profile.achievementsSection.viewDetails')} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

interface AchievementModalProps {
  tableName: string
  idField: string
  idValue: string
  achievement: CoachAchievement | null
  onClose: () => void
  onSave: () => void
}

function AchievementModal({ tableName, idField, idValue, achievement, onClose, onSave }: AchievementModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    achievement_type: achievement?.achievement_type || 'Professional Achievement' as AchievementType,
    title: achievement?.title || '',
    description: achievement?.description || '',
    achievement_month: achievement?.achievement_month || null,
    achievement_year: achievement?.achievement_year || null,
    achievement_url: achievement?.url || null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = t('profile.achievementsSection.modal.titleRequired')
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = t('profile.achievementsSection.modal.descriptionLimit')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!validateForm()) return

    setIsSaving(true)

    const payload = {
      [idField]: idValue,
      achievement_type: formData.achievement_type,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      achievement_month: formData.achievement_month,
      achievement_year: formData.achievement_year,
      url: formData.achievement_url?.trim() || null,
    }

    if (achievement?.id) {
      // Update existing
      const { error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', achievement.id)

      if (!error) {
        onSave()
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from(tableName)
        .insert([payload])

      if (!error) {
        onSave()
      }
    }

    setIsSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {achievement ? t('profile.achievementsSection.modal.editTitle') : t('profile.achievementsSection.modal.addTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Achievement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 place-items-center">
              {ACHIEVEMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, achievement_type: type.value })}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition w-full ${
                    formData.achievement_type === type.value
                      ? 'bg-purple-900/30 border-purple-500 text-purple-400'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-sm">{t(`profile.achievementsSection.types.${type.value === 'Professional Achievement' ? 'professional' : type.value === 'Public Speaking' ? 'publicSpeaking' : type.value.toLowerCase()}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Best Speaker Award..."
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional) - {formData.description.length}/200
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your achievement..."
              rows={3}
              maxLength={200}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.achievement_month || ''}
                onChange={(e) => setFormData({ ...formData, achievement_month: e.target.value ? Number(e.target.value) : null })}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Month</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={formData.achievement_year || ''}
                onChange={(e) => setFormData({ ...formData, achievement_year: e.target.value ? Number(e.target.value) : null })}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL (optional)
            </label>
            <input
              type="url"
              value={formData.achievement_url || ''}
              onChange={(e) => setFormData({ ...formData, achievement_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 hover:border-gray-400 hover:bg-gray-700 text-white rounded-lg transition"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? t('profile.saving') : achievement ? t('profile.achievementsSection.modal.updateButton') : t('profile.achievementsSection.modal.addButton')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
