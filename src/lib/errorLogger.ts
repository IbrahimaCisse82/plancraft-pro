import { supabase } from "@/integrations/supabase/client";

type Level = "error" | "warning" | "info";

interface LogPayload {
  message: string;
  stack?: string;
  level?: Level;
  context?: Record<string, unknown>;
  source?: "client" | "edge";
}

let lastSignature = "";
let lastTime = 0;

/**
 * Best-effort error logger. Silent on failure, deduplicates rapid duplicates.
 */
export const logError = async (payload: LogPayload): Promise<void> => {
  try {
    const sig = `${payload.level || "error"}|${payload.message}`;
    const now = Date.now();
    if (sig === lastSignature && now - lastTime < 5000) return;
    lastSignature = sig;
    lastTime = now;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("error_logs").insert({
      user_id: user?.id ?? null,
      source: payload.source || "client",
      level: payload.level || "error",
      message: String(payload.message).slice(0, 4000),
      stack: payload.stack ? String(payload.stack).slice(0, 8000) : null,
      route: typeof window !== "undefined" ? window.location.pathname : null,
      context: payload.context || {},
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    /* swallow — never let logger crash the app */
  }
};

/**
 * Install global handlers for uncaught errors and unhandled promise rejections.
 * Idempotent.
 */
let installed = false;
export const installGlobalErrorHandlers = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    logError({
      message: e.message || "window.error",
      stack: e.error?.stack,
      context: { type: "window.error", filename: e.filename, lineno: e.lineno },
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    logError({
      message: typeof reason === "string" ? reason : reason?.message || "unhandledrejection",
      stack: reason?.stack,
      context: { type: "unhandledrejection" },
    });
  });
};
