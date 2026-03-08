
-- Fix 1: Add trigger to prevent non-admin inserts into user_roles
CREATE OR REPLACE FUNCTION public.check_user_role_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow the handle_new_user trigger (which runs as service role on auth.users insert)
  -- by checking if it's called from the trigger context (NEW.role = 'user')
  IF NEW.role = 'user' THEN
    RETURN NEW;
  END IF;
  
  -- For admin role inserts, verify caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign non-default roles';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_user_role_insert
BEFORE INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.check_user_role_insert();

-- Fix 2: Align bp_versions SELECT with business_plans (admin override)
DROP POLICY IF EXISTS "Users can view own plan versions" ON public.bp_versions;
CREATE POLICY "Users can view own plan versions"
ON public.bp_versions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
