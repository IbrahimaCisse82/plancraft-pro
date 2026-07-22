import * as Sentry from "@sentry/react";

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
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch {
    // No-op : on ne casse jamais l'app à cause du monitoring.
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    /* ignore */
  }
}
