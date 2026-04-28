
-- 1) Prevent users from changing has_voted via direct UPDATE
CREATE OR REPLACE FUNCTION public.prevent_has_voted_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if invoked by SECURITY DEFINER context flagged via session variable
  IF current_setting('app.allow_has_voted_update', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.has_voted IS DISTINCT FROM OLD.has_voted THEN
    RAISE EXCEPTION 'has_voted cannot be modified directly';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_has_voted ON public.students;
CREATE TRIGGER protect_has_voted
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.prevent_has_voted_update();

-- 2) Update vote insert trigger to also mark student as voted atomically
CREATE OR REPLACE FUNCTION public.increment_votes_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block double voting at the database level
  IF EXISTS (SELECT 1 FROM public.students WHERE id = NEW.student_id AND has_voted = true) THEN
    RAISE EXCEPTION 'Student has already voted';
  END IF;

  UPDATE public.candidates
  SET votes = votes + 1
  WHERE id = NEW.candidate_id;

  -- Mark student as voted (bypass protection trigger)
  PERFORM set_config('app.allow_has_voted_update', 'on', true);
  UPDATE public.students SET has_voted = true WHERE id = NEW.student_id;
  PERFORM set_config('app.allow_has_voted_update', 'off', true);

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on votes
DROP TRIGGER IF EXISTS votes_increment_trigger ON public.votes;
CREATE TRIGGER votes_increment_trigger
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.increment_votes_trigger();

-- 3) Add data integrity constraints on candidates
ALTER TABLE public.candidates
  ADD CONSTRAINT candidates_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT candidates_tagline_length CHECK (char_length(tagline) BETWEEN 1 AND 200),
  ADD CONSTRAINT candidates_manifesto_length CHECK (char_length(manifesto) BETWEEN 1 AND 5000),
  ADD CONSTRAINT candidates_avatar_url_format CHECK (avatar ~ '^https?://');
