import type { Page } from "@playwright/test";

/**
 * Resolves once React has hydrated the nav (it tags DOM nodes it manages with
 * `__reactProps$…`). Use before keyboard shortcuts whose listeners are added
 * on hydration, e.g. Ctrl+K, so a slow first load can't swallow the keypress.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector("nav button");
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  });
}
