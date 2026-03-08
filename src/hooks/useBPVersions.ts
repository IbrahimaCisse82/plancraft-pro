import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BPVersion {
  id: string;
  plan_id: string;
  label: string | null;
  created_at: string;
}

export function useBPVersions(planId: string | undefined) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<BPVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bp_versions")
      .select("id, plan_id, label, created_at")
      .eq("plan_id", planId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setVersions(data || []);
    setLoading(false);
  }, [planId]);

  const saveVersion = useCallback(async (content: Record<string, any>, label?: string) => {
    if (!planId || !user) return;
    const { error } = await supabase.from("bp_versions").insert({
      plan_id: planId,
      user_id: user.id,
      content,
      label: label || `Snapshot ${new Date().toLocaleString("fr-FR")}`,
    });
    if (error) {
      toast.error("Erreur lors de la sauvegarde de la version");
    } else {
      toast.success("Version sauvegardée !");
      await fetchVersions();
    }
  }, [planId, user, fetchVersions]);

  const restoreVersion = useCallback(async (versionId: string): Promise<Record<string, any> | null> => {
    const { data, error } = await supabase
      .from("bp_versions")
      .select("content")
      .eq("id", versionId)
      .single();
    if (error || !data) {
      toast.error("Erreur lors de la restauration");
      return null;
    }
    toast.success("Version restaurée !");
    return data.content as Record<string, any>;
  }, []);

  const deleteVersion = useCallback(async (versionId: string) => {
    const { error } = await supabase.from("bp_versions").delete().eq("id", versionId);
    if (!error) {
      toast.success("Version supprimée");
      await fetchVersions();
    }
  }, [fetchVersions]);

  return { versions, loading, fetchVersions, saveVersion, restoreVersion, deleteVersion };
}
