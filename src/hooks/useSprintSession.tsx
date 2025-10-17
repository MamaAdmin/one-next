import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type DbSprintSession = Database["public"]["Tables"]["design_sprint_sessions"]["Row"];

interface SprintSession {
  id: string;
  session_token: string;
  team_name: string;
  current_phase: number;
  completion_percentage: number;
  last_active_phase: number;
  streak_days: number;
  achievements: Array<{ id: string; title: string; icon: string }>;
  task_completion: Record<string, boolean>;
  challenge_data: Record<string, any>;
}

const convertDbToSession = (data: DbSprintSession): SprintSession => {
  return {
    id: data.id,
    session_token: data.session_token,
    team_name: data.team_name,
    current_phase: data.current_phase,
    completion_percentage: data.completion_percentage,
    last_active_phase: data.last_active_phase,
    streak_days: data.streak_days,
    achievements: (data.achievements as any) || [],
    task_completion: (data.task_completion as any) || {},
    challenge_data: (data.challenge_data as any) || {},
  };
};

export const useSprintSession = (sessionToken?: string) => {
  const [session, setSession] = useState<SprintSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load or create session
  useEffect(() => {
    const initSession = async () => {
      try {
        const token = sessionToken || localStorage.getItem("sprint_session_token");

        if (token) {
          // Load existing session
          const { data, error } = await supabase
            .from("design_sprint_sessions")
            .select("*")
            .eq("session_token", token)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            setSession(convertDbToSession(data));
          } else {
            // Session not found, create new
            await createNewSession();
          }
        } else {
          // No token, create new session
          await createNewSession();
        }
      } catch (error) {
        console.error("Error loading session:", error);
        toast({
          title: "Fehler",
          description: "Session konnte nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [sessionToken]);

  const createNewSession = async (teamName: string = "Mein Team") => {
    try {
      const newToken = `sprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("design_sprint_sessions")
        .insert({
          session_token: newToken,
          team_name: teamName,
          user_id: user?.id || null,
          current_phase: 1,
          completion_percentage: 0,
          last_active_phase: 1,
          streak_days: 0,
          achievements: [],
          task_completion: {},
          challenge_data: {},
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem("sprint_session_token", newToken);
      setSession(convertDbToSession(data));

      toast({
        title: "Sprint gestartet",
        description: "Deine Session wurde erstellt",
      });

      return convertDbToSession(data);
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Fehler",
        description: "Session konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const updateSession = async (updates: Partial<SprintSession>) => {
    if (!session) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("design_sprint_sessions")
        .update(updates)
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      setSession(convertDbToSession(data));
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Fehler",
        description: "Änderungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateChallengeData = async (key: string, value: any) => {
    if (!session) return;

    const updatedData = {
      ...session.challenge_data,
      [key]: value,
    };

    await updateSession({ challenge_data: updatedData });
  };

  const toggleTask = async (taskId: string) => {
    if (!session) return;

    const updatedTasks = {
      ...session.task_completion,
      [taskId]: !session.task_completion[taskId],
    };

    // Recalculate completion percentage
    const totalTasks = Object.keys(updatedTasks).length;
    const completedTasks = Object.values(updatedTasks).filter(Boolean).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await updateSession({
      task_completion: updatedTasks,
      completion_percentage: percentage,
    });
  };

  const advanceToPhase = async (phase: number) => {
    if (!session) return;

    // Check if advancing to next phase (streak logic)
    const isNextPhase = phase === session.current_phase + 1;
    const streakIncrement = isNextPhase ? 1 : 0;

    await updateSession({
      current_phase: phase,
      last_active_phase: phase,
      streak_days: session.streak_days + streakIncrement,
    });
  };

  const unlockAchievement = async (achievement: { id: string; title: string; icon: string }) => {
    if (!session) return;

    const existingAchievements = session.achievements || [];
    if (existingAchievements.some((a) => a.id === achievement.id)) return;

    await updateSession({
      achievements: [...existingAchievements, achievement],
    });

    toast({
      title: "Erfolg freigeschaltet! 🎉",
      description: achievement.title,
    });
  };

  return {
    session,
    loading,
    saving,
    createNewSession,
    updateSession,
    updateChallengeData,
    toggleTask,
    advanceToPhase,
    unlockAchievement,
  };
};
