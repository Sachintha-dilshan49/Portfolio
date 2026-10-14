"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/projects", label: "./projects" },
  { href: "/about", label: "./about" },
  { href: "/contact", label: "./contact" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 py-6" aria-label="Main">
      <Link href="/" className="text-[15px] text-accent no-underline">
        ~/sachintha
      </Link>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={active ? "text-accent" : "text-soft transition-colors hover:text-accent"}
            >
              {l.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
}
