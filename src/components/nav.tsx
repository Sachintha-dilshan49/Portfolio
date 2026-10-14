"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import type { ProjectLink } from "@/content/projects";
import { pages } from "@/content/site";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

const links = pages.filter((p) => p.href !== "/");

/**
 * Phones: brand + ⌘K + theme toggle + menu button on one row; the menu button
 * shows the four links as a 2×2 grid of 44px buttons underneath (one row of
 * four from sm). md and up: everything on one line, no menu button.
 *
 * The links only collapse once JavaScript is running (<html data-js>, set in
 * <head> before paint — see globals.css), so without JS they simply show.
 */
export function Nav({ projects }: { projects: ProjectLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <nav
      onKeyDown={onKeyDown}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:py-6"
      aria-label="Main"
    >
      <Link href="/" className="inline-flex min-h-11 items-center text-[15px] text-accent no-underline">
        ~/sachintha
      </Link>
      <ul
        id="nav-links"
        data-open={open}
        className="nav-links order-last m-0 grid w-full list-none grid-cols-2 gap-2 p-0 text-[13px] sm:grid-cols-4 md:order-none md:ml-auto md:flex md:w-auto md:gap-5 md:text-sm"
      >
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-lg border bg-surface no-underline md:border-0 md:bg-transparent ${
                  active ? "border-accent text-accent" : "border-line text-soft transition-colors hover:text-accent"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2">
        <CommandPalette projects={projects} />
        <ThemeToggle />
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? "Close menu" : "Open menu"}
          className="nav-toggle min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:border-accent"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5h12M3 9h12M3 13h12" />}
          </svg>
        </button>
      </div>
    </nav>
  );
}
