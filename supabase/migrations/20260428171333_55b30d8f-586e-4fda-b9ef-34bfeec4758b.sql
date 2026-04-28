REVOKE EXECUTE ON FUNCTION public.restart_voting(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restart_voting(timestamptz) TO authenticated;