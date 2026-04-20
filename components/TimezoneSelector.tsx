'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'

interface TimezoneOption {
  value: string
  label: string
  region: string
  offset: string
}

interface TimezoneSelectorProps {
  value: string
  onChange: (value: string) => void
  detectedTimezone?: string
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Europe
  { value: 'Europe/Paris', label: 'Paris', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/London', label: 'London', region: 'Europe', offset: 'UTC±0/+1' },
  { value: 'Europe/Berlin', label: 'Berlin', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Rome', label: 'Rome', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Madrid', label: 'Madrid', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Brussels', label: 'Brussels', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Vienna', label: 'Vienna', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Zurich', label: 'Zurich', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Athens', label: 'Athens', region: 'Europe', offset: 'UTC+2/+3' },
  { value: 'Europe/Istanbul', label: 'Istanbul', region: 'Europe', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Moscow', region: 'Europe', offset: 'UTC+3' },
  { value: 'Europe/Kiev', label: 'Kyiv', region: 'Europe', offset: 'UTC+2/+3' },
  { value: 'Europe/Dublin', label: 'Dublin', region: 'Europe', offset: 'UTC±0/+1' },
  { value: 'Europe/Lisbon', label: 'Lisbon', region: 'Europe', offset: 'UTC±0/+1' },
  { value: 'Europe/Stockholm', label: 'Stockholm', region: 'Europe', offset: 'UTC+1/+2' },
  { value: 'Europe/Warsaw', label: 'Warsaw', region: 'Europe', offset: 'UTC+1/+2' },
  
  // Africa
  { value: 'Africa/Algiers', label: 'Algiers', region: 'Africa', offset: 'UTC+1' },
  { value: 'Africa/Cairo', label: 'Cairo', region: 'Africa', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', region: 'Africa', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'Lagos', region: 'Africa', offset: 'UTC+1' },
  { value: 'Africa/Nairobi', label: 'Nairobi', region: 'Africa', offset: 'UTC+3' },
  { value: 'Africa/Casablanca', label: 'Casablanca', region: 'Africa', offset: 'UTC±0/+1' },
  { value: 'Africa/Tunis', label: 'Tunis', region: 'Africa', offset: 'UTC+1' },
  
  // Middle East
  { value: 'Asia/Riyadh', label: 'Riyadh', region: 'Middle East', offset: 'UTC+3' },
  { value: 'Asia/Dubai', label: 'Dubai', region: 'Middle East', offset: 'UTC+4' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', region: 'Middle East', offset: 'UTC+2/+3' },
  { value: 'Asia/Tehran', label: 'Tehran', region: 'Middle East', offset: 'UTC+3:30/+4:30' },
  { value: 'Asia/Baghdad', label: 'Baghdad', region: 'Middle East', offset: 'UTC+3' },
  { value: 'Asia/Kuwait', label: 'Kuwait', region: 'Middle East', offset: 'UTC+3' },
  { value: 'Asia/Beirut', label: 'Beirut', region: 'Middle East', offset: 'UTC+2/+3' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo', region: 'Asia', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai', region: 'Asia', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', region: 'Asia', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore', region: 'Asia', offset: 'UTC+8' },
  { value: 'Asia/Seoul', label: 'Seoul', region: 'Asia', offset: 'UTC+9' },
  { value: 'Asia/Bangkok', label: 'Bangkok', region: 'Asia', offset: 'UTC+7' },
  { value: 'Asia/Kolkata', label: 'Kolkata', region: 'Asia', offset: 'UTC+5:30' },
  { value: 'Asia/Karachi', label: 'Karachi', region: 'Asia', offset: 'UTC+5' },
  { value: 'Asia/Jakarta', label: 'Jakarta', region: 'Asia', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Manila', region: 'Asia', offset: 'UTC+8' },
  { value: 'Asia/Taipei', label: 'Taipei', region: 'Asia', offset: 'UTC+8' },
  { value: 'Asia/Dhaka', label: 'Dhaka', region: 'Asia', offset: 'UTC+6' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', region: 'Asia', offset: 'UTC+8' },
  
  // Americas
  { value: 'America/New_York', label: 'New York', region: 'Americas', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Chicago', region: 'Americas', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Denver', region: 'Americas', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Los Angeles', region: 'Americas', offset: 'UTC-8/-7' },
  { value: 'America/Phoenix', label: 'Phoenix', region: 'Americas', offset: 'UTC-7' },
  { value: 'America/Anchorage', label: 'Anchorage', region: 'Americas', offset: 'UTC-9/-8' },
  { value: 'America/Toronto', label: 'Toronto', region: 'Americas', offset: 'UTC-5/-4' },
  { value: 'America/Vancouver', label: 'Vancouver', region: 'Americas', offset: 'UTC-8/-7' },
  { value: 'America/Mexico_City', label: 'Mexico City', region: 'Americas', offset: 'UTC-6/-5' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', region: 'Americas', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', region: 'Americas', offset: 'UTC-3' },
  { value: 'America/Lima', label: 'Lima', region: 'Americas', offset: 'UTC-5' },
  { value: 'America/Bogota', label: 'Bogotá', region: 'Americas', offset: 'UTC-5' },
  { value: 'America/Caracas', label: 'Caracas', region: 'Americas', offset: 'UTC-4' },
  { value: 'America/Santiago', label: 'Santiago', region: 'Americas', offset: 'UTC-4/-3' },
  
  // Australia & Pacific
  { value: 'Australia/Sydney', label: 'Sydney', region: 'Australia & Pacific', offset: 'UTC+10/+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne', region: 'Australia & Pacific', offset: 'UTC+10/+11' },
  { value: 'Australia/Brisbane', label: 'Brisbane', region: 'Australia & Pacific', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Perth', region: 'Australia & Pacific', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'Auckland', region: 'Australia & Pacific', offset: 'UTC+12/+13' },
  { value: 'Pacific/Fiji', label: 'Fiji', region: 'Australia & Pacific', offset: 'UTC+12/+13' },
  { value: 'Pacific/Honolulu', label: 'Honolulu', region: 'Australia & Pacific', offset: 'UTC-10' },
  
  // UTC
  { value: 'UTC', label: 'UTC', region: 'UTC', offset: 'UTC±0' },
]

export default function TimezoneSelector({ value, onChange, detectedTimezone }: TimezoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showDetected, setShowDetected] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const detected = detectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const selectedOption = TIMEZONE_OPTIONS.find(opt => opt.value === value)
  const detectedOption = TIMEZONE_OPTIONS.find(opt => opt.value === detected)

  // Filter timezones based on search
  const filteredTimezones = TIMEZONE_OPTIONS.filter(tz =>
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.region.toLowerCase().includes(search.toLowerCase()) ||
    tz.value.toLowerCase().includes(search.toLowerCase())
  )

  // Group by region
  const groupedTimezones = filteredTimezones.reduce((acc, tz) => {
    if (!acc[tz.region]) acc[tz.region] = []
    acc[tz.region].push(tz)
    return acc
  }, {} as Record<string, TimezoneOption[]>)

  // Region order
  const regionOrder = ['Europe', 'Africa', 'Middle East', 'Asia', 'Americas', 'Australia & Pacific', 'UTC']
  const sortedRegions = regionOrder.filter(region => groupedTimezones[region])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleUseDetected = () => {
    onChange(detected)
    setShowDetected(false)
    setIsOpen(false)
  }

  const handleSelectTimezone = (timezone: string) => {
    onChange(timezone)
    setIsOpen(false)
    setSearch('')
    setShowDetected(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Detected Timezone Banner */}
      {showDetected && detectedOption && value !== detected && (
        <div className="mb-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">
              🌍 Detected: <span className="font-medium text-purple-400">{detectedOption.label} ({detectedOption.offset})</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseDetected}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors px-3 py-1 rounded border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/20"
            >
              Use Detected
            </button>
            <button
              type="button"
              onClick={() => setShowDetected(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white transition-all hover:border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        {selectedOption ? (
          <span>
            {selectedOption.label} <span className="text-gray-400">({selectedOption.offset})</span>
          </span>
        ) : (
          <span className="text-gray-400">Select timezone...</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-white/20 bg-gray-900 shadow-2xl">
          {/* Search Input - Sticky */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-gray-900 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search timezones..."
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Timezone List - Scrollable */}
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {sortedRegions.length > 0 ? (
              sortedRegions.map((region) => (
                <div key={region}>
                  {/* Region Header */}
                  <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-gray-400 border-b border-white/5">
                    ── {region.toUpperCase()} ──
                  </div>
                  
                  {/* Timezone Options */}
                  {groupedTimezones[region].map((tz) => (
                    <button
                      key={tz.value}
                      type="button"
                      onClick={() => handleSelectTimezone(tz.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        value === tz.value
                          ? 'bg-purple-900/30 text-purple-400 font-medium'
                          : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                      }`}
                    >
                      <span>{tz.label}</span>
                      <span className="text-xs text-gray-500">{tz.offset}</span>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No timezones found
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(147 51 234 / 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(147 51 234 / 0.7);
        }
      `}</style>
    </div>
  )
}
