import type { Page } from "@playwright/test";

/**
 * Elements that stick out past the viewport, ignoring ones whose overflow is
 * contained by a scrolling or clipping box that itself fits the viewport.
 */
export async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const contained = (el: Element) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== "visible" && a.getBoundingClientRect().right <= vw + 0.5) return true;
      }
      return false;
    };
    const describe = (el: Element) =>
      el.tagName.toLowerCase() +
      (el.id ? `#${el.id}` : "") +
      (typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "");

    const offenders: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      // Skip empty boxes and the 1px visually-hidden skip link.
      if (r.width <= 1 || r.height <= 1) continue;
      const tooWide = r.width > vw + 0.5 || r.right > vw + 0.5 || r.left < -0.5;
      if (tooWide && !contained(el)) offenders.push(`${describe(el)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 8) };
  });
}
