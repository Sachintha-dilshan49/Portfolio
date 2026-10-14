# ~/sachintha — portfolio

Personal portfolio of **Sachintha Dilshan**, IT undergraduate at the University of
Moratuwa, looking for a software engineering internship (backend · systems · DevOps).

Terminal-style UI with dark/light themes, a pointer-reactive code background,
and a README-style case study for every project.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                          |
|---------------------|---------------------------------------|
| `npm run dev`       | Dev server                            |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | Route types + `tsc --noEmit`          |
| `npm run build`     | Production build (all pages static)   |

## Editing content

All content lives in `src/content/`:

- `profile.ts` — name, links, neofetch lines, skills, certifications
- `projects.ts` — every project card and case study
- `timeline.ts` — wins and the `git log` timeline on About
- `shell.ts` — words for the interactive shell on the home page (commands, easter eggs)
- `site.ts` — pages (nav + command palette) and the ⌘K palette labels

Photo: put `me.jpg` in `public/` and set `photo: "/me.jpg"` in `profile.ts`.
CV: put a public version at `public/cv.pdf`.

## Stack & deployment

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GitHub Actions CI · Vercel.
See [docs/PLAN.md](docs/PLAN.md) for the architecture, roadmap and deployment steps.
