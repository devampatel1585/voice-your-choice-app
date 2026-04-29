-- Remove duplicate triggers on votes (keep only one)
DROP TRIGGER IF EXISTS votes_after_insert ON public.votes;
DROP TRIGGER IF EXISTS votes_increment_trigger ON public.votes;
-- Keep: after_vote_insert

-- Remove duplicate trigger on students (keep only one)
DROP TRIGGER IF EXISTS students_protect_has_voted ON public.students;
-- Keep: protect_has_voted