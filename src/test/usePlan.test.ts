import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/hooks/usePlan";

// Accès gratuit temporaire : tous les plans donnent un accès complet.
describe("PLAN_LIMITS (free access mode)", () => {
  it("Free plan is fully unlocked while access is free", () => {
    expect(PLAN_LIMITS.free.maxPlans).toBe(-1);
    expect(PLAN_LIMITS.free.exports).toEqual(["pdf", "docx", "xlsx"]);
    expect(PLAN_LIMITS.free.publicSharing).toBe(true);
    expect(PLAN_LIMITS.free.versionHistory).toBe(true);
    expect(PLAN_LIMITS.free.bceaoSummary).toBe(true);
    expect(PLAN_LIMITS.free.coachClients).toBe(true);
  });

  it("Pro plan keeps all premium features", () => {
    expect(PLAN_LIMITS.pro.maxPlans).toBe(-1);
    expect(PLAN_LIMITS.pro.exports).toEqual(["pdf", "docx", "xlsx"]);
    expect(PLAN_LIMITS.pro.publicSharing).toBe(true);
    expect(PLAN_LIMITS.pro.versionHistory).toBe(true);
  });

  it("Business plan provides effectively unlimited AI", () => {
    expect(PLAN_LIMITS.business.maxPlans).toBe(-1);
    expect(PLAN_LIMITS.business.aiMonthly).toBeGreaterThanOrEqual(10000);
  });

  it("All tiers expose the same premium capabilities", () => {
    for (const tier of ["free", "pro", "business"] as const) {
      expect(PLAN_LIMITS[tier].publicSharing).toBe(true);
      expect(PLAN_LIMITS[tier].versionHistory).toBe(true);
      expect(PLAN_LIMITS[tier].bceaoSummary).toBe(true);
    }
  });
});
