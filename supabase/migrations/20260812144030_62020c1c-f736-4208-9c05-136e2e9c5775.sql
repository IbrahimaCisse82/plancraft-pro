CREATE OR REPLACE FUNCTION public.plan_is_shared(_plan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.plan_id = _plan_id
      AND sl.is_active = true
      AND (sl.expires_at IS NULL OR sl.expires_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.plan_is_shared(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plan_is_shared(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view shared plans" ON public.business_plans;
CREATE POLICY "Public can view shared plans"
ON public.business_plans
FOR SELECT
TO anon
USING (public.plan_is_shared(id));