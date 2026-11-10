# AGENTS.md

## Project
Smart Campus room availability checker. A single-page client app to check if a study room is free for a requested time slot using fictional booking fixtures.

## Scope & Constraints
- Decision-only application: availability checking only.
- All room and booking data must remain hardcoded fictional fixtures. The app
  uses a multi-room catalog (carried over from Practice #09); do not fetch,
  persist, or externalize room or booking data.
- Forbidden: No backend, database, authentication/login, or saved booking creation/persistence.
- Forbidden: The `@supabase/supabase-js` dependency in `package.json` is
  vestigial and must never be imported or used. Do not introduce any other
  database client.
- Forbidden: No secrets, API keys, or hardcoded credentials anywhere in the
  source tree or configuration.
- Forbidden: No external deployment, publishing, or hosting configuration. The
  app runs locally via `npm run dev` only.
- Base code: Work exclusively on the repaired codebase from Practice #08. Do not generate a new application from scratch.
- Preserve Acceptance Criteria:
  - AC1: Reject `start >= end` and requests in the past.
  - AC2: Reject booking durations > 120 minutes.
  - AC3: Reject requests if the room is marked as blocked.
  - AC4: Reject overlapping bookings; allow bookings touching strictly at endpoints.
  - AC5: Never mutate existing booking fixtures or room data.
  - AC6: Maintain clear, responsive validation feedback on desktop and mobile.

## Engineering Rules
- Apply ONE small refactoring: extract a pure validation function returning `{ ok: boolean, reason?: string, code?: string }` into its own module (`src/lib/canBook.ts` or similar).
- Single source of truth: UI (`App.tsx`) must consume this function's result for both the validation banner and the verdict, eliminating duplicated validation logic.
- Design patterns decision:
  - Adapter Pattern: Skipped. Booking fixtures use a single consistent format across all rooms (`[number, number]`).
  - Strategy Pattern: Skipped. There is only one booking policy for Smart Campus; a simple pure function is preferred over extra abstractions.
- Keep changes minimal and focused. Do not re-architect untouched timeline/UI components.

## Verification & Workflow
- Exact commands available in project:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Add Vitest / unit tests for the pure validation function covering AC1 through AC6.
- Before proposing acceptance, run `npm run test`, `npm run typecheck`,
  `npm run lint`, and `npm run build`. All four must pass with zero errors.
- Final report must include:
  1. Files changed
  2. Rationale for modifications
  3. Verification and test results