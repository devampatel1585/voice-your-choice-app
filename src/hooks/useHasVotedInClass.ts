import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProfile } from "./useStudentProfile";

export const useHasVotedInClass = (classId: string | null | undefined) => {
  const { profile } = useStudentProfile();
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!profile || !classId) {
      setHasVoted(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("votes")
      .select("id")
      .eq("student_id", profile.id)
      .eq("class_id", classId)
      .maybeSingle();
    setHasVoted(!!data);
    setLoading(false);
  }, [profile, classId]);

  useEffect(() => {
    check();
  }, [check]);

  return { hasVoted, loading, refresh: check };
};