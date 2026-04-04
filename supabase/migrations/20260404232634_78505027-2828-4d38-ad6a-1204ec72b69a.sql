-- =============================================
-- FIX 1: Prevent privilege escalation on user_roles
-- Remove the INSERT policy that checks has_role (which could be bypassed)
-- and replace with a DENY-ALL policy for authenticated users.
-- Only the handle_new_user trigger (SECURITY DEFINER) can insert roles.
-- =============================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a restrictive INSERT policy that denies all direct inserts
-- The handle_new_user trigger uses SECURITY DEFINER and bypasses RLS
CREATE POLICY "No direct role inserts"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- =============================================
-- FIX 2: Restrict anonymous access to share_links
-- The old policy exposed ALL active share links to anonymous users.
-- Replace with a function-based approach that requires knowing the token.
-- =============================================

-- Drop the overly permissive anon SELECT policy
DROP POLICY IF EXISTS "Public can read active share links by token" ON public.share_links;

-- Create a security definer function to validate a share token
CREATE OR REPLACE FUNCTION public.get_shared_plan_id(_token text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan_id
  FROM public.share_links
  WHERE token = _token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;

-- Create a new restrictive anon policy that can never match via direct SELECT
-- (the app will use the get_shared_plan_id function instead)
CREATE POLICY "Anon cannot directly read share links"
ON public.share_links
FOR SELECT
TO anon
USING (false);