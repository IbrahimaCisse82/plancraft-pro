import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { History, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type AuditRow = {
  id: string;
  actor_id: string | null;
  target_user_id: string;
  action: string;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
};

const ACTION_LABELS: Record<string, { fr: string; en: string; cls: string }> = {
  created: { fr: "Création", en: "Created", cls: "bg-primary/10 text-primary" },
  plan_changed: { fr: "Changement de formule", en: "Plan changed", cls: "bg-[hsl(43,55%,54%)]/15 text-[hsl(43,55%,54%)]" },
  status_changed: { fr: "Changement de statut", en: "Status changed", cls: "bg-secondary text-muted-foreground" },
  period_changed: { fr: "Période modifiée", en: "Period changed", cls: "bg-success/10 text-success" },
};

function describe(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "object") return String(value);
  return Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${v ?? "—"}`)
    .join(", ");
}

/** Journal d'audit (lecture seule, admin) des changements d'abonnement. */
const SubscriptionAuditLog = () => {
  const { lang } = useI18n();
  const isFr = lang === "fr";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("subscription_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (data ?? []) as AuditRow[];
    setRows(list);

    const ids = Array.from(
      new Set(list.flatMap(r => [r.target_user_id, r.actor_id]).filter((v): v is string => !!v))
    );
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach(p => {
        if (p.display_name) map[p.user_id] = p.display_name;
      });
      setNames(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const label = (id: string | null) => {
    if (!id) return isFr ? "Système" : "System";
    return names[id] || id.slice(0, 8);
  };

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          aria-expanded={open}
        >
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <History className="w-3.5 h-3.5 text-primary" />
          {isFr ? "Journal d'audit des abonnements" : "Subscription audit log"}
        </button>
        {open && (
          <button
            onClick={load}
            className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground"
            title={isFr ? "Rafraîchir" : "Refresh"}
            aria-label={isFr ? "Rafraîchir le journal" : "Refresh log"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-border overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
              {isFr ? "Aucun changement enregistré" : "No recorded change"}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-2">{isFr ? "Date" : "Date"}</th>
                  <th className="text-left px-4 py-2">{isFr ? "Action" : "Action"}</th>
                  <th className="text-left px-4 py-2">{isFr ? "Utilisateur" : "User"}</th>
                  <th className="text-left px-4 py-2 hidden md:table-cell">{isFr ? "Avant" : "Before"}</th>
                  <th className="text-left px-4 py-2 hidden md:table-cell">{isFr ? "Après" : "After"}</th>
                  <th className="text-left px-4 py-2 hidden lg:table-cell">{isFr ? "Auteur" : "Actor"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const meta = ACTION_LABELS[r.action] ?? {
                    fr: r.action, en: r.action, cls: "bg-secondary text-muted-foreground",
                  };
                  return (
                    <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2 text-[0.65rem] text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString(isFr ? "fr-FR" : "en-GB")}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${meta.cls}`}>
                          {isFr ? meta.fr : meta.en}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">{label(r.target_user_id)}</td>
                      <td className="px-4 py-2 text-[0.65rem] text-muted-foreground hidden md:table-cell">{describe(r.old_value)}</td>
                      <td className="px-4 py-2 text-[0.65rem] hidden md:table-cell">{describe(r.new_value)}</td>
                      <td className="px-4 py-2 text-[0.65rem] text-muted-foreground hidden lg:table-cell">{label(r.actor_id)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionAuditLog;
