# Structured Profile Components - Integration Guide

## Overview
This migration adds structured, professional profile components with modals, autocomplete, and database storage.

## 🗄️ Step 1: Run Database Migration

Execute the SQL migration in Supabase:
```bash
supabase/migrations/20260418_structured_profile.sql
```

This creates 4 new tables:
- `user_experience` - Structured work history
- `user_education` - Education with types (University, Certification, etc.)
- `user_skills` - Skills with categories (Technical, Soft Skills, Languages, Tools)
- `user_achievements` - Projects and achievements

## 🔧 Step 2: Update Profile Page

In `app/profile/page.tsx`, add imports at the top:

```typescript
import ExperienceSection from '@/components/profile/ExperienceSection'
import EducationSection from '@/components/profile/EducationSection'
import SkillsSection from '@/components/profile/SkillsSection'
import AchievementsSection from '@/components/profile/AchievementsSection'
```

Replace the old "LinkedIn-style profile" section (around line 345-460) with:

```tsx
{/* Professional Profile - Headline & About */}
<div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
  <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Professional Profile <span className="text-red-400">*</span></h2>
  <Input
    label="Professional Headline"
    value={headline}
    onChange={setHeadline}
    placeholder="e.g. Software Engineer focused on backend systems and distributed apps"
    required
  />
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-200">About <span className="text-red-400">*</span></label>
    <textarea
      value={aboutMe}
      onChange={(e) => setAboutMe(e.target.value)}
      rows={4}
      placeholder="Write a short summary about yourself, your goals, and what makes you stand out..."
      className="w-full rounded-lg border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
      style={{ background: '#0a0f1e' }}
      required
    />
  </div>
</div>

{/* Experience Section - New Structured Component */}
<div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
  <ExperienceSection userId={user!.id} />
</div>

{/* Education Section - New Structured Component */}
<div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
  <EducationSection userId={user!.id} userCountry={country} />
</div>

{/* Skills Section - New Tag Selector Component */}
<div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
  <SkillsSection userId={user!.id} />
</div>

{/* Achievements Section - New Structured Component */}
<div className="rounded-2xl border border-white/10 p-5 space-y-5" style={{ background: '#111827' }}>
  <AchievementsSection userId={user!.id} />
</div>
```

## 🧹 Step 3: Clean Up Old State

Remove these old state variables from profile page (they're now handled by the components):

```typescript
// DELETE THESE:
const [experienceList, setExperienceList] = useState<string[]>([])
const [experienceInput, setExperienceInput] = useState('')
const [hasNoExperience, setHasNoExperience] = useState(false)
const [educationList, setEducationList] = useState<string[]>([])
const [educationInput, setEducationInput] = useState('')
const [projectsDetails, setProjectsDetails] = useState('')
const [skillsText, setSkillsText] = useState('')
```

Remove these functions (now in components):
- `addExperience()`
- `removeExperience()`
- `addEducation()`
- `removeEducation()`

Remove Experience/Education/Projects/Skills from the `handleSave` function - the new components save to their own tables.

## ✨ Features

### Experience Component
- ✅ Structured modal with separate fields for job title, company, dates, etc.
- ✅ Autocomplete for job titles and companies
- ✅ Employment type dropdown (Full-time, Part-time, etc.)
- ✅ "I currently work here" checkbox
- ✅ Month + Year dropdowns for dates
- ✅ 300-character description field
- ✅ Beautiful display cards with edit/delete buttons

### Education Component
- ✅ Dynamic forms based on education type
- ✅ University search with country-specific suggestions
- ✅ Certification fields (ID, URL, expiry)
- ✅ Online course/bootcamp support
- ✅ Grade/mention options
- ✅ Icon-based display (🎓, 📜, 💻, etc.)

### Skills Component
- ✅ Tag-based skill selector
- ✅ 4 categories with colored dots (🔵 Technical, 🟢 Soft Skills, 🟣 Languages, 🟠 Tools)
- ✅ Autocomplete suggestions per category
- ✅ Max 15 skills with counter
- ✅ Click X to remove skills

### Achievements Component
- ✅ Achievement types (🏆 Professional, 💻 Project, 📣 Speaking, 📝 Publication, 🥇 Award)
- ✅ Optional date (month + year)
- ✅ URL/link field for GitHub, articles, etc.
- ✅ 200-character description

## 📦 File Structure

```
components/profile/
  ├── ExperienceSection.tsx     (3.5KB)
  ├── EducationSection.tsx      (5KB)
  ├── SkillsSection.tsx          (2.5KB)
  └── AchievementsSection.tsx   (2.5KB)

lib/
  └── universities.ts           (University data by country)

supabase/migrations/
  └── 20260418_structured_profile.sql

app/profile/
  └── page.tsx                  (Updated)
```

## 🎨 Design

All components follow the existing dark theme with:
- Purple gradients and hover effects
- Dark cards (#111827)
- Modals with blur backdrop
- Smooth transitions
- Mobile responsive
- TypeScript interfaces

## 🔐 Security

Row Level Security (RLS) policies ensure users can only manage their own data.

## 🚀 Next Steps

1. Run the database migration in Supabase
2. Update the profile page imports and JSX
3. Remove old state variables
4. Test the new components
5. Optionally enhance with:
   - Drag-to-reorder cards (react-beautiful-dnd)
   - Framer Motion animations
   - More university database entries
   - Additional autocomplete data

Done! The profile is now fully structured and professional. 🎉
