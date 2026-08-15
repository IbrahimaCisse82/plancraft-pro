import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { usePlan, PLAN_LIMITS, isFreeAccessPeriod, type PlanTier } from "@/hooks/usePlan";

interface SubRow {
  plan: PlanTier;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

const fmtDate = (iso: string | null, lang: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

const SubscriptionSection = () => {
  const { user } = useAuth();
  const { lang } = useI18n();
  const { plan, usage, refresh } = usePlan();
  const [sub, setSub] = useState<SubRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, billing_interval, current_period_end, stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      setSub(data as SubRow | null);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return null;

  const limits = PLAN_LIMITS[plan];
  const isPaid = plan !== "free";
  const pct = Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));

  const tr = (fr: string, en: string) => (lang === "fr" ? fr : en);

  const planLabel: Record<PlanTier, string> = {
    free: tr("Gratuit", "Free"),
    pro: "Pro",
    business: "Business",
  };

  const statusLabel = () => {
    const s = sub?.status ?? "active";
    if (s === "active") return tr("Actif", "Active");
    if (s === "trialing") return tr("Essai", "Trial");
    if (s === "past_due") return tr("Paiement en retard", "Past due");
    if (s === "canceled") return tr("Annulé", "Canceled");
    return s;
  };

  return (
    <div className="mt-12 border-t border-border pt-10">
      <h2 className="font-display text-2xl font-bold mb-6">
        {tr("Mon abonnement", "My subscription")}
      </h2>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        {isFreeAccessPeriod() && (
          <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-foreground">
              {tr(
                "Accès complet offert : toutes les fonctionnalités premium sont débloquées gratuitement jusqu'au 31 décembre 2026.",
                "Full access granted: every premium feature is unlocked for free until December 31, 2026.",
              )}
            </p>
          </div>
        )}
        {/* Plan header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {tr("Plan actuel", "Current plan")}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${
                  isPaid
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {statusLabel()}
              </span>
            </div>
            <div className="font-display text-3xl font-bold text-[hsl(var(--gold-light))]">
              {planLabel[plan]}
            </div>
            {isPaid && (
              <div className="text-xs text-muted-foreground mt-1">
                {sub?.billing_interval === "yearly"
                  ? tr("Facturation annuelle", "Yearly billing")
                  : tr("Facturation mensuelle", "Monthly billing")}
              </div>
            )}
          </div>

          {!isPaid && (
            <Link
              to="/#tarifs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" />
              {tr("Passer au plan supérieur", "Upgrade plan")}
            </Link>
          )}
        </div>

        {/* Period info */}
        {isPaid && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/50">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  {sub?.status === "canceled"
                    ? tr("Fin d'accès", "Access ends")
                    : tr("Prochaine échéance", "Next renewal")}
                </div>
                <div className="text-sm font-bold">
                  {fmtDate(sub?.current_period_end ?? null, lang)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/50">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  {tr("Moyen de paiement", "Payment method")}
                </div>
                <div className="text-sm font-bold">
                  {sub?.stripe_customer_id
                    ? tr("Carte enregistrée", "Saved card")
                    : tr("Non configuré", "Not set")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI quota */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-secondary-foreground">
              {tr("Crédits IA ce mois-ci", "AI credits this month")}
            </span>
            <span className="text-muted-foreground">
              {usage.used} / {usage.limit === 100000 ? "∞" : usage.limit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full transition-all ${pct >= 90 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Features */}
        <div className="pt-2">
          <div className="text-xs font-bold text-secondary-foreground mb-2">
            {tr("Inclus dans votre plan", "Included in your plan")}
          </div>
          <ul className="space-y-1.5 text-sm">
            <Feat ok>
              {limits.maxPlans === -1
                ? tr("Business plans illimités", "Unlimited business plans")
                : tr(`${limits.maxPlans} business plans max`, `${limits.maxPlans} business plans max`)}
            </Feat>
            <Feat ok>{tr("Exports", "Exports")}: {limits.exports.join(", ").toUpperCase()}</Feat>
            <Feat ok={limits.publicSharing}>{tr("Partage public sécurisé", "Secure public sharing")}</Feat>
            <Feat ok={limits.versionHistory}>{tr("Historique des versions", "Version history")}</Feat>
            <Feat ok={limits.bceaoSummary}>{tr("Synthèse BCEAO bancaire", "BCEAO banker summary")}</Feat>
            <Feat ok={limits.coachClients}>{tr("Espace clients (coach)", "Coach client workspace")}</Feat>
          </ul>
        </div>

        {/* Manage / contact */}
        {isPaid && (
          <div className="pt-3 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              {tr(
                "Pour modifier, mettre à jour votre carte ou annuler votre abonnement, contactez-nous à ",
                "To change, update your card or cancel your subscription, contact us at ",
              )}
              <a href="mailto:support@plancraft.pro" className="text-primary hover:underline">
                support@plancraft.pro
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Feat = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <li className="flex items-center gap-2">
    <CheckCircle2 className={`w-4 h-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/40"}`} />
    <span className={ok ? "text-foreground" : "text-muted-foreground/60 line-through"}>{children}</span>
  </li>
);

export default SubscriptionSection;
