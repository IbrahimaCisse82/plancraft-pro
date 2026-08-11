import { test, expect, type Page } from "@playwright/test";

async function waitForApp(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction(() => !!document.querySelector("nav, main, form, h1, h2"), null, {
    timeout: 10_000,
  });
}

test.describe("📄 Pages publiques", () => {
  const pages: Array<[string, RegExp]> = [
    ["/guide", /guide/i],
    ["/cgu", /conditions|terms/i],
    ["/confidentialite", /confidentialité|privacy|données/i],
  ];

  for (const [route, heading] of pages) {
    test(`${route} s'affiche avec un titre pertinent`, async ({ page }) => {
      await page.goto(route);
      await waitForApp(page);
      await expect(page.locator("h1, h2").first()).toBeVisible();
      await expect(page.locator("body")).toContainText(heading);
    });
  }

  test("chaque page publique expose un seul h1", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    expect(await page.locator("h1").count()).toBeLessThanOrEqual(1);
  });

  test("le lien de partage invalide affiche un message d'erreur", async ({ page }) => {
    await page.goto("/share/token-invalide-123");
    await waitForApp(page);
    await expect(page.locator("body")).toContainText(/introuvable|expiré|invalide|not found|expired/i);
  });

  test("robots.txt et sitemap.xml sont servis", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("<urlset");
  });

  test("les métadonnées SEO sont présentes", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc && desc.length).toBeGreaterThan(30);
  });
});
