"use client";

import { useEffect, useSyncExternalStore } from "react";
import { INTRO_KEY } from "@/lib/head-scripts";

/** Total length of the CSS sequence in globals.css (`.intro-type` / `.intro-fade` delays + durations). */
const INTRO_MS = 2450;

/** Pending "left mid-way" mark; a dev-mode (Strict Mode) remount cancels it. */
let leaving: ReturnType<typeof setTimeout> | undefined;

/**
 * Drives the hero's login sequence, which is pure CSS on server-rendered
 * text. On the first visit of the session it records that it has played and
 * marks <html data-intro="done"> when the animation ends. Repeat visits and
 * click / keypress skipping are handled by the <head> script in lib/head-scripts.ts,
 * so they work before hydration.
 */
export function HeroIntro() {
  useEffect(() => {
    clearTimeout(leaving);
    const root = document.documentElement;
    if (root.dataset.intro === "done") return;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}

    const timer = setTimeout(() => (root.dataset.intro = "done"), INTRO_MS);
    // Leaving mid-way counts as played: coming back shows the final state.
    return () => {
      clearTimeout(timer);
      leaving = setTimeout(() => (root.dataset.intro = "done"));
    };
  }, []);

  return null;
}

const noSubscribe = () => () => {};

/**
 * Today's date for the "Last login" line, e.g. "Thu Oct 15 2026". Pages are
 * prerendered, so it is filled in on the client; the box is always 15ch wide
 * so nothing shifts when it appears.
 */
export function LastLoginDate() {
  const date = useSyncExternalStore(noSubscribe, () => new Date().toDateString(), () => "");
  return <span className="inline-block min-w-[15ch]">{date}</span>;
}
