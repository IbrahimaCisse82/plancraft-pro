import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X, BellRing } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_ACCESS_UNTIL } from "@/hooks/usePlan";
import { useAppSettings } from "@/hooks/useAppSettings";

/** Seuils de rappel (en jours restants) avant la fin de l'accès gratuit. */
export const REMINDER_THRESHOLDS = [30, 7, 1];

export function daysLeft(target: Date = FREE_ACCESS_UNTIL, now: Date = new Date()): number {
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Renvoie le seuil de rappel actif, ou null si aucun rappel ne doit s'afficher. */
export function activeThreshold(days: number): number | null {
  if (days <= 0) return null;
  const match = REMINDER_THRESHOLDS.filter((t) => days <= t).sort((a, b) => a - b)[0];
  return match ?? null;
}

const storageKey = (userId: string, threshold: number) =>
  `pcp:free-access-reminder:${userId}:${threshold}`;

const FreeAccessReminder = () => {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const { freeAccessUntil } = useAppSettings();
  const days = useMemo(() => daysLeft(freeAccessUntil), [freeAccessUntil]);
  const threshold = activeThreshold(days);
  const key = user && threshold ? storageKey(user.id, threshold) : null;

  const [dismissed, setDismissed] = useState(() => {
    if (!key) return false;
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  if (!user || !threshold || dismissed) return null;

  const dismiss = () => {
    if (key) {
      try {
        localStorage.setItem(key, "1");
      } catch {
        /* stockage indisponible : on masque seulement pour cette session */
      }
    }
    setDismissed(true);
  };

  const title =
    lang === "fr"
      ? days <= 1
        ? "Dernier jour d'accès gratuit"
        : `Il reste ${days} jours d'accès gratuit`
      : days <= 1
        ? "Last day of free access"
        : `${days} days of free access left`;

  const body =
    lang === "fr"
      ? "Après le 31 décembre 2026, les limites du plan gratuit s'appliqueront (1 business plan, 10 requêtes IA par mois, export PDF uniquement). Choisissez un abonnement pour conserver l'accès complet."
      : "After December 31, 2026, the free plan limits apply (1 business plan, 10 AI requests per month, PDF export only). Pick a subscription to keep full access.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <Link
          to="/profile#subscription"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {lang === "fr" ? "Voir les abonnements" : "View subscriptions"}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("common.close") || (lang === "fr" ? "Fermer" : "Close")}
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default FreeAccessReminder;
