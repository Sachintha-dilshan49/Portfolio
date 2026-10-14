import { expect, test, type Page } from "@playwright/test";
import { projects } from "../src/content/projects";
import { findOverflow } from "./overflow";

const routes = [
  "/",
  "/projects",
  ...projects.map((p) => `/projects/${p.slug}`),
  "/about",
  "/contact",
  "/this-page-does-not-exist",
];

// Portrait phones and tablet, plus phones in landscape.
const viewports = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 667, height: 375 },
  { width: 844, height: 390 },
];

for (const vp of viewports) {
  test.describe(`${vp.width}×${vp.height}`, () => {
    test.use({ viewport: vp });

    for (const route of routes) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(route);
        const { vw, scrollWidth, offenders } = await findOverflow(page);
        expect(offenders, "elements wider than / outside the viewport").toEqual([]);
        expect(scrollWidth, "page scrolls sideways").toBeLessThanOrEqual(vw);
      });
    }
  });
}

test.describe("phone ergonomics at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  for (const route of routes) {
    test(`touch targets ≥44px and inputs ≥16px on ${route}`, async ({ page }) => {
      await page.goto(route);
      const problems = await page.evaluate(() => {
        const out: string[] = [];
        const els = document.querySelectorAll<HTMLElement>("a[href], button, input, textarea, select, [tabindex='0']");
        for (const el of els) {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          // Hidden, visually-hidden (skip link) and inline links inside running text are exempt (WCAG 2.5.8).
          if (r.width <= 1 || r.height <= 1 || style.display === "inline" || style.visibility === "hidden") continue;
          if (r.width < 44 || r.height < 44) out.push(`${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
          if (el.matches("input, textarea, select") && parseFloat(style.fontSize) < 16) out.push(`${el.tagName.toLowerCase()}[name=${el.getAttribute("name")}] font ${style.fontSize}`);
        }
        return out;
      });
      expect(problems).toEqual([]);
    });
  }
});

test.describe("screenshots at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });

  for (const theme of ["dark", "light"] as const) {
    for (const route of routes) {
      test(`${theme} ${route}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "_");
        await page.screenshot({ path: `test-results/screenshots/${theme}/${name}.png`, fullPage: true });
      });
    }
  }
});

test.describe("background", () => {
  const glowDisplay = (page: Page) =>
    page.evaluate(() => {
      const glow = document.querySelector(".dot-grid__glow");
      return glow ? getComputedStyle(glow).display : null;
    });

  test("dot grid only on the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".dot-grid")).toHaveCount(1);
    for (const route of routes.filter((r) => r !== "/")) {
      await page.goto(route);
      await expect(page.locator(".dot-grid"), route).toHaveCount(0);
    }
  });

  test("desktop: accent dots follow the mouse", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(300, 300);
    await page.mouse.move(420, 360, { steps: 5 });
    await expect(page.locator(".dot-grid")).toHaveAttribute("data-active", "true");
    expect(await glowDisplay(page)).toBe("block");
  });

  test.describe("touch screens", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    test("static grid only", async ({ page }) => {
      await page.goto("/");
      expect(await glowDisplay(page)).toBe("none");
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("static grid only", async ({ page }) => {
      await page.goto("/");
      await page.mouse.move(400, 300);
      expect(await glowDisplay(page)).toBe("none");
      await expect(page.locator(".dot-grid")).toHaveAttribute("data-active", "false");
    });
  });
});
