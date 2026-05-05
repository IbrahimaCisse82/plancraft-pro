
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  source text NOT NULL DEFAULT 'client',
  level text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  route text,
  context jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON public.error_logs (level);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert error logs"
  ON public.error_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(message) > 0 AND length(message) <= 4000
    AND (stack IS NULL OR length(stack) <= 8000)
  );

CREATE POLICY "Admins can view error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete error logs"
  ON public.error_logs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
