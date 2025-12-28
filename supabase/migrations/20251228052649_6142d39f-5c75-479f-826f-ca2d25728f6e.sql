-- Add policy allowing admins to view all votes for auditing and result calculations
CREATE POLICY "Admins can view all votes for auditing"
ON public.votes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));