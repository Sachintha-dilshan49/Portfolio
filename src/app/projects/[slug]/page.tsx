import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/terminal";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.name, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  const meta = [
    { label: "role", value: project.role },
    { label: "stack", value: project.stack.slice(0, 3).join(" · ") },
    { label: "team", value: project.team === "solo" ? "solo" : project.team },
  ];

  return (
    <article className="mx-auto flex max-w-[900px] flex-col gap-10 pb-16 pt-8">
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

      <section className="flex flex-col gap-3">
        <SectionHeading>The problem</SectionHeading>
        <p className="m-0 font-sans text-lg leading-relaxed text-soft">{project.problem}</p>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>What I built</SectionHeading>
        <ul className="m-0 flex list-none flex-col gap-2 rounded-xl border border-line bg-surface p-5 text-sm leading-relaxed">
          {project.highlights.map((h) => (
            <li key={h}>
              <span className="text-ok">✓</span> {h}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Stack</SectionHeading>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {project.stack.map((s) => (
            <li key={s} className="rounded bg-chrome px-2.5 py-1.5 text-[13px] text-soft">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-sm">
        <Link href="/projects">← cd ..</Link>
        <Link href={`/projects/${next.slug}`}>next: {next.name} →</Link>
      </footer>
    </article>
  );
}
