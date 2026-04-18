'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, X, Edit, Plus, Award } from 'lucide-react'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { searchUniversities, commonCertifications, onlinePlatforms } from '@/lib/universities'

interface Education {
  id: string
  education_type: string
  institution_name: string
  degree: string | null
  field_of_study: string | null
  start_year: number | null
  end_year: number | null
  is_ongoing: boolean
  grade: string | null
  credential_id: string | null
  credential_url: string | null
  description: string | null
  order_index: number
}

const educationTypes = [
  { value: 'University', label: '🎓 University / College', icon: '🎓' },
  { value: 'Certification', label: '📜 Professional Certification', icon: '📜' },
  { value: 'High School', label: '🏫 High School / Baccalaureate', icon: '🏫' },
  { value: 'Online Course', label: '💻 Online Course', icon: '💻' },
  { value: 'Bootcamp', label: '💻 Bootcamp', icon: '💻' },
  { value: 'Vocational', label: '🔧 Vocational Training', icon: '🔧' },
  { value: 'Other', label: '📚 Other', icon: '📚' },
]

const degrees = [
  "Bachelor's (Licence)", "Master's", "PhD", "Engineer Diploma", "DUT", "BTS", "Associate's", "Other"
]

const grades = [
  'Excellent (Très bien)', 'Very Good (Bien)', 'Good (Assez bien)', 'Pass (Passable)'
]

export default function EducationSection({ userId, userCountry }: { userId: string, userCountry?: string }) {
  const [educations, setEducations] = useState<Education[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [universitySearch, setUniversitySearch] = useState('')
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    education_type: 'University',
    institution_name: '',
    degree: '',
    field_of_study: '',
    start_year: null as number | null,
    end_year: null as number | null,
    is_ongoing: false,
    grade: '',
    credential_id: '',
    credential_url: '',
    description: '',
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 + 10 }, (_, i) => currentYear + 10 - i)

  useEffect(() => {
    loadEducations()
  }, [userId])

  useEffect(() => {
    if (universitySearch.length >= 2) {
      const results = searchUniversities(universitySearch, userCountry)
      setUniversitySuggestions(results)
    } else {
      setUniversitySuggestions([])
    }
  }, [universitySearch, userCountry])

  const loadEducations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: false })
      
      if (error) throw error
      setEducations(data || [])
    } catch (error) {
      console.error('Error loading educations:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      education_type: 'University',
      institution_name: '',
      degree: '',
      field_of_study: '',
      start_year: null,
      end_year: null,
      is_ongoing: false,
      grade: '',
      credential_id: '',
      credential_url: '',
      description: '',
    })
    setUniversitySearch('')
    setShowModal(true)
  }

  const openEditModal = (edu: Education) => {
    setEditingId(edu.id)
    setFormData({
      education_type: edu.education_type,
      institution_name: edu.institution_name,
      degree: edu.degree || '',
      field_of_study: edu.field_of_study || '',
      start_year: edu.start_year,
      end_year: edu.end_year,
      is_ongoing: edu.is_ongoing,
      grade: edu.grade || '',
      credential_id: edu.credential_id || '',
      credential_url: edu.credential_url || '',
      description: edu.description || '',
    })
    setUniversitySearch(edu.institution_name)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.institution_name.trim()) {
      alert('Please enter an institution name')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        user_id: userId,
        ...formData,
        order_index: educations.length,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('user_education')
          .update(dataToSave)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_education')
          .insert([dataToSave])
        if (error) throw error
      }

      await loadEducations()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving education:', error)
      alert('Failed to save education')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return

    try {
      const { error } = await supabase
        .from('user_education')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadEducations()
    } catch (error) {
      console.error('Error deleting education:', error)
      alert('Failed to delete education')
    }
  }

  const getIcon = (type: string) => {
    return educationTypes.find(t => t.value === type)?.icon || '📚'
  }

  if (loading) {
    return <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Education <span className="text-red-400">*</span>
          </label>
          {educations.length > 0 && (
            <p className="text-xs text-gray-400">{educations.length} education{educations.length !== 1 ? 's' : ''} added ✅</p>
          )}
        </div>
        <Button
          type="button"
          onClick={openAddModal}
          variant="outline"
          className="text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Education
        </Button>
      </div>

      {educations.length > 0 && (
        <div className="space-y-3">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              style={{ background: '#111827' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{getIcon(edu.education_type)}</span>
                    <div>
                      <h3 className="font-semibold text-white">
                        {edu.degree && `${edu.degree} in `}{edu.field_of_study || edu.institution_name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-0.5">{edu.institution_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.start_year && `${edu.start_year} → `}
                        {edu.is_ongoing ? 'Present' : edu.end_year || ''}
                        {edu.grade && ` · ${edu.grade}`}
                      </p>
                      {edu.credential_id && (
                        <p className="text-xs text-purple-400 mt-1">Credential ID: {edu.credential_id}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(edu)}
                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
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
              <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} Education</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Education Type */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Education Type <span className="text-red-400">*</span></label>
                <select
                  value={formData.education_type}
                  onChange={(e) => setFormData({ ...formData, education_type: e.target.value })}
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                >
                  {educationTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              {/* Institution Name */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {formData.education_type === 'Certification' ? 'Certification Name' :
                   formData.education_type === 'Online Course' || formData.education_type === 'Bootcamp' ? 'Course/Program Name' :
                   'Institution Name'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={universitySearch}
                  onChange={(e) => {
                    setUniversitySearch(e.target.value)
                    setFormData({ ...formData, institution_name: e.target.value })
                  }}
                  placeholder={
                    formData.education_type === 'University' ? "Start typing university name..." :
                    formData.education_type === 'Certification' ? "e.g. AWS Certified Solutions Architect" :
                    formData.education_type === 'Online Course' || formData.education_type === 'Bootcamp' ? "e.g. Full Stack Web Development" :
                    "Institution name"
                  }
                  list={formData.education_type === 'Certification' ? 'certifications' : (formData.education_type === 'Online Course' || formData.education_type === 'Bootcamp' ? 'platforms' : '')}
                  className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: '#0a0f1e' }}
                />
                {formData.education_type === 'University' && universitySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 rounded-lg border border-white/10 max-h-48 overflow-y-auto" style={{ background: '#111827' }}>
                    {universitySuggestions.map((uni, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUniversitySearch(uni)
                          setFormData({ ...formData, institution_name: uni })
                          setUniversitySuggestions([])
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 transition-colors"
                      >
                        {uni}
                      </button>
                    ))}
                  </div>
                )}
                <datalist id="certifications">
                  {commonCertifications.map(cert => <option key={cert} value={cert} />)}
                </datalist>
                <datalist id="platforms">
                  {onlinePlatforms.map(platform => <option key={platform} value={platform} />)}
                </datalist>
              </div>

              {/* University/High School specific fields */}
              {(formData.education_type === 'University' || formData.education_type === 'High School') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {formData.education_type === 'University' ? 'Degree' : 'Specialization'}
                      </label>
                      {formData.education_type === 'University' ? (
                        <select
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                          className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ background: '#0a0f1e' }}
                        >
                          <option value="">Select degree</option>
                          {degrees.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                          placeholder="e.g. Sciences, Maths"
                          className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ background: '#0a0f1e' }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Field of Study</label>
                      <input
                        type="text"
                        value={formData.field_of_study}
                        onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{ background: '#0a0f1e' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Certification specific fields */}
              {formData.education_type === 'Certification' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Credential ID</label>
                    <input
                      type="text"
                      value={formData.credential_id}
                      onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
                      placeholder="e.g. ABC123XYZ"
                      className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: '#0a0f1e' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Credential URL</label>
                    <input
                      type="url"
                      value={formData.credential_url}
                      onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                      placeholder="Verification link"
                      className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: '#0a0f1e' }}
                    />
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {formData.education_type === 'Certification' ? 'Issue Date' : 'Duration'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.start_year || ''}
                    onChange={(e) => setFormData({ ...formData, start_year: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Start Year</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                  <select
                    value={formData.end_year || ''}
                    onChange={(e) => setFormData({ ...formData, end_year: e.target.value ? parseInt(e.target.value) : null })}
                    disabled={formData.is_ongoing}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">End Year</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_ongoing}
                  onChange={(e) => setFormData({ ...formData, is_ongoing: e.target.checked, end_year: null })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                {formData.education_type === 'Certification' ? 'No expiry date' : 'Currently studying'}
              </label>

              {/* Grade */}
              {(formData.education_type === 'University' || formData.education_type === 'High School') && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Grade / Mention</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: '#0a0f1e' }}
                  >
                    <option value="">Select grade (optional)</option>
                    {grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" fullWidth>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} variant="primary" fullWidth loading={saving}>
                  {editingId ? 'Update' : 'Add'} Education
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
