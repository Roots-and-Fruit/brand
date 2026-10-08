import { defineConfig } from "@playwright/test";

const baseURL = process.env.RF_WP_BASE_URL || "http://localhost:8893";

export default defineConfig({
  testDir: "./wordpress/e2e",
  testMatch: "**/rf-*.spec.js",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
  outputDir: "test-results/playwright",
});
