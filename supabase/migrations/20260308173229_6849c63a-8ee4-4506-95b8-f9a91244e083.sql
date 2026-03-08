
-- Fix 1: Add DELETE policy on user_roles for admins only
CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Add explicit UPDATE policy on bp_versions
CREATE POLICY "Users can update own plan versions"
ON public.bp_versions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Fix 3: Add DELETE policy on profiles for own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);
