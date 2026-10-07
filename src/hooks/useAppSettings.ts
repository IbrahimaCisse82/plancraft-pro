import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Date de fin de gratuité par défaut (utilisée si les réglages ne sont pas encore chargés). */
export const DEFAULT_FREE_ACCESS_UNTIL = new Date("2026-12-31T23:59:59Z");

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  freeAccessUntil: Date;
  contactEmail: string | null;
}

const DEFAULTS: AppSettings = {
  maintenanceMode: false,
  maintenanceMessage: null,
  freeAccessUntil: DEFAULT_FREE_ACCESS_UNTIL,
  contactEmail: null,
};

let cache: AppSettings | null = null;
const listeners = new Set<() => void>();

async function fetchSettings() {
  const { data } = await supabase
    .from("app_settings")
    .select("maintenance_mode, maintenance_message, free_access_until, contact_email")
    .eq("id", 1)
    .maybeSingle();
  if (data) {
    cache = {
      maintenanceMode: data.maintenance_mode ?? false,
      maintenanceMessage: data.maintenance_message ?? null,
      freeAccessUntil: data.free_access_until
        ? new Date(`${data.free_access_until}T23:59:59Z`)
        : DEFAULT_FREE_ACCESS_UNTIL,
      contactEmail: data.contact_email ?? null,
    };
  }
  listeners.forEach((fn) => fn());
}

/** Recharge les réglages (à appeler après une modification dans le back-office). */
export function refreshAppSettings() {
  return fetchSettings();
}

/** Lit les réglages généraux de l'application (date de fin de gratuité, maintenance, contact). */
export function useAppSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(cache ?? DEFAULTS);

  useEffect(() => {
    const update = () => setSettings(cache ?? DEFAULTS);
    listeners.add(update);
    if (!cache) fetchSettings();
    else update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  return settings;
}
