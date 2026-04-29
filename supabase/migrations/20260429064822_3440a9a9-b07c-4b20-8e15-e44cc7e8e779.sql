-- Attach the increment_votes_trigger function to the votes table
DROP TRIGGER IF EXISTS votes_after_insert ON public.votes;
CREATE TRIGGER votes_after_insert
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.increment_votes_trigger();

-- Attach the protect-has_voted trigger to students
DROP TRIGGER IF EXISTS students_protect_has_voted ON public.students;
CREATE TRIGGER students_protect_has_voted
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.prevent_has_voted_update();