"use client";

import { useEffect, useRef } from "react";
import { CODE_FIELD, CODE_FIELD_SMALL } from "@/lib/code-field";

/**
 * Faint field of code behind every page, with a glow that lights up the
 * characters underneath. Mouse: the glow follows the pointer. Touch: it
 * follows the finger while touching, and otherwise drifts slowly across the
 * screen. Off under prefers-reduced-motion. Updates CSS variables directly
 * (no React re-render). Phones get a smaller field (see globals.css).
 */
export function CodeSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let touching = false;
    const paint = () => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paint();
        el.dataset.active = "true";
      });
    };
    const onMouseLeave = () => {
      el.dataset.active = "false";
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touching = true;
      x = t.clientX;
      y = t.clientY;
      paint();
      el.dataset.active = "true";
    };
    const onTouchEnd = () => {
      touching = false;
    };

    // Slow Lissajous drift for touch-only devices; eases back after a touch.
    const start = performance.now();
    let last = 0;
    const drift = (now: number) => {
      raf = requestAnimationFrame(drift);
      if (touching || now - last < 50) return; // ~20 fps is plenty for a slow drift
      last = now;
      const t = (now - start) / 1000;
      const tx = window.innerWidth * (0.5 + 0.38 * Math.sin(t * 0.23));
      const ty = window.innerHeight * (0.5 + 0.38 * Math.sin(t * 0.17 + 1.3));
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      paint();
    };

    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
    } else {
      paint();
      el.dataset.active = "true";
      raf = requestAnimationFrame(drift);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className="code-spotlight" data-active="false" aria-hidden="true">
      <pre className="code-field code-field--lg">{CODE_FIELD}</pre>
      <pre className="code-field code-field--glow code-field--lg">{CODE_FIELD}</pre>
      <pre className="code-field code-field--sm">{CODE_FIELD_SMALL}</pre>
      <pre className="code-field code-field--glow code-field--sm">{CODE_FIELD_SMALL}</pre>
    </div>
  );
}
