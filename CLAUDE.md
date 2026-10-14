@AGENTS.md

# Portfolio — notes for Claude Code

Sachintha Dilshan's portfolio site for internship and job applications.
Terminal / CLI look, dark + light themes, a calm dot-grid background on the home page (accent dots follow the mouse on desktop) and a cursor-following border glow on cards and terminal windows.

**Read `docs/PLAN.md` first** — architecture, phases (with checkboxes) and deployment.
Tick items off there as they are finished.

## Commands
- `npm run dev` — dev server on http://localhost:3000
- `npm run lint` · `npm run typecheck` · `npm run build` — all three must pass before committing (CI runs the same)
- `npm run test:e2e` — Playwright, against the production build (run `npm run build` first): no horizontal overflow on any route at 320/375/390/768 + phone landscape, 44px touch targets, 16px inputs; also saves 390px screenshots of every route in both themes to `test-results/screenshots/` (git-ignored). CI runs it as a separate job.

## Where things live
- `src/content/` — ALL text and data (profile, projects, timeline). Change content here, never hard-code it in components.
- `src/components/` — UI pieces (terminal window, neofetch, nav, theme toggle, dot grid, border glow…)
- `src/app/` — routes: `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact`
- `public/` — `me.jpg` (photo) and `cv.pdf` (public CV). public/cv.pdf may include referee details — the referees have consented.

## Rules
- Colours come from the CSS variable tokens in `src/app/globals.css`; every change must work in BOTH themes.
- Every animation respects `prefers-reduced-motion` and never hides content.
- Pages stay statically prerendered unless there is a real reason (e.g. the phase-3 contact API).
- Keep it fast: no heavy animation libraries without a reason; check the build output.
- Never invent facts about Sachintha (roles, numbers, results). Leave a `[TODO: …]` and ask.
- Work on a `feat/*` branch, open a PR, merge when CI is green. `main` is always deployable.
