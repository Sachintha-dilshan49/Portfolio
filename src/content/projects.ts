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
    role: "Team SynapX · Loader workspace",
    tags: ["backend", "fullstack"],
    stack: ["FastAPI", "Next.js", "Keycloak", "PostgreSQL", "Alembic", "Cloudflare R2"],
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
    caseStudy: {
      overview: [
        "A role-based operations platform for planning and fulfilling deliveries across Waypoint Group. It covers the full journey of an order: a store's goods request, depot allocation, dock loading, driver delivery, and the store's receiving confirmation.",
        "Five role workspaces — System Administrator, Dispatcher, Loader, Driver and Store Manager — sit behind one sign-in. The live system holds the brief's reference data: 2 depots with 4 loading docks, 120 outlets across the Fresh, Style and Tech chains, 63 vehicles and 1,092 catalogue items.",
        "It grew out of the team's Designathon prototype, which covered four roles and a five-stage journey (Order, Plan, Load, Deliver, Receive). The built system keeps that journey and adds an admin role, a dock hand-off between planning and loading, and operational email.",
      ],
      architecture: {
        caption:
          "Next.js frontend → FastAPI API → PostgreSQL on Neon, with Keycloak for sign-in and Cloudflare R2 for photos. The email worker runs as a separate process outside Vercel, because it needs to run continuously.",
        diagram: {
          width: 780,
          height: 392,
          title: "Waypoint Logistics architecture",
          description:
            "A Next.js frontend with five role workspaces calls a FastAPI API over REST. The API verifies sign-in tokens with Keycloak, stores photos in Cloudflare R2, and reads and writes PostgreSQL on Neon. A separate email worker reads queued messages from the email_outbox table and sends them over SMTP.",
          nodes: [
            {
              id: "web",
              x: 16,
              y: 24,
              w: 210,
              h: 120,
              title: "Next.js frontend",
              lines: ["5 role workspaces", "admin · dispatcher · loader", "driver · store", "offline queue → sync"],
            },
            {
              id: "api",
              x: 290,
              y: 24,
              w: 230,
              h: 120,
              tone: "accent",
              title: "FastAPI API",
              lines: ["/api/v1 · on Vercel", "allocation constraints", "role APIs incl. /loader", "Alembic migrations"],
            },
            { id: "kc", x: 580, y: 24, w: 184, h: 64, title: "Keycloak", lines: ["one sign-in, every role"] },
            { id: "r2", x: 580, y: 104, w: 184, h: 76, title: "Cloudflare R2", lines: ["photos: flags,", "proof of delivery"] },
            {
              id: "db",
              x: 290,
              y: 276,
              w: 230,
              h: 96,
              tone: "info",
              title: "PostgreSQL (Neon)",
              lines: ["orders · runs · stops", "email_outbox"],
            },
            {
              id: "mail",
              x: 600,
              y: 276,
              w: 164,
              h: 96,
              title: "email worker",
              lines: ["separate process", "outbox → SMTP"],
            },
          ],
          edges: [
            { points: [[226, 84], [286, 84]], label: ["REST"], labelAt: [256, 76], labelAnchor: "middle" },
            { points: [[520, 52], [576, 52]], label: ["tokens"], labelAt: [548, 44], labelAnchor: "middle" },
            { points: [[520, 128], [576, 128]], label: ["photos"], labelAt: [548, 120], labelAnchor: "middle" },
            { points: [[405, 144], [405, 272]] },
            { points: [[600, 324], [524, 324]], label: ["reads"], labelAt: [562, 316], labelAnchor: "middle" },
          ],
        },
      },
      role: {
        summary: "Team of ~10. I built the Loader workspace, one of the five role workspaces, end to end.",
        owned: [
          "Backend: data models and Alembic migrations for delivery runs, stops, plan revisions, loader issues, checks and activity.",
          "The /loader API covers loader sessions and the dock-wide queue, the loading checklist (check / uncheck / re-check), issue flagging, and release with an undo window and release lock. It also handles plan-change detection with acknowledge/takeover, and a run activity log and dock activity feed.",
          "Idempotent writes using client_action_id, so duplicate requests are rejected.",
          "Integration with the dispatcher and driver flows: loader runs created from dispatch trips, order status updates on loading and release, and final shortfall numbers for the Store Manager.",
          "Keycloak sign-in for loaders (replacing PINs) and flag-photo upload to Cloudflare R2.",
          "Frontend: the loader checklist, plan-diff and review screens.",
          "Domain, API and seed-fidelity tests; the loader API contract docs; a one-command demo seed.",
        ],
        timeframe: "Late Sep – early Oct 2026",
      },
      decisions: [
        {
          title: "One sign-in for every role, including the loader",
          body: "The prototype had loaders pick their name and enter a PIN on a shared dock tablet. Every role now signs in through Keycloak, so the system has one login, one session model and one audit trail. To keep the shared-tablet use, the loader workspace keeps Switch user and signs out automatically after 10 minutes of inactivity.",
        },
        {
          title: "A dock hand-off before loading starts",
          body: "The dispatcher allocates a vehicle and sends it to a dock; the driver confirms arrival; only then does the run appear in the loaders' queue. Pick locks a run to one loader, so loading can't start before the truck is at the dock and two loaders can't work the same run.",
        },
        {
          title: "Problems block release, and release can be undone",
          body: "A loader can flag an order on the checklist (for example as short). The dispatcher resolves it under Exceptions, and the run can't be released until they decide. After Confirm & release, the release can be undone for about 10 seconds.",
        },
        {
          title: "Vehicle allocation checked against real constraints",
          body: "The allocation drawer recommends vehicles and checks each against capacity, temperature, depot, availability, fuel and route timing. A request that mixes chilled and ambient goods is split into two orders, one per temperature zone.",
        },
        {
          title: "Offline-capable loader and driver apps",
          body: "In the loader or driver workspace the device can lose its network and keep working. Queued actions sync when the connection returns.",
        },
        {
          title: "Email from an outbox, sent by a separate worker",
          body: "Operational email to dispatchers, store managers and admins is queued in email_outbox and sent by a worker outside Vercel, because it has to run continuously. Photos go to Cloudflare R2 because serverless functions can't keep files between requests.",
        },
      ],
      stackNotes: {
        FastAPI: "the API under /api/v1, deployed on Vercel",
        "Next.js": "five role workspaces; loader and driver work offline",
        Keycloak: "one sign-in for every role; admin user changes are applied in Keycloak too",
        PostgreSQL: "hosted on Neon",
        Alembic: "migrations; only the DB lead applies them to the shared database",
        "Cloudflare R2": "photo storage, required on Vercel where functions can't keep files",
      },
    },
  },
  {
    slug: "aaac",
    name: "AAAC",
    summary:
      "Fairness-aware virtual waiting room that adapts admission windows and page payloads to each client's link quality.",
    team: "Team",
    role: "Team · estimator, delivery, client SDK",
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
    caseStudy: {
      overview: [
        "AAAC (Access-Aware Admission Control) is a virtual waiting room that stays fair to users on slow connections.",
        "Conventional waiting rooms give every user the same admission window and the same page. Users on slow, lossy links time out, go to the back of the queue and retry at the same cost, so they are systematically excluded. AAAC adapts the queue to each client's link to close that gap.",
        "The key metric is the completion gap: Δ = completion rate of HIGH-bandwidth clients − completion rate of LOW-bandwidth clients.",
      ],
      architecture: {
        caption:
          "Three services — admission (with Redis), delivery and a mock origin — plus three client containers whose networks are shaped to HIGH, MEDIUM and LOW links with tc netem. Run modes compare no queue, a conventional waiting room and the full system.",
        diagram: {
          width: 780,
          height: 392,
          title: "AAAC architecture",
          description:
            "Three client containers, shaped to high, medium and low links and using the client SDK, join the queue at the admission service on port 8000, which uses Redis and holds the adaptive window, the link estimator, re-queueing and AIMD rate control. Admitted clients fetch a page sized to their link from the delivery service on port 8001, which fetches from the mock origin on port 8002. Origin health feeds back into the admission rate.",
          nodes: [
            {
              id: "clients",
              x: 16,
              y: 24,
              w: 200,
              h: 120,
              stack: 2,
              title: "clients × 3",
              lines: ["HIGH · MEDIUM · LOW", "shaped with tc netem", "client SDK"],
            },
            {
              id: "admission",
              x: 300,
              y: 24,
              w: 230,
              h: 136,
              tone: "accent",
              title: "admission :8000",
              lines: ["queue + adaptive window", "link estimator", "non-regressive re-queue", "AIMD rate control", "Redis"],
            },
            {
              id: "delivery",
              x: 300,
              y: 276,
              w: 230,
              h: 96,
              tone: "accent",
              title: "delivery :8001",
              lines: ["page variant per link", "411 KB → 5 KB → 2 KB"],
            },
            { id: "origin", x: 590, y: 276, w: 174, h: 96, tone: "info", title: "origin :8002", lines: ["mock origin"] },
          ],
          edges: [
            { points: [[232, 64], [296, 64]], label: ["join"], labelAt: [264, 56], labelAnchor: "middle" },
            { points: [[296, 112], [232, 112]], label: ["admit"], labelAt: [264, 104], labelAnchor: "middle" },
            { points: [[116, 160], [116, 324], [296, 324]], label: ["fetch page"], labelAt: [126, 244] },
            { points: [[530, 324], [586, 324]], label: ["fetch"], labelAt: [558, 316], labelAnchor: "middle" },
            {
              points: [[677, 276], [677, 92], [534, 92]],
              label: ["origin health", "→ admission rate"],
              labelAt: [667, 200],
              labelAnchor: "end",
            },
          ],
        },
      },
      role: {
        summary:
          "My part is listed below; teammates built the admission-control core and the evaluation framework.",
        owned: [
          "The link-quality estimator: LightGBM model, synthetic training data, training pipeline and model card.",
          "The in-band link measurement probe.",
          "The client SDK: input-support fallback, asymmetric clamping, a test harness, payload variants and sub-resource fetching.",
          "The adaptive payload delivery service with capacity benchmarking.",
          "The admission dashboard layout.",
        ],
        timeframe: "Sep 2026",
      },
      decisions: [
        {
          title: "Classify each client's link from its own traffic",
          body: "A LightGBM classifier labels each client HIGH, MEDIUM or LOW from its own traffic, and the window and payload adapt to that class. The results report notes the classifier was rarely exercised in the evaluated runs.",
        },
        {
          title: "Slower links get more time",
          body: "The admission window adapts to the link, so a client on a slow connection gets longer to finish instead of the same window as everyone else.",
        },
        {
          title: "Same content, lighter page",
          body: "Slower links get a lighter page with the same content: 411 KB for fast links, 5 KB and 2 KB for slower ones.",
        },
        {
          title: "Timing out doesn't cost your place",
          body: "A non-regressive re-queue: a client that times out keeps its place and gets a cheaper retry, instead of going to the back of the queue.",
        },
        {
          title: "Admission rate follows origin health",
          body: "AIMD rate control (additive increase, multiplicative decrease) makes the admission rate track origin health, so the server never collapses.",
        },
        {
          title: "A pre-registered, reproducible evaluation",
          body: "A Docker testbed with network-shaped client containers runs three modes — no queue, a conventional waiting room, and AAAC — over several seeds, then generates a results report.",
          evidence:
            "3 seeds × 3 modes, 140 clients per run: mean completion gap 0.986 for the conventional waiting room vs 0.027 for AAAC, aggregate completion 0.655 vs 0.991, zero origin errors (p = 0.0005). Limitations: 3 of 5 planned seeds and a scaled-down load.",
        },
      ],
      stackNotes: {
        Python: "Python 3.11",
        Redis: "used by the admission service",
        LightGBM: "link-quality classifier (HIGH / MEDIUM / LOW)",
        Docker: "testbed with network-shaped client containers (tc netem)",
      },
    },
  },
  {
    slug: "corehr",
    name: "CoreHR",
    summary:
      "HR management platform; I built the document module with separation-of-duties approvals, PDF generation and idempotent email intake.",
    team: "Team",
    role: "Team · top contributor",
    tags: ["backend", "fullstack"],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "SQLAlchemy", "Alembic", "APScheduler"],
    repo: "https://github.com/Sachintha-dilshan49/hrm-system",
    featured: true,
    problem:
      "HR documents need approval chains where the requester can't approve their own request, and emailed requests must not create duplicates.",
    highlights: [
      "Approval workflows with separation-of-duties enforcement",
      "Automated PDF document generation from templates",
      "IMAP background service with Message-ID idempotency",
    ],
    caseStudy: {
      overview: [
        "CoreHR is a full-stack HR management system that digitises the employee lifecycle: recruitment and applicant tracking, employee records, leave, and document workflows.",
        "It is a modular monolith — a Next.js frontend and a FastAPI backend — plus a separate AI microservice for automated candidate screening.",
        "HR documents need approval chains where the requester can't approve their own request, and emailed requests must not create duplicate records.",
      ],
      architecture: {
        caption:
          "One FastAPI API holds the HR modules and the scheduled jobs. CV screening runs as its own service so heavy LLM inference and document parsing don't slow the main API.",
        diagram: {
          width: 780,
          height: 392,
          title: "CoreHR architecture",
          description:
            "A Next.js frontend, including the public job portal, calls the main FastAPI API over REST. The API handles JWT and permission-based access, employees, recruitment, documents and leave, and runs APScheduler jobs guarded by PostgreSQL advisory locks. It stores data in PostgreSQL through SQLAlchemy and Alembic, sends CVs to a separate AI screening service, and an IMAP poller pulls inbound HR requests from an external inbox, de-duplicated by Message-ID.",
          nodes: [
            {
              id: "web",
              x: 16,
              y: 24,
              w: 200,
              h: 100,
              title: "Next.js frontend",
              lines: ["App Router · TypeScript", "HR portal", "public job portal"],
            },
            {
              id: "api",
              x: 270,
              y: 24,
              w: 250,
              h: 136,
              tone: "accent",
              title: "FastAPI main API",
              lines: ["JWT + permission RBAC", "employees · recruitment", "documents · leave", "APScheduler jobs", "(advisory-locked)"],
            },
            {
              id: "ai",
              x: 574,
              y: 24,
              w: 190,
              h: 100,
              title: "AI screening",
              lines: ["separate FastAPI app", "PyMuPDF · LLM APIs", "regex fallback"],
            },
            {
              id: "db",
              x: 270,
              y: 276,
              w: 250,
              h: 96,
              tone: "info",
              title: "PostgreSQL",
              lines: ["SQLAlchemy · Alembic", "audit tables"],
            },
            {
              id: "inbox",
              x: 574,
              y: 276,
              w: 190,
              h: 96,
              title: "external inbox",
              lines: ["inbound HR requests"],
            },
          ],
          edges: [
            { points: [[216, 74], [266, 74]], label: ["REST"], labelAt: [241, 66], labelAnchor: "middle" },
            { points: [[520, 74], [570, 74]], label: ["CVs"], labelAt: [545, 66], labelAnchor: "middle" },
            { points: [[395, 160], [395, 272]] },
            {
              points: [[669, 276], [669, 140], [524, 140]],
              label: ["IMAP poller", "Message-ID dedupe"],
              labelAt: [659, 200],
              labelAnchor: "end",
            },
          ],
        },
      },
      role: {
        summary: "I was the top contributor.",
        owned: [
          "Document management end to end: HTML/DOCX template engine with PDF generation, promotion and salary letters, separation-of-duties approval routing, and employee document requests and uploads.",
          "An inbound email (IMAP) poller on APScheduler with duplicate prevention.",
          "Leave module: per-role entitlements, accrual rules with caps and carry-forward, real balance calculation, and an approval workflow for medical leave reclassification.",
          "Replaced X-Employee-ID headers with JWT auth and permission-based access.",
          "Production hardening: removed an auth backdoor, centralised soft-delete filtering with partial unique indexes, safer file storage names, and global search with permission filtering.",
        ],
        timeframe: "Jan – Aug 2026",
      },
      decisions: [
        {
          title: "Separation-of-duties approval routing",
          body: "The document routing engine prevents anyone from approving their own document and escalates administrative submissions to Super Admins.",
        },
        {
          title: "Documents generated from templates",
          body: "Standardised PDFs such as promotion letters and contracts are generated from HTML and DOCX templates.",
        },
        {
          title: "Email intake that can't create duplicates",
          body: "A background IMAP poller turns emails in an external inbox into HR requests, using the RFC 5322 Message-ID as an idempotency key so the same email never creates two records.",
        },
        {
          title: "Permission-based access control",
          body: "JWT authentication with fine-grained permissions such as recruitment:manage and document:approve, assigned dynamically, keeps duties separated across every module.",
        },
        {
          title: "Scheduled jobs with advisory locks",
          body: "Background jobs run on APScheduler, guarded by PostgreSQL advisory locks (pg_try_advisory_lock) for distributed execution.",
        },
        {
          title: "AI screening kept out of the main API",
          body: "CV screening runs as its own FastAPI service so LLM inference and document parsing don't degrade the HR API. It can use Groq (Llama 3), Gemini, OpenAI or Claude, extracts text with PyMuPDF, and falls back to deterministic regex extraction when an API is rate-limited.",
        },
        {
          title: "A duplicate-safe public job portal",
          body: "Applications through the public portal are protected by Google reCAPTCHA v2 and by duplicate-application checks: SHA-256 hashes and unique email constraints.",
        },
      ],
      stackNotes: {
        FastAPI: "the main HR API and the separate AI screening service",
        "Next.js": "App Router with TypeScript and Tailwind CSS",
        PostgreSQL: "also provides the advisory locks for scheduled jobs",
        SQLAlchemy: "ORM",
        Alembic: "schema migrations",
        APScheduler: "background jobs, including the IMAP poller",
      },
    },
  },
  {
    slug: "sentrio",
    name: "Sentrio",
    summary:
      "Browser extension that detects social-engineering and phishing attacks aimed at Sri Lankan banking users.",
    team: "Mora Vortex",
    role: "Team · AI agent core",
    tags: ["ai", "security"],
    stack: ["JavaScript", "Chrome MV3", "Groq", "Llama 3.3", "Gemini", "Claude", "IndexedDB"],
    repo: "https://github.com/Sachintha-dilshan49/sentrio",
    badge: "2nd Runner-Up · Aurora 2026",
    problem:
      "Phishing pages targeting local bank customers are convincing and short-lived, so static blocklists miss them.",
    highlights: [
      "LLM reasoning layer with multi-provider support",
      "Evidence grounding from trusted external sources",
      "2nd Runner-Up at Aurora 2026, University of Sri Jayewardenepura",
    ],
    caseStudy: {
      overview: [
        "Sentrio is an agentic AI browser extension that detects social-engineering and phishing attacks aimed at Sri Lankan banking users. Team Mora Vortex built it for Aurora 2026, where it placed 2nd Runner-Up.",
        "Phishing pages targeting local bank customers are convincing and short-lived, so static blocklists miss them.",
        "It works in layers: local checks that run on every page, AI reasoning over the signals they raise, a personal trust profile that learns, and an alert overlay and popup that show the verdict.",
      ],
      architecture: {
        caption:
          "One Manifest V3 extension. The content script runs on every page because phishing can appear on any domain; the background worker does the AI reasoning and fetches grounding evidence over HTTPS.",
        diagram: {
          width: 780,
          height: 392,
          title: "Sentrio architecture",
          description:
            "Layer 1 local checks run in a content script on every page and send signals to the background worker. The worker's AI agent builds a reasoning prompt for the LLM provider — Groq by default, or Gemini or Claude — and fetches grounding evidence from official bank sites, RDAP and crt.sh. It reads and updates the personal trust profile in IndexedDB, and sends its verdict to the alert overlay and popup.",
          nodes: [
            { id: "l1", x: 16, y: 24, w: 200, h: 80, title: "Layer 1 · local", lines: ["content script", "on every page"] },
            {
              id: "worker",
              x: 290,
              y: 24,
              w: 230,
              h: 120,
              tone: "accent",
              title: "background worker",
              lines: ["Layer 2 · AI agent", "prompt builder", "response parser", "analyseThreats"],
            },
            { id: "llm", x: 574, y: 24, w: 190, h: 80, title: "LLM provider", lines: ["Groq (default)", "Gemini · Claude"] },
            { id: "ui", x: 16, y: 276, w: 200, h: 96, title: "Layer 4 · alerts", lines: ["overlay on the page", "popup · toolbar badge"] },
            {
              id: "trust",
              x: 290,
              y: 276,
              w: 230,
              h: 96,
              tone: "info",
              title: "Layer 3 · trust profile",
              lines: ["IndexedDB, per origin"],
            },
            {
              id: "evidence",
              x: 574,
              y: 276,
              w: 190,
              h: 96,
              title: "grounding evidence",
              lines: ["official bank sites", "RDAP · crt.sh"],
            },
          ],
          edges: [
            { points: [[216, 64], [286, 64]], label: ["signals"], labelAt: [251, 56], labelAnchor: "middle" },
            { points: [[520, 64], [570, 64]], label: ["prompt"], labelAt: [545, 56], labelAnchor: "middle" },
            {
              points: [[520, 124], [669, 124], [669, 272]],
              label: ["fetch over", "HTTPS"],
              labelAt: [659, 196],
              labelAnchor: "end",
            },
            { points: [[405, 144], [405, 272]], label: ["read / update"], labelAt: [415, 212] },
            { points: [[330, 144], [330, 210], [116, 210], [116, 272]], label: ["verdict"], labelAt: [223, 202], labelAnchor: "middle" },
          ],
        },
      },
      role: {
        summary:
          "I built the AI agent core. A teammate added the Groq provider and the evidence-grounding lookups (RDAP, crt.sh).",
        owned: [
          "A multi-provider API client (Gemini and Claude).",
          "The prompt builder that turns threat signals into reasoning prompts.",
          "A response parser that validates the AI output, and a fallback handler for API errors.",
          "The analyseThreats orchestrator with a network-availability check, plus a manual test suite.",
        ],
        timeframe: "May – Jun 2026",
      },
      decisions: [
        {
          title: "Layered detection",
          body: "Layer 1 runs local checks in a content script on every page. Layer 2 reasons over the signals they raise with an LLM, Layer 3 keeps a personal trust profile that learns, and Layer 4 shows the result as an overlay and in the popup.",
        },
        {
          title: "A swappable AI provider",
          body: "Layer 2 runs on Groq (llama-3.3-70b-versatile) by default — free and fast for development and the demo. One config setting switches it to Gemini or Claude.",
        },
        {
          title: "Verdicts grounded in evidence",
          body: "The background worker fetches evidence from official bank sites, RDAP and crt.sh over HTTPS to ground the AI's reasoning in trusted external sources.",
        },
        {
          title: "AI output is validated, with a fallback",
          body: "A response parser validates what the model returns, API errors go to a fallback handler, and the analyseThreats orchestrator checks network availability.",
        },
        {
          title: "Minimum permissions",
          body: "Only activeTab and host permissions for all URLs, because phishing can appear on any domain. No storage or notifications permission: the trust profile lives in per-origin IndexedDB, and status shows on the toolbar badge and overlay.",
        },
      ],
      stackNotes: {
        JavaScript: "bundled into the extension's dist/ folder",
        "Chrome MV3": "an unpacked Manifest V3 extension for any Chromium browser",
        Groq: "default provider, added by a teammate",
        "Llama 3.3": "llama-3.3-70b-versatile on Groq",
        Gemini: "alternative provider through the multi-provider client",
        Claude: "alternative provider through the multi-provider client",
        IndexedDB: "per-origin trust profile, so no storage permission is needed",
      },
    },
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
    caseStudy: {
      overview: [
        "A public showcase site plus a private portal for the Rahula Dancing Society. Teachers manage students, marks, notes, past papers, announcements and online quizzes; students log in to see their own results.",
        "Three roles — Admin, Teacher and Student — share one system with JWT sign-in and role-based access. Students can only read their own marks, notes and quiz attempts.",
      ],
      architecture: {
        caption:
          "Two independent apps over a REST API. The frontend has no database access, controllers never touch Prisma directly, and utils/ has no database or HTTP imports, so the scoring and exam-access rules can be unit-tested in isolation.",
        diagram: {
          width: 780,
          height: 392,
          title: "Rahula Dancing Society architecture",
          description:
            "A Next.js frontend with public, auth and portal route groups calls an Express API over REST with JWT bearer tokens. The API is layered route, controller, service, with authenticate and authorize middleware and pure utils for quiz scoring and access rules. It stores data in PostgreSQL through Prisma, saves uploads to a local uploads folder, and sends welcome and password-reset email through a Google Apps Script proxy.",
          nodes: [
            {
              id: "web",
              x: 16,
              y: 24,
              w: 220,
              h: 120,
              title: "Next.js frontend",
              lines: ["(public) showcase site", "(auth) login · OTP reset", "(portal) teacher · student", "services/ fetch wrappers"],
            },
            {
              id: "api",
              x: 320,
              y: 24,
              w: 240,
              h: 120,
              tone: "accent",
              title: "Express API",
              lines: ["route → controller → service", "authenticate · authorize", "utils/: scoring, quiz access", "multer uploads"],
            },
            { id: "mail", x: 600, y: 24, w: 164, h: 80, title: "Apps Script", lines: ["email proxy", "welcome · OTP"] },
            {
              id: "db",
              x: 320,
              y: 276,
              w: 240,
              h: 96,
              tone: "info",
              title: "PostgreSQL",
              lines: ["via Prisma", "students · marks · quizzes"],
            },
            { id: "files", x: 600, y: 276, w: 164, h: 96, title: "uploads/", lines: ["local disk", "≤ 50 MB per file"] },
          ],
          edges: [
            { points: [[236, 74], [316, 74]], label: ["REST + JWT"], labelAt: [276, 66], labelAnchor: "middle" },
            { points: [[560, 64], [596, 64]] },
            { points: [[440, 144], [440, 272]], label: ["Prisma"], labelAt: [450, 212] },
            { points: [[560, 124], [682, 124], [682, 272]], label: ["files"], labelAt: [672, 212], labelAnchor: "end" },
          ],
        },
      },
      role: {
        summary: "I built everything.",
        owned: [],
        timeframe: "Feb – Aug 2026",
      },
      decisions: [
        {
          title: "Students only ever see their own data",
          body: "Every protected route declares its own guard: authenticate verifies the JWT and authorize([roles]) gates by role. A student's marks, notes and attempts are queried by the ID inside the token, never by one the client supplies.",
        },
        {
          title: "Quiz questions can't be pulled early",
          body: "Questions are unreachable through the API until a quiz is both published and past its start time. Attempts are scored on the server and capped at one per student by a unique constraint on quiz and student.",
        },
        {
          title: "Rules that can be tested in isolation",
          body: "The backend is layered route → controller → service, and the rules that matter — quiz scoring and exam access — live in utils/ with no database or HTTP imports, covered by unit tests.",
        },
        {
          title: "Quiz questions from a PDF or a photo",
          body: "Teachers can bootstrap a quiz by uploading a PDF or an image; pdf-parse and Tesseract OCR turn it into editable text.",
        },
        {
          title: "Email through a proxy",
          body: "Welcome mail with new student credentials and 5-minute password-reset OTPs go through a Google Apps Script proxy, because the hosting tier blocks outbound SMTP ports.",
        },
        {
          title: "Admin seeding that never overwrites",
          body: "The default admin is created on startup only when that account is missing, so a changed password is never overwritten.",
        },
      ],
      stackNotes: {
        "Next.js": "Next.js 16 App Router, with route groups for the public site, auth and the portal",
        React: "React 19",
        Tailwind: "Tailwind CSS 4",
        Express: "Express 5, layered route → controller → service",
        Prisma: "Prisma 7",
        JWT: "bearer tokens; passwords hashed with bcrypt",
      },
    },
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
    caseStudy: {
      overview: [
        "An AI tool that helps mechanical engineering students pick the right material for a design task. Describe the operating conditions in plain English; get back suitable metals with properties, reasoning and citations.",
        "Why it exists: students spend hours flipping between Shigley, ASME standards and datasheets for one design decision, and generic chatbots make up property values without citations. This tool runs RAG over a curated database, so the LLM only reasons over verified data — “the LLM is the mouth, the database is the brain.”",
        "Status: work in progress. The full pipeline works end to end — query understanding, retrieval, reasoning and the Streamlit UI — with 66 curated materials across 24 classes.",
      ],
      architecture: {
        caption:
          "The LLM never supplies a property value: it chooses among rows and explains the choice, and every number on screen comes from SQLite. ChromaDB is only a search index, rebuilt from SQLite in under a minute.",
        diagram: {
          width: 780,
          height: 392,
          title: "Material Selection Assistant architecture",
          description:
            "The Streamlit UI sends a plain-English query to the reason.py orchestrator. It first checks whether this is a material question without an API call, then turns the query into filters with a fast LLM, retrieves 18 class-diverse candidates from ChromaDB, has a smarter LLM select and rank them, and looks up allowable stress at temperature in SQLite. llm.py handles every LLM call with failover between Groq, Gemini and OpenAI, quota cooldowns and a cache. SQLite is the source of truth; ChromaDB is rebuilt from it.",
          nodes: [
            { id: "ui", x: 16, y: 24, w: 190, h: 96, title: "Streamlit UI", lines: ["chat · material cards", "comparison table"] },
            {
              id: "reason",
              x: 270,
              y: 24,
              w: 250,
              h: 136,
              tone: "accent",
              title: "reason.py pipeline",
              lines: [
                "1 intent gate (no API call)",
                "2 query → filters [fast LLM]",
                "3 retrieve 18 candidates",
                "4 select & rank [smart LLM]",
                "5 allowable stress lookup",
              ],
            },
            {
              id: "llm",
              x: 574,
              y: 24,
              w: 190,
              h: 100,
              title: "llm.py",
              lines: ["Groq · Gemini · OpenAI", "failover + cooldowns", "response cache"],
            },
            {
              id: "chroma",
              x: 270,
              y: 276,
              w: 210,
              h: 96,
              tone: "info",
              title: "ChromaDB",
              lines: ["derived search index", "sentence-transformers"],
            },
            {
              id: "sqlite",
              x: 544,
              y: 276,
              w: 220,
              h: 96,
              tone: "info",
              title: "SQLite · source of truth",
              lines: ["materials", "allowable stress tables"],
            },
          ],
          edges: [
            { points: [[206, 56], [266, 56]], label: ["query"], labelAt: [236, 48], labelAnchor: "middle" },
            { points: [[266, 100], [210, 100]], label: ["cards"], labelAt: [238, 92], labelAnchor: "middle" },
            { points: [[520, 64], [570, 64]], label: ["calls"], labelAt: [545, 56], labelAnchor: "middle" },
            { points: [[380, 160], [380, 272]], label: ["semantic", "search"], labelAt: [390, 204] },
            {
              points: [[480, 160], [480, 228], [654, 228], [654, 272]],
              label: ["exact values"],
              labelAt: [567, 220],
              labelAnchor: "middle",
            },
            { points: [[544, 330], [484, 330]], label: ["reindex"], labelAt: [514, 322], labelAnchor: "middle" },
          ],
        },
      },
      role: {
        summary: "I built everything.",
        owned: [],
        timeframe: "Jun – Aug 2026",
      },
      decisions: [
        {
          title: "The database is the brain",
          body: "The LLM chooses among retrieved rows and explains its choice; every number on screen comes from SQLite. Missing properties stay NULL instead of being filled in.",
        },
        {
          title: "Curated data over scraped data",
          body: "66 materials across 24 classes, every row hand-verified with a cited source. Bulk scraped datasets are deliberately left out: rows without corrosion, chemical-resistance and application context crowd out good candidates and degrade the recommendations.",
        },
        {
          title: "An intent gate before any API call",
          body: "Greetings, questions about the tool and off-topic messages are answered directly, without calling an LLM.",
        },
        {
          title: "Class-diverse retrieval, then ranking",
          body: "ChromaDB returns 18 class-diverse candidates; the smarter model selects and ranks from that pool, and allowable stress at temperature is looked up in SQLite afterwards.",
        },
        {
          title: "Two models, with failover and caching",
          body: "A fast model turns the query into filters and a smarter one does the reasoning. All LLM calls go through llm.py, which fails over between Groq, Gemini and OpenAI with quota cooldowns, and caches responses.",
          evidence:
            "A fresh query costs about 8,500 tokens (~3,300 on the fast model, ~5,200 on the smart one); a repeated query costs zero — it is served from the cache.",
        },
      ],
      stackNotes: {
        Python: "Python 3.11",
        ChromaDB: "derived semantic index; safe to delete and rebuild from SQLite",
        "Sentence Transformers": "embeddings for semantic search over material descriptions",
        SQLite: "source of truth: the materials and allowable-stress tables",
        Streamlit: "chat UI with material cards and a comparison table",
      },
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
