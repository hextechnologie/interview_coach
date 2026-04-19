'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Building2, Edit2, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COUNTRIES } from '@/lib/countries'
import { useLanguage } from '@/components/LanguageProvider'
import type { CoachExperience, ExperienceFormData, EmploymentType } from '@/lib/types/profile'
import { MONTHS, YEARS, EMPLOYMENT_TYPES, JOB_TITLES, COMPANIES } from '@/lib/types/profile'

const LOCATION_SUGGESTIONS = Array.from(new Set([
  'Remote',
  'Hybrid',
  'On-site',
  ...COUNTRIES.flatMap((country) => country.cities.map((city) => `${city}, ${country.label}`)),
]))


interface ExperienceCardsSectionProps {
  coachId?: string
  userId?: string
}

export default function ExperienceCardsSection({ coachId, userId }: ExperienceCardsSectionProps) {
  const { t } = useLanguage()
  const [experiences, setExperiences] = useState<CoachExperience[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingExperience, setEditingExperience] = useState<CoachExperience | null>(null)
  const [loading, setLoading] = useState(false)

  // Determine which table and ID field to use
  const tableName = coachId ? 'coach_experience' : 'user_experience'
  const idField = coachId ? 'coach_id' : 'user_id'
  const idValue = coachId || userId

  useEffect(() => {
    if (idValue) loadExperiences()
  }, [coachId, userId])

  const loadExperiences = async () => {
    if (!idValue) return
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, idValue)
      .order('order_index', { ascending: true })

    if (!error && data) {
      setExperiences(data)
    }
  }

  const handleAddClick = () => {
    setEditingExperience(null)
    setShowModal(true)
  }

  const handleEditClick = (experience: CoachExperience) => {
    setEditingExperience(experience)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('profile.experienceSection.deleteConfirm'))) return

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (!error) {
      await loadExperiences()
    }
  }

  const handleSave = async () => {
    await loadExperiences()
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{t('profile.experienceSection.countAdded').replace('{count}', String(experiences.length))}</p>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          {t('profile.experienceSection.addButton')}
        </button>
      </div>

      <div className="space-y-3">
        {experiences.map((exp) => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            onEdit={() => handleEditClick(exp)}
            onDelete={() => handleDelete(exp.id)}
          />
        ))}
        {experiences.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-gray-700 rounded-lg">
            {t('profile.experienceSection.emptyState')}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && idValue && (
          <ExperienceModal
            tableName={tableName}
            idField={idField}
            idValue={idValue}
            experience={editingExperience}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ExperienceCard({
  experience,
  onEdit,
  onDelete,
}: {
  experience: CoachExperience
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useLanguage()

  const getEmploymentTypeLabel = (type: EmploymentType) => {
    const keyMap: Record<EmploymentType, string> = {
      'Full-time': 'fullTime',
      'Part-time': 'partTime',
      'Freelance': 'freelance',
      'Internship': 'internship',
      'Contract': 'contract',
      'Self-employed': 'selfEmployed',
    }

    return t(`profile.experienceSection.employmentTypes.${keyMap[type]}`)
  }

  const formatDate = () => {
    const startMonth = experience.start_month ? MONTHS.find(m => m.value === experience.start_month)?.label.slice(0, 3) : ''
    const start = `${startMonth} ${experience.start_year}`
    const end = experience.is_current
      ? t('profile.experienceSection.present')
      : experience.end_month && experience.end_year
        ? `${MONTHS.find(m => m.value === experience.end_month)?.label.slice(0, 3)} ${experience.end_year}`
        : experience.end_year || t('profile.experienceSection.present')

    return `${start} → ${end}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
              💼
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{experience.job_title}</h4>
              <p className="text-blue-400">{experience.company_name}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                {experience.employment_type && (
                  <span>{getEmploymentTypeLabel(experience.employment_type)}</span>
                )}
                {experience.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {experience.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate()}
              </div>
              {experience.description && (
                <p className="mt-2 text-sm text-gray-300">{experience.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title={t('profile.shared.edit')}
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 hover:bg-red-500/20 rounded-lg transition"
            title={t('profile.shared.delete')}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ExperienceModal({
  tableName,
  idField,
  idValue,
  experience,
  onClose,
  onSave,
}: {
  tableName: string
  idField: string
  idValue: string
  experience: CoachExperience | null
  onClose: () => void
  onSave: () => void
}) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ExperienceFormData>({
    job_title: experience?.job_title || '',
    company_name: experience?.company_name || '',
    employment_type: experience?.employment_type || undefined,
    location: experience?.location || '',
    start_month: experience?.start_month || undefined,
    start_year: experience?.start_year || new Date().getFullYear(),
    end_month: experience?.end_month || undefined,
    end_year: experience?.end_year || undefined,
    is_current: experience?.is_current || false,
    description: experience?.description || '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ExperienceFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([])
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ExperienceFormData, string>> = {}

    if (!formData.job_title.trim()) newErrors.job_title = t('profile.experienceSection.modal.jobTitleRequired')
    if (!formData.company_name.trim()) newErrors.company_name = t('profile.experienceSection.modal.companyRequired')
    if (!formData.start_year) newErrors.start_year = t('profile.experienceSection.modal.startYearRequired')

    if (!formData.is_current) {
      if (!formData.end_month || !formData.end_year) {
        newErrors.end_year = t('profile.experienceSection.modal.endDateRequired')
      } else if (
        formData.end_year < formData.start_year ||
        (formData.end_year === formData.start_year && formData.start_month && formData.end_month < formData.start_month)
      ) {
        newErrors.end_year = t('profile.experienceSection.modal.endDateInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!validate()) return

    setLoading(true)

    try {
      if (experience) {
        // Update existing
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', experience.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from(tableName)
          .insert([{ ...formData, [idField]: idValue }])

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Error saving experience:', error)
      alert(t('profile.experienceSection.modal.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleJobTitleChange = (value: string) => {
    setFormData({ ...formData, job_title: value })
    if (value.length > 0) {
      const suggestions = JOB_TITLES.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setJobTitleSuggestions(suggestions)
    } else {
      setJobTitleSuggestions([])
    }
  }

  const handleCompanyChange = (value: string) => {
    setFormData({ ...formData, company_name: value })
    if (value.length > 0) {
      const suggestions = COMPANIES.filter(company =>
        company.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setCompanySuggestions(suggestions)
    } else {
      setCompanySuggestions([])
    }
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
    const query = value.trim().toLowerCase()

    if (query.length > 0) {
      const suggestions = LOCATION_SUGGESTIONS.filter((location) =>
        location.toLowerCase().includes(query)
      ).slice(0, 6)
      setLocationSuggestions(suggestions)
    } else {
      setLocationSuggestions(LOCATION_SUGGESTIONS.slice(0, 6))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {experience ? t('profile.experienceSection.modal.editTitle') : t('profile.experienceSection.modal.addTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Job Title */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.experienceSection.modal.jobTitle')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleJobTitleChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('profile.experienceSection.modal.jobTitlePlaceholder')}
            />
            {errors.job_title && <p className="text-red-400 text-sm mt-1">{errors.job_title}</p>}
            {jobTitleSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                {jobTitleSuggestions.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, job_title: title })
                      setJobTitleSuggestions([])
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition"
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.experienceSection.modal.companyName')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('profile.experienceSection.modal.companyPlaceholder')}
            />
            {errors.company_name && <p className="text-red-400 text-sm mt-1">{errors.company_name}</p>}
            {companySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                {companySuggestions.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, company_name: company })
                      setCompanySuggestions([])
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.experienceSection.modal.employmentType')}
            </label>
            <select
              value={formData.employment_type || ''}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as EmploymentType || undefined })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">{t('profile.experienceSection.modal.selectType')}</option>
              {EMPLOYMENT_TYPES.map((type) => {
                const keyMap: Record<EmploymentType, string> = {
                  'Full-time': 'fullTime',
                  'Part-time': 'partTime',
                  'Freelance': 'freelance',
                  'Internship': 'internship',
                  'Contract': 'contract',
                  'Self-employed': 'selfEmployed',
                }

                return (
                  <option key={type} value={type}>{t(`profile.experienceSection.employmentTypes.${keyMap[type]}`)}</option>
                )
              })}
            </select>
          </div>

          {/* Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.experienceSection.modal.location')}
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => setLocationSuggestions(formData.location ? LOCATION_SUGGESTIONS.filter((location) => location.toLowerCase().includes((formData.location || '').toLowerCase())).slice(0, 6) : LOCATION_SUGGESTIONS.slice(0, 6))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder={t('profile.experienceSection.modal.locationPlaceholder')}
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {locationSuggestions.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, location })
                      setLocationSuggestions([])
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.experienceSection.modal.startDate')} <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.start_month || ''}
                onChange={(e) => setFormData({ ...formData, start_month: e.target.value ? parseInt(e.target.value) : undefined })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t('profile.shared.month')}</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={formData.start_year}
                onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {YEARS.reverse().map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {errors.start_year && <p className="text-red-400 text-sm mt-1">{errors.start_year}</p>}
          </div>

          {/* Current Work Checkbox */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => {
                  const isCurrent = e.target.checked
                  setFormData({
                    ...formData,
                    is_current: isCurrent,
                    ...(isCurrent ? { end_month: undefined, end_year: undefined } : {}),
                  })
                  if (isCurrent) {
                    setErrors((prev) => ({ ...prev, end_year: undefined }))
                  }
                }}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              {t('profile.experienceSection.modal.currentWorkHere')}
            </label>
          </div>

          {/* End Date (hidden if current) */}
          {!formData.is_current && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('profile.experienceSection.modal.endDate')} <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formData.end_month || ''}
                  onChange={(e) => setFormData({ ...formData, end_month: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{t('profile.shared.month')}</option>
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <select
                  value={formData.end_year || ''}
                  onChange={(e) => setFormData({ ...formData, end_year: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{t('profile.shared.year')}</option>
                  {YEARS.reverse().map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              {errors.end_year && <p className="text-red-400 text-sm mt-1">{errors.end_year}</p>}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.shared.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
              placeholder={t('profile.experienceSection.modal.descriptionPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description?.length || 0}/300 {t('profile.bio.characters')}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition"
              disabled={loading}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('profile.saving') : experience ? t('profile.experienceSection.modal.updateButton') : t('profile.experienceSection.modal.addButton')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
