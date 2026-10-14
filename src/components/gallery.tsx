"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { GalleryPhoto } from "@/content/achievements";
import { lightbox } from "@/content/site";
import { lockScroll, trapTab } from "@/lib/focus-trap";

/**
 * Photo gallery for an achievement card: the first photo large, any others as
 * thumbnails. Each opens a lightbox — a native modal <dialog> — with ← / →
 * keys, swipe on touch screens, Esc / backdrop / close button to dismiss, Tab
 * kept inside, and focus returned to the photo that opened it.
 */
export function Gallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const n = photos.length;
  const photo = index === null ? null : photos[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
    if (index !== null) return lockScroll();
  }, [index]);

  const open = (i: number, e: MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget;
    setIndex(i);
  };
  const step = (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + n) % n));

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowRight" && n > 1) step(1);
    else if (e.key === "ArrowLeft" && n > 1) step(-1);
    else trapTab(e);
  };

  // Horizontal swipe on touch screens; vertical drags and pinch-zoom are left to the browser.
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || n < 2) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y)) step(dx < 0 ? 1 : -1);
  };

  const [first, ...rest] = photos;
  if (!first) return null;

  const thumb = (p: GalleryPhoto, i: number, sizes: string, className: string) => (
    <button
      key={p.src}
      type="button"
      onClick={(e) => open(i, e)}
      className={`group relative block cursor-zoom-in overflow-hidden rounded-lg border border-line bg-chrome p-0 ${className}`}
    >
      <Image
        src={p.src}
        alt={p.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={p.blurDataURL}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
      />
      <span className="sr-only"> — {lightbox.open}</span>
    </button>
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {thumb(first, 0, "(min-width: 768px) 520px, 100vw", "aspect-[3/2] w-full")}
        {rest.length > 0 && (
          <div className="grid grid-cols-3 gap-2">{rest.map((p, i) => thumb(p, i + 1, "180px", "aspect-[3/2] w-full"))}</div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={photo ? `${title} — ${lightbox.counter(index! + 1, n)}` : title}
        onClose={() => {
          setIndex(null);
          if (opener.current?.isConnected) opener.current.focus();
        }}
        onKeyDown={onKeyDown}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-text backdrop:bg-black/90"
      >
        {photo && (
          <div className="flex h-full flex-col gap-3 p-[max(0.75rem,env(safe-area-inset-top))_max(0.75rem,env(safe-area-inset-right))_max(0.75rem,env(safe-area-inset-bottom))_max(0.75rem,env(safe-area-inset-left))]">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px]">
              <span className="min-w-0 truncate text-muted" aria-live="polite">
                {title} · {lightbox.counter(index! + 1, n)}
              </span>
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="min-h-11 min-w-11 shrink-0 rounded-md border border-border px-3 text-text transition-colors hover:border-accent hover:text-accent"
              >
                {lightbox.close}
              </button>
            </div>

            {/* Clicking the dark area around the photo closes it. */}
            <div
              className="relative min-h-0 flex-1 touch-pan-y"
              onClick={(e) => e.target === e.currentTarget && setIndex(null)}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (swipe.current = null)}
            >
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="pointer-events-none object-contain"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-1.5 text-[13px]">
              {n > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={lightbox.previous}
                  className="min-h-11 min-w-11 shrink-0 rounded-md border border-border text-text transition-colors hover:border-accent hover:text-accent"
                >
                  ←
                </button>
              )}
              <p className="m-0 min-w-0 flex-1 px-1.5 leading-snug text-soft" aria-hidden="true">
                {photo.alt}
              </p>
              {n > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={lightbox.next}
                  className="min-h-11 min-w-11 shrink-0 rounded-md border border-border text-text transition-colors hover:border-accent hover:text-accent"
                >
                  →
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
