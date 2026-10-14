import Image from "next/image";
import { profile } from "@/content/profile";

export function Photo({ className = "" }: { className?: string }) {
  if (profile.photo) {
    return (
      <div className={`group relative overflow-hidden rounded-xl border border-border ${className}`}>
        <Image
          src={profile.photo}
          alt={`Photo of ${profile.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          priority
          className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
        />
        {/* green duotone tint, removed on hover */}
        <div className="pointer-events-none absolute inset-0 bg-accent opacity-25 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />
      </div>
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
