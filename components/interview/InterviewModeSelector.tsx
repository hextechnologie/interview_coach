'use client'

import { MessageSquare, Mic } from 'lucide-react'

interface InterviewModeSelectorProps {
  selectedMode: 'chat' | 'voice'
  onSelectMode: (mode: 'chat' | 'voice') => void
}

export default function InterviewModeSelector({ selectedMode, onSelectMode }: InterviewModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Interview Mode</h2>
        <p className="text-gray-400 text-sm">Select how you want to practice your interview</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Chat Interview Mode */}
        <button
          onClick={() => onSelectMode('chat')}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedMode === 'chat'
              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          {selectedMode === 'chat' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">💬 Chat Interview</h3>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Text-based Q&A</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Type your answers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Instant AI feedback</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Review at your own pace</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              FREE with your plan
            </span>
          </div>
        </button>

        {/* Voice Interview Mode */}
        <button
          onClick={() => onSelectMode('voice')}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedMode === 'voice'
              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          {selectedMode === 'voice' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🎙️ Voice Interview</h3>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Real call experience</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Speak your answers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>AI talks to you</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Multiple panel members</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                5 min FREE
              </span>
              <span className="text-gray-500 text-xs">then credits required</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
