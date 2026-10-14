"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ProjectLink } from "@/content/projects";
import { pages } from "@/content/site";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

const links = pages.filter((p) => p.href !== "/");

/**
 * Phones: brand + ⌘K + theme toggle on the first row, the four links as a
 * 2×2 grid of 44px buttons underneath (one row of four from sm). md and up:
 * everything on one line.
 */
export function Nav({ projects }: { projects: ProjectLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:py-6"
      aria-label="Main"
    >
      <Link href="/" className="inline-flex min-h-11 items-center text-[15px] text-accent no-underline">
        ~/sachintha
      </Link>
      <ul className="order-last m-0 grid w-full list-none grid-cols-2 gap-2 p-0 text-[13px] sm:grid-cols-4 md:order-none md:ml-auto md:flex md:w-auto md:gap-5 md:text-sm">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href}>
              <Link
                href={l.href}
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
      </div>
    </nav>
  );
}
