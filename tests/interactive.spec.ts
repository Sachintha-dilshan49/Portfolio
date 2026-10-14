import { expect, test, type Page } from "@playwright/test";
import { neofetch, profile } from "../src/content/profile";
import { projects } from "../src/content/projects";
import { shell } from "../src/content/shell";
import { palette } from "../src/content/site";
import { findOverflow } from "./overflow";

const output = (page: Page) => page.getByLabel(shell.outputLabel);
const input = (page: Page) => page.locator("#shell-input");
const dialog = (page: Page) => page.getByRole("dialog", { name: palette.label });
const chip = (page: Page, name: string) => page.getByRole("group", { name: shell.chipsLabel }).getByRole("button", { name, exact: true });

async function type(page: Page, command: string) {
  await input(page).fill(command);
  await input(page).press("Enter");
}

test.describe("interactive shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("auto-runs whoami when it first comes into view", async ({ page }) => {
    await input(page).scrollIntoViewIfNeeded();
    await expect(output(page)).toContainText(profile.summary);
    await expect(output(page).locator("[data-shell-entry]")).toHaveCount(1);
  });

  test("help and projects via chip clicks", async ({ page }) => {
    await chip(page, "help").click();
    for (const c of shell.commands) await expect(output(page)).toContainText(c.description);

    await chip(page, "projects").click();
    for (const p of projects) {
      await expect(output(page).getByRole("link", { name: p.name })).toHaveAttribute("href", `/projects/${p.slug}`);
    }
  });

  test("help and projects by typing, and a project link opens its case study", async ({ page }) => {
    await type(page, "help");
    await expect(output(page)).toContainText(shell.helpFooter);

    await type(page, "projects");
    const first = projects[0];
    await output(page).getByRole("link", { name: first.name }).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
  });

  test("Tab completes and ↑/↓ recall history", async ({ page }) => {
    await input(page).fill("pro");
    await input(page).press("Tab");
    await expect(input(page)).toHaveValue("projects ");
    await input(page).press("Enter");
    await type(page, "wins");

    await input(page).press("ArrowUp");
    await expect(input(page)).toHaveValue("wins");
    await input(page).press("ArrowUp");
    await expect(input(page)).toHaveValue("projects");
    await input(page).press("ArrowDown");
    await expect(input(page)).toHaveValue("wins");
    await input(page).press("ArrowDown");
    await expect(input(page)).toHaveValue("");

    // Nothing to complete: Tab moves focus on instead of being swallowed.
    await input(page).press("Tab");
    await expect(input(page)).not.toBeFocused();
  });

  test("output comes from content and is announced to screen readers", async ({ page }) => {
    await chip(page, "stack").click();
    const live = page.locator("[role=status][aria-live=polite]").filter({ hasText: "languages:" });
    await expect(live).toHaveCount(1);

    await chip(page, "clear").click();
    await expect(output(page).locator("[data-shell-entry]")).toHaveCount(0);
  });

  test("cv downloads the CV", async ({ page }) => {
    const download = page.waitForEvent("download");
    await chip(page, "cv").click();
    expect((await download).suggestedFilename()).toBe(profile.cvFileName);
  });

  test("easter eggs and unknown commands", async ({ page }) => {
    await type(page, "sudo hire sachintha");
    await expect(output(page)).toContainText(shell.sudoHire.granted);
    await expect(output(page).getByRole("link", { name: "/contact" })).toHaveAttribute("href", "/contact");

    await type(page, "ls -a");
    await expect(output(page)).toContainText(".secret");
    await expect(output(page)).toContainText(shell.secret);

    await type(page, "rm -rf /");
    await expect(output(page)).toContainText(shell.rmRf);

    await type(page, "exit");
    await expect(output(page)).toContainText(shell.exit);
    await expect(output(page).getByRole("link", { name: profile.email }).last()).toHaveAttribute("href", `mailto:${profile.email}`);

    await type(page, "hack-the-planet");
    await expect(output(page)).toContainText("command not found: hack-the-planet — try help");
  });
});

test.describe("command palette", () => {
  test("Ctrl+K opens it and Enter navigates to a project", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Control+k");
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByRole("combobox")).toBeFocused();

    await page.keyboard.type("job queue");
    await expect(page.getByRole("option").first()).toContainText("Distributed Job Queue");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects\/distributed-job-queue$/);
    await expect(dialog(page)).toBeHidden();
  });

  test("arrow keys move, Tab stays inside, Esc closes and returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: palette.trigger });
    await trigger.click();
    await expect(dialog(page)).toBeVisible();

    const combobox = page.getByRole("combobox");
    await page.keyboard.press("ArrowDown");
    const second = page.getByRole("option").nth(1);
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(combobox).toHaveAttribute("aria-activedescendant", (await second.getAttribute("id"))!);

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("Toggle theme action", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("theme");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before!);
  });
});

test.describe("375px phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test("no horizontal overflow with shell output and the palette open", async ({ page }) => {
    await page.goto("/");
    for (const c of ["whoami", "projects", "wins", "stack", "contact", "help", "ls -a", "exit", "a-really-long-unknown-command-name-without-spaces"]) {
      await type(page, c);
    }
    await expect(output(page).locator("[data-shell-entry]").last()).toContainText("command not found");
    let result = await findOverflow(page);
    expect(result.offenders).toEqual([]);
    expect(result.scrollWidth).toBeLessThanOrEqual(result.vw);

    // The ⌘K button is in the nav on phones too.
    await page.getByRole("button", { name: palette.trigger }).tap();
    await expect(dialog(page)).toBeVisible();
    result = await findOverflow(page);
    expect(result.offenders).toEqual([]);
    expect(result.scrollWidth).toBeLessThanOrEqual(result.vw);
  });

  test("chips are at least 44px and the input is 16px", async ({ page }) => {
    await page.goto("/");
    for (const c of shell.commands) {
      const box = (await chip(page, c.name).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await input(page).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  });

});

test.describe("neofetch typing reveal", () => {
  const lines = (page: Page) => page.locator(".type-line");

  test("text is in the server HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();
    for (const line of neofetch) expect(html).toContain(line.value.replaceAll("&", "&amp;"));
  });

  test("types once on load, then is static", async ({ page }) => {
    await page.goto("/");
    expect(await lines(page).first().evaluate((el) => getComputedStyle(el).animationName)).toBe("type-in");
    await expect(page.locator("html")).toHaveAttribute("data-typed", "");
    expect(await lines(page).last().evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("skipped entirely", async ({ page }) => {
      await page.goto("/");
      for (const el of await lines(page).all()) {
        expect(await el.evaluate((e) => [getComputedStyle(e).animationName, getComputedStyle(e).clipPath])).toEqual(["none", "none"]);
      }
    });
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("lines still end up visible", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText(neofetch[0].value)).toBeVisible();
      await expect.poll(() => lines(page).last().evaluate((el) => getComputedStyle(el).clipPath), { timeout: 3000 }).toMatch(/^(none|inset\(0px 0%( 0px 0px)?\))$/);
    });
  });
});
