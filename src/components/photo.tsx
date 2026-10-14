"use client";

import Image from "next/image";
import { useState } from "react";
import { profile } from "@/content/profile";

/**
 * Accent duotone (grayscale + accent in "color" blend mode) that lifts to full
 * colour on hover, on keyboard focus, or when tapped (a toggle, so it works on
 * touch screens). Hover styles only apply on hover-capable devices, so a tap
 * never leaves a "stuck" hover. Reduced motion: plain full colour, no tint.
 */
export function Photo({ className = "" }: { className?: string }) {
  const [colour, setColour] = useState(false);

  if (profile.photo) {
    return (
      <button
        type="button"
        aria-pressed={colour}
        onClick={() => setColour((c) => !c)}
        className={`group relative block cursor-pointer overflow-hidden rounded-xl border border-border bg-chrome p-0 ${className}`}
      >
        <Image
          src={profile.photo}
          alt={`Photo of ${profile.name}`}
          fill
          sizes="(max-width: 640px) 180px, 300px"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[50%_20%] grayscale transition-[filter] duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0 group-aria-pressed:grayscale-0 motion-reduce:grayscale-0"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-accent opacity-60 mix-blend-color transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0 group-aria-pressed:opacity-0 motion-reduce:hidden"
        />
        <span className="sr-only">, show in full colour</span>
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-bg p-4 text-center text-[13px] text-muted ${className}`}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      <span>[ photo goes here ]</span>
    </div>
  );
}
