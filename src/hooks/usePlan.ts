import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";

export type PlanTier = "free" | "pro" | "business";

export interface PlanLimits {
  maxPlans: number; // -1 = unlimited
  aiMonthly: number;
  exports: ("pdf" | "docx" | "xlsx")[];
  publicSharing: boolean;
  versionHistory: boolean;
  bceaoSummary: boolean;
  coachClients: boolean;
}

/** Période promotionnelle : accès complet gratuit jusqu'au 31 décembre 2026 inclus. */
export const FREE_ACCESS_UNTIL = new Date("2026-12-31T23:59:59Z");

export const isFreeAccessPeriod = (now: Date = new Date(), until: Date = FREE_ACCESS_UNTIL) => now <= until;

const FULL_ACCESS: PlanLimits = {
  maxPlans: -1,
  aiMonthly: 100000,
  exports: ["pdf", "docx", "xlsx"],
  publicSharing: true,
  versionHistory: true,
  bceaoSummary: true,
  coachClients: true,
};

/** Limites réelles appliquées après la fin de la période gratuite. */
export const STANDARD_PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlans: 1,
    aiMonthly: 10,
    exports: ["pdf"],
    publicSharing: false,
    versionHistory: false,
    bceaoSummary: false,
    coachClients: false,
  },
  pro: {
    maxPlans: -1,
    aiMonthly: 100,
    exports: ["pdf", "docx", "xlsx"],
    publicSharing: true,
    versionHistory: true,
    bceaoSummary: true,
    coachClients: false,
  },
  business: FULL_ACCESS,
};

export const getPlanLimits = (tier: PlanTier, now: Date = new Date(), until: Date = FREE_ACCESS_UNTIL): PlanLimits =>
  isFreeAccessPeriod(now, until) ? FULL_ACCESS : STANDARD_PLAN_LIMITS[tier];

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: getPlanLimits("free"),
  pro: getPlanLimits("pro"),
  business: getPlanLimits("business"),
};

export interface AIUsage {
  used: number;
  limit: number;
  plan: PlanTier;
}

export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanTier>("free");
  const [usage, setUsage] = useState<AIUsage>({ used: 0, limit: 10, plan: "free" });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPlan("free");
      setUsage({ used: 0, limit: 10, plan: "free" });
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: sub }, { data: u }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.rpc("get_current_ai_usage"),
    ]);
    const tier = (sub?.plan as PlanTier) || "free";
    setPlan(tier);
    if (u && typeof u === "object") {
      const obj = u as { used?: number; limit?: number; plan?: PlanTier };
      setUsage({
        used: obj.used ?? 0,
        limit: obj.limit ?? PLAN_LIMITS[tier].aiMonthly,
        plan: (obj.plan as PlanTier) ?? tier,
      });
    }
    setLoading(false);
  }, [user]);

  const { freeAccessUntil } = useAppSettings();

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("ai-quota-updated", handler);
    return () => window.removeEventListener("ai-quota-updated", handler);
  }, [refresh]);

  const limits = getPlanLimits(plan, new Date(), freeAccessUntil);
  const freeAccess = isFreeAccessPeriod(new Date(), freeAccessUntil);
  const effectiveUsage: AIUsage = freeAccess
    ? { ...usage, limit: limits.aiMonthly }
    : usage;
  const canCreatePlan = (currentCount: number) =>
    limits.maxPlans === -1 || currentCount < limits.maxPlans;

  return {
    plan,
    limits,
    usage: effectiveUsage,
    loading,
    refresh,
    canCreatePlan,
    freeAccess,
    freeAccessUntil,
  };
}
