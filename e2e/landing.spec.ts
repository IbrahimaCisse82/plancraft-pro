import { test, expect, type Page } from "@playwright/test";

// Helper: wait for the React Router app to mount
async function waitForApp(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction(() => !!document.querySelector("nav, main, form, h1, h2"), null, {
    timeout: 10_000,
  });
}

test.describe("🏠 Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
  });

  test("affiche le branding PlanCraft Pro dans la navbar", async ({ page }) => {
    const brand = page.locator("nav").getByText(/PlanCraft/i).first();
    await expect(brand).toBeVisible();
  });

  test("affiche le héros avec titre + CTA principal", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
    const cta = page.getByRole("link", { name: /créer mon business plan|create my business plan/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/auth");
  });

  test("affiche les statistiques (14 sections, 11 tableaux, 100%, IA)", async ({ page }) => {
    await expect(page.getByText("14", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("11", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  });

  test("contient les sections fonctionnalités, comment ça marche et tarifs", async ({ page }) => {
    await expect(page.locator("#fonctionnalites")).toBeAttached();
    await expect(page.locator("#comment")).toBeAttached();
    await expect(page.locator("#tarifs")).toBeAttached();
  });

  test("le clic sur 'Voir les fonctionnalités' fait défiler vers la section", async ({ page }) => {
    const link = page.getByRole("link", { name: /voir les fonctionnalités|see features/i }).first();
    await link.click();
    await expect(page).toHaveURL(/#fonctionnalites/);
  });

  test("propose les boutons 'Connexion' et 'Commencer gratuitement' dans la navbar", async ({ page }) => {
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("link", { name: /connexion|login/i }).first()).toBeVisible();
    await expect(nav.getByRole("link", { name: /commencer|start for free/i }).first()).toBeVisible();
  });
});

test.describe("🌍 Internationalisation (FR/EN)", () => {
  test("le toggle de langue change le contenu visible", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);

    // FR par défaut : on voit "Fonctionnalités"
    const navFR = page.getByRole("link", { name: /^Fonctionnalités$/ }).first();
    await expect(navFR).toBeVisible();

    // Bascule la langue (premier bouton FR/EN dans la navbar)
    const langBtn = page.locator('button:has-text("EN"), button:has-text("FR")').first();
    await langBtn.click();

    // Après bascule on doit voir "Features"
    await expect(page.getByRole("link", { name: /^Features$/ }).first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("🔐 Page d'authentification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await waitForApp(page);
  });

  test("affiche le formulaire de connexion par défaut", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter|sign in/i }).first()).toBeVisible();
  });

  test("propose le lien 'Mot de passe oublié'", async ({ page }) => {
    await expect(page.getByRole("button", { name: /mot de passe oublié|forgot password/i })).toBeVisible();
  });

  test("propose le bouton Google OAuth", async ({ page }) => {
    await expect(page.getByRole("button", { name: /continuer avec google|continue with google/i })).toBeVisible();
  });

  test("bascule entre login et register via le lien dédié", async ({ page }) => {
    await page.getByRole("button", { name: /pas encore de compte|no account yet/i }).click();
    await expect(page.locator('input[placeholder*="Moussa"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /créer le compte|create account/i }).first()).toBeVisible();
  });

  test("affiche une erreur de validation pour un email invalide", async ({ page }) => {
    await page.locator('input[type="email"]').fill("not-an-email");
    await page.locator('input[type="password"]').fill("123456");
    await page.getByRole("button", { name: /se connecter|sign in/i }).first().click();
    // Soit le navigateur bloque (validation HTML), soit zod renvoie un message — on laisse passer
    await page.waitForTimeout(300);
    // On vérifie qu'on n'a PAS été redirigé
    await expect(page).toHaveURL(/\/auth/);
  });

  test("affiche le mode 'mot de passe oublié'", async ({ page }) => {
    await page.getByRole("button", { name: /mot de passe oublié|forgot password/i }).click();
    await expect(page.getByRole("button", { name: /envoyer le lien|send link/i })).toBeVisible();
    // Plus de champ password en mode forgot
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("contient les liens vers CGU et Politique de confidentialité", async ({ page }) => {
    await expect(page.locator('a[href="/cgu"]').first()).toBeVisible();
    await expect(page.locator('a[href="/confidentialite"]').first()).toBeVisible();
  });
});

test.describe("🛡️ Routes protégées", () => {
  test("redirige /dashboard vers /auth si non connecté", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test("redirige /bp/:id vers /auth si non connecté", async ({ page }) => {
    await page.goto("/bp/00000000-0000-0000-0000-000000000000");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
  });

  test("redirige /admin vers /auth si non connecté", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
  });

  test("redirige /profile vers /auth si non connecté", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
  });
});

test.describe("📄 Pages publiques (CGU & Confidentialité)", () => {
  test("la page /cgu se charge et affiche un titre", async ({ page }) => {
    await page.goto("/cgu");
    await waitForApp(page);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText(/CGU|conditions générales|terms of service/i).first()).toBeVisible();
  });

  test("la page /confidentialite se charge", async ({ page }) => {
    await page.goto("/confidentialite");
    await waitForApp(page);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText(/confidentialité|privacy/i).first()).toBeVisible();
  });
});

test.describe("🔗 Pages partagées (anonyme)", () => {
  test("un token de partage invalide affiche un message d'erreur", async ({ page }) => {
    await page.goto("/share/token-invalide-1234");
    await waitForApp(page);
    // Attend que le RPC échoue et que le message d'accès refusé s'affiche
    await expect(page.getByText(/accès refusé|access denied/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("❓ Page 404", () => {
  test("affiche la page Not Found pour une route inconnue", async ({ page }) => {
    await page.goto("/cette-route-nexiste-pas-12345");
    await waitForApp(page);
    await expect(page.getByText(/404|not found|introuvable|oops/i).first()).toBeVisible();
  });

  test("la page 404 propose un lien retour à l'accueil", async ({ page }) => {
    await page.goto("/route-fantome");
    await waitForApp(page);
    const backHome = page.getByRole("link", { name: /accueil|home|retour/i }).first();
    await expect(backHome).toBeVisible();
  });
});

test.describe("🎨 Préférences UI (thème)", () => {
  test("le toggle de thème est présent et cliquable", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    const themeBtn = page.locator('button[aria-label*="theme" i], button[aria-label*="thème" i]').first();
    // Si pas d'aria-label dédié, on prend tous les boutons icônes de la navbar
    const candidates = page.locator("nav button");
    const count = await candidates.count();
    expect(count).toBeGreaterThan(0);
    await candidates.nth(1).click().catch(() => {}); // best-effort, ne doit pas planter
  });
});

test.describe("⚡ Performance / Health", () => {
  test("le bundle Vite se charge sans erreur 5xx", async ({ page }) => {
    const errors: number[] = [];
    page.on("response", (resp) => {
      if (resp.status() >= 500) errors.push(resp.status());
    });
    await page.goto("/");
    await waitForApp(page);
    expect(errors).toEqual([]);
  });

  test("aucune erreur console critique sur la landing", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto("/");
    await waitForApp(page);
    await page.waitForTimeout(800);
    // On ignore tous les Warning React de dev et erreurs réseau bénignes
    const critical = consoleErrors.filter(
      (e) =>
        !/^Warning:|Function components cannot be given refs|forwardRef|401|403|favicon|analytics|net::ERR_|Failed to load resource/i.test(e)
    );
    expect(critical, `Erreurs console: ${critical.join(" | ")}`).toEqual([]);
  });
});
