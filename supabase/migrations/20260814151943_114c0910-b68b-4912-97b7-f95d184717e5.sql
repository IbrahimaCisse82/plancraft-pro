CREATE TABLE public.subscription_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscription_audit_log TO authenticated;
GRANT ALL ON public.subscription_audit_log TO service_role;

ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view subscription audit log"
ON public.subscription_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_sub_audit_created_at ON public.subscription_audit_log (created_at DESC);
CREATE INDEX idx_sub_audit_target ON public.subscription_audit_log (target_user_id);

CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_audit_log (actor_id, target_user_id, action, old_value, new_value)
    VALUES (auth.uid(), NEW.user_id, 'created',
      NULL,
      jsonb_build_object('plan', NEW.plan, 'status', NEW.status, 'current_period_end', NEW.current_period_end));
    RETURN NEW;
  END IF;

  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    INSERT INTO public.subscription_audit_log (actor_id, target_user_id, action, old_value, new_value)
    VALUES (auth.uid(), NEW.user_id, 'plan_changed',
      jsonb_build_object('plan', OLD.plan), jsonb_build_object('plan', NEW.plan));
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.subscription_audit_log (actor_id, target_user_id, action, old_value, new_value)
    VALUES (auth.uid(), NEW.user_id, 'status_changed',
      jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
  END IF;

  IF NEW.current_period_end IS DISTINCT FROM OLD.current_period_end THEN
    INSERT INTO public.subscription_audit_log (actor_id, target_user_id, action, old_value, new_value)
    VALUES (auth.uid(), NEW.user_id, 'period_changed',
      jsonb_build_object('current_period_end', OLD.current_period_end),
      jsonb_build_object('current_period_end', NEW.current_period_end));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.log_subscription_change();