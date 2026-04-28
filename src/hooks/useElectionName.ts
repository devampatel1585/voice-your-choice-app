import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_NAME = "Student Election";

export const useElectionName = () => {
  const [electionName, setElectionName] = useState<string>(DEFAULT_NAME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      const { data, error } = await supabase
        .from("election_settings")
        .select("value")
        .eq("key", "election_name")
        .maybeSingle();
      if (!error && data?.value) {
        const v = data.value as unknown as { name?: string };
        if (v?.name) setElectionName(v.name);
      }
      setLoading(false);
    };

    fetchName();

    const channel = supabase
      .channel("election_name_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "election_settings" },
        () => fetchName()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { electionName, loading };
};