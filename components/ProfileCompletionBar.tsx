'use client'

import { calculateProfileCompletion, getCompletionStatus, getMissingFields } from '@/lib/profile-utils'
import { useLanguage } from '@/components/LanguageProvider'

interface ProfileCompletionBarProps {
  profile: any
}

export default function ProfileCompletionBar({ profile }: ProfileCompletionBarProps) {
  const { t } = useLanguage()
  const completion = calculateProfileCompletion(profile)
  const status = getCompletionStatus(completion)
  const missingFields = getMissingFields(profile)

  const statusTextMap: Record<string, string> = {
    'Profile complete! ✅': t('profile.completion.status.complete'),
    'Almost complete!': t('profile.completion.status.almostComplete'),
    'Getting there!': t('profile.completion.status.gettingThere'),
    'Just getting started': t('profile.completion.status.justGettingStarted'),
  }

  const missingFieldMap: Record<string, string> = {
    'Add your full name': t('profile.completion.missing.fullName'),
    'Add profile photo': t('profile.completion.missing.profilePhoto'),
    'Add location': t('profile.completion.missing.location'),
    'Add bio (min 50 characters)': t('profile.completion.missing.bio'),
    'Add current status': t('profile.completion.missing.currentStatus'),
    'Add target job role': t('profile.completion.missing.targetJobRole'),
    'Add work experience': t('profile.completion.missing.workExperience'),
    'Add education details': t('profile.completion.missing.educationDetails'),
    'Add at least 3 skills': t('profile.completion.missing.skills'),
    'Add LinkedIn URL': t('profile.completion.missing.linkedin'),
  }

  return (
    <div className="rounded-xl border border-white/10 p-5" style={{ background: '#111827' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">{t('profile.completion.title')}</h3>
        <span className={`text-sm font-bold ${status.color}`}>{completion}%</span>
      </div>

      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className={`h-full ${status.bgColor} transition-all duration-500 ease-out`}
          style={{ width: `${completion}%` }}
        />
      </div>

      <p className={`text-sm font-medium ${status.color} mb-2`}>
        {statusTextMap[status.message] || status.message}
      </p>

      {missingFields.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">
            {t('profile.completion.completeThese')}
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((field, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10"
              >
                <span className="text-purple-400">+</span>
                {missingFieldMap[field] || field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
