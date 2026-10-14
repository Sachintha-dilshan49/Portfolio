@AGENTS.md

# Portfolio — notes for Claude Code

Sachintha Dilshan's portfolio site for internship and job applications.
Terminal / CLI look, dark + light themes, code-spotlight pointer background.

**Read `docs/PLAN.md` first** — architecture, phases (with checkboxes) and deployment.
Tick items off there as they are finished.

## Commands
- `npm run dev` — dev server on http://localhost:3000
- `npm run lint` · `npm run typecheck` · `npm run build` — all three must pass before committing (CI runs the same)

## Where things live
- `src/content/` — ALL text and data (profile, projects, timeline). Change content here, never hard-code it in components.
- `src/components/` — UI pieces (terminal window, neofetch, nav, theme toggle, code spotlight…)
- `src/app/` — routes: `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact`
- `public/` — `me.jpg` (photo) and `cv.pdf` (public CV). public/cv.pdf may include referee details — the referees have consented.

## Rules
- Colours come from the CSS variable tokens in `src/app/globals.css`; every change must work in BOTH themes.
- Every animation respects `prefers-reduced-motion` and never hides content.
- Pages stay statically prerendered unless there is a real reason (e.g. the phase-3 contact API).
- Keep it fast: no heavy animation libraries without a reason; check the build output.
- Never invent facts about Sachintha (roles, numbers, results). Leave a `[TODO: …]` and ask.
- Work on a `feat/*` branch, open a PR, merge when CI is green. `main` is always deployable.
