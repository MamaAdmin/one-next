import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vote {
  id: string;
  session_id: string;
  participant_id: string;
  target_id: string;
  vote_type: string;
  created_at: string;
}

interface VotingSession {
  id: string;
  module_id: string;
  enrollment_id: string;
  session_type: string;
  max_votes: number;
  status: string;
}

export const useVoting = (sessionId?: string, participantId?: string) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [session, setSession] = useState<VotingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadVotes = async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await (supabase as any)
        .from("lms_voting_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!sessionData) {
        console.warn("Voting session not found");
        return;
      }
      setSession(sessionData);

      const { data: votesData, error: votesError } = await (supabase as any)
        .from("lms_votes")
        .select("*")
        .eq("session_id", sessionId);

      if (votesError) throw votesError;
      setVotes(votesData || []);
    } catch (error) {
      console.error("Error loading votes:", error);
      toast({
        title: "Fehler",
        description: "Votes konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVotes();

    if (sessionId) {
      const channel = supabase
        .channel(`voting:${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "lms_votes",
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            loadVotes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [sessionId]);

  const castVote = async (targetId: string, voteType: string = "dot") => {
    if (!sessionId || !participantId) return;

    try {
      const myVotes = votes.filter((v) => v.participant_id === participantId);
      
      if (session && myVotes.length >= session.max_votes) {
        toast({
          title: "Limit erreicht",
          description: `Du hast bereits ${session.max_votes} Votes abgegeben`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await (supabase as any)
        .from("lms_votes")
        .insert([
          {
            session_id: sessionId,
            participant_id: participantId,
            target_id: targetId,
            vote_type: voteType,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Vote abgegeben",
        description: "Deine Stimme wurde gezählt",
      });
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast({
        title: "Fehler",
        description: error.message || "Vote konnte nicht abgegeben werden",
        variant: "destructive",
      });
    }
  };

  const removeVote = async (voteId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_votes")
        .delete()
        .eq("id", voteId);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing vote:", error);
      toast({
        title: "Fehler",
        description: "Vote konnte nicht entfernt werden",
        variant: "destructive",
      });
    }
  };

  const getVoteCount = (targetId: string) => {
    return votes.filter((v) => v.target_id === targetId).length;
  };

  const getMyVotes = () => {
    return votes.filter((v) => v.participant_id === participantId);
  };

  return {
    votes,
    session,
    loading,
    castVote,
    removeVote,
    getVoteCount,
    getMyVotes,
    reload: loadVotes,
  };
};
