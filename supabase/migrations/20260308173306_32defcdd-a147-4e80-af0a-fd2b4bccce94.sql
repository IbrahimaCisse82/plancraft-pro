
-- Fix bp_versions: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can create own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can update own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can delete own plan versions" ON public.bp_versions;

CREATE POLICY "Users can view own plan versions"
ON public.bp_versions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plan versions"
ON public.bp_versions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan versions"
ON public.bp_versions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plan versions"
ON public.bp_versions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles: drop restrictive DELETE and recreate as permissive
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix user_roles: drop restrictive admin policies and recreate as permissive
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
