import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Responsive checks against the production build.
 * Run `npm run build` first; `npm run test:e2e` starts `next start` itself.
 */
export default defineConfig({
  testDir: "./tests",
  // Screenshots go to test-results/screenshots; Playwright only wipes this subfolder.
  outputDir: "test-results/artifacts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
