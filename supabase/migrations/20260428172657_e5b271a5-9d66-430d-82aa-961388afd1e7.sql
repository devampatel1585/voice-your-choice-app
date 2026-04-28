-- Add election_name setting and reset existing election data

-- 1. Insert election name setting (default value)
INSERT INTO public.election_settings (key, value)
VALUES ('election_name', '{"name": "B.Tech 3rd Year Election"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Reset all election data
DELETE FROM public.votes;
DELETE FROM public.candidates;

-- Reset has_voted for all students (bypass protect trigger)
SELECT set_config('app.allow_has_voted_update', 'on', true);
UPDATE public.students SET has_voted = false WHERE has_voted = true;
SELECT set_config('app.allow_has_voted_update', 'off', true);

-- 3. Add unique constraint on key column if not present (safe-guard for upserts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'election_settings_key_key'
  ) THEN
    ALTER TABLE public.election_settings ADD CONSTRAINT election_settings_key_key UNIQUE (key);
  END IF;
END $$;