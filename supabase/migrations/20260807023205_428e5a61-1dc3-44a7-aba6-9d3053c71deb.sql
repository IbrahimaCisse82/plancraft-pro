DELETE FROM public.bp_versions v WHERE NOT EXISTS (SELECT 1 FROM public.business_plans p WHERE p.id = v.plan_id);
DELETE FROM public.share_links s WHERE NOT EXISTS (SELECT 1 FROM public.business_plans p WHERE p.id = s.plan_id);
DELETE FROM public.share_views s WHERE NOT EXISTS (SELECT 1 FROM public.business_plans p WHERE p.id = s.plan_id);

ALTER TABLE public.bp_versions
  ADD CONSTRAINT bp_versions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.business_plans(id) ON DELETE CASCADE,
  ADD CONSTRAINT bp_versions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.share_links
  ADD CONSTRAINT share_links_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.business_plans(id) ON DELETE CASCADE,
  ADD CONSTRAINT share_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.share_views
  ADD CONSTRAINT share_views_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.business_plans(id) ON DELETE CASCADE;

ALTER TABLE public.clients
  ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_usage
  ADD CONSTRAINT ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.error_logs
  ADD CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;