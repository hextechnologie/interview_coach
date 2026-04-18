'use client'

import { useState, useEffect } from 'react'
import { Briefcase, X, Edit, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

interface Experience {
  id: string
  job_title: string
  company_name: string
  employment_type: string | null
  location: string | null
  start_month: number | null
  start_year: number
  end_month: number | null
  end_year: number | null
  is_current: boolean
  description: string | null
  order_index: number
}

interface ExperienceFormData {
  job_title: string
  company_name: string
  employment_type: string
  location: string
  start_month: number | null
  start_year: number | null
  end_month: number | null
  end_year: number | null
  is_current: boolean
  description: string
}

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Freelance',
  'Internship',
  'Contract',
  'Self-employed',
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const jobTitleSuggestions = [
  'Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager',
  'Product Manager', 'Senior Product Manager', 'Data Scientist', 'Data Analyst',
  'UX Designer', 'UI Designer', 'Product Designer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect',
  'Marketing Manager', 'Sales Executive', 'Business Analyst', 'Project Manager',
]

const topCompanies = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Tesla',
  'McKinsey', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture', 'IBM',
  'Oracle', 'Salesforce', 'Adobe', 'Intel', 'Nvidia', 'Uber', 'Airbnb',
]

export default function ExperienceSection({ userId }: { userId: string }) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [hasNoExperience, setHasNoExperience] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState<ExperienceFormData>({
    job_title: '',
    company_name: '',
    employment_type: 'Full-time',
    location: '',
    start_month: null,
    start_year: null,
    end_month: null,
    end_year: null,
    is_current: false,
    description: '',
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  useEffect(() => {
    loadExperiences()
  }, [userId])

  const loadExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: false })
      
      if (error) throw error
      setExperiences(data || [])
      setHasNoExperience((data || []).length === 0)
    } catch (error) {
      console.error('Error loading experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      job_title: '',
      company_name: '',
      employment_type: 'Full-time',
      location: '',
      start_month: null,
      start_year: null,
      end_month: null,
      end_year: null,
      is_current: false,
      description: '',
    })
    setShowModal(true)
  }

  const openEditModal = (exp: Experience) => {
    setEditingId(exp.id)
    setFormData({
      job_title: exp.job_title,
      company_name: exp.company_name,
      employment_type: exp.employment_type || 'Full-time',
      location: exp.location || '',
      start_month: exp.start_month,
      start_year: exp.start_year,
      end_month: exp.end_month,
      end_year: exp.end_year,
      is_current: exp.is_current,
      description: exp.description || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.job_title.trim() || !formData.company_name.trim() || !formData.start_year) {
      alert('Please fill in required fields: Job Title, Company, and Start Year')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        user_id: userId,
        ...formData,
        order_index: experiences.length,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('user_experience')
          .update(dataToSave)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_experience')
          .insert([dataToSave])
        if (error) throw error
      }

      await loadExperiences()
      setShowModal(false)
      setHasNoExperience(false)
    } catch (error) {
      console.error('Error saving experience:', error)
      alert('Failed to save experience')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const { error } = await supabase
        .from('user_experience')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadExperiences()
    } catch (error) {
      console.error('Error deleting experience:', error)
      alert('Failed to delete experience')
    }
  }

  const formatDate = (month: number | null, year: number | null, isCurrent: boolean) => {
    if (isCurrent) return 'Present'
    if (!year) return ''
    if (!month) return year.toString()
    return `${months[month - 1].slice(0, 3)} ${year}`
  }

  if (loading) {
    return <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Experience {!hasNoExperience && <span className="text-red-400">*</span>}
          </label>
          {experiences.length > 0 && (
            <p className="text-xs text-gray-400">{experiences.length} experience{experiences.length !== 1 ? 's' : ''} added ✅</p>
          )}
        </div>
        <Button
          type="button"
          onClick={openAddModal}
          variant="outline"
          className="text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Experience
        </Button>
      </div>

      <label className="flex items-center gap-2 mb-3 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={hasNoExperience}
          onChange={(e) => setHasNoExperience(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
        />
        I have no professional experience yet
      </label>

      {!hasNoExperience && experiences.length > 0 && (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              style={{ background: '#111827' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white">{exp.job_title} — {exp.company_name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {exp.employment_type && `${exp.employment_type} · `}
                        {exp.location || 'Remote'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exp.start_month, exp.start_year, false)} → {exp.is_current ? 'Present' : formatDate(exp.end_month, exp.end_year, false)}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
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
              <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} Experience</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Job Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  list="job-titles"
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
                <datalist id="job-titles">
                  {jobTitleSuggestions.map(title => <option key={title} value={title} />)}
                </datalist>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Company Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Google"
                  list="companies"
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
                <datalist id="companies">
                  {topCompanies.map(company => <option key={company} value={company} />)}
                </datalist>
              </div>

              {/* Employment Type & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco or Remote"
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Start Date <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.start_month || ''}
                    onChange={(e) => setFormData({ ...formData, start_month: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Month (optional)</option>
                    {months.map((month, idx) => <option key={month} value={idx + 1}>{month}</option>)}
                  </select>
                  <select
                    value={formData.start_year || ''}
                    onChange={(e) => setFormData({ ...formData, start_year: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Year *</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>

              {/* Currently Working Checkbox */}
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_month: null, end_year: null })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                I currently work here
              </label>

              {/* End Date */}
              {!formData.is_current && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">End Date</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.end_month || ''}
                      onChange={(e) => setFormData({ ...formData, end_month: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: '#0a0f1e' }}
                    >
                      <option value="">Month (optional)</option>
                      {months.map((month, idx) => <option key={month} value={idx + 1}>{month}</option>)}
                    </select>
                    <select
                      value={formData.end_year || ''}
                      onChange={(e) => setFormData({ ...formData, end_year: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: '#0a0f1e' }}
                    >
                      <option value="">Year (optional)</option>
                      {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your role, achievements, responsibilities..."
                  maxLength={300}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  style={{ background: '#0a0f1e' }}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/300</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" fullWidth>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} variant="primary" fullWidth loading={saving}>
                  {editingId ? 'Update' : 'Add'} Experience
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
