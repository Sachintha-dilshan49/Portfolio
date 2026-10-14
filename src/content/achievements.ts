import { photoFiles, type PhotoFile } from "./achievement-photos.generated";
import { todo, type Text } from "./case-study";

/**
 * Achievements page (/achievements), the home-page wins strip and the shell's
 * `wins` command. Photos: drop them in _inbox/achievements/<slug>/ and run
 * `node scripts/process-photos.mjs`, then add one alt text per photo below
 * (same order as the files). Missing facts are `todo("…")`, never guessed.
 */

export type GalleryPhoto = PhotoFile & { alt: string };

export type Achievement = {
  slug: string;
  title: string;
  placement: string;
  /** What kind of event it was, and where. */
  event: Text;
  organiser: Text;
  year: Text;
  team: Text;
  /** 2–3 short lines. */
  description: Text[];
  /** Related case study, when there is one. */
  project?: { label: string; href: string };
  /** Source code, when there is no case study on this site. */
  repo?: { label: string; href: string };
  stack?: string[];
  photos: GalleryPhoto[];
};

/** Pairs processed photo files with their alt texts; fails the build if one is missing. */
function gallery(slug: string, alts: string[]): GalleryPhoto[] {
  const files = photoFiles[slug] ?? [];
  if (files.length !== alts.length) {
    throw new Error(`achievements: ${slug} has ${files.length} photo(s) but ${alts.length} alt text(s)`);
  }
  return files.map((f, i) => ({ ...f, alt: alts[i] }));
}

export const achievements: Achievement[] = [
  {
    slug: "comfix",
    title: "ComFix 2026",
    placement: "1st Runner-Up",
    event: "Inter-university communication technology ideathon · University of Moratuwa",
    organiser: "IEEE Communications Society Student Branch Chapter",
    year: "2026",
    team: "Mora Vortex",
    description: [
      "Networking track, with a software-based solution. Proposal-first: teams of three were shortlisted on their proposals, then built them.",
      "Our project, AAAC (Access-Aware Admission Control), is a fairness-aware virtual waiting room that adapts admission windows and page payloads to each client’s link quality.",
    ],
    project: { label: "AAAC case study", href: "/projects/aaac" },
    photos: gallery("comfix", [
      "Five people on a stage in front of a projector screen, holding a large ComFix ’26 presentation cheque that reads “First Runners Up · LKR 30,000”.",
    ]),
  },
  {
    slug: "aurora",
    title: "Aurora 2026",
    placement: "2nd Runner-Up",
    event: "University AI Ideathon",
    organiser: "University of Sri Jayewardenepura",
    year: "2026",
    team: "Mora Vortex",
    description: [
      "Our project, Sentrio, is an AI browser extension that detects social-engineering attacks on Sri Lankan banking users.",
    ],
    project: { label: "Sentrio case study", href: "/projects/sentrio" },
    photos: gallery("aurora", [
      "A group on stage at Aurora 2026, two of them holding a large “Second Runner-Up · 25,000 LKR” cheque, in front of a screen that reads “2nd Runner Up”.",
    ]),
  },
  {
    slug: "codesplash",
    title: "Codesplash AI Agent Hackathon 2026",
    placement: "Finalist",
    event: "AI agent hackathon",
    organiser: "University of Kelaniya",
    year: "2026",
    team: "Mora Vortex",
    description: [
      "Our project, Pol Mila, is an explainable-AI fair-price benchmarking tool for coconut smallholders in Sri Lanka.",
    ],
    stack: ["Python", "XGBoost", "LightGBM", "SHAP", "FastAPI", "Next.js", "PostgreSQL"],
    repo: { label: "Pol Mila on GitHub", href: "https://github.com/codesplash26-ai/mora-vortex" },
    photos: gallery("codesplash", [
      "Six people in matching black T-shirts and lanyards on the Codesplash stage, holding a certificate, behind large “CODESPLASH” letters.",
    ]),
  },
  {
    slug: "octwave",
    title: "OctWave 3.0 Kaggle Hackathon",
    placement: "1st place, Round 1",
    event: "Image-classification challenge on Kaggle",
    organiser: "IEEE Student Branch, University of Moratuwa",
    year: todo("year — the old About timeline said 2025"),
    team: "Mora Vortex",
    description: [
      "Classifying frames from Tom & Jerry. We reframed it as two binary detectors, using EfficientNet-B3 and ConvNeXt, and reached 0.9444 on the public leaderboard.",
    ],
    stack: ["EfficientNet-B3", "ConvNeXt"],
    photos: [],
  },
];

export type Activity = { role: string; organisation: string; period: string; description: string };

export const extraCurricular: Activity[] = [
  {
    role: "IT & Media Coordinator",
    organisation: "University of Moratuwa Dancing Society",
    period: "2026 – present",
    description: "Managing digital content and media for the society’s activities.",
  },
  {
    role: "Organising Committee Member",
    organisation: "FIT Future Career Fair",
    period: "2025 – 2026",
    description: "Helped organise the Faculty of IT’s career fair, connecting students with industry.",
  },
];
