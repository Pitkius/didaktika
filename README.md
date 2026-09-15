# Didaktika

An AI-powered education platform that adapts to every student's individual learning needs. Built for students, teachers, schools, and administrators across Europe.

**Product name is configurable** in `config/site.ts`.

## Features

- **AI Second Teacher** — Socratic tutoring that guides without giving away answers
- **Adaptive Learning** — Difficulty and topic selection based on real performance data
- **Question Engine** — Multiple choice, numeric, true/false, short answer, and more with proper grading
- **Teacher Tools** — Class management, assignment creation, AI question generation, analytics
- **School Administration** — User management, subjects, classes, invitations, audit logs
- **AI Integrity** — Risk signal analysis (not automated punishment) for teacher review
- **Role-based Access** — Student, Teacher, School Admin, Super Admin with server-side enforcement

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js Server Actions & Route Handlers
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Auth.js (NextAuth v5) with credentials, JWT sessions, RBAC
- **Validation:** Zod + React Hook Form
- **Charts:** Recharts
- **AI:** Pluggable AIProvider (Mock / OpenAI)
- **Tests:** Vitest

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your DATABASE_URL and AUTH_SECRET
# Generate AUTH_SECRET: openssl rand -base64 32

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

After seeding (password: `Password123!`):

| Role | Email |
|------|-------|
| Super Admin | admin@didaktika.eu |
| School Admin | admin@vilnius-gymnasium.lt |
| Teacher | jonas.kazlauskas@vilnius-gymnasium.lt |
| Student | student1@vilnius-gymnasium.lt |

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session encryption secret |
| `AI_PROVIDER` | `mock` (default) or `openai` |
| `OPENAI_API_KEY` | Required when AI_PROVIDER=openai |
| `FEATURE_*` | Feature flags for AI, billing, etc. |

## Architecture

```
/app              # Next.js App Router pages
/components       # Shared UI components
/config           # Site config, feature flags
/features         # Domain-specific actions & components
/lib              # Utilities, auth, db, validations
/services         # Business logic (AI, grading, analytics, etc.)
/prisma           # Database schema, migrations, seed
/tests            # Vitest test suites
/types            # TypeScript type definitions
```

### Key Services

- `services/ai/` — AIProvider interface with Mock and OpenAI implementations
- `services/grading/` — Question grading with numeric tolerance, math normalization
- `services/learning/` — AdaptiveLearningService for difficulty & topic selection
- `services/analytics/` — Dashboard stats and AI insights from real DB data
- `services/integrity/` — Risk signal analysis for teacher review
- `services/billing/` — Subscription architecture (payments not connected in MVP)

## Roles & Routes

| Role | Dashboard | Access |
|------|-----------|--------|
| STUDENT | `/student` | Learning, assignments, AI teacher, progress |
| TEACHER | `/teacher` | Classes, assignments, question bank, analytics |
| SCHOOL_ADMIN | `/school-admin` | School users, classes, settings |
| SUPER_ADMIN | `/admin` | Platform-wide management |

All private routes are protected server-side via middleware and session checks.

## AI Configuration

Default development uses `MockAIProvider` which returns deterministic, realistic responses.

To enable OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

AI API keys are never exposed to the browser. All AI calls go through server actions.

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest tests
npx prisma studio    # Database GUI
npx prisma migrate dev # Create migration
npx prisma db seed   # Seed demo data
```

## Security

- Password hashing with bcrypt (12 rounds)
- Server-side RBAC on all protected routes
- Input validation with Zod
- Audit logging for important actions
- AI assistance restrictions enforced server-side for tests/exams
- No student can access another student's data via URL manipulation

## Deployment

1. Set production environment variables
2. Run `npx prisma migrate deploy`
3. Run `npm run build && npm start`

Recommended: Vercel for frontend, managed PostgreSQL (Neon, Supabase, RDS).

## License

Proprietary — All rights reserved.
