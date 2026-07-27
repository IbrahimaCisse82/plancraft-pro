
-- Allow admins to reset AI usage counters for any user
CREATE POLICY "Admins can delete ai usage"
  ON public.ai_usage
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ai usage"
  ON public.ai_usage
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert a subscription row for a user that doesn't have one yet
CREATE POLICY "Admins can insert subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
