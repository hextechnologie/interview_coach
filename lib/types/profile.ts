// ============================================================
// Structured Coach Profile Types
// ============================================================

export type EmploymentType = 'Full-time' | 'Part-time' | 'Freelance' | 'Internship' | 'Contract' | 'Self-employed'

export type EducationType = 'University' | 'Certification' | 'High School' | 'Online Course' | 'Vocational' | 'Other'

export type SkillCategory = 'Technical' | 'Soft Skills' | 'Languages' | 'Tools'

export type AchievementType = 'Professional Achievement' | 'Project' | 'Public Speaking' | 'Publication' | 'Award' | 'Other'

export interface CoachExperience {
  id: string
  coach_id: string
  job_title: string
  company_name: string
  employment_type?: EmploymentType
  location?: string
  start_month?: number
  start_year: number
  end_month?: number
  end_year?: number
  is_current: boolean
  description?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CoachEducation {
  id: string
  coach_id: string
  education_type: EducationType
  institution_name: string
  degree?: string
  field_of_study?: string
  start_year?: number
  end_year?: number
  is_ongoing: boolean
  grade?: string
  specialization?: string
  platform?: string
  credential_id?: string
  credential_url?: string
  issue_month?: number
  issue_year?: number
  expiry_month?: number
  expiry_year?: number
  no_expiry: boolean
  description?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CoachSkill {
  id: string
  coach_id: string
  skill_name: string
  skill_category: SkillCategory
  order_index: number
  created_at: string
}

export interface CoachAchievement {
  id: string
  coach_id: string
  achievement_type?: AchievementType
  title: string
  description?: string
  achievement_month?: number
  achievement_year?: number
  url?: string
  order_index: number
  created_at: string
  updated_at: string
}

// Form data types (without server-generated fields)
export type ExperienceFormData = Omit<CoachExperience, 'id' | 'coach_id' | 'created_at' | 'updated_at' | 'order_index'>

export type EducationFormData = Omit<CoachEducation, 'id' | 'coach_id' | 'created_at' | 'updated_at' | 'order_index'>

export type SkillFormData = Omit<CoachSkill, 'id' | 'coach_id' | 'created_at' | 'order_index'>

export type AchievementFormData = Omit<CoachAchievement, 'id' | 'coach_id' | 'created_at' | 'updated_at' | 'order_index'>

// Month names for date dropdowns
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

// Generate years array (2000-2028)
export const YEARS = Array.from({ length: 29 }, (_, i) => 2000 + i)

// Employment types
export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Freelance',
  'Internship',
  'Contract',
  'Self-employed',
]

// Education types
export const EDUCATION_TYPES: Array<{ value: EducationType; label: string; icon: string }> = [
  { value: 'University', label: 'University / College', icon: '🎓' },
  { value: 'Certification', label: 'Professional Certification', icon: '📜' },
  { value: 'High School', label: 'High School / Baccalaureate', icon: '🏫' },
  { value: 'Online Course', label: 'Online Course / Bootcamp', icon: '💻' },
  { value: 'Vocational', label: 'Vocational Training', icon: '🔧' },
  { value: 'Other', label: 'Other', icon: '📚' },
]

// Degree types
export const DEGREE_TYPES = [
  "Bachelor's (Licence)",
  "Master's",
  "PhD",
  "Engineer Diploma",
  "DUT",
  "BTS",
  "Other",
]

// Grade options
export const GRADES = [
  'Excellent (Très bien)',
  'Very Good (Bien)',
  'Good (Assez bien)',
  'Pass (Passable)',
]

// Baccalaureate specializations
export const BAC_SPECIALIZATIONS = [
  'Sciences',
  'Mathematics',
  'Literature',
  'Economics',
  'Technology',
  'Other',
]

// Online course platforms
export const COURSE_PLATFORMS = [
  'Coursera',
  'Udemy',
  'edX',
  'Le Wagon',
  'Simplon',
  'OpenClassrooms',
  'YouTube',
  'LinkedIn Learning',
  'Udacity',
  'Other',
]

// Popular skill suggestions by category
export const SKILL_SUGGESTIONS: Record<SkillCategory, string[]> = {
  Technical: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Django', 'Flask', 'Spring Boot',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
    'VHDL', 'Verilog', 'SystemVerilog', 'FPGA', 'ASIC Design', 'RTL Design',
    'Embedded Systems', 'Microcontrollers', 'ARM', 'RISC-V',
    'Circuit Design', 'PCB Design', 'Analog Design', 'Digital Signal Processing',
  ],
  'Soft Skills': [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
    'Critical Thinking', 'Adaptability', 'Creativity', 'Negotiation', 'Conflict Resolution',
    'Project Management', 'Strategic Planning', 'Decision Making', 'Mentoring',
  ],
  Languages: [
    'English', 'French', 'Arabic', 'Spanish', 'German', 'Chinese', 'Japanese',
    'Portuguese', 'Russian', 'Italian', 'Korean', 'Dutch', 'Turkish',
  ],
  Tools: [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Trello', 'Asana', 'Slack',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'VS Code', 'IntelliJ', 'Eclipse', 'Vim',
    'Salesforce', 'HubSpot', 'SAP', 'Oracle', 'Tableau', 'Power BI',
    'Xilinx Vivado', 'Intel Quartus', 'ModelSim', 'Cadence', 'Synopsys',
    'Altium Designer', 'Eagle', 'KiCad', 'MATLAB', 'Simulink', 'LabVIEW',
  ],
}

// Achievement icons
export const ACHIEVEMENT_ICONS: Record<AchievementType, string> = {
  'Professional Achievement': '🏆',
  'Project': '💻',
  'Public Speaking': '📣',
  'Publication': '📝',
  'Award': '🥇',
  'Other': '⭐',
}

// Popular job titles for autocomplete
export const JOB_TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Engineer',
  'Tech Lead',
  'Engineering Manager',
  'CTO',
  'Product Manager',
  'Senior Product Manager',
  'Product Owner',
  'Data Scientist',
  'Data Analyst',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'UX Designer',
  'UI Designer',
  'Product Designer',
  'Graphic Designer',
  'Business Analyst',
  'Project Manager',
  'Scrum Master',
  'QA Engineer',
  'Test Engineer',
]

// Popular companies
export const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Tesla',
  'IBM', 'Oracle', 'SAP', 'Adobe', 'Salesforce', 'Intel', 'NVIDIA',
  'McKinsey', 'Boston Consulting Group', 'Bain & Company', 'Deloitte',
  'PwC', 'EY', 'KPMG', 'Accenture', 'Capgemini',
  'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Citibank', 'Bank of America',
  'Airbnb', 'Uber', 'Lyft', 'Spotify', 'Twitter', 'LinkedIn', 'Snapchat',
]

// Popular certification names
export const CERTIFICATIONS = [
  'AWS Certified Solutions Architect',
  'AWS Certified Developer',
  'Google Cloud Professional',
  'Azure Fundamentals',
  'Azure Administrator',
  'PMP - Project Management Professional',
  'CISSP',
  'Scrum Master (CSM)',
  'Product Owner (CSPO)',
  'CFA - Chartered Financial Analyst',
  'IELTS',
  'TOEFL',
  'DELF/DALF',
  'Six Sigma Green Belt',
  'Six Sigma Black Belt',
  'ITIL Certification',
]
