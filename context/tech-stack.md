# Tech Stack

> **MVP scope only.** For the planned additions post-MVP (PostHog, Supabase, Stripe, Resend, Sentry — and *when* each enters), see [`launch-plan.md`](./launch-plan.md).

## Runtime
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript strict mode — `noImplicitAny`, `strictNullChecks`, no `any`
- **Styling**: Tailwind CSS — **logical properties only** (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`)
- **Components**: Custom rendering + Radix UI primitives for `Dialog` בלבד (אם נצרך). אין UI library גדולה.
- **Font**: Rubik 400/500/600/700/800 (UI) + JetBrains Mono 400/500/600 (numerics/timers). שניהם מ-Google Fonts. Rubik במקור פונט עברי — ההידוק החזותי לעברית טוב במיוחד
- **Icons**: Lucide React — תמיכת RTL טובה
- **Package manager**: npm

## Internationalization
- **i18n**: ללא ספרייה. עברית בלבד ב-MVP, מחרוזות מרוכזות ב-`lib/strings.ts` (קבועים, לא lookup דינמי)
- **Direction**: `dir="rtl"` על `<html>` (root layout)
- **Date/number formatting**: `Intl.NumberFormat('he-IL')` / `Intl.DateTimeFormat('he-IL')`

## Data
- **Persistence**: `localStorage`, key מוקדמת בגרסה: `sourdough:v1:recipes`
- **Schema validation**: Zod — schema על read/write כדי לזרוק מוקדם על נתון מקולקל
- **ORM**: ללא. סריאליזציה ידנית JSON.
- **Realtime sync**: N/A

## Auth
- **Provider**: ללא ב-MVP

## Hosting & Deploy
- **App hosting**: Vercel (free tier)
- **Domain**: TBD (subdomain של vercel.app מספיק להתחלה)
- **PWA / install**: נדחה. אפליקציה responsive ב-MVP, manifest מינימלי לאייקון אם יש זמן. service worker — לא נדרש.

## Testing
- **Unit / component**: Vitest + React Testing Library
- **E2E**: Playwright — נכנס רק כשנצטרך לבדוק gestures מסובכים (T11 swipe-to-delete)
- **Coverage**:
  - כל state machine של gesture חייב בדיקה ייעודית (לפי `engineer.md` ו-`ui-playbook.md`)
  - כל ולידציה חוסמת-שמירה חייבת בדיקה
  - localStorage layer מבוסס בדיקות

## Repo Conventions
- Branches: `feature/NN-<feature>/T<n>-<slug>`
- Commits: `feat(NN-<feature>): T<n> — <short message>`
- PRs: one task per PR, body references `specs/features/NN-<feature>/tasks.md#T<n>`

## Constraints
- **עלות**: 0$ לחודש ב-MVP. כל מה שדורש תשלום נדחה.
- **גודל באנדל**: ללא Framer Motion / react-spring (לפי `ui-playbook` §12). אנימציות בעצמנו.
- **בלי backend**: כל ה-state במכשיר. אם משהו דורש שרת — מסומן ב-Out of Scope.
