# CLAUDE.md — Project Context for Claude Code

## Project Overview

**Interview Coach** — An AI-powered interview preparation platform with a two-sided marketplace. Candidates practice with an AI interviewer (text and voice modes) and can also book sessions with real human coaches. Coaches manage their profiles, availability, templates, and earnings. The platform is monetized through a credits system (1 credit = $1 USD) and Stripe subscriptions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| AI — Interview | Anthropic Claude Sonnet 4.6 (`@anthropic-ai/sdk`) |
| AI — Voice STT | OpenAI Whisper |
| AI — Voice TTS | OpenAI TTS |
| Payments | Stripe (subscriptions + webhook) |
| Email | Resend |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Document Parsing | Mammoth (`.docx`), pdfjs-dist (`.pdf`) |
| Runtime | Node.js (Next.js API routes) |

---

## Project Structure

```
/app                  — Next.js App Router pages and API routes
  /api                — Server-side API routes (21 routes)
    /interview        — AI interview: create, question, answer, translate, summary
    /interview/voice  — Voice interview: create, question, feedback, transcribe, tts
    /stripe           — Checkout, portal, webhook
    /credits          — Credit purchase
    /bookings         — Booking checkout and cancellation
    /earnings         — Coach withdrawal (Stripe Connect — TODO)
    /reviews          — Review CRUD
    /notifications    — Notification creation
    /contact          — Contact form
    /welcome          — Welcome email trigger
  /login              — Auth pages
  /signup/candidate
  /signup/coach
  /forgot-password
  /reset-password
  /dashboard          — Candidate dashboard
  /profile            — Candidate profile editor
  /bookings           — Candidate bookings list
  /credits            — Credit purchase page
  /interview/[id]     — Active AI interview session
  /interview/setup    — Interview setup wizard
  /interview/voice/[sessionId] — Active voice interview session
  /interview/summary/[id]      — Post-interview feedback summary
  /coaches            — Coach marketplace (browse)
  /coaches/[id]       — Individual coach public profile
  /candidates/[id]    — Candidate public profile
  /book/[coachId]     — Book a session with a coach
  /session/[id]       — Active coaching session
  /review/[sessionId] — Post-session review page
  /coach/dashboard    — Coach main dashboard
  /coach/profile      — Coach profile editor
  /coach/templates    — Interview template management
  /coach/availability — Availability management
  /coach/earnings     — Earnings overview and withdrawal
  /coach/messages     — Coach messaging inbox
  /jobs               — Job listings browser
  /pricing            — Pricing page
  /contact            — Contact form
  /about, /faq, /privacy, /terms — Static info pages
  /earnings/withdraw  — Earnings withdrawal page

/components           — Reusable React components
  /coach              — Coach-specific components (experience, education, achievements, skills cards)
  /profile            — Candidate profile section components
  /ui                 — Generic UI primitives (Button, Input, etc.)
  AuthProvider.tsx    — Supabase auth context + session management
  LanguageProvider.tsx — i18n context (EN, ES, FR, AR)
  ThemeProvider.tsx   — Dark/light mode context
  InterviewModeSelector.tsx
  MicrophoneRecorder.tsx
  VoicePanelSelector.tsx, VoiceDurationSelector.tsx
  AchievementBadge.tsx, AnimatedScoreRing.tsx, MetricBar.tsx
  ProfilePhotoUploader.tsx, ProfileCompletionBar.tsx
  SidebarNav.tsx, CoachNavbar.tsx
  CreditBalanceButton.tsx
  NotificationBell.tsx
  CancellationModal.tsx, DeleteAccountModal.tsx, ChangePasswordModal.tsx

/lib                  — Utilities and API clients
  supabase.ts         — Supabase client + shared types
  claude.ts           — Anthropic SDK client + interview logic
  stripe.ts           — Stripe client + subscription tiers
  auth.ts             — Cookie-based auth helpers for API routes
  credits.ts          — Credit system logic
  coach-marketplace.ts — Marketplace types + mock coach data
  interview-personalization.ts — Resume/JD keyword extraction
  jobs-api.ts         — Job listings integration
  metadata.ts         — SEO metadata helpers
  profile-utils.ts    — Profile helper functions
  countries.ts, locations.ts — Location data
  universities.ts, data/universities.ts — University autocomplete data
  types/profile.ts    — Coach profile types + 500+ skill suggestions
  types/jobs.ts
  types/credits.ts

/supabase/migrations  — All database migrations (run in order)
/locales              — i18n translation files: en.json, es.json, fr.json, ar.json
/public               — Static assets
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | All users (candidates and coaches). Extends `auth.users`. Columns: `id`, `email`, `full_name`, `first_name`, `last_name`, `user_type` (`candidate`/`coach`/`both`), `role` (`candidate`/`coach`/`admin`), `avatar_url`, `target_job_field`, `experience_level`, `subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`, `interviews_used_this_month`, `interviews_limit`, `created_at`, `updated_at` |
| `interview_sessions` | AI interview sessions. Columns: `id`, `user_id`, `job_role`, `industry`, `difficulty_level`, `status`, `overall_score`, `started_at`, `completed_at`, `total_questions`, `questions_answered`, `interview_config` (JSONB) |
| `interview_answers` | Individual Q&A pairs. Columns: `id`, `session_id`, `question_number`, `question_text`, `user_answer`, `ai_feedback` (JSONB), `score` |
| `subscription_history` | Stripe subscription events log |
| `contact_messages` | Contact form submissions |

### Coach Marketplace Tables

| Table | Purpose |
|---|---|
| `coach_profiles` | Coach details: `title`, `bio`, `years_experience`, `price_per_hour`, `credits_per_hour`, `rating`, `total_sessions`, `linkedin_url`, `languages[]`, `companies[]`, `intro_call_enabled`, `stripe_connect_account_id`, `is_verified`, `specializations` (JSONB), `companies_worked` (JSONB), `profile_completed` |
| `coach_specializations` | Coach specialization tags (normalized) |
| `availability` | Individual availability slots with `date`, `start_time`, `end_time`, `is_booked`, `buffer_minutes` |
| `coach_availability` | Coach-level availability config: `slots` (JSONB), `blocked_dates` (JSONB), `buffer_minutes` |
| `bookings` | Candidate-coach bookings: `candidate_id`, `coach_id`, `slot_id`, `status`, `stripe_payment_id`, `credits_cost`, `cancellation_deadline`, `cancelled_at`, `session_type`, `daily_room_url`, `google_calendar_url` |
| `reviews` | Post-booking 1–5 star reviews with `comment` and `recommend_coach` |
| `messages` | Direct + booking-thread messages with `sender_id`, `receiver_id`, `booking_id`, `read` |
| `earnings` | Coach earnings per booking: `gross_amount`, `platform_fee`, `net_amount`, `status` (`pending`/`available`/`paid_out`) |
| `notifications` | In-app notifications: `title`, `message`, `type`, `read` |
| `interview_templates` | Coach-created interview templates: `name`, `job_role`, `industry`, `difficulty`, `duration_minutes` |
| `template_questions` | Questions per template: `question`, `order_index`, `time_limit_seconds` |
| `session_notes` | Coach notes per booking |
| `answer_scores` | Coach scoring of candidate answers during live sessions |

### Credits System Tables

| Table | Purpose |
|---|---|
| `user_credits` | Per-user credit balance: `balance`, `total_purchased`, `total_spent`, `total_earned`, `total_withdrawn` |
| `credit_transactions` | Full audit log: `type` (`purchase`/`spent`/`refund`/`earned`/`withdrawn`/`bonus`/`admin_adjustment`), `amount`, `balance_after`, `description` |
| `credits_escrow` | Holds credits during active sessions: `total_credits`, `platform_fee`, `coach_earnings`, `status` (`held`/`released`/`refunded`) |
| `credit_packages` | Configurable purchase packages: `name`, `price_usd`, `base_credits`, `bonus_credits`, `total_credits` |

### Trust & Safety Tables

| Table | Purpose |
|---|---|
| `cancellations` | Cancellation records with `cancelled_by`, `reason_category`, `hours_before_session`, `refund_amount`, `refund_status` |
| `coach_strikes` | Coach violation tracking with `strike_type`, `expires_at`, `resolved` |

### Migrations (13 files, run in this order)
1. `coach_platform.sql` — Core schema + all base tables + RLS
2. `credits_system.sql` — Credits economy tables
3. `dual_role.sql` — Allows `user_type = 'both'`
4. `voice_interviews.sql` — Voice session support
5. `coach_profile_structured.sql` — Structured coach profile fields
6. `coach_public_profiles.sql` — Public profile policies
7. `profile_columns.sql` — Additional profile columns
8. `20260119_enhanced_profile_fields.sql`
9. `20260119_fix_profile_signup.sql`
10. `20260119_account_deletion_requests.sql`
11. `20260418_structured_profile.sql`
12. `20260418_jobs_system.sql`
13. `20260419_avatar_storage.sql`

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=

# OpenAI (Whisper STT + TTS for voice interviews)
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Key Features Implemented

- **Authentication** — Supabase email/password auth, signup flows for both candidate and coach, password reset
- **AI Text Interview** — Full session flow: setup wizard (resume + JD upload, job role, difficulty), question generation via Claude Sonnet 4.6, answer submission, structured JSON feedback (score, strengths, weaknesses, improved answer, metrics)
- **Voice Interview** — Audio recording (WebM), OpenAI Whisper transcription, TTS question playback, credit-gated with 5 min free tier
- **Interview Summary** — Post-session feedback page with animated score rings and metric bars
- **Candidate Dashboard** — Interview history, session stats, progress tracking
- **Coach Marketplace** — Browse coaches, filter by specialization, view public profiles with ratings and reviews
- **Coach Profile Editor** — Structured sections for experience, education, skills, achievements, certifications
- **Availability Management** — Slot-based scheduling with buffer times and blocked dates
- **Booking System** — Select slot, pay via credits, escrow holding, cancellation with deadline enforcement
- **Coach Dashboard** — Upcoming sessions, earnings overview, messaging
- **Coach Messaging** — Direct messages between candidates and coaches
- **Reviews System** — Post-session star ratings and comments
- **Credits System** — Full schema and logic for purchase, spending, escrow, earning, withdrawal
- **Stripe Integration** — Checkout sessions, billing portal, webhook handling for subscription events
- **User Profile** — Avatar upload to Supabase Storage, experience/education/skills/achievements sections
- **Multi-language Support** — EN, ES, FR, AR via `LanguageProvider`
- **Dark/Light Theme** — System-preference default with manual toggle
- **Notifications** — In-app notification bell with unread count
- **Email** — Welcome email via Resend, contact form handler
- **Landing Page** — Full marketing page with animated demo, coach carousel, testimonials, CTA
- **SEO** — Structured data schemas (Organization, Website, SoftwareApplication), metadata generation
- **Job Listings** — Job browsing page at `/jobs`
- **Dual Role** — Users can hold both candidate and coach roles simultaneously

---

## Features In Progress

- **Credit Purchase Flow** — Schema and Stripe checkout exist; webhook integration for crediting accounts after purchase needs end-to-end testing and validation
- **Coach Earnings Withdrawal** — UI and schema exist; the actual Stripe Connect payout call in `/api/earnings/withdraw/route.ts` has a `TODO: Implement actual Stripe Connect payout` comment — not yet functional
- **Live Session Room** — `bookings.daily_room_url` column exists but Daily.co (or equivalent) video room creation is not wired up
- **Google Calendar Integration** — `bookings.google_calendar_url` column exists but calendar invite generation is not implemented
- **Stripe Connect Onboarding** — `coach_profiles.stripe_connect_account_id` column exists but the onboarding flow for coaches to connect their Stripe account is missing
- **Coach Template Usage in Sessions** — Templates and questions tables exist; using a coach template to drive a live session is not yet connected
- **Answer Scores by Coach** — `answer_scores` table exists; coach scoring UI during live sessions not implemented

---

## Features TODO

- Stripe Connect full onboarding flow for coaches
- Daily.co (or equivalent) video room creation on booking confirmation
- Google Calendar invite generation on booking confirmation
- Admin dashboard (role exists in DB, no UI)
- Coach strike / trust & safety enforcement UI
- Cancellation rate display on coach profiles
- Referral / bonus credit system (schema foundation exists in `credit_transactions.type = 'bonus'`)
- Email notifications for booking confirmations, reminders, cancellations
- Real-time chat (Supabase Realtime is commented out in migrations — needs enabling)
- Coach interview template → live session conductor
- Mobile responsive testing pass

---

## Important Rules (DO NOT CHANGE)

- Dark theme is default; light mode toggle exists — never break dark mode when editing light mode styles
- **Credits system: 1 credit = $1 USD** — all monetary values stored as integer credits in the database
- Voice interview: 5 minutes free, then credits required
- Coach sessions use an escrow credit system — credits are held at booking, released to coach after session completion
- **Cancellation policy:** Candidate cancels free before the `cancellation_deadline` (48 hours before session); no refund after that window
- Never use `any` type in TypeScript
- Keep purple/blue gradient theme consistent across pages
- Test both dark and light modes after any UI changes

---

## API Keys & Services Used

| Service | Purpose | Env Var |
|---|---|---|
| Supabase | Database, Auth, Storage, RLS | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Anthropic Claude Sonnet 4.6 | AI interview question generation and feedback | `ANTHROPIC_API_KEY` |
| OpenAI Whisper | Voice interview speech-to-text transcription | `OPENAI_API_KEY` |
| OpenAI TTS | Voice interview text-to-speech question playback | `OPENAI_API_KEY` |
| Stripe | Subscription billing, credit purchases, coach payouts (planned) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | Transactional email (welcome, contact) | `RESEND_API_KEY` |

---

## Common Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check for lint errors
```

---

## Code Style Rules

- TypeScript strict mode — **never use `any` type**
- Tailwind CSS for all styling (no CSS modules or inline styles)
- Framer Motion for animations
- Supabase for all database operations and auth
- Next.js App Router — pages in `/app`, not `/pages`
- Components go in `/components` folder
- API logic (Anthropic, Stripe, etc.) goes in `/lib`
- API routes go in `/app/api`
- Use `lucide-react` for icons
- Use `react-hot-toast` for user notifications

---

## Current Known Bugs

- `coach_profiles` table has both a `user_id` column and a `coach_id` column pointing to `profiles.id` — `coach_id` was added as a duplicate alias; queries should consistently use `user_id` as the canonical key
- `lib/coach-marketplace.ts` contains **mock/hardcoded coach data** — the marketplace browse page may be rendering this fake data instead of real database records; verify real DB query is used in production routes
- Stripe Connect payout in `/app/api/earnings/withdraw/route.ts` is a stub — coaches cannot actually withdraw earnings yet
- Realtime messaging is disabled — the `ALTER PUBLICATION supabase_realtime` lines in migrations are commented out, so messages/notifications do not update live without a page refresh
- `earnings` table has `amount` as a generated column aliasing `net_amount` — some queries may be selecting `amount` expecting a direct column, which could cause issues if the DB migration hasn't been applied

---

## Notes for Future Claude Sessions

- Always read this file first before making changes
- The credits system is the financial backbone — any change to booking, cancellation, or payout logic must go through `user_credits`, `credit_transactions`, and `credits_escrow` tables atomically
- The `profiles` table is the single source of truth for user identity; both candidates and coaches have a row here; coaches additionally have a row in `coach_profiles`
- `user_type = 'both'` means the user has activated both roles — the UI should handle this case on routing
- When adding new Supabase tables, always add RLS policies and add the migration to this file
- The landing page (`app/page.tsx`) is 1300+ lines — edit it carefully and test the full scroll
- The voice interview flow spans: `MicrophoneRecorder` → `/api/interview/voice/transcribe` → `/api/interview/voice/feedback` → TTS playback — any break in this chain silently fails audio
- Before touching the Stripe webhook handler, test locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook`
