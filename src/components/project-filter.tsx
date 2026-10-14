"use client";

import { useState } from "react";
import type { Project, ProjectTag } from "@/content/projects";
import { ProjectCard } from "./project-card";
import { Prompt } from "./terminal";

const filters: ("all" | ProjectTag)[] = ["all", "backend", "fullstack", "ai", "devops"];

export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("all");
  const shown = active === "all" ? projects : projects.filter((p) => p.tags.includes(active));

  return (
    <>
      <div className="flex flex-col gap-4">
        <Prompt>ls ~/projects | grep {active === "all" ? "." : active}</Prompt>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">
          {filters.map((f) => {
            const on = f === active;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(f)}
                className={`min-h-10 rounded-md border px-3.5 text-[13px] transition-colors ${
                  on ? "border-accent bg-accent text-accent-fg" : "border-border bg-chrome text-soft hover:border-accent"
                }`}
              >
                {f === "all" ? "*" : `--${f}`}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4" aria-live="polite">
        {shown.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}
