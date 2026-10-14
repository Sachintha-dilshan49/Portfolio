import { expect, test, type Page } from "@playwright/test";
import { hero, profile } from "../src/content/profile";

const heroBox = (page: Page) => page.locator("main section").first();
const name = (page: Page) => page.getByRole("heading", { level: 1, name: profile.name });
const steps = (page: Page) => page.locator(".intro-type, .intro-fade");
const introState = (page: Page) => page.evaluate(() => document.documentElement.dataset.intro ?? null);

async function allShown(page: Page) {
  return steps(page).evaluateAll((els) =>
    els.every((el) => {
      const s = getComputedStyle(el);
      return s.opacity === "1" && (s.clipPath === "none" || /^inset\(0px 0%( 0px 0px)?\)$/.test(s.clipPath));
    }),
  );
}

test.describe("home hero", () => {
  test("all text is in the server HTML, with no internship or availability line", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const start = html.indexOf("login: ");
    const end = html.indexOf(hero.actions.contact, start);
    const heroHtml = html.slice(start, end + 20).replaceAll("&amp;", "&").replaceAll("&#x27;", "'");
    for (const text of [hero.user, hero.welcome, hero.command, profile.name, hero.headline, hero.summary, hero.actions.projects, hero.actions.cv]) {
      expect(heroHtml).toContain(text);
    }
    expect(heroHtml).not.toMatch(/intern/i);
    expect(heroHtml).not.toContain(profile.availability);
  });

  test("first visit: plays the login sequence once (~2s), then holds the final state", async ({ page }) => {
    // Paused fake clock: a slow page load can't let the sequence finish before we look.
    // (An installed clock keeps running in real time until it is paused.)
    await page.clock.install({ time: new Date("2026-10-15T09:00:00") });
    await page.clock.pauseAt(new Date("2026-10-15T09:00:01"));
    await page.goto("/");
    await page.clock.runFor(500);
    expect(await introState(page)).toBeNull();
    expect(await name(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("intro-fade");
    await page.clock.runFor(2500);
    expect(await introState(page)).toBe("done");
    expect(await allShown(page)).toBe(true);
    await expect(page.getByText(`Last login: ${await page.evaluate(() => new Date().toDateString())} on ${hero.tty}`)).toBeVisible();
  });

  test("the layout doesn't move while it plays", async ({ page }) => {
    await page.goto("/");
    const before = await Promise.all([heroBox(page).boundingBox(), name(page).boundingBox()]);
    await expect.poll(() => introState(page), { timeout: 4000 }).toBe("done");
    const after = await Promise.all([heroBox(page).boundingBox(), name(page).boundingBox()]);
    expect(after[0]!.height).toBe(before[0]!.height);
    expect(after[1]!.y).toBe(before[1]!.y);
  });

  test("a keypress skips to the end", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Shift");
    expect(await introState(page)).toBe("done");
    expect(await allShown(page)).toBe(true);
  });

  test("a click skips to the end", async ({ page }) => {
    await page.goto("/");
    await page.mouse.click(5, 400);
    expect(await introState(page)).toBe("done");
    expect(await allShown(page)).toBe(true);
  });

  test("repeat visit in the same session: final state straight away", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => introState(page), { timeout: 4000 }).toBe("done");
    await page.reload();
    // Set by the <head> script before first paint, not after hydration.
    expect(await introState(page)).toBe("done");
    expect(await allShown(page)).toBe(true);

    // Client-side navigation back home doesn't replay it either.
    await page.getByRole("link", { name: "./about" }).click();
    await page.getByRole("link", { name: "~/sachintha" }).click();
    await expect(name(page)).toBeVisible();
    expect(await allShown(page)).toBe(true);
  });

  test("head scripts are real code: saved theme applies before hydration", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    const html = await (await page.request.get("/")).text();
    expect(html).not.toContain("Attempted to call");
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("shows the final state immediately", async ({ page }) => {
      await page.goto("/");
      const names = await steps(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
      expect(names.length).toBeGreaterThan(5);
      expect(new Set(names)).toEqual(new Set(["none"]));
      expect(await allShown(page)).toBe(true);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("still ends up fully shown", async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => allShown(page), { timeout: 4000 }).toBe(true);
    });
  });

  test.describe("phone", () => {
    test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    test("photo stacks above the text", async ({ page }) => {
      await page.goto("/");
      const photo = (await page.getByRole("button", { name: /Photo of/ }).boundingBox())!;
      const h1 = (await name(page).boundingBox())!;
      expect(photo.y + photo.height).toBeLessThanOrEqual(h1.y);
    });
  });

  for (const width of [375, 1280]) {
    test.describe(`${width}px`, () => {
      test.use({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      test("the name is the biggest text on the site", async ({ page }) => {
        const biggest = async (route: string) => {
          await page.goto(route);
          return page.evaluate(() => Math.max(...[...document.querySelectorAll("main *")].map((el) => parseFloat(getComputedStyle(el).fontSize))));
        };
        await page.goto("/");
        const nameSize = await name(page).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(nameSize).toBe(await biggest("/"));
        for (const route of ["/projects", "/achievements", "/about", "/contact", "/projects/sentrio"]) {
          expect(await biggest(route), route).toBeLessThan(nameSize);
        }
      });
    });
  }
});
