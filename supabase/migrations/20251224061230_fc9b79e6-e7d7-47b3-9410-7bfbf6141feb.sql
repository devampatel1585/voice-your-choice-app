-- Create students table for authentication
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '3rd Year',
  has_voted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  avatar TEXT NOT NULL,
  manifesto TEXT NOT NULL,
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table to track individual votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Users can view their own student profile"
ON public.students FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student profile"
ON public.students FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile"
ON public.students FOR UPDATE
USING (auth.uid() = user_id);

-- Candidates policies (public read, no write from client)
CREATE POLICY "Anyone can view candidates"
ON public.candidates FOR SELECT
TO authenticated
USING (true);

-- Votes policies
CREATE POLICY "Users can view their own votes"
ON public.votes FOR SELECT
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own vote"
ON public.votes FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Function to increment candidate votes
CREATE OR REPLACE FUNCTION public.increment_candidate_votes(candidate_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.candidates
  SET votes = votes + 1
  WHERE id = candidate_uuid;
END;
$$;