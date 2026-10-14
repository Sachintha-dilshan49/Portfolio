import Link from "next/link";
import { Neofetch } from "@/components/neofetch";
import { ProjectCard } from "@/components/project-card";
import { Prompt } from "@/components/terminal";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { wins } from "@/content/timeline";

const btn =
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-3 text-center text-[clamp(13px,3.8vw,15px)] no-underline transition-colors sm:px-5";

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <section className="flex flex-col gap-5 pb-16 pt-6">
        <Neofetch />
        {/* Two-column grid of full-width buttons on phones, a row from sm up. */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <Link href="/projects" className={`${btn} bg-accent font-semibold text-accent-fg`}>
            cd ./projects
          </Link>
          <a href={profile.cvPath} download={profile.cvFileName} className={`${btn} border border-border text-text hover:border-accent`}>
            wget cv.pdf
          </a>
          <a href={profile.github} className={`${btn} border border-border text-text hover:border-accent`}>
            open github
          </a>
          <Link href="/contact" className={`${btn} border border-border text-text hover:border-accent`}>
            mail me
          </Link>
        </div>
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
        <Prompt>cat wins.txt</Prompt>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4 p-0">
          {wins.map((w) => (
            <li key={w.event} className="flex flex-col gap-1.5 rounded-b-xl border-t-2 border-accent bg-surface p-5">
              <span className="font-sans text-xl font-bold">{w.place}</span>
              <span className="text-[15px] text-soft">{w.event}</span>
              <span className="text-xs text-muted">{w.where}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-6 border-t border-line py-14">
        <h2 className="m-0 max-w-[640px] font-sans text-[clamp(1.75rem,7vw,2.25rem)] font-bold leading-tight">
          Hiring a backend / DevOps intern for {profile.availability.split(" ")[1]}?
        </h2>
        <Link href="/contact" className={`${btn} bg-accent font-semibold text-accent-fg`}>
          ./contact.sh
        </Link>
      </section>
    </>
  );
}
