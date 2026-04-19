'use client'

import { calculateProfileCompletion, getCompletionStatus, getMissingFields } from '@/lib/profile-utils'

interface ProfileCompletionBarProps {
  profile: any
}

export default function ProfileCompletionBar({ profile }: ProfileCompletionBarProps) {
  const completion = calculateProfileCompletion(profile)
  const status = getCompletionStatus(completion)
  const missingFields = getMissingFields(profile)

  return (
    <div className="rounded-xl border border-white/10 p-5" style={{ background: '#111827' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Profile Completion</h3>
        <span className={`text-sm font-bold ${status.color}`}>{completion}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className={`h-full ${status.bgColor} transition-all duration-500 ease-out`}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Status message */}
      <p className={`text-sm font-medium ${status.color} mb-2`}>
        {status.message}
      </p>

      {/* Missing fields */}
      {missingFields.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">
            Complete these to improve your profile:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((field, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10"
              >
                <span className="text-purple-400">+</span>
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
