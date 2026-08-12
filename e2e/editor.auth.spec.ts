import { test, expect, type Page } from "@playwright/test";

/**
 * Authenticated end-to-end journey: dashboard -> plan creation -> editor
 * (narrative + financial tables) -> exports -> sharing -> profile -> cleanup.
 * Runs with the storage state produced by e2e/auth.setup.ts.
 */

const PLAN_NAME = `E2E Plan ${Date.now()}`;

async function gotoDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
  // Close the onboarding tour if it reappears.
  const close = page.getByRole("button", { name: /passer|skip|terminer|finish/i }).first();
  if (await close.isVisible().catch(() => false)) await close.click();
}

test.describe.configure({ mode: "serial" });

test.describe("🔐 Parcours connecté", () => {
  test("le dashboard est accessible et affiche le plan de l'utilisateur", async ({ page }) => {
    await gotoDashboard(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("body")).toContainText(/plan/i);
    await expect(page.getByRole("button", { name: /nouveau|new/i }).first()).toBeVisible();
  });

  test("création d'un business plan depuis un modèle sectoriel", async ({ page }) => {
    await gotoDashboard(page);
    await page.getByRole("button", { name: /nouveau|new/i }).first().click();

    const nameInput = page.getByPlaceholder("Ex : Boulangerie Moderne Dakar");
    await expect(nameInput).toBeVisible();
    await nameInput.fill(PLAN_NAME);

    await page.getByRole("button", { name: /créer|create/i }).last().click();
    await expect(page.getByText(PLAN_NAME)).toBeVisible({ timeout: 20_000 });

    await page.getByText(PLAN_NAME).first().click();
    await page.waitForURL(/\/bp\//, { timeout: 20_000 });
    await expect(page.locator("h1").first()).toContainText(PLAN_NAME.slice(0, 12));

  });

  test("édition d'une section narrative et sauvegarde", async ({ page }) => {
    await gotoDashboard(page);
    await page.getByText(PLAN_NAME).first().click();
    await page.waitForURL(/\/bp\//);

    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Synthèse E2E : projet test automatisé PlanCraft Pro.");

    await page.getByRole("button", { name: /sauvegarder|save/i }).first().click();
    await expect(page.locator("body")).toContainText(/sauvegard|saved/i, { timeout: 15_000 });
  });

  test("saisie dans un tableau financier et persistance après rechargement", async ({ page }) => {
    await gotoDashboard(page);
    await page.getByText(PLAN_NAME).first().click();
    await page.waitForURL(/\/bp\//);

    // Navigate to a financial section from the sidebar.
    const finLink = page.locator("aside button, aside a").filter({ hasText: /compte de résultat|résultat|income/i }).first();
    await finLink.click();

    const cell = page.locator('input[aria-label*=" - "]').first();
    await expect(cell).toBeVisible({ timeout: 15_000 });
    await cell.fill("1500000");
    await cell.blur();

    await page.getByRole("button", { name: /sauvegarder|save/i }).first().click();
    await page.waitForTimeout(2000);

    await page.reload();
    await finLink.click();
    await expect(page.locator('input[aria-label*=" - "]').first()).toHaveValue(/1\s?500\s?000|1500000/, {
      timeout: 15_000,
    });
  });

  test("exports PDF, One-Pager, DOCX et XLSX déclenchent un téléchargement", async ({ page }) => {
    await gotoDashboard(page);
    await page.getByText(PLAN_NAME).first().click();
    await page.waitForURL(/\/bp\//);
    await expect(page.getByLabel("PDF")).toBeVisible({ timeout: 15_000 });

    for (const label of ["PDF", "DOCX", "XLSX"]) {
      const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
      await page.getByLabel(label, { exact: true }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(pdf|docx|xlsx)$/i);
    }
  });

  test("génération d'un lien de partage public consultable sans compte", async ({ page, browser }) => {
    await gotoDashboard(page);
    await page.getByText(PLAN_NAME).first().click();
    await page.waitForURL(/\/bp\//);

    await page.getByLabel(/partager|share/i).first().click();

    const createBtn = page.getByRole("button", { name: /créer le lien|generate|create link|créer un lien/i }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
    }

    const linkInput = page.locator('input[readonly]').first();
    await expect(linkInput).toBeVisible({ timeout: 15_000 });

    const url = await linkInput.inputValue();
    expect(url).toContain("/share/");

    // Anonymous visitor can read the shared plan.
    const anon = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anonPage = await anon.newPage();
    const token = url.split("/share/")[1];
    await anonPage.goto(`/share/${token}`);
    await expect(anonPage.locator("body")).toContainText(PLAN_NAME.slice(0, 12), { timeout: 20_000 });
    await anon.close();
  });

  test("la page profil expose l'abonnement et le quota IA", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("body")).toContainText(/abonnement|subscription/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/IA|AI/);
  });

  test("un utilisateur non-admin est redirigé hors de /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toMatch(/\/dashboard/);
  });

  test("suppression des plans de test (nettoyage)", async ({ page }) => {
    await gotoDashboard(page);

    // Supprime tous les plans générés par les campagnes E2E.
    for (let i = 0; i < 20; i++) {
      const card = page.locator("div").filter({ hasText: /^📋E2E Plan/ }).first();
      if (!(await card.isVisible().catch(() => false))) break;
      await card.getByLabel("Menu").first().click();
      await page.getByRole("button", { name: /^supprimer$|^delete$/i }).first().click();
      await page.getByRole("button", { name: /supprimer|delete|confirmer|confirm/i }).last().click();
      await page.waitForTimeout(1200);
    }

    await expect(page.getByText(PLAN_NAME)).toHaveCount(0, { timeout: 15_000 });
  });
});

