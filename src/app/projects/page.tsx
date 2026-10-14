import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Backend, full-stack and AI projects by Sachintha Dilshan.",
};

export default function ProjectsPage() {
  return (
    <section className="flex flex-col gap-6 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-sans text-5xl font-bold tracking-tight sm:text-6xl">Projects</h1>
        <p className="m-0 max-w-[640px] text-[15px] leading-relaxed text-soft">
          Things I&apos;ve built, solo and with teams. Each opens a README-style case study: the problem, what I did,
          and how it works.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
