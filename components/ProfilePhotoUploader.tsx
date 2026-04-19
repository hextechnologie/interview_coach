'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/profile-utils'
import { useLanguage } from '@/components/LanguageProvider'

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string
  userId: string
  onPhotoUpdated: (url: string) => void
}

export default function ProfilePhotoUploader({
  currentPhotoUrl,
  firstName,
  lastName,
  email,
  userId,
  onPhotoUpdated,
}: ProfilePhotoUploaderProps) {
  const [preview, setPreview] = useState(currentPhotoUrl || '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  const initials = getInitials(firstName, lastName, email)

  useEffect(() => {
    setPreview(currentPhotoUrl || '')
  }, [currentPhotoUrl])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t('profile.photoUploader.invalidType'))
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('profile.photoUploader.fileTooLarge'))
      return
    }

    setError('')
    setPreview(URL.createObjectURL(file))

    // Upload to Supabase Storage
    try {
      setUploading(true)
      setUploadProgress(0)

      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}.${fileExt}`

      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev))
      }, 200)

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      const publicUrl = urlData.publicUrl

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (updateError) throw updateError

      onPhotoUpdated(publicUrl)
      setTimeout(() => setUploadProgress(0), 1000)
    } catch (err: any) {
      setError(err.message || t('profile.photoUploader.uploadFailed'))
      setPreview(currentPhotoUrl || '')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      setUploading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      setPreview('')
      onPhotoUpdated('')
    } catch (err: any) {
      setError(err.message || t('profile.photoUploader.removeFailed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        {preview ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/40"
            />
            {!uploading && (
              <button
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[#0a0f1e]"
                title={t('profile.photoUploader.removePhoto')}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-purple-500/40">
            {initials}
          </div>
        )}
        
        {/* Upload progress */}
        {uploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-1" />
              <span className="text-xs text-white font-medium">{uploadProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload button */}
      <label className="cursor-pointer">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-white text-sm font-medium">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('profile.photoUploader.uploading')}
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              {preview ? t('profile.photoUploader.changePhoto') : t('profile.photoUploader.uploadPhoto')}
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      <p className="text-xs text-gray-400 text-center">
        {t('profile.photoUploader.formatHint')}
      </p>

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
