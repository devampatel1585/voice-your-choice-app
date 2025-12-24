import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  manifesto: string;
  qualifications: string[];
  votes: number;
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("name");

      if (!error && data) {
        setCandidates(data);
      }
      setLoading(false);
    };

    fetchCandidates();
  }, []);

  return { candidates, loading };
};

export const useCandidate = (id: string) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setCandidate(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  return { candidate, loading };
};
