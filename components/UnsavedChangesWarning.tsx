'use client'

import { AlertCircle, Save, X } from 'lucide-react'

interface UnsavedChangesWarningProps {
  hasUnsavedChanges: boolean
  onSave: () => void
  onDiscard: () => void
}

export default function UnsavedChangesWarning({
  hasUnsavedChanges,
  onSave,
  onDiscard,
}: UnsavedChangesWarningProps) {
  if (!hasUnsavedChanges) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4 duration-300">
      <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 backdrop-blur-md px-4 py-3 shadow-lg flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
        <p className="text-sm font-medium text-yellow-200">
          You have unsaved changes!
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Now
          </button>
          <button
            onClick={onDiscard}
            className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
