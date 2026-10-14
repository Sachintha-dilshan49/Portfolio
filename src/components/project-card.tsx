import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  const solo = project.team === "solo";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-text no-underline transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line bg-chrome px-4 py-2.5 text-xs text-muted">
        <span className="min-w-0 truncate">{project.slug}/</span>
        <span className={`shrink-0 ${solo ? "text-accent" : "text-info"}`}>{solo ? "solo" : project.team === "Team" ? "team" : `team ${project.team}`}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="m-0 font-sans text-2xl font-bold">{project.name}</h3>
        <p className="m-0 flex-1 text-sm leading-relaxed text-soft">{project.summary}</p>
        {project.badge && <div className="text-xs text-gold">▲ {project.badge}</div>}
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {project.stack.slice(0, 5).map((s) => (
            <li key={s} className="rounded bg-chrome px-2 py-1 text-xs text-soft transition-colors group-hover:text-accent">
              {s}
            </li>
          ))}
        </ul>
        <span className="text-[13px] text-accent">cat README.md →</span>
      </div>
    </Link>
  );
}
