import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await userClient.auth.getUser(authHeader.slice(7));
    if (uErr || !user) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const admin = createClient(url, service);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const target = String(body.user_id ?? "");

    const log = (act: string, details: Record<string, unknown> = {}) =>
      admin.from("admin_audit_log").insert({ actor_id: user.id, action: act, target_type: "user", target_id: target, details });

    if (action === "list") {
      const all: unknown[] = [];
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) return json({ error: error.message }, 500);
        all.push(...data.users.map((u) => ({
          id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
          banned_until: (u as { banned_until?: string }).banned_until ?? null,
          factors: (u.factors ?? []).filter((f) => f.status === "verified").length,
        })));
        if (data.users.length < 1000) break;
      }
      return json({ users: all });
    }

    if (!UUID.test(target)) return json({ error: "invalid user_id" }, 400);
    if (target === user.id) return json({ error: "self_action_forbidden" }, 400);

    if (action === "ban" || action === "unban") {
      const { error } = await admin.auth.admin.updateUserById(target, { ban_duration: action === "ban" ? "876000h" : "none" });
      if (error) return json({ error: error.message }, 500);
      await log(action === "ban" ? "suspend_user" : "reactivate_user");
      return json({ ok: true });
    }

    if (action === "delete") {
      const { data: t } = await admin.auth.admin.getUserById(target);
      const { error } = await admin.auth.admin.deleteUser(target);
      if (error) return json({ error: error.message }, 500);
      await log("delete_user", { email: t?.user?.email ?? null });
      return json({ ok: true });
    }

    if (action === "set_role") {
      const role = body.role === "admin" ? "admin" : "user";
      // Uses admin's own session so the role trigger/RLS validate the caller; audit trigger logs it.
      const { error } = await userClient.from("user_roles").update({ role }).eq("user_id", target);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "reset_password") {
      const { data: t } = await admin.auth.admin.getUserById(target);
      const email = t?.user?.email;
      if (!email) return json({ error: "no_email" }, 400);
      const origin = typeof body.origin === "string" && /^https?:\/\//.test(body.origin) ? body.origin : "";
      const { error } = await createClient(url, anon).auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
      if (error) return json({ error: error.message }, 500);
      await log("send_password_reset", { email });
      return json({ ok: true });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 500);
  }
});
