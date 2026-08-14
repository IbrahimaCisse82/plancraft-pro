import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Search, RefreshCw, Download, CalendarPlus, Zap } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Plan = "free" | "pro" | "business";
type Status = "active" | "canceled" | "past_due" | "trialing";

type SubRow = {
  id: string;
  user_id: string;
  plan: Plan;
  status: Status;
  billing_interval: string;
  current_period_end: string | null;
  updated_at: string;
};

type ProfileRow = { user_id: string; display_name: string | null; created_at: string };
type UsageRow = { user_id: string; month: string; count: number };

const PLANS: Plan[] = ["free", "pro", "business"];
const STATUSES: Status[] = ["active", "trialing", "past_due", "canceled"];

const AI_LIMITS: Record<Plan, number> = { free: 10, pro: 100, business: 100000 };

const SubscriptionsPanel = () => {
  const { lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<Record<string, SubRow>>({});
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isFr = lang === "fr";

  const load = async () => {
    setLoading(true);
    const [pRes, sRes, uRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, created_at").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*"),
      supabase.from("ai_usage").select("user_id, month, count").eq("month", currentMonth),
    ]);
    if (pRes.data) setProfiles(pRes.data);
    if (sRes.data) {
      const map: Record<string, SubRow> = {};
      (sRes.data as SubRow[]).forEach(s => { map[s.user_id] = s; });
      setSubs(map);
    }
    if (uRes.data) {
      const um: Record<string, number> = {};
      (uRes.data as UsageRow[]).forEach(u => { um[u.user_id] = u.count; });
      setUsage(um);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const ensureSub = async (userId: string): Promise<SubRow | null> => {
    if (subs[userId]) return subs[userId];
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: userId, plan: "free", status: "active" })
      .select()
      .single();
    if (error) { toast.error(error.message); return null; }
    setSubs(prev => ({ ...prev, [userId]: data as SubRow }));
    return data as SubRow;
  };

  const updateSub = async (userId: string, patch: Partial<Pick<SubRow, "plan" | "status" | "current_period_end">>) => {
    setBusyId(userId);
    const existing = await ensureSub(userId);
    if (!existing) { setBusyId(null); return; }
    const { data, error } = await supabase
      .from("subscriptions")
      .update(patch)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      setSubs(prev => ({ ...prev, [userId]: data as SubRow }));
      toast.success(isFr ? "Abonnement mis à jour" : "Subscription updated");
    }
    setBusyId(null);
  };

  const extend30Days = async (userId: string) => {
    const existing = subs[userId];
    const base = existing?.current_period_end ? new Date(existing.current_period_end) : new Date();
    if (base < new Date()) base.setTime(Date.now());
    base.setDate(base.getDate() + 30);
    await updateSub(userId, { current_period_end: base.toISOString() });
  };

  const resetUsage = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase
      .from("ai_usage")
      .delete()
      .eq("user_id", userId)
      .eq("month", currentMonth);
    if (error) toast.error(error.message);
    else {
      setUsage(prev => { const n = { ...prev }; delete n[userId]; return n; });
      toast.success(isFr ? "Quota IA réinitialisé" : "AI quota reset");
    }
    setBusyId(null);
    setResetUserId(null);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles
      .map(p => {
        const s = subs[p.user_id];
        return {
          profile: p,
          plan: (s?.plan ?? "free") as Plan,
          status: (s?.status ?? "active") as Status,
          periodEnd: s?.current_period_end ?? null,
          used: usage[p.user_id] ?? 0,
        };
      })
      .filter(r => {
        if (planFilter !== "all" && r.plan !== planFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (q && !(r.profile.display_name ?? "").toLowerCase().includes(q) && !r.profile.user_id.startsWith(q)) return false;
        return true;
      });
  }, [profiles, subs, usage, search, planFilter, statusFilter]);

  const exportCsv = () => {
    const header = ["user_id", "display_name", "plan", "status", "current_period_end", "ai_used_this_month", "ai_limit"];
    const lines = rows.map(r => [
      r.profile.user_id,
      (r.profile.display_name ?? "").replace(/[",\n]/g, " "),
      r.plan,
      r.status,
      r.periodEnd ?? "",
      String(r.used),
      String(AI_LIMITS[r.plan]),
    ].map(v => `"${v}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const planBadge: Record<Plan, string> = {
    free: "bg-secondary text-muted-foreground",
    pro: "bg-[hsl(43,55%,54%)]/15 text-[hsl(43,55%,54%)]",
    business: "bg-[hsl(155,62%,53%)]/15 text-[hsl(155,62%,53%)]",
  };
  const statusBadge: Record<Status, string> = {
    active: "bg-success/10 text-success",
    trialing: "bg-primary/10 text-primary",
    past_due: "bg-[hsl(43,55%,54%)]/15 text-[hsl(43,55%,54%)]",
    canceled: "bg-destructive/10 text-destructive",
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const totals = {
    free: rows.filter(r => r.plan === "free").length,
    pro: rows.filter(r => r.plan === "pro").length,
    business: rows.filter(r => r.plan === "business").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(["free", "pro", "business"] as Plan[]).map(p => (
          <div key={p} className="bg-card border border-border rounded-lg p-4">
            <div className={`inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase mb-2 ${planBadge[p]}`}>{p}</div>
            <div className="font-display text-2xl font-bold">{totals[p]}</div>
            <div className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{isFr ? "utilisateurs" : "users"}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isFr ? "Nom ou ID..." : "Name or ID..."}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-secondary text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value as "all" | Plan)}
          className="px-2 py-1.5 rounded-md bg-secondary text-xs border border-border">
          <option value="all">{isFr ? "Tous plans" : "All plans"}</option>
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "all" | Status)}
          className="px-2 py-1.5 rounded-md bg-secondary text-xs border border-border">
          <option value="all">{isFr ? "Tous statuts" : "All statuses"}</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground" title={isFr ? "Rafraîchir" : "Refresh"}>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={exportCsv} className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-xs font-bold hover:bg-secondary/80">
          <Download className="w-3.5 h-3.5" />CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left px-4 py-3">{isFr ? "Utilisateur" : "User"}</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">{isFr ? "Statut" : "Status"}</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">{isFr ? "Fin période" : "Period end"}</th>
              <th className="text-center px-4 py-3">{isFr ? "IA (mois)" : "AI (month)"}</th>
              <th className="text-right px-4 py-3">{isFr ? "Actions" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-xs">{isFr ? "Aucun utilisateur" : "No users"}</td></tr>
            ) : rows.map(r => {
              const limit = AI_LIMITS[r.plan];
              const pct = limit > 0 ? Math.min(100, Math.round((r.used / limit) * 100)) : 0;
              const busy = busyId === r.profile.user_id;
              return (
                <tr key={r.profile.user_id} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-xs">{r.profile.display_name || "—"}</div>
                    <div className="text-[0.6rem] text-muted-foreground font-mono">{r.profile.user_id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.plan}
                      disabled={busy}
                      onChange={e => updateSub(r.profile.user_id, { plan: e.target.value as Plan })}
                      className={`px-2 py-1 rounded-md text-[0.65rem] font-bold uppercase bg-transparent border border-border ${planBadge[r.plan]}`}
                    >
                      {PLANS.map(p => <option key={p} value={p} className="bg-card text-foreground">{p}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      disabled={busy}
                      onChange={e => updateSub(r.profile.user_id, { status: e.target.value as Status })}
                      className={`px-2 py-1 rounded-md text-[0.65rem] font-bold uppercase bg-transparent border border-border ${statusBadge[r.status]}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {r.periodEnd ? new Date(r.periodEnd).toLocaleDateString(isFr ? "fr-FR" : "en-US") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-[0.7rem] font-medium">{r.used} / {limit === 100000 ? "∞" : limit}</div>
                    <div className="w-16 h-1 mx-auto bg-secondary rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-[hsl(43,55%,54%)]" : "bg-success"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        disabled={busy}
                        onClick={() => extend30Days(r.profile.user_id)}
                        title={isFr ? "Prolonger de 30 jours" : "Extend 30 days"}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary disabled:opacity-40"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={busy || r.used === 0}
                        onClick={() => setResetUserId(r.profile.user_id)}
                        title={isFr ? "Réinitialiser quota IA" : "Reset AI quota"}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-[hsl(43,55%,54%)] hover:bg-secondary disabled:opacity-40"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SubscriptionAuditLog />

      <ConfirmDialog
        open={!!resetUserId}
        onOpenChange={o => !o && setResetUserId(null)}
        title={isFr ? "Réinitialiser le quota IA ?" : "Reset AI quota?"}
        description={isFr ? "Le compteur d'utilisation IA du mois en cours sera remis à zéro." : "The current month's AI usage counter will be reset to zero."}
        confirmLabel={isFr ? "Réinitialiser" : "Reset"}
        onConfirm={() => { if (resetUserId) resetUsage(resetUserId); }}
      />
    </div>
  );
};

export default SubscriptionsPanel;
