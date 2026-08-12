GRANT SELECT ON public.business_plans TO anon;
GRANT INSERT ON public.share_views TO anon;
GRANT EXECUTE ON FUNCTION public.get_shared_plan_id(text) TO anon;