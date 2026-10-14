"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "@/content/profile";
import type { ProjectLink } from "@/content/projects";
import { shell } from "@/content/shell";
import { downloadCv } from "@/lib/actions";
import { complete, plainText, runCommand, type Line, type Segment, type Tone } from "@/lib/shell";
import { TerminalWindow } from "./terminal";

type Entry = { id: number; input: string; lines: Line[] };

const MAX_ENTRIES = 40;

const toneClass: Record<Tone, string> = {
  accent: "text-accent",
  muted: "text-muted",
  gold: "text-gold",
  ok: "text-ok",
  danger: "text-danger",
};

function SegmentView({ s }: { s: Segment }) {
  const tone = s.tone ? toneClass[s.tone] : "";
  if (!("href" in s)) return <span className={tone}>{s.text}</span>;
  // Inline links inside text: underlined so they read as links in both themes.
  const cls = `${tone || "text-accent"} underline decoration-1 underline-offset-4 hover:decoration-2`;
  switch (s.kind) {
    case "internal":
      return <Link href={s.href} className={cls}>{s.text}</Link>;
    case "external":
      return <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>{s.text}</a>;
    case "download":
      return <a href={s.href} download={profile.cvFileName} className={cls}>{s.text}</a>;
    case "mailto":
      return <a href={s.href} className={cls}>{s.text}</a>;
  }
}

function PromptEcho({ input }: { input: string }) {
  return (
    <div>
      <span className="text-accent">{shell.user}</span>
      <span className="text-muted">:~$</span> {input}
    </div>
  );
}

/**
 * Home-page shell: runs `whoami` the first time it scrolls into view, then
 * takes commands from the chips or the input (Enter runs, ↑/↓ history, Tab
 * completes). Output text comes from lib/shell.ts → src/content/; a visually
 * hidden live region reads each result to screen readers.
 */
export function Shell({ projects }: { projects: ProjectLink[] }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const started = useRef(false);
  const history = useRef<string[]>([]);
  const historyPos = useRef<number | null>(null);
  const draft = useRef("");

  const print = (input: string, lines: Line[], announce: boolean) => {
    const id = nextId.current++;
    setEntries((prev) => [...prev, { id, input, lines }].slice(-MAX_ENTRIES));
    // Same text twice in a row would not be re-announced; vary it invisibly.
    if (announce) setAnnouncement(plainText(lines) + (id % 2 ? " " : ""));
  };

  const run = (raw: string, { announce = true } = {}) => {
    started.current = true;
    const input = raw.trim();
    historyPos.current = null;
    if (input && history.current.at(-1) !== input) history.current.push(input);

    const result = runCommand(input, projects);
    if (result.effect === "clear") {
      setEntries([]);
      if (announce) setAnnouncement(shell.cleared);
      return;
    }
    if (result.effect === "download-cv") downloadCv();
    print(input, result.lines, announce);
  };

  // Auto-run `whoami` the first time the shell is on screen (unless the visitor got there first).
  const autorun = useEffectEvent(() => {
    if (!started.current) run("whoami", { announce: false });
  });
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (items) => {
        if (items.some((i) => i.isIntersecting)) {
          io.disconnect();
          autorun();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keep the newest result in view inside the output box (never scrolls the page).
  useEffect(() => {
    const out = outputRef.current;
    const last = out?.lastElementChild;
    if (out && last instanceof HTMLElement) out.scrollTop = last.offsetTop - 12;
  }, [entries]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === "ArrowUp") {
      if (!h.length) return;
      e.preventDefault();
      if (historyPos.current === null) {
        draft.current = value;
        historyPos.current = h.length - 1;
      } else {
        historyPos.current = Math.max(0, historyPos.current - 1);
      }
      setValue(h[historyPos.current]);
    } else if (e.key === "ArrowDown") {
      if (historyPos.current === null) return;
      e.preventDefault();
      const pos = historyPos.current + 1;
      historyPos.current = pos < h.length ? pos : null;
      setValue(pos < h.length ? h[pos] : draft.current);
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Only take over Tab when there is something to complete, so keyboard users can still tab past.
      const { value: next, options } = complete(value);
      if (next === value && !options.length) return;
      e.preventDefault();
      setValue(next);
      if (options.length > 1) print(value.trim(), [options.map((o) => ({ text: `${o}  `, tone: "accent" as const }))], true);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      run("clear");
    }
  };

  // Clicking the output focuses the input — mouse only, so a tap on a phone doesn't pop the keyboard.
  const focusInput = () => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div ref={rootRef}>
      <TerminalWindow title={shell.title}>
        <div className="flex flex-col gap-4 p-4 text-[clamp(13px,3.6vw,15px)] leading-relaxed sm:p-6">
          <div
            ref={outputRef}
            onClick={focusInput}
            tabIndex={0}
            aria-label={shell.outputLabel}
            className="relative flex max-h-[min(26rem,60vh)] min-h-32 flex-col gap-3 overflow-y-auto rounded-lg [overflow-wrap:anywhere]"
          >
            <p className="m-0 text-muted"># {shell.intro}</p>
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-0.5" data-shell-entry>
                <PromptEcho input={entry.input} />
                {entry.lines.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {line.map((s, j) => (
                      <SegmentView key={j} s={s} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(value);
              setValue("");
            }}
            className="flex items-center gap-2 border-t border-line pt-3"
          >
            <label htmlFor="shell-input" className="shrink-0">
              <span className="text-accent">{shell.user}</span>
              <span className="text-muted">:~$</span>
              <span className="sr-only"> {shell.inputLabel}</span>
            </label>
            {/* 16px so iOS doesn't zoom on focus. */}
            <input
              ref={inputRef}
              id="shell-input"
              name="command"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                historyPos.current = null;
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder={shell.placeholder}
              className="min-h-11 w-full min-w-0 flex-1 bg-transparent font-mono text-base text-text caret-accent placeholder:text-muted"
            />
          </form>

          <div role="group" aria-label={shell.chipsLabel} className="flex flex-wrap gap-2">
            {shell.commands.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => run(c.name)}
                className="min-h-11 rounded-lg border border-border bg-chrome px-4 text-sm text-text transition-colors hover:border-accent hover:text-accent"
              >
                {c.name}
              </button>
            ))}
          </div>

          <noscript>
            <p className="m-0 text-muted"># {shell.noscript}</p>
          </noscript>
        </div>
      </TerminalWindow>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
