import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { Prompt } from "@/components/terminal";
import { certifications, profile, skills } from "@/content/profile";
import { timeline, type Commit } from "@/content/timeline";

export const metadata: Metadata = {
  title: "About",
  description: `About ${profile.name}: education, achievements and skills.`,
};

const dot: Record<Commit["kind"], string> = {
  head: "bg-accent",
  award: "bg-gold",
  leadership: "bg-info",
  education: "bg-info",
};

export default function AboutPage() {
  const width = Math.max(...skills.map((s) => s.group.length)) + 2;

  return (
    <div className="flex flex-col pb-10 pt-8">
      <section className="flex flex-col items-start gap-6 pb-12 md:flex-row md:gap-10">
        <Photo className="h-[200px] w-[168px] flex-none sm:h-[300px] sm:w-[250px] md:h-[340px] md:w-[300px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Prompt>cat about.md</Prompt>
          <h1 className="m-0 font-sans text-[clamp(2rem,8vw,3rem)] font-bold leading-tight tracking-tight">
            I like systems that explain themselves when they break.
          </h1>
          <p className="m-0 font-sans text-lg leading-relaxed text-soft">
            I&apos;m a third-year IT undergraduate at the University of Moratuwa. Most of what I build lives behind the
            UI: APIs, access control, background processing, and the plumbing that keeps them reliable.
          </p>
          <p className="m-0 font-sans text-lg leading-relaxed text-soft">
            Outside code I&apos;m the IT &amp; media coordinator for the university dancing society, which is where my
            interest in motion and timing comes from.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5 border-t border-line py-10">
        <Prompt>git log --oneline --graph</Prompt>
        <ol className="m-0 list-none p-0">
          {timeline.map((c, i) => (
            <li key={c.hash} className="flex gap-4">
              <div className="flex w-3.5 flex-none flex-col items-center" aria-hidden="true">
                <span className={`mt-1.5 size-3 flex-none rounded-full ${dot[c.kind]}`} />
                {i < timeline.length - 1 && <span className="w-0.5 flex-1 bg-line" />}
              </div>
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3.5 gap-y-1 pb-5">
                <span className="text-[13px] text-gold">{c.hash}</span>
                <span className="text-[13px] text-muted">{c.when}</span>
                <span className="text-[15px]">{c.message}</span>
                {c.kind === "head" && <span className="text-xs text-accent">(HEAD → main)</span>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-8 border-t border-line py-10">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
          <Prompt>tree skills/</Prompt>
          {/* Keeps the tree aligned: scrolls sideways inside its own box on narrow screens. */}
          <pre
            tabIndex={0}
            aria-label="Skills tree"
            className="m-0 overflow-x-auto rounded-xl border border-line bg-surface p-4 text-[13px] leading-loose text-soft sm:p-5 sm:text-sm"
          >
            {"skills/\n" +
              skills
                .map((s, i) => `${i === skills.length - 1 ? "└──" : "├──"} ${(s.group + "/").padEnd(width)} ${s.items}`)
                .join("\n")}
          </pre>
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <Prompt>ls certs/</Prompt>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {certifications.map((c) => (
              <li key={c.name} className="rounded-xl border border-line bg-surface px-4 py-3.5">
                <div className="font-sans text-base font-medium">{c.name}</div>
                <div className="text-xs text-muted">{c.issuer}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
