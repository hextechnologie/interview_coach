/**
 * Profile utilities for name capitalization and completion calculation
 */

/**
 * Capitalize first letter of each word in a name
 * "abdelkarim boudara" → "Abdelkarim Boudara"
 */
export function capitalizeName(name: string): string {
  if (!name) return ''
  
  return name
    .trim()
    .split(' ')
    .map(word => {
      if (!word) return ''
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Calculate profile completion percentage
 * Each field = 10%, total 100%
 */
export function calculateProfileCompletion(profile: any): number {
  let completion = 0
  
  // First + Last name (10%)
  if (profile.first_name?.trim() && profile.last_name?.trim()) {
    completion += 10
  }
  
  // Profile photo (10%)
  if (profile.avatar_url) {
    completion += 10
  }
  
  // Country + City (10%)
  if (profile.country?.trim() && profile.city?.trim()) {
    completion += 10
  }
  
  // Bio (10%)
  if (profile.bio?.trim() && profile.bio.trim().length >= 50) {
    completion += 10
  }
  
  // Current Status (10%)
  if (profile.current_status?.trim()) {
    completion += 10
  }
  
  // Target Job Role (10%)
  if (profile.target_job_role?.trim()) {
    completion += 10
  }
  
  // Work Experience (10%)
  // Check if experience_details exists and is not the default "No experience"
  if (profile.experience_details?.trim() && profile.experience_details !== 'No experience') {
    completion += 10
  }
  
  // Education (10%)
  if (profile.education_details?.trim() && profile.education_details.length >= 20) {
    completion += 10
  }
  
  // Skills - minimum 3 required (10%)
  if (Array.isArray(profile.skills) && profile.skills.length >= 3) {
    completion += 10
  }
  
  // LinkedIn URL (10%)
  if (profile.linkedin_url?.trim() && profile.linkedin_url.includes('linkedin.com')) {
    completion += 10
  }
  
  return completion
}

/**
 * Get missing profile fields for showing completion hints
 */
export function getMissingFields(profile: any): string[] {
  const missing: string[] = []
  
  if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
    missing.push('Add your full name')
  }
  
  if (!profile.avatar_url) {
    missing.push('Add profile photo')
  }
  
  if (!profile.country?.trim() || !profile.city?.trim()) {
    missing.push('Add location')
  }
  
  if (!profile.bio?.trim() || profile.bio.trim().length < 50) {
    missing.push('Add bio (min 50 characters)')
  }
  
  if (!profile.current_status?.trim()) {
    missing.push('Add current status')
  }
  
  if (!profile.target_job_role?.trim()) {
    missing.push('Add target job role')
  }
  
  if (!profile.experience_details?.trim() || profile.experience_details === 'No experience') {
    missing.push('Add work experience')
  }
  
  if (!profile.education_details?.trim() || profile.education_details.length < 20) {
    missing.push('Add education details')
  }
  
  if (!Array.isArray(profile.skills) || profile.skills.length < 3) {
    missing.push('Add at least 3 skills')
  }
  
  if (!profile.linkedin_url?.trim() || !profile.linkedin_url.includes('linkedin.com')) {
    missing.push('Add LinkedIn URL')
  }
  
  return missing
}

/**
 * Get completion status message and color
 */
export function getCompletionStatus(percentage: number): {
  message: string
  color: string
  bgColor: string
} {
  if (percentage === 100) {
    return {
      message: 'Profile complete! ✅',
      color: 'text-green-400',
      bgColor: 'bg-green-500'
    }
  } else if (percentage >= 71) {
    return {
      message: 'Almost complete!',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500'
    }
  } else if (percentage >= 41) {
    return {
      message: 'Getting there!',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500'
    }
  } else {
    return {
      message: 'Just getting started',
      color: 'text-red-400',
      bgColor: 'bg-red-500'
    }
  }
}

/**
 * Get initials from name for avatar
 */
export function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return '?'
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return true // Empty is valid (optional field)
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if profile has minimum required fields to start an interview
 * Only checks 5 essential fields - rest are optional
 */
export function canStartInterview(profile: any): boolean {
  if (!profile) return false
  
  const requiredFields = [
    profile.first_name,
    profile.last_name,
    profile.country,
    profile.current_status,
    profile.target_job_role,
  ]

  // Only block if ANY required field is empty
  return requiredFields.every(field =>
    field !== null &&
    field !== undefined &&
    field.toString().trim() !== ''
  )
}

/**
 * Get list of missing required fields for interview
 * Returns user-friendly field names
 */
export function getMissingRequiredFields(profile: any): string[] {
  if (!profile) return ['First Name', 'Last Name', 'Country', 'Current Status', 'Target Job Role']
  
  const missing: string[] = []
  
  if (!profile.first_name?.trim()) missing.push('First Name')
  if (!profile.last_name?.trim()) missing.push('Last Name')
  if (!profile.country?.trim()) missing.push('Country')
  if (!profile.current_status?.trim()) missing.push('Current Status')
  if (!profile.target_job_role?.trim()) missing.push('Target Job Role')
  
  return missing
}

/**
 * Get country flag emoji from country name
 */
export function getCountryFlag(countryName: string): string {
  const countryFlags: Record<string, string> = {
    'Afghanistan': '🇦🇫',
    'Albania': '🇦🇱',
    'Algeria': '🇩🇿',
    'Andorra': '🇦🇩',
    'Angola': '🇦🇴',
    'Argentina': '🇦🇷',
    'Armenia': '🇦🇲',
    'Australia': '🇦🇺',
    'Austria': '🇦🇹',
    'Azerbaijan': '🇦🇿',
    'Bahrain': '🇧🇭',
    'Bangladesh': '🇧🇩',
    'Belarus': '🇧🇾',
    'Belgium': '🇧🇪',
    'Bolivia': '🇧🇴',
    'Bosnia and Herzegovina': '🇧🇦',
    'Brazil': '🇧🇷',
    'Bulgaria': '🇧🇬',
    'Cambodia': '🇰🇭',
    'Cameroon': '🇨🇲',
    'Canada': '🇨🇦',
    'Chile': '🇨🇱',
    'China': '🇨🇳',
    'Colombia': '🇨🇴',
    'Costa Rica': '🇨🇷',
    'Croatia': '🇭🇷',
    'Cuba': '🇨🇺',
    'Cyprus': '🇨🇾',
    'Czech Republic': '🇨🇿',
    'Denmark': '🇩🇰',
    'Dominican Republic': '🇩🇴',
    'Ecuador': '🇪🇨',
    'Egypt': '🇪🇬',
    'Estonia': '🇪🇪',
    'Ethiopia': '🇪🇹',
    'Finland': '🇫🇮',
    'France': '🇫🇷',
    'Georgia': '🇬🇪',
    'Germany': '🇩🇪',
    'Ghana': '🇬🇭',
    'Greece': '🇬🇷',
    'Guatemala': '🇬🇹',
    'Honduras': '🇭🇳',
    'Hong Kong': '🇭🇰',
    'Hungary': '🇭🇺',
    'Iceland': '🇮🇸',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Iran': '🇮🇷',
    'Iraq': '🇮🇶',
    'Ireland': '🇮🇪',
    'Israel': '🇮🇱',
    'Italy': '🇮🇹',
    'Ivory Coast': '🇨🇮',
    'Jamaica': '🇯🇲',
    'Japan': '🇯🇵',
    'Jordan': '🇯🇴',
    'Kazakhstan': '🇰🇿',
    'Kenya': '🇰🇪',
    'Kuwait': '🇰🇼',
    'Latvia': '🇱🇻',
    'Lebanon': '🇱🇧',
    'Libya': '🇱🇾',
    'Lithuania': '🇱🇹',
    'Luxembourg': '🇱🇺',
    'Malaysia': '🇲🇾',
    'Malta': '🇲🇹',
    'Mexico': '🇲🇽',
    'Moldova': '🇲🇩',
    'Morocco': '🇲🇦',
    'Myanmar': '🇲🇲',
    'Nepal': '🇳🇵',
    'Netherlands': '🇳🇱',
    'New Zealand': '🇳🇿',
    'Nigeria': '🇳🇬',
    'North Macedonia': '🇲🇰',
    'Norway': '🇳🇴',
    'Oman': '🇴🇲',
    'Pakistan': '🇵🇰',
    'Palestine': '🇵🇸',
    'Panama': '🇵🇦',
    'Peru': '🇵🇪',
    'Philippines': '🇵🇭',
    'Poland': '🇵🇱',
    'Portugal': '🇵🇹',
    'Qatar': '🇶🇦',
    'Romania': '🇷🇴',
    'Russia': '🇷🇺',
    'Saudi Arabia': '🇸🇦',
    'Senegal': '🇸🇳',
    'Serbia': '🇷🇸',
    'Singapore': '🇸🇬',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'South Africa': '🇿🇦',
    'South Korea': '🇰🇷',
    'Spain': '🇪🇸',
    'Sri Lanka': '🇱🇰',
    'Sudan': '🇸🇩',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Syria': '🇸🇾',
    'Taiwan': '🇹🇼',
    'Tanzania': '🇹🇿',
    'Thailand': '🇹🇭',
    'Tunisia': '🇹🇳',
    'Turkey': '🇹🇷',
    'Uganda': '🇺🇬',
    'Ukraine': '🇺🇦',
    'United Arab Emirates': '🇦🇪',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Uruguay': '🇺🇾',
    'Uzbekistan': '🇺🇿',
    'Venezuela': '🇻🇪',
    'Vietnam': '🇻🇳',
    'Yemen': '🇾🇪',
    'Zimbabwe': '🇿🇼',
  }
  
  return countryFlags[countryName] || '🌍'
}

/**
 * Get timezone from country (basic mapping)
 */
export function getTimezoneFromCountry(country: string): string {
  const timezoneMap: Record<string, string> = {
    'United States': 'America/New_York',
    'Canada': 'America/Toronto',
    'United Kingdom': 'Europe/London',
    'France': 'Europe/Paris',
    'Germany': 'Europe/Berlin',
    'Spain': 'Europe/Madrid',
    'Italy': 'Europe/Rome',
    'Netherlands': 'Europe/Amsterdam',
    'Belgium': 'Europe/Brussels',
    'Switzerland': 'Europe/Zurich',
    'Austria': 'Europe/Vienna',
    'Poland': 'Europe/Warsaw',
    'Sweden': 'Europe/Stockholm',
    'Norway': 'Europe/Oslo',
    'Denmark': 'Europe/Copenhagen',
    'Finland': 'Europe/Helsinki',
    'Portugal': 'Europe/Lisbon',
    'Greece': 'Europe/Athens',
    'Ireland': 'Europe/Dublin',
    'India': 'Asia/Kolkata',
    'China': 'Asia/Shanghai',
    'Japan': 'Asia/Tokyo',
    'South Korea': 'Asia/Seoul',
    'Singapore': 'Asia/Singapore',
    'Australia': 'Australia/Sydney',
    'New Zealand': 'Pacific/Auckland',
    'Brazil': 'America/Sao_Paulo',
    'Mexico': 'America/Mexico_City',
    'Argentina': 'America/Argentina/Buenos_Aires',
    'Chile': 'America/Santiago',
    'Colombia': 'America/Bogota',
    'Peru': 'America/Lima',
    'South Africa': 'Africa/Johannesburg',
    'Nigeria': 'Africa/Lagos',
    'Kenya': 'Africa/Nairobi',
    'Egypt': 'Africa/Cairo',
    'Morocco': 'Africa/Casablanca',
    'Saudi Arabia': 'Asia/Riyadh',
    'United Arab Emirates': 'Asia/Dubai',
    'Turkey': 'Europe/Istanbul',
    'Russia': 'Europe/Moscow',
    'Israel': 'Asia/Jerusalem',
    'Thailand': 'Asia/Bangkok',
    'Vietnam': 'Asia/Ho_Chi_Minh',
    'Philippines': 'Asia/Manila',
    'Indonesia': 'Asia/Jakarta',
    'Malaysia': 'Asia/Kuala_Lumpur',
    'Pakistan': 'Asia/Karachi',
    'Bangladesh': 'Asia/Dhaka',
  }
  
  return timezoneMap[country] || 'UTC'
}
