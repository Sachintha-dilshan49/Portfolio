"use client";

import { useEffect } from "react";

/**
 * The neofetch typing reveal is pure CSS (see `.type-line` in globals.css).
 * Once it has played, this marks <html data-typed> so coming back to the home
 * page during the visit shows the lines static instead of typing them again.
 */
export function TypeOnce() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.hasAttribute("data-typed")) return;
    // Not cleared on unmount: leaving mid-animation still counts as played.
    setTimeout(() => root.setAttribute("data-typed", ""), 1200);
  }, []);

  return null;
}
