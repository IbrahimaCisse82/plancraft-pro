import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { TEST_USER, AUTH_STATE_FILE } from "./testUser";

/**
 * Logs in with the dedicated test account through the real UI and persists the
 * session so that every authenticated spec starts already connected.
 */
setup("authenticate", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE_FILE), { recursive: true });

  await page.goto("/auth");
  await page.getByPlaceholder("votre@email.com").fill(TEST_USER.email);
  await page.locator('input[type="password"]').fill(TEST_USER.password);
  await page.locator('form button[type="submit"]').click();

  await page.waitForURL("**/dashboard", { timeout: 20_000 });
  await expect(page.locator("h1").first()).toBeVisible();

  // Dismiss the onboarding tour once so it never blocks later scenarios.
  const skip = page.getByRole("button", { name: /passer|skip|terminer|finish|fermer|close/i }).first();
  try {
    await skip.waitFor({ state: "visible", timeout: 3000 });
    await skip.click();
  } catch {
    /* tour already completed */
  }

  await page.context().storageState({ path: AUTH_STATE_FILE });
});
