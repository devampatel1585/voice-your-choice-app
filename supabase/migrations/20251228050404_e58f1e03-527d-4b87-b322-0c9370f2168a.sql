-- Add RLS policies for admins to manage candidates

-- Admins can insert candidates
CREATE POLICY "Admins can insert candidates"
ON public.candidates FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update candidates
CREATE POLICY "Admins can update candidates"
ON public.candidates FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete candidates
CREATE POLICY "Admins can delete candidates"
ON public.candidates FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));