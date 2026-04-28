import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVotingDeadline = () => {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentDeadline: Date | null = null;
    let currentActive = true;

    const recompute = () => {
      if (!currentDeadline) {
        setIsVotingOpen(currentActive);
        return;
      }
      setIsVotingOpen(currentActive && currentDeadline > new Date());
    };

    const fetchDeadline = async () => {
      const { data, error } = await supabase
        .from("election_settings")
        .select("value")
        .eq("key", "voting_deadline")
        .maybeSingle();

      if (!error && data && data.value) {
        const settings = data.value as unknown as { deadline: string; is_active: boolean };
        const deadlineDate = new Date(settings.deadline);
        currentDeadline = deadlineDate;
        currentActive = settings.is_active;
        setDeadline(deadlineDate);
        recompute();
      }
      setLoading(false);
    };

    fetchDeadline();

    // Re-check every 30s if deadline has passed
    const interval = setInterval(recompute, 30000);

    // Subscribe to realtime changes so admin updates reflect instantly
    const channel = supabase
      .channel("election_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "election_settings" },
        () => {
          fetchDeadline();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { deadline, isVotingOpen, loading };
};
