
-- 1. Revoke EXECUTE from anon on sensitive RPCs
REVOKE EXECUTE ON FUNCTION public.consume_ai_credit(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_current_ai_usage() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_plan(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_shared_plan_id(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.consume_ai_credit(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_ai_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_plan_id(text) TO anon, authenticated;

-- 2. Revoke SELECT from anon on business tables (RLS also blocks, but defense-in-depth)
REVOKE SELECT ON public.ai_usage FROM anon;
REVOKE SELECT ON public.bp_versions FROM anon;
REVOKE SELECT ON public.clients FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.share_links FROM anon;
REVOKE SELECT ON public.share_views FROM anon;
REVOKE SELECT ON public.subscriptions FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
-- business_plans keeps anon SELECT because share_links policy needs it

-- 3. Tighten error_logs insert policy: keep open for anonymous error capture,
-- but add basic anti-abuse constraints (already length-bounded). Ensure only
-- authenticated users can attach a user_id to logs.
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Anyone can insert error logs"
  ON public.error_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(message) > 0
    AND length(message) <= 4000
    AND (stack IS NULL OR length(stack) <= 8000)
    AND (
      user_id IS NULL
      OR user_id = auth.uid()
    )
  );
