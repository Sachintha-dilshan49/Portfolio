"use client";

import { useSyncExternalStore } from "react";
import { currentTheme, setTheme, type Theme } from "@/lib/actions";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark" as Theme);
  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="min-h-11 min-w-11 rounded-full border border-border bg-surface px-3.5 text-[13px] text-text transition-colors hover:border-accent"
    >
      {/* Icon only on the narrowest phones, so the nav row fits; the aria-label carries the meaning. */}
      {theme === "light" ? "☾" : "☀"}
      <span className="hidden min-[360px]:inline"> {theme === "light" ? "dark" : "light"}</span>
    </button>
  );
}
