"use client";

import { useEffect } from "react";

/**
 * One listener for the whole site: tells the `.glow-border` element under the
 * mouse where the cursor is (--gx/--gy, relative to the element), so the glow
 * on its border follows the pointer. CSS does the rest. Mouse only; touch
 * screens and reduced motion never run it (the CSS falls back to a static
 * highlight under reduced motion).
 */
export function BorderGlow() {
  useEffect(() => {
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mouse || reduce) return;

    let raf = 0;
    let last: PointerEvent | null = null;
    const update = () => {
      raf = 0;
      const target = last?.target;
      const el = target instanceof Element ? target.closest<HTMLElement>(".glow-border") : null;
      if (!last || !el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${last.clientX - r.left}px`);
      el.style.setProperty("--gy", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!raf) raf = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
