import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVotingDeadline = () => {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadline = async () => {
      const { data, error } = await supabase
        .from("election_settings")
        .select("value")
        .eq("key", "voting_deadline")
        .maybeSingle();

      if (!error && data && data.value) {
        const settings = data.value as unknown as { deadline: string; is_active: boolean };
        const deadlineDate = new Date(settings.deadline);
        setDeadline(deadlineDate);
        
        const now = new Date();
        setIsVotingOpen(settings.is_active && deadlineDate > now);
      }
      setLoading(false);
    };

    fetchDeadline();

    // Check every minute if voting is still open
    const interval = setInterval(() => {
      if (deadline) {
        const now = new Date();
        setIsVotingOpen(deadline > now);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  return { deadline, isVotingOpen, loading };
};
