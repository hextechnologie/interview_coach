'use client'

import { Clock, Coins } from 'lucide-react'

export interface DurationOption {
  minutes: number
  credits: number
  label: string
  isFree: boolean
}

export const DURATION_OPTIONS: DurationOption[] = [
  { minutes: 5, credits: 0, label: '5 minutes', isFree: true },
  { minutes: 15, credits: 10, label: '15 minutes', isFree: false },
  { minutes: 30, credits: 20, label: '30 minutes', isFree: false },
  { minutes: 45, credits: 30, label: '45 minutes', isFree: false },
  { minutes: 60, credits: 40, label: '60 minutes', isFree: false },
]

interface VoiceDurationSelectorProps {
  selectedDuration: number
  onSelectDuration: (minutes: number) => void
  userCredits: number
}

export default function VoiceDurationSelector({
  selectedDuration,
  onSelectDuration,
  userCredits
}: VoiceDurationSelectorProps) {
  const selectedOption = DURATION_OPTIONS.find(opt => opt.minutes === selectedDuration)
  const creditsAfter = selectedOption ? userCredits - selectedOption.credits : userCredits

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">How long do you want to practice?</h3>
        <p className="text-gray-400 text-sm">Choose your interview duration</p>
      </div>

      <div className="space-y-3">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = selectedDuration === option.minutes
          const canAfford = userCredits >= option.credits
          const isDisabled = !canAfford && !option.isFree

          return (
            <button
              key={option.minutes}
              onClick={() => !isDisabled && onSelectDuration(option.minutes)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                  : isDisabled
                  ? 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-semibold">{option.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {option.isFree ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                    FREE ✅
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className={`font-semibold ${isDisabled ? 'text-red-400' : 'text-yellow-400'}`}>
                      {option.credits} credits
                    </span>
                    {isDisabled && (
                      <span className="text-xs text-red-400">(insufficient)</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Credit Balance Summary */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Your balance:</span>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold">{userCredits} credits</span>
          </div>
        </div>

        {selectedOption && !selectedOption.isFree && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">This session:</span>
              <span className="text-red-400 font-semibold">-{selectedOption.credits} credits</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-white font-semibold">After interview:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className={`font-bold ${creditsAfter < 10 ? 'text-orange-400' : 'text-green-400'}`}>
                  {creditsAfter} credits
                </span>
              </div>
            </div>
          </>
        )}

        {creditsAfter < 10 && selectedOption && !selectedOption.isFree && (
          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-400 text-xs">
              ⚠️ Low balance after this session. Consider topping up credits.
            </p>
          </div>
        )}
      </div>

      {/* Need More Credits CTA */}
      {DURATION_OPTIONS.some(opt => !opt.isFree && userCredits < opt.credits) && (
        <div className="text-center">
          <a
            href="/credits"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition text-sm"
          >
            <Coins className="w-4 h-4" />
            Get More Credits
          </a>
        </div>
      )}
    </div>
  )
}

export function calculateCreditsRequired(durationMinutes: number): number {
  if (durationMinutes === 5) return 0
  return (durationMinutes / 15) * 10
}

export function checkCreditsForVoiceInterview(
  duration: number,
  userCredits: number
): { canStart: boolean; creditsNeeded: number } {
  if (duration === 5) return { canStart: true, creditsNeeded: 0 }
  
  const required = calculateCreditsRequired(duration)
  return {
    canStart: userCredits >= required,
    creditsNeeded: Math.max(0, required - userCredits)
  }
}
