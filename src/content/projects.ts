import type { CaseStudy } from "./case-study";

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
  /** Full case study — see docs/PLAN.md → "Case-study template". */
  caseStudy?: CaseStudy;
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
      "Background work such as emails, PDF builds and document processing must not be lost when the worker running it dies. Each job is claimed by one worker at a time (SKIP LOCKED plus leases); delivery is at-least-once, so handlers should be idempotent.",
    highlights: [
      "Published jobqueue-core to GitHub Packages with a pluggable handler interface",
      "Worker leases and heartbeats so a crashed worker's job is picked up again",
      "Exponential backoff retries, then a dead-letter state instead of endless loops",
      "JUnit integration tests, GitHub Actions CI and a live Prometheus metrics endpoint",
    ],
    caseStudy: {
      overview: [
        "A job queue built from scratch on Java, Spring Boot and PostgreSQL, packaged as a reusable library (jobqueue-core) with a pluggable handler interface. It tracks work, not messages: every job has a state, an attempt count, a lease held by whichever worker is running it, a retry schedule and a recorded failure reason.",
        "Several worker processes claim jobs from the same table at once without ever claiming the same job twice. When a worker dies mid-job its lease expires and another worker picks the job back up. Delivery is at-least-once, so side effects are made idempotent with a key supplied by the caller.",
        "Why build it: in production you would reach for Celery, Sidekiq, SQS or Temporal. This is a learning project, built to understand what those systems do underneath — claiming a job safely under concurrency, telling a dead worker from a slow one, what backoff and dead-lettering look like as rows in a table, and why at-least-once delivery pushes correctness onto the handler.",
      ],
      architecture: {
        caption:
          "One jar, two Spring profiles. There is no coordinator process: workers never talk to the API or to each other — PostgreSQL row locks and leases are the only coordination.",
        diagram: {
          width: 780,
          height: 392,
          title: "Distributed Job Queue architecture",
          description:
            "A client sends POST /jobs to the API, which runs JobController, the Reaper, Flyway migrations and the Prometheus endpoint. N worker processes claim jobs directly from PostgreSQL with FOR UPDATE SKIP LOCKED, renew their lease with a heartbeat, and mark jobs done, retried or dead. The Reaper returns jobs with expired leases to PENDING, or DEAD once attempts are used up. PostgreSQL holds the jobs, completed_effects and fake_payments tables and is the only coordinator.",
          nodes: [
            { id: "client", x: 16, y: 60, w: 124, h: 64, title: "client", lines: ["any HTTP caller"] },
            {
              id: "api",
              x: 230,
              y: 24,
              w: 230,
              h: 120,
              tone: "accent",
              title: "API · default profile",
              lines: ["JobController", "Reaper · sweep every 5s", "Flyway migrations", "/actuator/prometheus"],
            },
            {
              id: "workers",
              x: 520,
              y: 24,
              w: 230,
              h: 120,
              tone: "accent",
              stack: 2,
              title: "workers × N",
              lines: ["worker profile, no web server", "claim poll · every 10ms", "type → JobHandler bean", "heartbeat timer while busy"],
            },
            {
              id: "db",
              x: 230,
              y: 286,
              w: 532,
              h: 96,
              tone: "info",
              title: "PostgreSQL 16 — the only coordinator",
              lines: ["jobs · completed_effects · fake_payments", "PENDING → RUNNING → SUCCEEDED | DEAD"],
            },
          ],
          edges: [
            { points: [[140, 92], [226, 92]], label: ["POST /jobs"], labelAt: [184, 82], labelAnchor: "middle" },
            {
              points: [[300, 144], [300, 282]],
              label: ["insert job (PENDING)", "reaper: expired lease →", "PENDING, or DEAD when", "attempts are used up"],
              labelAt: [312, 184],
            },
            {
              points: [[590, 156], [590, 282]],
              label: ["claim (SKIP LOCKED)", "heartbeat: extend lease", "done / retry / DEAD"],
              labelAt: [602, 184],
            },
          ],
        },
      },
      role: {
        summary: "Solo project — I designed and built it end to end.",
        owned: [
          "The SQL at the core: the claim query, leases, retries, dead-lettering and the idempotent-effect statement (Spring JDBC, no JPA)",
          "Worker, Reaper and the pluggable JobHandler interface",
          "Integration and chaos tests against a real PostgreSQL, run in GitHub Actions CI",
          "Docker Compose setup (database, API, 3 worker replicas) and the Prometheus metrics",
        ],
        timeframe: "Built in September 2026, about one week",
      },
      decisions: [
        {
          title: "Claim a job in one statement with FOR UPDATE SKIP LOCKED",
          body: "A worker claims with a single UPDATE … WHERE id = (SELECT … FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *. Concurrent workers skip rows another transaction has locked instead of waiting on them, so N workers polling at the same moment get N different jobs.",
          evidence:
            "3 workers, 1000 jobs: about 1900 duplicate claims with read-then-update, 0 with the single statement.",
        },
        {
          title: "Leases, renewed by a heartbeat timer",
          body: "A claim stamps claimed_by (hostname + PID) and lease_expires_at. While the handler runs, a background timer extends the lease every lease-seconds / 3, so a slow job is never taken away; a dead worker stops renewing and the Reaper puts its job back. The trade-off: the later a worker dies, the later its job is noticed.",
          evidence:
            "A 40 s handler under a 30 s lease finished on attempt 1, never reclaimed. With 3 worker containers, one killed mid-job (exit 137): another worker finished it, attempts = 2.",
        },
        {
          title: "Ownership checked on every write",
          body: "markSucceeded, heartbeat, scheduleRetry and markDead all require state = 'RUNNING' AND claimed_by = ?. A worker that stalled past its lease cannot mark a job done that someone else now owns — the update hits 0 rows and it logs LEASE LOST.",
          evidence: "Covered by integration tests for completion and heartbeat ownership.",
        },
        {
          title: "Exponential backoff with jitter, then a dead letter",
          body: "Attempts are counted at claim time, so a job that crashes its worker still counts. A failed attempt waits base × 2^(attempts − 1) plus 0–3 s of random jitter, so jobs that failed together don't retry in lockstep. After 5 attempts the job goes to DEAD with last_error kept. The Reaper applies the same rule, so a poison job that kills its worker can't be resurrected forever.",
          evidence: "A failing job retried after 7 s, 11 s, 22 s and 42 s, then went DEAD on attempt 5 with last_error preserved.",
        },
        {
          title: "At-least-once delivery plus idempotency keys",
          body: "Exactly-once across a worker and a database isn't achievable — a crash between doing the work and recording it is always possible. So an idempotency key is required on POST /jobs, and one SQL statement both records the key (ON CONFLICT DO NOTHING) and applies the effect, so the effect lands once however many times the job runs.",
          evidence:
            "Chaos test: 200 jobs, 4 workers, 15% of claims abandoned mid-flight — every job reached a final state and no key was paid twice.",
        },
        {
          title: "Pluggable handlers",
          body: "The worker knows nothing about job logic: it looks the job's type up in a map of JobHandler beans. Adding a job type is one @Component. Failure is just a thrown exception, which goes down the same retry and dead-letter path; two handlers for one type fail at startup instead of one being picked silently.",
          evidence:
            "A job with no matching handler retried, then went DEAD on attempt 5 with last_error = “no handler registered for type: unknown-type”.",
        },
        {
          title: "Metrics that can't drift from the logs",
          body: "Counters (claimed, succeeded, retried, dead, leases reaped, leases lost) are incremented on the same code branch as the matching log line. Gauges read queue depth straight from the database on every scrape of /actuator/prometheus — a rising pending gauge is the signal that the queue is falling behind.",
        },
      ],
      stackNotes: {
        Java: "Java 25",
        "Spring Boot": "Spring Boot 4.1.1 with Spring JDBC (JdbcTemplate) — no JPA, the SQL is the point",
        PostgreSQL: "PostgreSQL 16 — row locks and leases are the whole coordination layer",
        Docker: "Docker Compose: database, API and 3 worker replicas",
        Flyway: "schema migrations, run by the API only",
        JUnit: "JUnit 5 integration and chaos tests against a real database, run in GitHub Actions",
        Prometheus: "Micrometer registry behind /actuator/prometheus",
      },
      extraLinks: [
        { label: "package", href: "https://github.com/Sachintha-dilshan49/distributed-job-queue/packages/3249511" },
      ],
    },
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
