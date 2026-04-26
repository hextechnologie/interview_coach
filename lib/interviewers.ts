export interface Interviewer {
  id: string
  name: string
  title: string
  voice: 'nova' | 'onyx' | 'shimmer'
  personality: string
  questionStyle: string
  avatar: string
  description: string[]
}

export const INTERVIEWERS: Interviewer[] = [
  {
    id: 'hr',
    name: 'Sarah',
    title: 'HR Manager',
    voice: 'nova',
    personality: 'Friendly, focuses on behavior and culture fit',
    questionStyle: 'behavioral',
    avatar: '👔',
    description: ['Behavioral questions', 'Culture fit', 'Soft skills', 'Work style'],
  },
  {
    id: 'tech',
    name: 'Marcus',
    title: 'Technical Lead',
    voice: 'onyx',
    personality: 'Direct, analytical, asks follow-up questions',
    questionStyle: 'technical',
    avatar: '💻',
    description: ['Technical questions', 'Coding/System design', 'Problem solving', 'Best practices'],
  },
  {
    id: 'manager',
    name: 'Claire',
    title: 'Department Manager',
    voice: 'shimmer',
    personality: 'Strategic, leadership focused',
    questionStyle: 'managerial',
    avatar: '🏢',
    description: ['Strategic questions', 'Team/Leadership', 'Vision/Goals', 'Management style'],
  },
]
