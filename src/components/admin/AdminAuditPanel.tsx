import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AdminToolbar, Pager, inputCls } from "./AdminToolbar";
import { downloadCsv, paginate } from "@/lib/csv";

type Entry = { id: string; actor_id: string | null; action: string; target_type: string | null; target_id: string | null; details: Record<string, unknown> | null; created_at: string; source: "admin" | "subscription" };

const LABELS: Record<string, [string, string]> = {
  suspend_user: ["Compte suspendu", "Account suspended"],
  reactivate_user: ["Compte réactivé", "Account reactivated"],
  delete_user: ["Compte supprimé", "Account deleted"],
  send_password_reset: ["Lien mot de passe envoyé", "Password reset sent"],
  insert: ["Création", "Created"],
  update: ["Modification", "Updated"],
  delete: ["Suppression", "Deleted"],
  plan_changed: ["Plan modifié", "Plan changed"],
  status_changed: ["Statut modifié", "Status changed"],
  period_changed: ["Période modifiée", "Period changed"],
  created: ["Abonnement créé", "Subscription created"],
};
const TYPES: Record<string, [string, string]> = {
  user: ["Utilisateur", "User"], business_plans: ["Business plan", "Business plan"], user_roles: ["Rôle", "Role"],
  announcements: ["Annonce", "Announcement"], app_settings: ["Réglages", "Settings"], support_tickets: ["Support", "Support"], subscriptions: ["Abonnement", "Subscription"],
};

const AdminAuditPanel = () => {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const [a, s, p] = await Promise.all([
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("subscription_audit_log").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      const list: Entry[] = [
        ...((a.data ?? []) as Omit<Entry, "source">[]).map((e) => ({ ...e, source: "admin" as const })),
        ...(s.data ?? []).map((e) => ({ id: e.id, actor_id: e.actor_id, action: e.action, target_type: "subscriptions", target_id: e.target_user_id, details: { old: e.old_value, new: e.new_value }, created_at: e.created_at, source: "subscription" as const })),
      ].sort((x, y) => y.created_at.localeCompare(x.created_at));
      setEntries(list);
      setNames(new Map((p.data ?? []).map((r) => [r.user_id, r.display_name ?? r.user_id.slice(0, 8)])));
      setLoading(false);
    })();
  }, []);

  const label = (m: Record<string, [string, string]>, k: string | null) => (k && m[k] ? m[k][fr ? 0 : 1] : k ?? "—");
  const who = (id: string | null) => (id ? names.get(id) ?? id.slice(0, 8) : fr ? "Système" : "System");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => (type === "all" || e.target_type === type) &&
      (!q || [e.action, who(e.actor_id), e.target_id, JSON.stringify(e.details)].join(" ").toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, search, type, names]);
  const { pageItems, pages, page: cur } = paginate(filtered, page);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">{fr ? "Historique non modifiable de toutes les actions des administrateurs." : "Tamper-proof history of every admin action."}</p>
      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder={fr ? "Rechercher..." : "Search..."}
        onExport={() => downloadCsv("journal-admin.csv", ["date", "actor", "action", "type", "target", "details"],
          filtered.map((e) => [e.created_at, who(e.actor_id), e.action, e.target_type, e.target_id, JSON.stringify(e.details)]))}>
        <select aria-label="Type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={inputCls}>
          <option value="all">{fr ? "Tous types" : "All types"}</option>
          {Object.keys(TYPES).map((k) => <option key={k} value={k}>{label(TYPES, k)}</option>)}
        </select>
      </AdminToolbar>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">{fr ? "Auteur" : "Actor"}</th>
            <th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3 hidden md:table-cell">{fr ? "Détails" : "Details"}</th>
          </tr></thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-muted-foreground">{fr ? "Aucune action enregistrée" : "No actions recorded"}</td></tr>
            ) : pageItems.map((e) => (
              <tr key={`${e.source}-${e.id}`} className="border-t border-border/50">
                <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(e.created_at).toLocaleString(fr ? "fr-FR" : "en-US")}</td>
                <td className="px-4 py-2.5 text-xs">{who(e.actor_id)}</td>
                <td className="px-4 py-2.5 text-xs font-medium">{label(LABELS, e.action)}</td>
                <td className="px-4 py-2.5 text-xs">{label(TYPES, e.target_type)}</td>
                <td className="px-4 py-2.5 text-[0.65rem] text-muted-foreground hidden md:table-cell max-w-[320px] truncate" title={JSON.stringify(e.details)}>{JSON.stringify(e.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={cur} pages={pages} total={filtered.length} onPage={setPage} fr={fr} />
    </div>
  );
};

export default AdminAuditPanel;
