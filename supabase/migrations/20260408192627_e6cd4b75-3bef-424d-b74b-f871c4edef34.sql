
-- Table to track shared plan views
CREATE TABLE public.share_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL,
  token TEXT NOT NULL,
  viewer_ip TEXT,
  viewer_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_views ENABLE ROW LEVEL SECURITY;

-- Plan owners can view their share_views
CREATE POLICY "Plan owners can view share analytics"
ON public.share_views
FOR SELECT
TO authenticated
USING (
  plan_id IN (
    SELECT id FROM public.business_plans WHERE user_id = auth.uid()
  )
);

-- Anyone can insert (anonymous viewers)
CREATE POLICY "Anyone can log a view"
ON public.share_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Index for querying by plan
CREATE INDEX idx_share_views_plan_id ON public.share_views (plan_id);
CREATE INDEX idx_share_views_created_at ON public.share_views (created_at);
