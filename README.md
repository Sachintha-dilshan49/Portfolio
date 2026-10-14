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

- `profile.ts` — name, links, home hero text, About (bio, education, skills, certifications)
- `projects.ts` — every project card and case study
- `achievements.ts` — competitions (with photo alt texts) and extra-curricular activities
- `shell.ts` — words for the interactive shell on the home page (commands, easter eggs)
- `site.ts` — pages (nav + command palette) and the ⌘K palette labels

Photo: put `me.jpg` in `public/` and set `photo: "/me.jpg"` in `profile.ts`.
CV: put a public version at `public/cv.pdf`.
Achievement photos: put them in `_inbox/achievements/<slug>/` (name them `01-…`, `02-…` for order),
run `node scripts/process-photos.mjs` (resizes to ≤1600px, strips EXIF/GPS, writes `public/achievements/`),
then add one alt text per photo in `achievements.ts` — the build fails if one is missing.

## Stack & deployment

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GitHub Actions CI · Vercel.
See [docs/PLAN.md](docs/PLAN.md) for the architecture, roadmap and deployment steps.
