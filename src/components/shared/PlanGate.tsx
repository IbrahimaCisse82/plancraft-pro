import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { usePlan, type PlanTier, PLAN_LIMITS } from "@/hooks/usePlan";
import { useI18n } from "@/contexts/I18nContext";

interface Props {
  feature: keyof typeof PLAN_LIMITS["free"];
  required?: PlanTier;
  children: ReactNode;
  fallback?: ReactNode;
  inline?: boolean;
}

/**
 * Gates a child component behind a plan tier.
 * For boolean features (publicSharing, versionHistory, bceaoSummary).
 */
const PlanGate = ({ feature, required = "pro", children, fallback, inline }: Props) => {
  const { plan, limits, loading } = usePlan();
  const { lang } = useI18n();

  if (loading) return null;

  const ok = (() => {
    const v = limits[feature];
    if (typeof v === "boolean") return v;
    return true;
  })();

  if (ok) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const msg =
    lang === "fr"
      ? `Fonctionnalité réservée au plan ${required.toUpperCase()}.`
      : `Available on the ${required.toUpperCase()} plan.`;
  const cta = lang === "fr" ? "Passer au plan supérieur" : "Upgrade plan";

  return (
    <div
      className={`${
        inline ? "inline-flex" : "flex"
      } items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm`}
    >
      <Lock className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 text-foreground">
        <span className="font-semibold">{msg}</span>
      </div>
      <Link
        to="/#tarifs"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
      >
        <Sparkles className="w-3 h-3" />
        {cta}
      </Link>
    </div>
  );
};

export default PlanGate;
