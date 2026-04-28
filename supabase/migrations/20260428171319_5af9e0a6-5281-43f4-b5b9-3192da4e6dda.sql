-- Function to restart voting: admins only. Clears all votes, resets has_voted,
-- resets candidate vote counts, and reactivates the election with a new deadline.
CREATE OR REPLACE FUNCTION public.restart_voting(_new_deadline timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins may restart voting
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can restart voting';
  END IF;

  -- Clear all votes
  DELETE FROM public.votes;

  -- Reset candidate vote counts
  UPDATE public.candidates SET votes = 0;

  -- Reset has_voted flag on all students (bypass protect trigger)
  PERFORM set_config('app.allow_has_voted_update', 'on', true);
  UPDATE public.students SET has_voted = false WHERE has_voted = true;
  PERFORM set_config('app.allow_has_voted_update', 'off', true);

  -- Reactivate voting with new deadline
  UPDATE public.election_settings
  SET value = jsonb_build_object('deadline', _new_deadline, 'is_active', true),
      updated_at = now()
  WHERE key = 'voting_deadline';
END;
$$;

-- Enable realtime for election_settings so frontends update instantly
ALTER TABLE public.election_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_settings;