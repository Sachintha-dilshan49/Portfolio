"use client";

import { useEffect, useRef } from "react";

/**
 * Home-page background: a faint dot grid (pure CSS, see globals.css). On
 * desktops with a mouse, accent dots brighten softly in a ~180px radius
 * around the cursor, which eases after the pointer instead of snapping to it.
 * Touch screens and reduced motion get only the static grid.
 */
export function DotGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mouse || reduce) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let placed = false;

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      // Keep animating only while the glow is still catching up.
      raf = Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!placed) {
        x = tx;
        y = ty;
        placed = true;
      }
      el.dataset.active = "true";
      if (!raf) raf = requestAnimationFrame(tick);
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
    <div ref={ref} className="dot-grid" data-active="false" aria-hidden="true">
      <div className="dot-grid__glow" />
    </div>
  );
}
