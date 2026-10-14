"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades its `.reveal-item` children in the first time it scrolls into view.
 *
 * Content is only hidden once JavaScript has run AND the element is still
 * below the fold, so it is never hidden without JS, never flashes when it is
 * already on screen, and is left alone under prefers-reduced-motion.
 * Sets a data attribute directly (no React re-render).
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.reveal = "shown";
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
