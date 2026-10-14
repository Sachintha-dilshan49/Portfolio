import type { KeyboardEvent } from "react";

/**
 * Keeps Tab / Shift+Tab cycling through a modal's own controls. Call it from
 * the dialog's onKeyDown; it ignores every other key.
 */
export function trapTab(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab") return;
  const focusables = [
    ...e.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, [tabindex='0']"),
  ].filter((el) => el.getClientRects().length > 0);
  if (!focusables.length) return;
  const i = focusables.indexOf(document.activeElement as HTMLElement);
  const next = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1) : (i + 1) % focusables.length;
  e.preventDefault();
  focusables[next].focus();
}

/** Stops the page behind a modal from scrolling; returns the undo. */
export function lockScroll() {
  const root = document.documentElement;
  const before = root.style.overflow;
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = before;
  };
}
