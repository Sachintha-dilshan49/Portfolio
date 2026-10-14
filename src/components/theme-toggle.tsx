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
      {theme === "light" ? "☾ dark" : "☀ light"}
    </button>
  );
}

/** Runs before paint: saved choice, else the visitor's system setting. */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
