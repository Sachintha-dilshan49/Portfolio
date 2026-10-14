import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/terminal";
import { isTodo, type Decision, type Text } from "@/content/case-study";
import type { Project } from "@/content/projects";
import { ArchitectureDiagram } from "./architecture-diagram";
import { Reveal } from "./reveal";
import { RichText, TodoMark } from "./rich-text";

/**
 * The one case-study template every project page uses (docs/PLAN.md →
 * "Case-study template"). Projects without a `caseStudy` yet fall back to
 * their problem / role / highlights and skip the diagram.
 */
export function CaseStudy({ project, next }: { project: Project; next: Project }) {
  const cs = project.caseStudy;
  const overview: Text[] = cs?.overview ?? [project.problem];
  const decisions: Decision[] = cs?.decisions ?? project.highlights.map((h) => ({ title: h, body: "" }));
  const solo = project.team === "solo";

  return (
    <article className="mx-auto flex max-w-[900px] flex-col gap-12 pb-16 pt-8">
      <Header project={project} />

      <Section title="Overview">
        {overview.map((p, i) => (
          <p key={i} className="m-0 max-w-[720px] font-sans text-lg leading-relaxed text-soft">
            <RichText value={p} />
          </p>
        ))}
      </Section>

      {cs && (
        <Section title="Architecture">
          <figure className="m-0 flex flex-col gap-3">
            <Reveal className="overflow-hidden rounded-xl border border-line bg-surface">
              <div
                className="overflow-x-auto p-4 sm:p-6"
                tabIndex={0}
                role="region"
                aria-label="Architecture diagram (scrolls sideways on small screens)"
              >
                <ArchitectureDiagram id={`${project.slug}-arch`} diagram={cs.architecture.diagram} />
              </div>
            </Reveal>
            <figcaption className="max-w-[720px] text-sm leading-relaxed text-muted">
              <RichText value={cs.architecture.caption} />
            </figcaption>
          </figure>
        </Section>
      )}

      <Section title="My role">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
          <p className="m-0 font-sans text-lg">
            <span className={solo ? "text-accent" : "text-info"}>{solo ? "solo" : project.team === "Team" ? "team" : `team ${project.team}`}</span>
            <span className="text-muted"> · </span>
            <RichText value={cs?.role.summary ?? project.role} />
          </p>
          {cs && cs.role.owned.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-relaxed text-soft">
              {cs.role.owned.map((o, i) => (
                <li key={i}>
                  <span className="text-accent">▸</span> <RichText value={o} />
                </li>
              ))}
            </ul>
          )}
          {cs && (
            <p className="m-0 text-sm text-muted">
              timeframe: <RichText value={cs.role.timeframe} />
            </p>
          )}
        </div>
      </Section>

      <Section title="Key features & decisions">
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {decisions.map((d, i) => (
            <li key={d.title} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5">
              <h3 className="m-0 font-sans text-lg font-semibold leading-snug">
                <span className="mr-2 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                {d.title}
              </h3>
              {d.body && <p className="m-0 font-sans leading-relaxed text-soft">{d.body}</p>}
              {d.evidence && (
                <p className="m-0 mt-auto border-t border-line pt-3 text-[13px] leading-relaxed text-soft">
                  <span className="text-ok">✓ evidence </span>
                  <RichText value={d.evidence} />
                </p>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Tech stack">
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          {project.stack.map((s) => {
            const note = cs?.stackNotes?.[s];
            return (
              <li key={s} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded bg-chrome px-2.5 py-1.5 text-[13px] text-text">{s}</span>
                {note && <span className="text-muted">{note}</span>}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Links">
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          {project.repo && (
            <LinkRow label="github">
              <a href={project.repo}>{project.repo.replace("https://", "")}</a>
            </LinkRow>
          )}
          {project.live && (
            <LinkRow label="live demo">
              <a href={project.live}>{project.live.replace("https://", "")} ↗</a>
            </LinkRow>
          )}
          {cs?.extraLinks?.map((l, i) =>
            isTodo(l) ? (
              <li key={i}>
                <TodoMark>{l.todo}</TodoMark>
              </li>
            ) : (
              <LinkRow key={l.href} label={l.label}>
                <a href={l.href}>{l.href.replace("https://", "")}</a>
              </LinkRow>
            ),
          )}
        </ul>
      </Section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-sm">
        <Link href="/projects">← cd ..</Link>
        <Link href={`/projects/${next.slug}`}>next: {next.name} →</Link>
      </footer>
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>{title}</SectionHeading>
      {children}
    </section>
  );
}

function LinkRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap gap-x-3 break-all">
      <span className="w-24 shrink-0 text-muted">{label}</span>
      {children}
    </li>
  );
}

function Header({ project }: { project: Project }) {
  const meta = [
    { label: "role", value: project.role },
    { label: "stack", value: project.stack.slice(0, 3).join(" · ") },
    { label: "team", value: project.team === "solo" ? "solo" : project.team },
  ];

  return (
    <header className="flex flex-col gap-5 border-b border-line pb-8">
      <div className="text-sm">
        <Link href="/projects" className="text-muted no-underline hover:text-accent">
          ~/projects/
        </Link>
        <span>{project.slug}</span>
        <span className="text-muted">/README.md</span>
      </div>
      <h1 className="m-0 font-sans text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{project.name}</h1>
      <p className="m-0 max-w-[720px] font-sans text-lg leading-relaxed text-soft sm:text-xl">{project.summary}</p>
      {project.badge && <div className="text-sm text-gold">▲ {project.badge}</div>}
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 text-[13px]">
        {meta.map((m) => (
          <div key={m.label} className="rounded-lg border border-line bg-surface px-3.5 py-3">
            <dt className="text-muted">{m.label}</dt>
            <dd className="m-0">{m.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-3">
        {project.repo && (
          <a href={project.repo} className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg no-underline">
            git clone →
          </a>
        )}
        {project.live && (
          <a href={project.live} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm text-text no-underline hover:border-accent">
            open live demo ↗
          </a>
        )}
      </div>
    </header>
  );
}
