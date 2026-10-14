import type { Metadata } from "next";
import Link from "next/link";
import { RichText } from "@/components/case-study/rich-text";
import { Gallery } from "@/components/gallery";
import { Prompt } from "@/components/terminal";
import { achievements, extraCurricular, type Achievement } from "@/content/achievements";
import type { Text } from "@/content/case-study";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Achievements",
  description: `Hackathons, competitions and extra-curricular work by ${profile.name}.`,
};

function Field({ label, value }: { label: string; value: Text }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className="m-0 min-w-0">
        <RichText value={value} />
      </dd>
    </div>
  );
}

function AchievementCard({ a }: { a: Achievement }) {
  const hasPhotos = a.photos.length > 0;
  return (
    <article aria-labelledby={`${a.slug}-title`} className="glow-border flex flex-col rounded-xl border border-line bg-surface">
      <div aria-hidden="true" className="flex items-center justify-between gap-2 rounded-t-[11px] border-b border-line bg-chrome px-4 py-2.5 text-xs text-muted">
        <span className="min-w-0 truncate">achievements/{a.slug}/</span>
        {typeof a.year === "string" && <span className="shrink-0">{a.year}</span>}
      </div>
      <div className={`grid gap-6 p-5 sm:p-6 ${hasPhotos ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" : ""}`}>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-sm font-semibold text-gold">{a.placement}</p>
            <h2 id={`${a.slug}-title`} className="m-0 font-sans text-2xl font-bold leading-tight sm:text-[1.75rem]">
              {a.title}
            </h2>
          </div>
          <dl className="m-0 flex flex-col gap-1.5 text-[13px] leading-relaxed sm:text-sm">
            <Field label="event" value={a.event} />
            <Field label="organiser" value={a.organiser} />
            <Field label="year" value={a.year} />
            <Field label="team" value={a.team} />
          </dl>
          <div className="flex max-w-[60ch] flex-col gap-2 text-[15px] leading-relaxed text-soft">
            {a.description.map((d, i) => (
              <p key={i} className="m-0">
                <RichText value={d} />
              </p>
            ))}
          </div>
          {a.stack && (
            <ul aria-label="Tech used" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {a.stack.map((s) => (
                <li key={s} className="rounded bg-chrome px-2 py-1 text-xs text-soft">
                  {s}
                </li>
              ))}
            </ul>
          )}
          {a.project && (
            <Link href={a.project.href} className="inline-flex min-h-11 items-center self-start text-sm text-accent">
              → {a.project.label}
            </Link>
          )}
          {a.repo && (
            <a
              href={a.repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center self-start text-sm text-accent"
            >
              → {a.repo.label} ↗
            </a>
          )}
        </div>
        {hasPhotos && <Gallery photos={a.photos} title={a.title} />}
      </div>
    </article>
  );
}

export default function AchievementsPage() {
  return (
    <div className="flex flex-col gap-10 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <Prompt>ls ~/achievements</Prompt>
        <h1 className="m-0 font-sans text-[clamp(2rem,10vw,3.75rem)] font-bold leading-none tracking-tight">Achievements</h1>
        <p className="m-0 max-w-[640px] text-[15px] leading-relaxed text-soft">
          Hackathons, ideathons and competitions, with photos where there are some. Open a photo to see it larger.
        </p>
      </div>

      <ul className="m-0 flex list-none flex-col gap-6 p-0">
        {achievements.map((a) => (
          <li key={a.slug}>
            <AchievementCard a={a} />
          </li>
        ))}
      </ul>

      <section aria-labelledby="extra-curricular" className="flex flex-col gap-5 border-t border-line pt-10">
        <Prompt>ls ~/extra-curricular</Prompt>
        <h2 id="extra-curricular" className="m-0 font-sans text-[clamp(1.5rem,6vw,2rem)] font-bold">
          Extra-curricular
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0">
          {extraCurricular.map((x) => (
            <li key={x.role} className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5">
              <span className="text-xs text-muted">{x.period}</span>
              <h3 className="m-0 font-sans text-xl font-bold leading-snug">{x.role}</h3>
              <p className="m-0 text-sm text-accent">{x.organisation}</p>
              <p className="m-0 text-[15px] leading-relaxed text-soft">{x.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
