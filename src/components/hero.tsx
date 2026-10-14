import Link from "next/link";
import type { CSSProperties } from "react";
import { hero, profile } from "@/content/profile";
import { HeroIntro, LastLoginDate } from "./hero-intro";
import { Photo } from "./photo";
import { TerminalWindow } from "./terminal";

/**
 * When each step of the login sequence starts (ms). Everything below is in the
 * server HTML; `.intro-type` reveals text left to right in steps, `.intro-fade`
 * fades a line in. Neither changes layout, so the space is reserved from the
 * first paint. See globals.css and hero-intro.tsx.
 */
const at = (d: number, extra?: Record<string, string | number>) => ({ "--d": `${d}ms`, ...extra }) as CSSProperties;
const typed = (d: number, text: string, ms: number) => at(d, { "--steps": text.length, "--dur": `${ms}ms` });

const btn =
  "inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-4 text-center text-[clamp(13px,3.8vw,15px)] no-underline transition-colors sm:px-5";

function PromptUser() {
  return (
    <>
      <span className="text-accent">{hero.prompt}</span>
      <span className="text-muted">:~$</span>{" "}
    </>
  );
}

export function Hero() {
  return (
    <TerminalWindow title={hero.title}>
      <HeroIntro />
      <div className="flex flex-col gap-6 p-4 sm:p-7">
        <div className="flex flex-col gap-0.5 text-[clamp(13px,3.6vw,15px)] leading-relaxed [overflow-wrap:anywhere]">
          <p className="m-0">
            <span className="text-muted">login: </span>
            <span className="intro-type" style={typed(150, hero.user, 300)}>
              {hero.user}
            </span>
          </p>
          <p className="intro-fade m-0 text-muted" style={at(550)}>
            Last login: <LastLoginDate /> on {hero.tty}
          </p>
          <p className="intro-fade m-0" style={at(700)}>
            {hero.welcome}
          </p>
          <p className="intro-fade m-0 pt-3" style={at(900)}>
            <PromptUser />
            <span className="intro-type" style={typed(950, hero.command, 450)}>
              {hero.command}
            </span>
          </p>
        </div>

        {/* Phones: photo stacked above the text. md+: side by side. */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:gap-10">
          <div className="intro-fade flex-none" style={at(1500)}>
            <Photo className="h-[200px] w-[168px] sm:h-[300px] sm:w-[250px] md:h-[340px] md:w-[300px]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* The biggest text on the site. */}
            <h1
              className="intro-fade m-0 font-sans text-[clamp(2.75rem,13vw,5rem)] font-bold leading-[0.95] tracking-tight text-accent"
              style={at(1550)}
            >
              {profile.name}
            </h1>
            <p className="intro-fade m-0 text-[clamp(13px,3.6vw,16px)] leading-relaxed text-text" style={at(1700)}>
              {hero.headline}
            </p>
            <p className="intro-fade m-0 max-w-[62ch] font-sans text-[clamp(1rem,3.9vw,1.125rem)] leading-relaxed text-soft" style={at(1850)}>
              {hero.summary}
            </p>
            {/* Phones: "View projects" full width, the other two side by side. sm+: one row. */}
            <div className="intro-fade grid grid-cols-2 gap-3 pt-2 sm:flex sm:flex-wrap" style={at(2000)}>
              <Link href="/projects" className={`${btn} col-span-2 bg-accent font-semibold text-accent-fg`}>
                {hero.actions.projects}
              </Link>
              <a href={profile.cvPath} download={profile.cvFileName} className={`${btn} border border-border text-text hover:border-accent`}>
                {hero.actions.cv}
              </a>
              <Link href="/contact" className={`${btn} border border-border text-text hover:border-accent`}>
                {hero.actions.contact}
              </Link>
            </div>
          </div>
        </div>

        <div className="intro-fade border-t border-line pt-4 text-[clamp(13px,3.6vw,15px)] text-muted" style={at(2100)}>
          <PromptUser />
          <span className="cursor-block" aria-hidden="true" />
        </div>
      </div>
    </TerminalWindow>
  );
}
