import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import type { Json } from "@/integrations/supabase/types";

type BPContent = Record<string, any>;

export function useAutoSave(planId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveContent = useCallback(async (content: BPContent) => {
    if (!planId) return;
    setSaving(true);
    setSaved(false);

    const filledSections = BP_SECTIONS.filter((s) => {
      const val = content[s.id];
      if (!val) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (typeof val === "object") return Object.keys(val).length > 0;
      return false;
    }).length;
    const progress = Math.round((filledSections / BP_SECTIONS.length) * 100);

    const { error } = await supabase
      .from("business_plans")
      .update({ content: content as unknown as Json, progress })
      .eq("id", planId);

    setSaving(false);
    if (error) {
      toast.error("Erreur de sauvegarde");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [planId]);

  const scheduleAutoSave = useCallback((content: BPContent) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveContent(content), 1500);
  }, [saveContent]);

  return { saving, saved, saveContent, scheduleAutoSave };
}
