-- Fix 1: Add RLS policies for user_roles table to prevent privilege escalation
-- Only admins can assign roles (INSERT)
CREATE POLICY "Only admins can assign roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles (UPDATE)
CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can revoke roles (DELETE)
CREATE POLICY "Only admins can revoke roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Create a trigger to automatically increment vote counts instead of RPC
-- This eliminates the attack surface by making vote counting automatic on INSERT

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.increment_votes_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.candidates
  SET votes = votes + 1
  WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$;

-- Create the trigger on the votes table
CREATE TRIGGER after_vote_insert
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.increment_votes_trigger();

-- Drop the old vulnerable RPC function since we're using a trigger now
DROP FUNCTION IF EXISTS public.increment_candidate_votes(uuid);