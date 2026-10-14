export type ProjectTag = "backend" | "fullstack" | "ai" | "devops" | "security";

export type Project = {
  slug: string;
  name: string;
  summary: string;
  team: string; // "solo" or the team name
  role: string;
  tags: ProjectTag[];
  stack: string[];
  repo?: string;
  live?: string;
  badge?: string;
  featured?: boolean;
  problem: string;
  highlights: string[];
};

export const projects: Project[] = [
  {
    slug: "distributed-job-queue",
    name: "Distributed Job Queue",
    summary:
      "Reusable Spring Boot library for reliable background jobs: leases, heartbeats, backoff retries, crash recovery and dead-letter handling.",
    team: "solo",
    role: "Solo · design and build",
    tags: ["backend", "devops"],
    stack: ["Java", "Spring Boot", "PostgreSQL", "Docker", "Flyway", "JUnit", "Prometheus"],
    repo: "https://github.com/Sachintha-dilshan49/distributed-job-queue",
    featured: true,
    problem:
      "Background work such as emails, PDF builds and document processing must not be lost when the worker running it dies, and must never run twice at the same time.",
    highlights: [
      "Published jobqueue-core to GitHub Packages with a pluggable handler interface",
      "Worker leases and heartbeats so a crashed worker's job is picked up again",
      "Exponential backoff retries, then a dead-letter state instead of endless loops",
      "JUnit integration tests, GitHub Actions CI and a live Prometheus metrics endpoint",
    ],
  },
  {
    slug: "waypoint-logistics",
    name: "Waypoint Logistics",
    summary:
      "Five-role operations platform taking an order from store request through depot allocation, dock loading and delivery to receipt.",
    team: "SynapX",
    role: "Team SynapX",
    tags: ["backend", "fullstack"],
    stack: ["FastAPI", "Next.js", "Keycloak", "PostgreSQL", "Cloudflare R2"],
    repo: "https://github.com/Sachintha-dilshan49/SynapX_WaypointLogistics",
    live: "https://synap-x-waypoint-logistics-8thu.vercel.app",
    featured: true,
    problem:
      "A retail group needed one system for store managers, dispatchers, loaders, drivers and admins to plan and fulfil deliveries across depots.",
    highlights: [
      "Role-based workspaces behind a single Keycloak sign-in",
      "Vehicle allocation checked against capacity, temperature, depot and timing",
      "Offline-capable loader and driver apps that sync when the connection returns",
      "Operational email sent from a queue by a separate worker",
    ],
  },
  {
    slug: "aaac",
    name: "AAAC",
    summary:
      "Fairness-aware virtual waiting room that adapts admission windows and page payloads to each client's link quality.",
    team: "Team",
    role: "Team project",
    tags: ["backend", "ai"],
    stack: ["Python", "FastAPI", "Redis", "LightGBM", "Docker"],
    repo: "https://github.com/Sachintha-dilshan49/AAAC",
    featured: true,
    problem:
      "Ordinary waiting rooms time out users on slow connections first, so the people with the worst links lose their place.",
    highlights: [
      "LightGBM-based link-quality estimation per client",
      "Adaptive admission windows and payload sizes",
      "Client SDK and live dashboard",
      "Docker-based network emulation with automated evaluation",
    ],
  },
  {
    slug: "corehr",
    name: "CoreHR",
    summary:
      "HR management platform; I built the document module with separation-of-duties approvals, PDF generation and idempotent email intake.",
    team: "Team",
    role: "Team · document management module",
    tags: ["backend", "fullstack"],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "SQLAlchemy", "Alembic"],
    repo: "https://github.com/thisaruRasanjana/hrm-system-portfolio",
    featured: true,
    problem:
      "HR documents need approval chains where the requester can't approve their own request, and emailed requests must not create duplicates.",
    highlights: [
      "Approval workflows with separation-of-duties enforcement",
      "Automated PDF document generation from templates",
      "IMAP background service with Message-ID idempotency",
    ],
  },
  {
    slug: "sentrio",
    name: "Sentrio",
    summary:
      "Browser extension that detects social-engineering and phishing attacks aimed at Sri Lankan banking users.",
    team: "Mora Vortex",
    role: "Team · AI reasoning layer",
    tags: ["ai", "security"],
    stack: ["JavaScript", "Chrome MV3", "Groq", "Llama 3.3", "IndexedDB"],
    repo: "https://github.com/Sachintha-dilshan49/sentrio",
    badge: "2nd Runner-Up · Aurora 2026",
    problem:
      "Phishing pages targeting local bank customers are convincing and short-lived, so static blocklists miss them.",
    highlights: [
      "LLM reasoning layer with multi-provider support",
      "Evidence grounding from trusted external sources",
      "2nd Runner-Up at Aurora 2026, University of Sri Jayewardenepura",
    ],
  },
  {
    slug: "rahula-dancing-society",
    name: "Rahula Dancing Portal",
    summary:
      "Learning portal for students, marks, quizzes and study resources with Admin, Teacher and Student roles.",
    team: "solo",
    role: "Solo · full stack",
    tags: ["fullstack"],
    stack: ["Next.js", "React", "Tailwind", "Express", "Prisma", "PostgreSQL", "JWT"],
    repo: "https://github.com/Sachintha-dilshan49/rahula-dancing-society",
    problem:
      "A school society needed one place for marks, notes and online quizzes, with each role seeing only its own data.",
    highlights: [
      "JWT authentication with role-based access control and data isolation",
      "Server-side quiz evaluation with controlled exam access",
      "Structured Express backend with Prisma",
    ],
  },
  {
    slug: "material-selection-assistant",
    name: "Material Selection Assistant",
    summary:
      "RAG assistant that recommends engineering materials from plain-English operating conditions.",
    team: "solo",
    role: "Solo · design and build",
    tags: ["ai"],
    stack: ["Python", "ChromaDB", "Sentence Transformers", "SQLite", "Streamlit"],
    repo: "https://github.com/Sachintha-dilshan49/mechanical_assistant_project",
    problem:
      "Students describe operating conditions in words, but material data lives in tables; LLMs alone invent property values.",
    highlights: [
      "Semantic retrieval over a curated material set",
      "Verified properties kept in SQLite as the source of truth",
      "Multi-provider LLM support with caching and failover",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
