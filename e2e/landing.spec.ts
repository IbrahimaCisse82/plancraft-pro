import { test, expect } from "@playwright/test";

test.describe("Landing page (E2E)", () => {
  test("affiche le branding PlanCraft Pro et permet de naviguer vers /auth", async ({ page }) => {
    await page.goto("/");

    // Branding visible
    await expect(page.getByText(/PlanCraft/i).first()).toBeVisible();

    // Au moins un lien/CTA vers la page d'authentification
    const authLink = page.locator('a[href="/auth"]').first();
    await expect(authLink).toBeVisible();
    await authLink.click();

    await expect(page).toHaveURL(/\/auth/);
  });

  test("la page /auth affiche un formulaire avec email + mot de passe", async ({ page }) => {
    await page.goto("/auth");

    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("redirige vers /auth quand on tente d'accéder au dashboard sans être connecté", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test("la page 404 s'affiche pour une route inconnue", async ({ page }) => {
    await page.goto("/cette-route-nexiste-pas");
    await expect(page.getByText(/404|not found|introuvable/i).first()).toBeVisible();
  });
});
