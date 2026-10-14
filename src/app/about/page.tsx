import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { RichText } from "@/components/case-study/rich-text";
import { Photo } from "@/components/photo";
import { Prompt } from "@/components/terminal";
import { isTodo } from "@/content/case-study";
import { about, certifications, education, profile, skills } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: `About ${profile.name}: education, skills and certifications.`,
};

const btn =
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-5 text-center text-[15px] no-underline transition-colors";

function Section({ id, command, title, children }: { id: string; command: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-line py-10">
      <Prompt>{command}</Prompt>
      <h2 id={id} className="m-0 font-sans text-[clamp(1.5rem,6vw,2rem)] font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

const card = "flex flex-col gap-2 rounded-xl border border-line bg-surface p-5";

export default function AboutPage() {
  return (
    <div className="flex flex-col pb-10 pt-8">
      <section className="flex flex-col items-start gap-6 pb-12 md:flex-row md:gap-10">
        <Photo className="h-[200px] w-[168px] flex-none sm:h-[300px] sm:w-[250px] md:h-[340px] md:w-[300px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Prompt>cat about.md</Prompt>
          <h1 className="m-0 font-sans text-[clamp(2rem,8vw,3rem)] font-bold leading-tight tracking-tight">{about.heading}</h1>
          {about.bio.map((p) => (
            <p key={p.slice(0, 24)} className="m-0 max-w-[65ch] font-sans text-lg leading-relaxed text-soft">
              {p}
            </p>
          ))}
          <Link href="/achievements" className="inline-flex min-h-11 items-center self-start text-[15px] text-accent">
            See achievements →
          </Link>
        </div>
      </section>

      <Section id="education" command="cat education.txt" title="Education">
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0">
          {education.map((e) => (
            <li key={e.qualification} className={card}>
              <span className="text-xs text-muted">{e.period}</span>
              <h3 className="m-0 font-sans text-xl font-bold leading-snug">{e.qualification}</h3>
              <p className="m-0 text-sm text-accent">{e.institution}</p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-1">
                {e.details.map((d) => (
                  <li key={d} className="rounded bg-chrome px-2 py-1 text-[13px] text-text">
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="skills" command="ls skills/" title="Skills">
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4 p-0">
          {skills.map((s) => (
            <li key={s.group} className={card}>
              <h3 className="m-0 text-sm font-semibold text-accent">{s.title}</h3>
              <ul aria-label={s.title} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {s.items.map((item) => (
                  <li key={item} className="rounded bg-chrome px-2 py-1 text-[13px] text-soft">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="certifications" command="ls certs/" title="Certifications">
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0">
          {certifications.map((c) => (
            <li key={c.name} className={card}>
              <span className="text-xs text-muted">
                <RichText value={c.year} />
              </span>
              <h3 className="m-0 font-sans text-lg font-bold leading-snug">{c.name}</h3>
              <p className="m-0 text-sm text-soft">{c.issuer}</p>
              <div className="pt-1 text-sm">
                {isTodo(c.credential) ? (
                  <RichText value={c.credential} />
                ) : (
                  <a href={c.credential} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-accent">
                    view credential ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <section aria-label="CV" className="flex flex-wrap items-center gap-4 border-t border-line py-10">
        <a href={profile.cvPath} download={profile.cvFileName} className={`${btn} bg-accent font-semibold text-accent-fg`}>
          Download CV
        </a>
        <Link href="/achievements" className={`${btn} border border-border text-text hover:border-accent`}>
          See achievements →
        </Link>
      </section>
    </div>
  );
}
