import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlocked">[] = [
  {
    id: "first_phase",
    title: "Erste Phase",
    description: "Erste Phase abgeschlossen",
    icon: "🎯",
  },
  {
    id: "all_phases",
    title: "Alle Phasen",
    description: "Alle Phasen abgeschlossen",
    icon: "🏆",
  },
  {
    id: "artifact_10",
    title: "10 Artefakte",
    description: "10 Artefakte hochgeladen",
    icon: "📦",
  },
  {
    id: "streak_7",
    title: "7-Tage-Streak",
    description: "7 Tage in Folge aktiv",
    icon: "🔥",
  },
];

export const useUserAchievements = (participantId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!participantId) {
        setAchievements([]);
        setStreak(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load streak via RPC
        const { data: streakData, error: streakError } = await supabase.rpc(
          "calculate_streak",
          { p_participant_id: participantId }
        );

        if (streakError) {
          console.error("Error loading streak:", streakError);
        } else {
          setStreak(streakData || 0);
        }

        // Load achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from("lms_achievements")
          .select("achievement_type, unlocked_at")
          .eq("participant_id", participantId);

        if (achievementsError) {
          console.error("Error loading achievements:", achievementsError);
          throw achievementsError;
        }

        // Match with achievement definitions
        const unlockedMap = new Map(
          achievementsData?.map((a) => [a.achievement_type, a.unlocked_at]) || []
        );

        const mappedAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
          ...def,
          unlocked: unlockedMap.has(def.id),
          unlockedAt: unlockedMap.get(def.id),
        }));

        setAchievements(mappedAchievements);
      } catch (error) {
        console.error("Error loading achievements:", error);
        toast.error("Fehler beim Laden der Erfolge");
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [participantId]);

  return { achievements, streak, loading };
};
