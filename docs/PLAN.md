# Portfolio — build & deployment plan

Personal portfolio for internship and job applications. CLI / terminal look,
dark + light themes, code-spotlight pointer effect, one case study per project.

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
| Case studies | MDX per project (phase 2)               | Long-form writing + embedded interactive demos |
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
- [ ] Write MDX case study for each flagship project (problem → architecture → decisions → proof → learned)
- [ ] Architecture diagrams as SVG that draw themselves on scroll
- [ ] Interactive "crash a worker" demo inside the Job Queue case study
- [ ] Fill in own role for each team project

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
- Content changes only touch `src/content/` (and MDX in phase 2).
- Every animation must respect `prefers-reduced-motion` and never hide content.
