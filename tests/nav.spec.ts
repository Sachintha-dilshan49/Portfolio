import { expect, test, type Page } from "@playwright/test";
import { waitForHydration } from "./hydration";
import { findOverflow } from "./overflow";

const toggle = (page: Page) => page.getByRole("button", { name: /menu/i });
const navLink = (page: Page, name: string) => page.getByRole("navigation", { name: "Main" }).getByRole("link", { name });

test.describe("phone nav", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("links are collapsed behind the menu button; it opens and closes", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await expect(navLink(page, "./projects")).toBeHidden();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");

    await toggle(page).tap();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(toggle(page)).toHaveAccessibleName("Close menu");
    for (const name of ["./projects", "./achievements", "./about", "./contact"]) await expect(navLink(page, name)).toBeVisible();

    await toggle(page).tap();
    await expect(navLink(page, "./projects")).toBeHidden();
  });

  test("Esc closes it and returns focus to the menu button", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await toggle(page).tap();
    await navLink(page, "./about").focus();
    await page.keyboard.press("Escape");
    await expect(navLink(page, "./about")).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test("choosing a link navigates and closes the menu", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await toggle(page).tap();
    await navLink(page, "./achievements").tap();
    await expect(page).toHaveURL(/\/achievements$/);
    await expect(navLink(page, "./achievements")).toBeHidden();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
  });

  test.describe("320px", () => {
    test.use({ viewport: { width: 320, height: 640 } });
    test("brand, ⌘K, theme and menu fit on one row, open or closed", async ({ page }) => {
      await page.goto("/");
      await waitForHydration(page);
      const brand = (await page.getByRole("link", { name: "~/sachintha" }).boundingBox())!;
      const menu = (await toggle(page).boundingBox())!;
      expect(Math.abs(brand.y + brand.height / 2 - (menu.y + menu.height / 2))).toBeLessThan(2);
      expect((await findOverflow(page)).offenders).toEqual([]);
      await toggle(page).tap();
      expect((await findOverflow(page)).offenders).toEqual([]);
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("links are shown and there is no dead menu button", async ({ page }) => {
      await page.goto("/");
      await expect(navLink(page, "./projects")).toBeVisible();
      await expect(toggle(page)).toBeHidden();
    });
  });
});

for (const width of [375, 600]) {
  test.describe(`PC with a mouse, ${width}px-wide window`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: false, isMobile: false });
    test("links always visible, no menu button", async ({ page }) => {
      await page.goto("/");
      await waitForHydration(page);
      for (const name of ["./projects", "./achievements", "./about", "./contact"]) await expect(navLink(page, name)).toBeVisible();
      await expect(toggle(page)).toBeHidden();
    });
  });
}

test.describe("tablet and desktop", () => {
  test.use({ viewport: { width: 768, height: 1024 } });
  test("links always visible, no menu button", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await expect(navLink(page, "./projects")).toBeVisible();
    await expect(toggle(page)).toBeHidden();
  });
});
