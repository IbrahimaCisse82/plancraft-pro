import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/hooks/usePlan";

describe("PLAN_LIMITS", () => {
  it("Free plan caps at 2 plans and 10 AI calls", () => {
    expect(PLAN_LIMITS.free.maxPlans).toBe(2);
    expect(PLAN_LIMITS.free.aiMonthly).toBe(10);
    expect(PLAN_LIMITS.free.exports).toEqual(["pdf"]);
    expect(PLAN_LIMITS.free.publicSharing).toBe(false);
    expect(PLAN_LIMITS.free.versionHistory).toBe(false);
  });

  it("Pro plan unlocks all exports + sharing + history", () => {
    expect(PLAN_LIMITS.pro.maxPlans).toBe(-1);
    expect(PLAN_LIMITS.pro.exports).toEqual(["pdf", "docx", "xlsx"]);
    expect(PLAN_LIMITS.pro.publicSharing).toBe(true);
    expect(PLAN_LIMITS.pro.versionHistory).toBe(true);
    expect(PLAN_LIMITS.pro.aiMonthly).toBe(100);
  });

  it("Business plan provides effectively unlimited AI", () => {
    expect(PLAN_LIMITS.business.maxPlans).toBe(-1);
    expect(PLAN_LIMITS.business.aiMonthly).toBeGreaterThanOrEqual(10000);
  });

  it("Plan tiers escalate strictly", () => {
    expect(PLAN_LIMITS.pro.aiMonthly).toBeGreaterThan(PLAN_LIMITS.free.aiMonthly);
    expect(PLAN_LIMITS.business.aiMonthly).toBeGreaterThan(PLAN_LIMITS.pro.aiMonthly);
  });
});
