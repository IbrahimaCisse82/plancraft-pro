import { describe, it, expect } from "vitest";
import { activeThreshold, daysLeft } from "@/components/shared/FreeAccessReminder";
import { FREE_ACCESS_UNTIL } from "@/hooks/usePlan";

describe("rappel de fin d'accès gratuit", () => {
  it("ne s'affiche pas au-delà de 30 jours restants", () => {
    expect(activeThreshold(45)).toBeNull();
    expect(activeThreshold(31)).toBeNull();
  });

  it("utilise le seuil le plus proche", () => {
    expect(activeThreshold(30)).toBe(30);
    expect(activeThreshold(12)).toBe(30);
    expect(activeThreshold(7)).toBe(7);
    expect(activeThreshold(3)).toBe(7);
    expect(activeThreshold(1)).toBe(1);
  });

  it("ne s'affiche plus une fois la période terminée", () => {
    expect(activeThreshold(0)).toBeNull();
    expect(activeThreshold(-5)).toBeNull();
  });

  it("calcule les jours restants avant le 31/12/2026", () => {
    expect(daysLeft(FREE_ACCESS_UNTIL, new Date("2026-12-24T23:59:59Z"))).toBe(7);
  });
});
