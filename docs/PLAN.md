# Portfolio — build & deployment plan

Personal portfolio for internship and job applications. CLI / terminal look,
dark + light themes, code-spotlight pointer effect, one case study per project,
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
  app/                 routes: /, /projects, /projects/[slug], /about, /contact
  components/          terminal window, neofetch, nav, theme toggle, spotlight…
  content/             profile.ts · projects.ts · timeline.ts   ← edit these
  lib/                 helpers (code-field generator)
public/                me.jpg (photo), cv.pdf (public CV)
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
- [ ] Add photo (`public/me.jpg`) and public CV (`public/cv.pdf`)
- [x] One case-study template for every project (see *Case-study template* below)
- [x] Architecture diagrams as SVG that fade in on scroll (both themes, reduced motion)
- [x] Case study: Distributed Job Queue — open `[TODO: …]`s still to answer
- [ ] Case study: Waypoint Logistics
- [ ] Case study: AAAC
- [ ] Case study: CoreHR
- [ ] Case study: Sentrio
- [ ] Case study: Rahula Dancing Portal
- [ ] Case study: Material Selection Assistant
- [ ] Fill in own role for each team project

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
- [ ] ⌘K command palette (jump to project, copy email, download CV)
- [ ] Text-scramble headings, `cd` page transitions, magnetic buttons
- [ ] Interactive shell section (`whoami`, `projects`, `wins`…) + easter eggs
- [ ] Contact form → `/api/contact` Route Handler → Resend, with honeypot + rate limit

**Phase 4 — launch & polish**
- [ ] Custom domain, Open Graph image per page
- [ ] Lighthouse CI budget in GitHub Actions (performance, a11y ≥ 95)
- [ ] Vercel Web Analytics
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
