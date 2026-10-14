import Link from "next/link";
import { RichText } from "@/components/case-study/rich-text";
import { DotGrid } from "@/components/dot-grid";
import { Hero } from "@/components/hero";
import { ProjectCard } from "@/components/project-card";
import { Shell } from "@/components/shell";
import { Prompt } from "@/components/terminal";
import { achievements } from "@/content/achievements";
import { projectLinks, projects } from "@/content/projects";
import { shell } from "@/content/shell";

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <DotGrid />
      <section className="pb-16 pt-6">
        <Hero />
      </section>

      <section className="flex flex-col gap-6 border-t border-line py-12" aria-labelledby="shell-heading">
        <h2 id="shell-heading" className="sr-only">
          {shell.heading}
        </h2>
        <Prompt>{shell.launcher}</Prompt>
        <Shell projects={projectLinks} />
      </section>

      <section className="flex flex-col gap-6 border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Prompt>ls ~/projects --featured</Prompt>
          <Link href="/projects" className="inline-flex min-h-11 items-center text-sm text-accent">
            all {projects.length} projects →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Prompt>cat wins.txt</Prompt>
          <Link href="/achievements" className="inline-flex min-h-11 items-center text-sm text-accent">
            all achievements →
          </Link>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4 p-0">
          {achievements.map((a) => (
            <li key={a.slug} className="flex flex-col gap-1.5 rounded-b-xl border-t-2 border-accent bg-surface p-5">
              <span className="font-sans text-xl font-bold">{a.placement}</span>
              <span className="text-[15px] text-soft">{a.title}</span>
              <span className="text-xs text-muted">
                <RichText value={a.organiser} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
