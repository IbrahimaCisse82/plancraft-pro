
-- Table for public share links
CREATE TABLE public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT NULL
);

-- RLS
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Owner can manage their share links
CREATE POLICY "Users can view own share links"
  ON public.share_links FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own share links"
  ON public.share_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own share links"
  ON public.share_links FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own share links"
  ON public.share_links FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Public read: anyone with token can read via anon
CREATE POLICY "Public can read active share links by token"
  ON public.share_links FOR SELECT TO anon
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Allow anon to read shared business plans
CREATE POLICY "Public can view shared plans"
  ON public.business_plans FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.share_links
      WHERE share_links.plan_id = business_plans.id
        AND share_links.is_active = true
        AND (share_links.expires_at IS NULL OR share_links.expires_at > now())
    )
  );
