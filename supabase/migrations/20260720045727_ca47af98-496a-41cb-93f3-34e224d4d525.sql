
-- 1. Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Normalize tokens to uppercase, trimmed
CREATE OR REPLACE FUNCTION public.normalize_class_token()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.token := upper(btrim(NEW.token));
  IF NEW.token = '' THEN
    RAISE EXCEPTION 'Class token cannot be empty';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER classes_normalize_token
BEFORE INSERT OR UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.normalize_class_token();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;

CREATE TRIGGER classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert classes" ON public.classes
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update classes" ON public.classes
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete classes" ON public.classes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 2. Seed a legacy class to hold existing candidates/votes
DO $$
DECLARE
  legacy_id UUID;
  legacy_deadline TIMESTAMPTZ;
  legacy_active BOOLEAN;
  settings JSONB;
BEGIN
  SELECT value INTO settings FROM public.election_settings WHERE key = 'voting_deadline' LIMIT 1;
  IF settings IS NOT NULL THEN
    legacy_deadline := COALESCE((settings->>'deadline')::timestamptz, now() + INTERVAL '7 days');
    legacy_active := COALESCE((settings->>'is_active')::boolean, true);
  ELSE
    legacy_deadline := now() + INTERVAL '7 days';
    legacy_active := true;
  END IF;

  INSERT INTO public.classes (name, token, deadline, is_active)
  VALUES ('Legacy Election', 'LEGACY-2026', legacy_deadline, legacy_active)
  RETURNING id INTO legacy_id;

  -- 3. Add class_id to candidates, backfill, enforce NOT NULL
  ALTER TABLE public.candidates ADD COLUMN class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE;
  UPDATE public.candidates SET class_id = legacy_id WHERE class_id IS NULL;
  ALTER TABLE public.candidates ALTER COLUMN class_id SET NOT NULL;
  CREATE INDEX candidates_class_id_idx ON public.candidates(class_id);

  -- 4. Add class_id to votes, backfill
  ALTER TABLE public.votes ADD COLUMN class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE;
  UPDATE public.votes v SET class_id = legacy_id WHERE class_id IS NULL;
  ALTER TABLE public.votes ALTER COLUMN class_id SET NOT NULL;
  CREATE INDEX votes_class_id_idx ON public.votes(class_id);
END $$;

-- 5. Replace old unique (student_id) with (student_id, class_id)
-- Drop existing unique constraint on votes.student_id
DO $$
DECLARE con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.votes'::regclass AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.votes DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.votes ADD CONSTRAINT votes_student_class_unique UNIQUE (student_id, class_id);

-- 6. Rewrite increment_votes_trigger: per-class, don't touch has_voted
CREATE OR REPLACE FUNCTION public.increment_votes_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cls RECORD;
BEGIN
  -- Ensure class is active and deadline not passed
  SELECT is_active, deadline INTO cls FROM public.classes WHERE id = NEW.class_id;
  IF cls IS NULL THEN
    RAISE EXCEPTION 'Invalid class';
  END IF;
  IF NOT cls.is_active THEN
    RAISE EXCEPTION 'Voting for this class is not active';
  END IF;
  IF cls.deadline <= now() THEN
    RAISE EXCEPTION 'Voting deadline has passed';
  END IF;

  -- Ensure candidate belongs to the same class
  IF NOT EXISTS (
    SELECT 1 FROM public.candidates
    WHERE id = NEW.candidate_id AND class_id = NEW.class_id
  ) THEN
    RAISE EXCEPTION 'Candidate does not belong to this class';
  END IF;

  -- Ensure student hasn't already voted in this class
  IF EXISTS (
    SELECT 1 FROM public.votes
    WHERE student_id = NEW.student_id
      AND class_id = NEW.class_id
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Student has already voted in this class';
  END IF;

  UPDATE public.candidates
  SET votes = votes + 1
  WHERE id = NEW.candidate_id;

  RETURN NEW;
END;
$$;

-- 7. Rewrite restart_voting to be per-class
DROP FUNCTION IF EXISTS public.restart_voting(timestamptz);

CREATE OR REPLACE FUNCTION public.restart_voting(_class_id uuid, _new_deadline timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can restart voting';
  END IF;

  DELETE FROM public.votes WHERE class_id = _class_id;
  UPDATE public.candidates SET votes = 0 WHERE class_id = _class_id;

  UPDATE public.classes
  SET deadline = _new_deadline, is_active = true, updated_at = now()
  WHERE id = _class_id;
END;
$$;

REVOKE ALL ON FUNCTION public.restart_voting(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restart_voting(uuid, timestamptz) TO authenticated;

-- 8. Tighten votes INSERT policy to require valid class + candidate match
DROP POLICY IF EXISTS "Users can insert their own vote" ON public.votes;
CREATE POLICY "Users can insert their own vote" ON public.votes
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = votes.class_id AND c.is_active = true AND c.deadline > now()
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates ca
      WHERE ca.id = votes.candidate_id AND ca.class_id = votes.class_id
    )
  );

-- Enable realtime on classes
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
