# Tech Stack

> Most choices are **draft** at project start. Lock them in the first Tech Lead cycle.

## Runtime
- **Framework**: TBD
- **Language**: TypeScript (strict) — non-negotiable
- **Styling**: TBD
- **Components**: TBD
- **Package manager**: TBD

## Internationalization
- **i18n**: TBD (only if multi-locale or non-English; if `add-hebrew-rtl.md` was applied, fill in here)
- **Direction**: TBD
- **Date/number formatting**: `Intl.*` APIs

## Data
- **Database**: TBD
- **ORM / client**: TBD
- **Realtime sync**: TBD (or N/A)

## Auth
- **Provider**: TBD

## Hosting & Deploy
- **App hosting**: TBD
- **Database hosting**: TBD
- **Domain**: TBD
- **PWA / install**: TBD

## Testing
- **Unit / component**: Vitest + React Testing Library (default)
- **E2E**: Playwright (if needed)
- **Coverage requirements**: at minimum, every gesture state machine and every optimistic mutation gets a test

## Repo Conventions
- Branches: `feature/NN-<feature>/T<n>-<slug>`
- Commits: `feat(NN-<feature>): T<n> — <short message>`
- PRs: one task per PR, body references `specs/features/NN-<feature>/tasks.md#T<n>`

## Constraints
- <cost target>
- <free-tier requirement>
- <other hard constraints>
