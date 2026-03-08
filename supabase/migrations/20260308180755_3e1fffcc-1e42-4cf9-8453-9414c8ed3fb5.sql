
-- Fix: Add WITH CHECK to UPDATE policies to prevent ownership reassignment

-- profiles: prevent changing user_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- bp_versions: prevent changing user_id
DROP POLICY IF EXISTS "Users can update own plan versions" ON public.bp_versions;
CREATE POLICY "Users can update own plan versions"
  ON public.bp_versions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
