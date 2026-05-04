import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = "free" | "pro" | "business";

export interface PlanLimits {
  maxPlans: number; // -1 = unlimited
  aiMonthly: number;
  exports: ("pdf" | "docx" | "xlsx")[];
  publicSharing: boolean;
  versionHistory: boolean;
  bceaoSummary: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlans: 2,
    aiMonthly: 10,
    exports: ["pdf"],
    publicSharing: false,
    versionHistory: false,
    bceaoSummary: false,
  },
  pro: {
    maxPlans: -1,
    aiMonthly: 100,
    exports: ["pdf", "docx", "xlsx"],
    publicSharing: true,
    versionHistory: true,
    bceaoSummary: true,
  },
  business: {
    maxPlans: -1,
    aiMonthly: 100000,
    exports: ["pdf", "docx", "xlsx"],
    publicSharing: true,
    versionHistory: true,
    bceaoSummary: true,
  },
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  const limits = PLAN_LIMITS[plan];
  const canCreatePlan = (currentCount: number) =>
    limits.maxPlans === -1 || currentCount < limits.maxPlans;

  return { plan, limits, usage, loading, refresh, canCreatePlan };
}
