# AGENTS.md — Skill-Avatar (Next.js + Supabase) UI Improvement Rules

> Archive note:
> This file is kept as a legacy snapshot. Active startup docs are:
> `agents/init.md` -> `agents/agents.md` -> `agents/context.md` -> `agents/architecture.md`.

## Project summary
This repository is a Next.js + Supabase application that:
- Lets users input skills (0–5)
- Calculates rank (Gold / Silver / Bronze)
- Generates an avatar image via OpenAI Images API (through Supabase Edge Function)
- Stores image in Supabase Storage
- Stores snapshot state in `user_snapshots` (single-row-per-user state machine)
- Uses Realtime subscription to update the lobby UI in near real-time

We are currently in **UI improvement phase**:
- Goal: enterprise-grade, game-inspired lobby UI
- Scope: frontend only (UI structure + design system + UX polish)
- Do NOT redesign backend or business logic.

---

## Hard constraints (MUST NOT change)
**Backend / Data flow is frozen.**
Do not change any of the following unless explicitly requested by the user:

### Supabase / Backend
- Database schema (tables, columns, RLS, triggers)
- `user_snapshots` state machine model (single row per user)
- Status values and semantics: `idle / generating / ready / failed`
- Realtime subscription logic and channel semantics
- Storage upload path conventions and public/private access decisions
- Supabase Edge Functions (including `generate-snapshot`) behavior and API contract
- Rank calculation logic and any server-side behavior

### Contracts
- Keep the existing request/response shape between frontend ↔ Edge Functions
- Keep existing fields in snapshot payloads (do not rename/remove)
- If UI needs extra data, prefer deriving it client-side from existing state.

---

## Allowed changes (YOU MAY change)
### Frontend UI / DX
- Lobby UI layout, visual hierarchy, typography, spacing
- Component structure and file organization under:
  - `app/lobby/**`
  - `app/**/_components/**` (if applicable)
  - `app/**/_hooks/**` (only if it doesn't change backend behavior)
- Tailwind styling, animations, transitions
- Shadcn/ui (if already used) or lightweight UI primitives
- Copywriting (Japanese/English) for clarity and enterprise tone
- Loading states, skeletons, empty states, error states
- Accessibility improvements (ARIA labels, focus states)
- Performance improvements that do NOT alter business logic (memoization, avoiding re-renders)

---

## UI requirements (lobby)
Design theme: **enterprise-grade + game-inspired**.
- Calm, trustworthy base with subtle "game UI" flair (panels, badges, progress indicators)
- Clear state-driven UI:
  - `idle`: prompt to generate / guidance
  - `generating`: progress feedback + prevent duplicate actions
  - `ready`: show avatar + rank + key skill summary + regenerate CTA
  - `failed`: explain failure + retry CTA + helpful troubleshooting hint
- Must remain responsive (desktop first, still works on mobile)
- Must handle slow network gracefully with skeletons and disabled buttons

### Accessibility baseline
- Buttons have accessible names
- Focus visible, keyboard navigation works
- Avoid relying solely on color for status signals

---

## Architecture notes (important)
- Treat the app as a **state machine UI** driven by `user_snapshots.status`.
- Realtime updates may arrive at any time; UI must be resilient to:
  - status flipping
  - partial snapshot content
  - transient `generating` or `failed`
- Any "polling" must not be introduced unless explicitly requested.

---

## Coding rules
- Keep TypeScript types accurate; prefer explicit types for public props
- Prefer small, composable components
- Avoid premature abstraction; refactor only when it improves readability
- No breaking changes to exported hook APIs unless the user requested it
- Keep client/server component boundaries correct (Next.js app router)
- Avoid adding heavy dependencies; if you must add one, justify it briefly

---

## Output / workflow expectations
When asked to implement a UI change:
1) First, summarize **what files you plan to touch** and why.
2) Then implement with minimal diff that preserves behavior.
3) Ensure `generating/ready/failed/idle` are all visually checked.
4) Provide quick manual test checklist for the user.

When uncertain about backend behavior:
- Assume backend is correct and immutable.
- Solve on UI side with defensive rendering.

---

## Useful dev commands (edit as needed)
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

---

## File map (edit as needed)
Key areas:
- `app/lobby/_components/*` : lobby UI components
- `app/lobby/_hooks/*`      : lobby hooks (snapshot + generation)
- `supabase/functions/*`    : frozen backend (do not modify)

---

## Definition of done (UI improvement)
- Lobby UI looks polished and consistent
- State transitions are clear and stable
- No backend logic changed
- No console errors in normal flows
- Loading / error / empty states are handled
