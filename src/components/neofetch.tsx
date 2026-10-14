import type { CSSProperties } from "react";
import { neofetch, profile } from "@/content/profile";
import { Photo } from "./photo";
import { Prompt, TerminalWindow } from "./terminal";

const toneClass = { gold: "text-gold", ok: "text-ok" } as const;
const swatches = ["#ff6b5b", "#3ddc97", "#f5c26b", "#5b8cff", "#c58cff", "#5bd6e6"];

export function Neofetch() {
  return (
    <TerminalWindow title={`${profile.host}: ~`}>
      <div className="flex flex-col gap-6 p-5 sm:p-7">
        <Prompt user={profile.host}>neofetch</Prompt>
        <div className="flex flex-wrap items-start gap-10">
          <Photo className="h-[260px] w-full max-w-[260px] flex-none sm:h-[340px] sm:max-w-[300px]" />
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2 text-[15px] leading-relaxed sm:text-base">
            <h1 className="m-0 text-[22px] font-extrabold">
              <span className="text-accent">sachintha</span>@<span className="text-accent">dilshan</span>
            </h1>
            <div className="text-border" aria-hidden="true">
              ─────────────────────────
            </div>
            <dl className="m-0 flex flex-col gap-2">
              {neofetch.map((line, i) => (
                <div key={line.key} className="type-line" style={{ "--i": i } as CSSProperties}>
                  <dt className="inline font-semibold text-accent">{line.key}</dt>
                  <span className="text-muted">: </span>
                  <dd className={`inline ${line.tone ? toneClass[line.tone] : ""}`}>{line.value}</dd>
                </div>
              ))}
            </dl>
            <div className="type-line flex pt-3" style={{ "--i": neofetch.length } as CSSProperties} aria-hidden="true">
              <span className="h-[18px] w-7 bg-text" />
              {swatches.map((c) => (
                <span key={c} className="h-[18px] w-7" style={{ background: c }} />
              ))}
              <span className="h-[18px] w-7 border border-border bg-bg" />
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-4 text-[15px] text-muted">
          {profile.host}:~$<span className="cursor-block" aria-hidden="true" />
        </div>
      </div>
    </TerminalWindow>
  );
}
