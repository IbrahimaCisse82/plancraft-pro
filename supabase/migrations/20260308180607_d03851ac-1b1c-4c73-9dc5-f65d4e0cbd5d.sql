
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- ═══════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- TABLE: business_plans
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can create own plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.business_plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.business_plans;

CREATE POLICY "Users can view own plans"
  ON public.business_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own plans"
  ON public.business_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.business_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own plans"
  ON public.business_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════
-- TABLE: bp_versions
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can create own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can update own plan versions" ON public.bp_versions;
DROP POLICY IF EXISTS "Users can delete own plan versions" ON public.bp_versions;

CREATE POLICY "Users can view own plan versions"
  ON public.bp_versions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own plan versions"
  ON public.bp_versions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan versions"
  ON public.bp_versions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plan versions"
  ON public.bp_versions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- TABLE: user_roles
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

-- Users can see their own role, admins can see all
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert roles (trigger handle_new_user uses SECURITY DEFINER to bypass RLS for new users)
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
