import { expect, test, type Page } from "@playwright/test";
import { achievements, extraCurricular } from "../src/content/achievements";
import { certifications, education, skills } from "../src/content/profile";
import { palette } from "../src/content/site";
import { findOverflow } from "./overflow";

const withPhotos = achievements.filter((a) => a.photos.length > 0);
const lightbox = (page: Page) => page.locator("dialog[open]");
const firstPhoto = (page: Page) => page.getByRole("button", { name: withPhotos[0].photos[0].alt });

async function expectNoOverflow(page: Page) {
  const { vw, scrollWidth, offenders } = await findOverflow(page);
  expect(offenders, "elements wider than / outside the viewport").toEqual([]);
  expect(scrollWidth, "page scrolls sideways").toBeLessThanOrEqual(vw);
}

test.describe("achievements page", () => {
  for (const vp of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
  ]) {
    test.describe(`${vp.width}px`, () => {
      test.use({ viewport: vp, hasTouch: true });
      test("no horizontal overflow, with and without the lightbox open", async ({ page }) => {
        await page.goto("/achievements");
        await expectNoOverflow(page);
        await firstPhoto(page).tap();
        await expect(lightbox(page)).toBeVisible();
        await expectNoOverflow(page);
      });
    });
  }

  test("every achievement and activity is on the page; galleries only where photos exist", async ({ page }) => {
    await page.goto("/achievements");
    for (const a of achievements) {
      const card = page.locator("article", { has: page.getByRole("heading", { name: a.title, exact: true }) });
      await expect(card).toContainText(a.placement);
      await expect(card.getByRole("img")).toHaveCount(a.photos.length);
      if (a.project) await expect(card.getByRole("link", { name: a.project.label })).toHaveAttribute("href", a.project.href);
    }
    for (const x of extraCurricular) await expect(page.getByRole("heading", { name: x.role })).toBeVisible();
  });

  test("photos use next/image with blur placeholders and alt text", async ({ page }) => {
    await page.goto("/achievements");
    const img = firstPhoto(page).getByRole("img");
    await expect(img).toHaveAttribute("alt", withPhotos[0].photos[0].alt);
    expect(await img.getAttribute("src")).toContain("/_next/image");
    expect(await img.evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/data:image|none/);
  });

  test("lightbox: opens on click, Tab stays inside, Esc closes and returns focus", async ({ page }) => {
    await page.goto("/achievements");
    await firstPhoto(page).click();
    await expect(lightbox(page)).toBeVisible();
    await expect(lightbox(page).getByRole("img", { name: withPhotos[0].photos[0].alt })).toBeVisible();
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
    }
    await page.keyboard.press("ArrowRight"); // one photo: stays put, nothing breaks
    await page.keyboard.press("Escape");
    await expect(lightbox(page)).toHaveCount(0);
    await expect(firstPhoto(page)).toBeFocused();
  });

  test("lightbox close button works and is a 44px target", async ({ page }) => {
    await page.goto("/achievements");
    await firstPhoto(page).click();
    const close = lightbox(page).getByRole("button", { name: "close" });
    const box = (await close.boundingBox())!;
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    await close.click();
    await expect(lightbox(page)).toHaveCount(0);
    await expect(firstPhoto(page)).toBeFocused();
  });

  test("in the nav between projects and about, in the sitemap and in the palette", async ({ page, request }) => {
    await page.goto("/");
    const labels = await page.getByRole("navigation", { name: "Main" }).getByRole("listitem").allTextContents();
    expect(labels).toEqual(["./projects", "./achievements", "./about", "./contact"]);

    expect(await (await request.get("/sitemap.xml")).text()).toContain("/achievements</loc>");

    await page.keyboard.press("Control+k");
    await page.keyboard.type("achiev");
    await expect(page.getByRole("option").first()).toContainText("Achievements");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/achievements$/);
    await expect(page.getByRole("dialog", { name: palette.label })).toBeHidden();
  });
});

test.describe("about page", () => {
  test("bio, education, skills, certifications, CV — no wins or git log", async ({ page }) => {
    await page.goto("/about");
    const headings = await page.locator("main h2").allTextContents();
    expect(headings).toEqual(["Education", "Skills", "Certifications"]);

    for (const e of education) await expect(page.getByRole("heading", { name: e.qualification })).toBeVisible();
    await expect(page.getByText("CGPA 3.59 / 4.00")).toBeVisible();
    for (const s of skills) await expect(page.getByRole("heading", { name: s.title, exact: true })).toBeVisible();
    for (const c of certifications) await expect(page.getByRole("heading", { name: c.name })).toBeVisible();

    await expect(page.getByRole("link", { name: "See achievements →" }).first()).toHaveAttribute("href", "/achievements");
    await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute("download", /\.pdf$/);

    const text = await page.locator("main").innerText();
    for (const gone of ["Runner-Up", "git log", "HEAD → main", "ComFix", "Aurora"]) expect(text).not.toContain(gone);
  });
});
