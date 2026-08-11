import * as Sentry from "@sentry/react";

/** Erreurs bruyantes qu'on ne veut jamais voir remonter en alerte. */
const IGNORED_ERRORS = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  "Non-Error promise rejection captured",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "NetworkError when attempting to fetch resource",
  "Load failed",
  "AbortError",
];

/** Extensions navigateur & scripts tiers : bruit pur. */
const DENY_URLS = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /googletagmanager\.com/i,
  /translate\.google/i,
];

let enabled = false;

/** Indique si le monitoring distant est actif (DSN fournie). */
export const isSentryEnabled = () => enabled;

/**
 * Initialise Sentry si une DSN publique est fournie via VITE_SENTRY_DSN.
 * Sans DSN, aucun envoi réseau n'est effectué (mode silencieux).
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  try {
    Sentry.init({
      dsn,
      environment: (import.meta.env.VITE_SENTRY_ENV as string) || import.meta.env.MODE,
      release: (import.meta.env.VITE_APP_VERSION as string) || undefined,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      ignoreErrors: IGNORED_ERRORS,
      denyUrls: DENY_URLS,
      // Ne jamais laisser fuiter de données sensibles dans les événements.
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.request?.url) {
          try {
            const url = new URL(event.request.url);
            // Purge les tokens éventuels présents dans le fragment/query.
            url.hash = "";
            ["access_token", "refresh_token", "token", "code"].forEach((k) =>
              url.searchParams.delete(k)
            );
            event.request.url = url.toString();
          } catch {
            /* ignore */
          }
        }
        return event;
      },
    });
    enabled = true;
  } catch {
    // No-op : on ne casse jamais l'app à cause du monitoring.
  }
}

/** Associe les erreurs à un utilisateur (id seulement, pas d'email = RGPD). */
export function setSentryUser(userId: string | null) {
  try {
    Sentry.setUser(userId ? { id: userId } : null);
  } catch {
    /* ignore */
  }
}

/** Ajoute un fil d'Ariane (navigation, action métier) au prochain événement. */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  try {
    Sentry.addBreadcrumb({ message, data, level: "info" });
  } catch {
    /* ignore */
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    /* ignore */
  }
}

export function captureMessage(
  message: string,
  level: "error" | "warning" | "info" = "error",
  context?: Record<string, unknown>
) {
  try {
    Sentry.captureMessage(message, { level, extra: context });
  } catch {
    /* ignore */
  }
}
