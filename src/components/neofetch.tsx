import type { CSSProperties } from "react";
import { neofetch, profile } from "@/content/profile";
import { Photo } from "./photo";
import { Prompt, TerminalWindow } from "./terminal";
import { TypeOnce } from "./type-once";

const toneClass = { gold: "text-gold", ok: "text-ok" } as const;
const swatches = ["#ff6b5b", "#3ddc97", "#f5c26b", "#5b8cff", "#c58cff", "#5bd6e6"];

export function Neofetch() {
  return (
    <TerminalWindow title={`${profile.host}: ~`}>
      <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-7">
        <TypeOnce />
        <Prompt user={profile.host}>neofetch</Prompt>
        {/* Phones: photo stacked above the info, smaller. md+: side by side. */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:gap-10">
          <Photo className="h-[200px] w-[168px] flex-none sm:h-[300px] sm:w-[250px] md:h-[340px] md:w-[300px]" />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-2 text-[clamp(13px,3.6vw,16px)] leading-relaxed">
            <h1 className="m-0 text-[clamp(18px,5.5vw,22px)] font-extrabold">
              <span className="text-accent">sachintha</span>@<span className="text-accent">dilshan</span>
            </h1>
            <div className="w-full max-w-[16rem] border-t border-border" aria-hidden="true" />
            <dl className="m-0 flex flex-col gap-2">
              {neofetch.map((line, i) => (
                // Key in its own column, value wraps beside it: a hanging indent.
                <div key={line.key} className="type-line flex" style={{ "--i": i } as CSSProperties}>
                  <dt className="shrink-0 font-semibold text-accent">
                    {line.key}
                    <span className="font-normal text-muted">:&nbsp;</span>
                  </dt>
                  <dd className={`m-0 min-w-0 ${line.tone ? toneClass[line.tone] : ""}`}>{line.value}</dd>
                </div>
              ))}
            </dl>
            <div className="type-line flex pt-3" style={{ "--i": neofetch.length } as CSSProperties} aria-hidden="true">
              <span className="h-[18px] w-6 bg-text sm:w-7" />
              {swatches.map((c) => (
                <span key={c} className="h-[18px] w-6 sm:w-7" style={{ background: c }} />
              ))}
              <span className="h-[18px] w-6 border border-border bg-bg sm:w-7" />
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-4 text-[clamp(13px,3.6vw,15px)] text-muted">
          {profile.host}:~$<span className="cursor-block" aria-hidden="true" />
        </div>
      </div>
    </TerminalWindow>
  );
}
