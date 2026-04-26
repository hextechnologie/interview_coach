'use client'

import { Check } from 'lucide-react'
import { INTERVIEWERS, type Interviewer } from '@/lib/interviewers'
export { INTERVIEWERS, type Interviewer }

interface VoicePanelSelectorProps {
  selectedPanelIds: string[]
  onTogglePanel: (interviewerId: string) => void
}

export default function VoicePanelSelector({ selectedPanelIds, onTogglePanel }: VoicePanelSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Who will interview you today?</h3>
        <p className="text-gray-400 text-sm">Select 1 to 3 panel members</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {INTERVIEWERS.map((interviewer) => {
          const isSelected = selectedPanelIds.includes(interviewer.id)
          const isDisabled = !isSelected && selectedPanelIds.length >= 3

          return (
            <button
              key={interviewer.id}
              onClick={() => !isDisabled && onTogglePanel(interviewer.id)}
              disabled={isDisabled}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                  : isDisabled
                  ? 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 cursor-pointer'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{interviewer.avatar}</div>
                <h4 className="text-lg font-bold text-white">{interviewer.name}</h4>
                <p className="text-sm text-gray-400">{interviewer.title}</p>
              </div>

              <div className="space-y-2">
                {interviewer.description.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {selectedPanelIds.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-purple-400 font-semibold">Selected panel:</span>
              <div className="flex gap-2">
                {selectedPanelIds.map(id => {
                  const interviewer = INTERVIEWERS.find(i => i.id === id)
                  return (
                    <span key={id} className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 rounded-full text-sm text-white flex items-center gap-1">
                      <span>{interviewer?.avatar}</span>
                      <span>{interviewer?.name}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Your interview will include questions from {selectedPanelIds.length} interviewer{selectedPanelIds.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
