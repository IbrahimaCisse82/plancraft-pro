import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Resolve a Chromium binary: explicit env var first, otherwise the newest
 * build installed in the shared Playwright cache (CI images sometimes ship a
 * different build number than the one bundled with @playwright/test).
 */
function resolveChromium(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/ms-playwright";
  try {
    const builds = fs
      .readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const b of builds) {
      const bin = path.join(cache, b, "chrome-linux", "chrome");
      if (fs.existsSync(bin)) return bin;
    }
  } catch {
    /* cache dir not present — fall back to Playwright's default */
  }
  return undefined;
}


export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8080",
    trace: "off",
    headless: true,
    launchOptions: {
      executablePath: resolveChromium(),
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      testIgnore: [/auth\.setup\.ts/, /.*\.auth\.spec\.ts/],
      use: { ...devices["Desktop Chrome"], channel: undefined },
    },
    {
      name: "chromium-auth",
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        channel: undefined,
        storageState: "e2e/.auth/user.json",
      },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
