import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProfile } from "./useStudentProfile";
import { toast } from "sonner";

export const useVoting = () => {
  const { profile } = useStudentProfile();
  const [voting, setVoting] = useState(false);

  const castVote = async (candidateId: string): Promise<boolean> => {
    if (!profile) {
      toast.error("Please login to vote");
      return false;
    }

    setVoting(true);

    try {
      const { data: candidate, error: candErr } = await supabase
        .from("candidates")
        .select("class_id")
        .eq("id", candidateId)
        .maybeSingle();

      if (candErr || !candidate) {
        toast.error("Candidate not found");
        return false;
      }

      const { error: voteError } = await supabase.from("votes").insert({
        student_id: profile.id,
        candidate_id: candidateId,
        class_id: candidate.class_id,
      });

      if (voteError) {
        const msg = (voteError.message || "").toLowerCase();
        if (msg.includes("already voted") || msg.includes("duplicate")) {
          toast.error("You have already voted in this class");
        } else if (msg.includes("deadline")) {
          toast.error("Voting deadline has passed");
        } else if (msg.includes("not active")) {
          toast.error("Voting for this class is not active");
        } else {
          toast.error("Failed to cast vote. Please try again.");
        }
        return false;
      }

      toast.success("Vote cast successfully!");
      return true;
    } catch {
      toast.error("An error occurred. Please try again.");
      return false;
    } finally {
      setVoting(false);
    }
  };

  return { castVote, voting };
};