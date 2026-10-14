import { todo, type Text } from "./case-study";

export const profile = {
  name: "Sachintha Dilshan",
  fullName: "N.L. Sachintha Dilshan",
  host: "sachintha@moratuwa",
  role: "Software Engineering Intern",
  focus: "Backend · Distributed systems · DevOps",
  summary:
    "Third-year IT undergraduate at the University of Moratuwa. I build backends that keep working when parts of them fail.",
  availability: "Jan 2027",
  email: "nlsachinthadilshan@gmail.com",
  github: "https://github.com/Sachintha-dilshan49",
  linkedin: "https://www.linkedin.com/in/sachintha-dilshan-498a3a306",
  // Public CV at public/cv.pdf (may include referee details — the referees have consented)
  cvPath: "/cv.pdf",
  // Name the browser saves the CV under
  cvFileName: "Sachintha-Dilshan-CV.pdf",
  photo: "/me.jpg" as string | null,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Home hero: a short login sequence, then `cat about.txt` (components/hero.tsx). */
export const hero = {
  title: "guest@sachintha: ~ — ttys001",
  user: "guest",
  prompt: "guest@sachintha",
  tty: "ttys001",
  welcome: "Welcome to sachintha.dev",
  command: "cat about.txt",
  headline: "Backend & Systems Engineering · Undergraduate, University of Moratuwa",
  summary:
    "I design and build backend systems: APIs, background processing, access control, and the infrastructure that keeps them dependable. My focus is on software that stays reliable under failure, with clear architecture and measurable behaviour. I work mainly with Java, Python and TypeScript, and I’m currently reading for a BSc (Hons) in Information Technology.",
  actions: { projects: "View projects", cv: "Download CV", contact: "Contact" },
};

/** Key/value facts. No longer shown in the hero; the shell's `whoami` prints a few of them. */
export type FetchLine = { key: string; value: string; tone?: "gold" | "ok" };

export const neofetch: FetchLine[] = [
  { key: "Role", value: "Software Engineering Intern (seeking)" },
  { key: "Focus", value: "Backend · Distributed systems · DevOps" },
  { key: "Uni", value: "BSc (Hons) IT · University of Moratuwa" },
  { key: "CGPA", value: "3.59 / 4.00" },
  { key: "Langs", value: "Java · Python · TypeScript · SQL · C" },
  { key: "Stack", value: "Spring Boot · FastAPI · Next.js · PostgreSQL · Docker" },
  { key: "Projects", value: "7 shipped (4 team, 3 solo)" },
  {
    key: "Wins",
    value: "1st RU ComFix · 2nd RU Aurora · OctWave R1 · Codesplash finalist",
    tone: "gold",
  },
  { key: "Status", value: "● open to work · Jan 2027 · remote OK", tone: "ok" },
];

/** About page (src/app/about/page.tsx). */
export const about = {
  heading: "I like systems that explain themselves when they break.",
  bio: [
    "I’m a third-year IT undergraduate at the University of Moratuwa, reading for a BSc (Hons) in Information Technology. Most of what I build lives behind the UI: APIs, access control, background processing, and the infrastructure that keeps them dependable.",
    "I care most about software that stays reliable under failure, with clear architecture and measurable behaviour. I work mainly with Java, Python and TypeScript, and reach for Spring Boot, FastAPI, Next.js, PostgreSQL and Docker.",
    "Outside code I’m the IT & Media Coordinator for the University of Moratuwa Dancing Society, which is where my interest in motion and timing comes from.",
  ],
};

export type Education = { qualification: string; institution: string; period: string; details: string[] };

export const education: Education[] = [
  {
    qualification: "BSc (Hons) Information Technology",
    institution: "University of Moratuwa",
    period: "2024 – 2028 (expected)",
    details: ["CGPA 3.59 / 4.00"],
  },
  {
    qualification: "G.C.E. Advanced Level",
    institution: "Rahula College, Matara",
    period: "2023",
    details: ["Physical Science stream", "Z-score 2.065"],
  },
];

/** `group` is the shell's short name (`stack` command); `title` is shown on About. */
export const skills: { group: string; title: string; items: string[] }[] = [
  { group: "languages", title: "Languages", items: ["Java", "Python", "TypeScript", "JavaScript", "SQL", "C"] },
  { group: "backend", title: "Backend", items: ["Spring Boot", "FastAPI", "Express", "REST", "JWT", "RBAC"] },
  { group: "data", title: "Databases", items: ["PostgreSQL", "Redis", "SQLite", "ChromaDB", "Prisma", "SQLAlchemy"] },
  { group: "ai-ml", title: "AI/ML", items: ["RAG", "LightGBM", "XGBoost", "Sentence Transformers", "LLM APIs"] },
  { group: "devops", title: "DevOps & Tools", items: ["Docker", "GitHub Actions", "Flyway", "Prometheus", "Micrometer"] },
];

export type Certification = { name: string; issuer: string; year: Text; credential: Text };

export const certifications: Certification[] = [
  {
    name: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    year: todo("year"),
    credential: todo("credential link"),
  },
  {
    name: "Introduction to DevOps and Site Reliability Engineering (LFS162)",
    issuer: "The Linux Foundation",
    year: todo("year"),
    credential: todo("credential link"),
  },
];
