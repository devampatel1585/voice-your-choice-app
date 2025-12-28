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

    if (profile.has_voted) {
      toast.error("You have already voted");
      return false;
    }

    setVoting(true);

    try {
      // Insert vote
      const { error: voteError } = await supabase
        .from("votes")
        .insert({
          student_id: profile.id,
          candidate_id: candidateId,
        });

      if (voteError) {
        toast.error("Failed to cast vote. Please try again.");
        return false;
      }

      // Vote count is automatically incremented by database trigger

      // Mark student as voted
      const { error: updateError } = await supabase
        .from("students")
        .update({ has_voted: true })
        .eq("id", profile.id);

      if (updateError) {
        // Error logged silently - user already received success toast for vote
      }

      toast.success("Vote cast successfully!");
      return true;
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      return false;
    } finally {
      setVoting(false);
    }
  };

  return { castVote, voting, hasVoted: profile?.has_voted ?? false };
};
