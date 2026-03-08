
CREATE TABLE public.bp_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bp_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan versions"
ON public.bp_versions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plan versions"
ON public.bp_versions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plan versions"
ON public.bp_versions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_bp_versions_plan_id ON public.bp_versions(plan_id);
