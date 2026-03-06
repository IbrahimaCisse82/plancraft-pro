import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type BPRow = {
  id: string;
  name: string;
  secteur: string | null;
  statut: "brouillon" | "finalise" | "archive";
  progress: number;
  updated_at: string;
};

export function useBusinessPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BPRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_plans")
      .select("id, name, secteur, statut, progress, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Erreur lors du chargement des business plans");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (name: string, secteur: string, devise: string) => {
    if (!user) return false;
    const { error } = await supabase.from("business_plans").insert({
      user_id: user.id,
      name: name.trim(),
      secteur: secteur.trim() || null,
      devise,
    });
    if (error) {
      toast.error("Erreur : " + error.message);
      return false;
    }
    toast.success("Business plan créé !");
    await fetchPlans();
    return true;
  }, [user, fetchPlans]);

  const archivePlan = useCallback(async (id: string, currentStatut: string) => {
    const newStatut = currentStatut === "archive" ? "brouillon" : "archive";
    const { error } = await supabase.from("business_plans").update({ statut: newStatut }).eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success(newStatut === "archive" ? "Business plan archivé" : "Business plan restauré");
      await fetchPlans();
    }
  }, [fetchPlans]);

  const deletePlan = useCallback(async (id: string) => {
    const { error } = await supabase.from("business_plans").delete().eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Business plan supprimé");
      await fetchPlans();
    }
  }, [fetchPlans]);

  const stats = {
    total: plans.length,
    finalise: plans.filter((p) => p.statut === "finalise").length,
    draft: plans.filter((p) => p.statut === "brouillon").length,
    avgProgress: plans.length ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / plans.length) : 0,
  };

  return { plans, loading, stats, createPlan, archivePlan, deletePlan, fetchPlans };
}
