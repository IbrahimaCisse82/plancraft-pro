import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Info } from "lucide-react";

type Sub = { user_id: string; plan: "free" | "pro" | "business"; status: string; billing_interval: string; updated_at: string };
type Audit = { action: string; old_value: { plan?: string; status?: string } | null; new_value: { plan?: string; status?: string } | null; created_at: string };

// Monthly list prices (EUR) used for estimates; real values come from the payment provider once enabled.
const PRICE: Record<Sub["plan"], number> = { free: 0, pro: 19, business: 49 };

const RevenuePanel = () => {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [subs, setSubs] = useState<Sub[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [s, a] = await Promise.all([
        supabase.from("subscriptions").select("user_id, plan, status, billing_interval, updated_at"),
        supabase.from("subscription_audit_log").select("action, old_value, new_value, created_at").gte("created_at", since),
      ]);
      setSubs((s.data ?? []) as Sub[]);
      setAudit((a.data ?? []) as Audit[]);
      setLoading(false);
    })();
  }, []);

  const m = useMemo(() => {
    const paying = subs.filter((s) => s.plan !== "free" && (s.status === "active" || s.status === "past_due"));
    const mrr = paying.reduce((t, s) => t + PRICE[s.plan], 0);
    const upgrades = audit.filter((e) => e.action === "plan_changed" && e.old_value?.plan === "free" && e.new_value?.plan !== "free").length;
    const churn = audit.filter((e) => (e.action === "status_changed" && e.new_value?.status === "canceled") || (e.action === "plan_changed" && e.new_value?.plan === "free" && e.old_value?.plan !== "free")).length;
    const total = subs.length || 1;
    return {
      mrr, arr: mrr * 12, paying: paying.length,
      arpu: paying.length ? Math.round(mrr / paying.length) : 0,
      conversion: Math.round((paying.length / total) * 100),
      upgrades, churn,
      byPlan: (["free", "pro", "business"] as const).map((p) => ({ p, n: subs.filter((s) => s.plan === p).length })),
    };
  }, [subs, audit]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const fmt = (n: number) => n.toLocaleString(fr ? "fr-FR" : "en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const cards = [
    { v: fmt(m.mrr), l: fr ? "Revenu mensuel (MRR)" : "Monthly revenue (MRR)" },
    { v: fmt(m.arr), l: fr ? "Revenu annuel (ARR)" : "Annual revenue (ARR)" },
    { v: m.paying, l: fr ? "Clients payants" : "Paying customers" },
    { v: fmt(m.arpu), l: fr ? "Revenu moyen / client" : "ARPU" },
    { v: `${m.conversion}%`, l: fr ? "Taux de conversion" : "Conversion rate" },
    { v: m.upgrades, l: fr ? "Passages payants (30 j)" : "Upgrades (30d)" },
    { v: m.churn, l: fr ? "Départs (30 j)" : "Churn (30d)" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 items-start bg-primary/10 border border-primary/30 rounded-lg p-3 text-xs">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>{fr
          ? "Estimations basées sur les plans attribués. Les montants deviendront réels après l'activation des paiements (accès gratuit jusqu'au 31/12/2026)."
          : "Estimates based on assigned plans. Figures become real once payments are enabled (free access until 31/12/2026)."}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.l} className="bg-card border border-border rounded-lg p-4">
            <div className="font-display text-2xl font-bold text-[hsl(var(--gold-light))]">{c.v}</div>
            <div className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-0.5">{c.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">{fr ? "Répartition par plan" : "Plan distribution"}</h3>
        {m.byPlan.map(({ p, n }) => {
          const pct = subs.length ? Math.round((n / subs.length) * 100) : 0;
          return (
            <div key={p} className="mb-2">
              <div className="flex justify-between text-xs mb-1"><span className="uppercase font-bold">{p}</span><span>{n} · {pct}%</span></div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenuePanel;
