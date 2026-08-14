import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Audit d'accessibilité automatisé (WCAG 2.1 A & AA) sur les pages publiques.
 * Toute violation sérieuse ou critique fait échouer la campagne.
 */

const PAGES: { path: string; name: string }[] = [
  { path: "/", name: "Landing" },
  { path: "/auth", name: "Authentification" },
  { path: "/cgu", name: "CGU" },
  { path: "/confidentialite", name: "Confidentialité" },
  { path: "/guide", name: "Guide" },
];

for (const p of PAGES) {
  test(`♿ ${p.name} — aucune violation a11y sérieuse (WCAG 2.1 AA)`, async ({ page }) => {
    await page.goto(p.path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      v => v.impact === "serious" || v.impact === "critical"
    );

    if (blocking.length) {
      console.log(
        `[a11y] ${p.name}:`,
        JSON.stringify(
          blocking.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })),
          null,
          2
        )
      );
    }

    expect(blocking, `Violations a11y sur ${p.name}`).toEqual([]);
  });
}
