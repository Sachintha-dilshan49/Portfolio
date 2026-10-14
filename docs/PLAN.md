# Portfolio — build & deployment plan

Personal portfolio for internship and job applications. CLI / terminal look,
dark + light themes, a calm dot-grid background on the home page, one case study per project,
all built from the same template.

## 1. Architecture

```
GitHub repo ──push/PR──▶ GitHub Actions CI (lint · typecheck · build)
     │
     └──────────────────▶ Vercel (Git integration)
                           ├─ every PR  → Preview URL
                           └─ main      → Production → custom domain
```

| Layer      | Choice                                    | Why |
|------------|-------------------------------------------|-----|
| Framework  | Next.js (App Router) + TypeScript         | Static pages by default, file-based routes, great on Vercel |
| Styling    | Tailwind CSS v4 + CSS variable tokens     | One set of tokens drives dark + light themes |
| Fonts      | JetBrains Mono + Space Grotesk (self-hosted via Fontsource) | No external font requests, works offline in CI |
| Content    | Typed data files in `src/content/`        | Adding a project = one object; no CMS or DB needed |
| Case studies | Typed `caseStudy` per project + one `<CaseStudy>` template | Every project reads the same way; no MDX tooling needed |
| Contact    | `mailto:` now → Route Handler + Resend (phase 3) | Real form without exposing the email to bots |
| Analytics  | Vercel Web Analytics (phase 4)            | Cookie-less, see which projects recruiters open |
| Hosting    | Vercel Hobby (free)                       | Preview deploys per PR, global CDN, zero config |

Everything is prerendered at build time (`○ Static` in the build output), so
the site is just files on a CDN — fast and effectively free to run.

## 2. Folder structure

```
src/
  app/                 routes: /, /projects, /projects/[slug], /achievements, /about, /contact
  components/          terminal window, hero (login sequence), nav, theme toggle, dot grid, border glow, shell, ⌘K palette, gallery…
  lib/                 shell interpreter, fuzzy matcher, browser actions (download CV, copy, theme)
  content/             profile.ts · projects.ts · achievements.ts · shell.ts · site.ts   ← edit these
public/                me.jpg (photo), cv.pdf (public CV), achievements/<slug>/ (processed photos)
scripts/process-photos.mjs   _inbox photos → ≤1600px, metadata stripped, blur placeholders
docs/PLAN.md           this file
CLAUDE.md              rules for Claude Code (imports AGENTS.md)
.github/workflows/     ci.yml
```

## 3. Phases

**Phase 1 — foundation (done in first commit)**
- [x] Next.js + TS + Tailwind scaffold, design tokens, dark/light theme with no flash
- [x] Layout, nav, code-spotlight background, neofetch hero
- [x] Projects grid with filter, generated case-study pages, About, Contact (mailto), 404
- [x] sitemap.xml, robots.txt, metadata
- [x] GitHub Actions CI

**Phase 2 — content & case studies**
- [x] Add photo (`public/me.jpg`, ≤1000px, metadata stripped) — accent duotone, full colour on hover/focus
- [x] "Download CV" links save as `Sachintha-Dilshan-CV.pdf`
- [x] Add public CV (`public/cv.pdf`)
- [x] One case-study template for every project (see *Case-study template* below)
- [x] Architecture diagrams as SVG that fade in on scroll (both themes, reduced motion)
- [x] Case study: Distributed Job Queue
- [x] Case study: Waypoint Logistics
- [x] Case study: AAAC – Access-Aware Admission Control
- [x] Case study: CoreHR
- [x] Case study: Sentrio
- [x] Case study: Rahula Dancing Society Platform – Learning Portal
- [x] Case study: Mechanical Engineering Material Selection Assistant
- [x] Fill in own role for each project (verified from each repo's git history)

No interactive demos in phase 2 — see *Later / optional*.

### Case-study template

Every project page is rendered by the same `<CaseStudy>` component
(`src/components/case-study/`), with these sections in this order:

1. **Overview** — what it is, the problem it solves, why it was built.
2. **Architecture** — one SVG diagram, defined as data (boxes + arrows) in
   `src/content/projects.ts`. Colours come from the theme tokens, so it works in
   dark and light. It fades in when scrolled into view; with
   `prefers-reduced-motion` (or without JavaScript) it is simply shown.
3. **My role** — solo or team, what I owned, timeframe.
4. **Key features & decisions** — what, why, and the evidence (a measured
   result or test) when there is one.
5. **Tech stack** — the stack, with a short why/how note where useful.
6. **Links** — GitHub, plus live demo if there is one.

Content lives in the optional `caseStudy` field of each project. Until a
project has one, the template falls back to its `problem`, `role` and
`highlights` and skips the diagram. Anything not yet known is written as
`todo("…")`, which renders a visible `[TODO: …]` — never guessed.

**Phase 3 — interactions**
- [x] ⌘K / Ctrl+K command palette: fuzzy search over pages, projects and actions (copy email, download CV, toggle theme, GitHub, LinkedIn); native `<dialog>`, no library; ⌘K button in the nav on phones too
- [ ] Text-scramble headings, `cd` page transitions, magnetic buttons
- [x] Interactive shell section (`whoami`, `projects`, `wins`…) + easter eggs — auto-runs `whoami` on first view; chips + input with history and Tab completion; output from `src/content/`, announced via an aria-live region
- [x] ~~Neofetch typing reveal~~ → replaced by the restructure below

**Restructure (feat/restructure)**
- [x] Home hero: login sequence (~2.4s, once per session, click/key skips, no layout shift, reduced motion → final state) then name, headline, summary and View projects · Download CV · Contact; neofetch lines and swatches removed
- [x] /achievements: cards (placement, event, organiser, year, team, description, case-study link) with photo galleries + accessible lightbox; extra-curricular cards; in nav, sitemap and ⌘K
- [x] About: bio → education → skill cards → certification cards → Download CV; wins and git-log timeline removed, "See achievements →" link
- [ ] Fill the remaining [TODO]s (OctWave 3.0 year, certification years + credential links)
- [ ] Contact form → `/api/contact` Route Handler → Resend, with honeypot + rate limit

**Phase 4 — launch & polish**
- [ ] Custom domain, Open Graph image per page
- [ ] Lighthouse CI budget in GitHub Actions (performance, a11y ≥ 95)
- [ ] Vercel Web Analytics
- [x] Fully responsive at 320–1024px, portrait and landscape: phone nav, stacked hero, vertical diagrams, 44px targets, safe areas, touch-aware spotlight
- [x] Playwright responsive test (overflow + touch targets) as a separate CI job
- [x] Calmer background: code-text spotlight replaced by a home-only dot grid (mouse-only accent glow, static on touch / reduced motion) and a cursor-following border glow on cards and terminal windows
- [ ] Test on real phones, keyboard-only, screen reader, reduced motion

**Later / optional**
- [ ] Interactive "crash a worker" demo inside the Job Queue case study
  (kill a worker in the browser, watch the lease expire and another worker
  finish the job)

## 4. Deployment

1. **Vercel** — sign in at vercel.com with GitHub → *Add New Project* → import
   this repo → framework auto-detected → Deploy. No settings needed.
2. Set environment variable `NEXT_PUBLIC_SITE_URL` to the final URL
   (e.g. `https://sachintha.dev`) so sitemap and social cards use it.
3. **Previews** — every pull request gets its own URL; merge to `main` to ship.
4. **Domain** — start on the free `*.vercel.app` URL. When ready, buy a domain
   (a `.dev` or `.me`; check the GitHub Student Developer Pack for free domain
   offers) and add it under *Project → Settings → Domains*.
5. **Branch protection** — require the CI check to pass before merging to `main`.

Why not GitHub Pages: no Route Handlers (needed for the phase-3 contact API)
and no per-PR previews. Docker/self-hosting is possible but adds cost with no
benefit for a static site — the CI pipeline is where the DevOps work shows.

## 5. Working agreement

- `main` is always deployable; work on `feat/*` branches → PR → CI green → merge.
- Content changes only touch `src/content/`.
- Every animation must respect `prefers-reduced-motion` and never hide content.
