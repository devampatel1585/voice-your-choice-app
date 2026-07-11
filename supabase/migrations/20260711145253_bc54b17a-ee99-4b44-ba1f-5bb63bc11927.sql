
-- Trigger functions should never be callable directly by API roles
REVOKE ALL ON FUNCTION public.increment_votes_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_has_voted_update() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies; only signed-in users need to call it
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- restart_voting is admin-only (self-checks role); block anonymous callers entirely
REVOKE ALL ON FUNCTION public.restart_voting(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restart_voting(timestamptz) TO authenticated;
