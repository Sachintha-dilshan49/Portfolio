"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "@/content/profile";
import type { ProjectLink } from "@/content/projects";
import { pages, palette } from "@/content/site";
import { copyText, downloadCv, openExternal, toggleTheme } from "@/lib/actions";
import { fuzzyFilter } from "@/lib/fuzzy";
import { lockScroll, trapTab } from "@/lib/focus-trap";

type Action = "copy-email" | "download-cv" | "toggle-theme" | "github" | "linkedin";
type Item = { id: string; group: string; title: string; hint?: string; keywords?: string; href?: string; action?: Action };

/**
 * ⌘K / Ctrl+K command palette: fuzzy search over pages, projects and a few
 * actions. A native modal <dialog> makes the page behind it inert; Tab is
 * kept inside it, Esc / backdrop / the esc button close it, and focus goes
 * back to whatever had it before. The input is an ARIA combobox driving a
 * listbox via aria-activedescendant.
 */
export function CommandPalette({ projects }: { projects: ProjectLink[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();
  const listId = `${id}-list`;

  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };

  const { groups, actions, toasts } = palette;
  const items: Item[] = [
    ...pages.map((p) => ({ id: `page${p.href}`, group: groups.pages, title: p.title, hint: p.href, keywords: p.label, href: p.href })),
    ...projects.map((p) => ({
      id: `project-${p.slug}`,
      group: groups.projects,
      title: p.name,
      hint: p.stack.slice(0, 3).join(" · "),
      keywords: [...p.tags, ...p.stack].join(" "),
      href: `/projects/${p.slug}`,
    })),
    { id: "copy-email", group: groups.actions, ...actions.copyEmail, hint: profile.email, action: "copy-email" },
    { id: "download-cv", group: groups.actions, ...actions.downloadCv, hint: profile.cvFileName, action: "download-cv" },
    { id: "toggle-theme", group: groups.actions, ...actions.toggleTheme, action: "toggle-theme" },
    { id: "github", group: groups.actions, ...actions.github, hint: "↗", action: "github" },
    { id: "linkedin", group: groups.actions, ...actions.linkedin, hint: "↗", action: "linkedin" },
  ];

  const results = fuzzyFilter(items, query);
  const current = Math.min(active, results.length - 1);
  const optionId = (item: Item) => `${id}-${item.id}`;
  const filtered = query.trim() !== "";

  const openPalette = () => {
    const el = document.activeElement;
    returnFocus.current = el instanceof HTMLElement && el !== document.body ? el : null;
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  const choose = async (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    if (item.href) return router.push(item.href);
    switch (item.action) {
      case "copy-email":
        return notify((await copyText(profile.email)) ? toasts.copied : `${toasts.copyFailed} ${profile.email}`);
      case "download-cv":
        downloadCv();
        return notify(toasts.downloading);
      case "toggle-theme":
        return toggleTheme();
      case "github":
        return openExternal(profile.github);
      case "linkedin":
        return openExternal(profile.linkedin);
    }
  };

  // Open / close the native dialog to match state, and lock page scroll while open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
    if (open) return lockScroll();
  }, [open]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (!open || current < 0) return;
    document.getElementById(`${id}-${results[current].id}`)?.scrollIntoView({ block: "nearest" });
  });

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onShortcut = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== "k") return;
    e.preventDefault();
    if (open) setOpen(false);
    else openPalette();
  });
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onShortcut(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = results.length;
    if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setActive((current + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setActive((current - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[current]);
    }
  };

  const renderOption = (item: Item) => {
    const index = results.indexOf(item);
    const selected = index === current;
    return (
      <li
        key={item.id}
        id={optionId(item)}
        role="option"
        aria-selected={selected}
        onClick={() => choose(item)}
        onMouseMove={() => !selected && setActive(index)}
        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
          selected ? "bg-chrome text-accent" : "text-text"
        }`}
      >
        <span aria-hidden="true" className={selected ? "text-accent" : "text-muted"}>
          {selected ? "❯" : " "}
        </span>
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
        {item.hint && <span className="hidden min-w-0 max-w-[45%] truncate text-xs text-muted sm:inline">{item.hint}</span>}
        {filtered && <span className="shrink-0 text-[11px] uppercase tracking-wide text-muted">{item.group}</span>}
      </li>
    );
  };

  // No query: grouped (Pages, Projects, Actions). With a query: one ranked list.
  const sections = filtered
    ? [{ label: "", items: results }]
    : [...new Set(results.map((r) => r.group))].map((g) => ({ label: g, items: results.filter((r) => r.group === g) }));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPalette}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        aria-label={palette.trigger}
        title={palette.trigger}
        className="min-h-11 min-w-11 rounded-full border border-border bg-surface px-3.5 text-[13px] text-text transition-colors hover:border-accent"
      >
        <kbd className="font-mono">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={palette.label}
        onClose={() => {
          setOpen(false);
          (returnFocus.current?.isConnected ? returnFocus.current : triggerRef.current)?.focus();
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        onKeyDown={trapTab}
        className="mx-auto mb-auto mt-[max(1rem,min(12vh,6rem))] w-[min(40rem,calc(100vw-2rem))] max-w-none rounded-[14px] border border-border bg-surface p-0 text-text shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex max-h-[min(34rem,calc(100dvh-4rem))] flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 focus-within:border-accent">
            <span aria-hidden="true" className="text-accent">
              ❯
            </span>
            {/* 16px so phones don't zoom on focus. */}
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={current >= 0 ? optionId(results[current]) : undefined}
              aria-label={palette.label}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={palette.placeholder}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="palette-input min-h-13 w-full min-w-0 flex-1 bg-transparent font-mono text-base text-text placeholder:text-muted"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={palette.close}
              className="min-h-11 min-w-11 rounded-md border border-border px-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              esc
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {results.length ? (
              <ul id={listId} role="listbox" aria-label={palette.label} className="m-0 flex list-none flex-col gap-0.5 p-0 text-sm">
                {sections.map((s) =>
                  s.label ? (
                    <li key={s.label} role="presentation" className="flex flex-col gap-0.5">
                      <div id={`${id}-${s.label}`} className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wide text-muted">
                        {s.label}
                      </div>
                      <ul role="group" aria-labelledby={`${id}-${s.label}`} className="m-0 flex list-none flex-col gap-0.5 p-0">
                        {s.items.map(renderOption)}
                      </ul>
                    </li>
                  ) : (
                    s.items.map(renderOption)
                  ),
                )}
              </ul>
            ) : (
              <p id={listId} className="m-0 px-3 py-6 text-sm text-muted">
                {palette.empty}
              </p>
            )}
          </div>

          <div className="hidden justify-between gap-4 border-t border-border px-4 py-2 text-xs text-muted sm:flex">
            <span>{palette.footer}</span>
            <span>
              {results.length} {palette.results}
            </span>
          </div>
        </div>
        <div className="sr-only" role="status" aria-live="polite">
          {open ? `${results.length} ${palette.results}` : ""}
        </div>
      </dialog>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
        {toast && (
          <span className="rounded-lg border border-accent bg-surface px-4 py-2.5 text-sm text-text shadow-lg [overflow-wrap:anywhere]">
            {toast}
          </span>
        )}
      </div>
    </>
  );
}
