"use client";

import { useEffect, useRef } from "react";
import { CODE_FIELD } from "@/lib/code-field";

/**
 * Faint field of code behind every page. A glow follows the pointer and
 * lights up the characters underneath. Updates CSS variables directly
 * (no React re-render) once per animation frame.
 */
export function CodeSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !finePointer) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.dataset.active = "true";
      });
    };
    const onLeave = () => {
      el.dataset.active = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="code-spotlight" data-active="false" aria-hidden="true">
      <pre className="code-field">{CODE_FIELD}</pre>
      <pre className="code-field code-field--glow">{CODE_FIELD}</pre>
    </div>
  );
}
