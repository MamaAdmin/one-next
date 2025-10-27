import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuizAttempt {
  id: string;
  enrollment_id: string;
  quiz_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  answers: any;
  is_passed: boolean | null;
  attempt_number: number;
  time_spent_seconds: number | null;
}

export const useQuizAttempts = (enrollmentId?: string, quizId?: string) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAttempts = async () => {
    if (!enrollmentId || !quizId) {
      setAttempts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_quiz_attempts")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("quiz_id", quizId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
      
      // Find incomplete attempt
      const incomplete = data?.find(a => !a.completed_at);
      setCurrentAttempt(incomplete || null);
    } catch (error) {
      console.error("Error loading quiz attempts:", error);
      toast.error("Fehler beim Laden der Versuche");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [enrollmentId, quizId]);

  const startAttempt = async (quizId: string, enrollmentId: string) => {
    try {
      const attemptNumber = attempts.length + 1;
      
      const { data, error } = await supabase
        .from("lms_quiz_attempts")
        .insert([
          {
            quiz_id: quizId,
            enrollment_id: enrollmentId,
            attempt_number: attemptNumber,
            answers: {},
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentAttempt(data);
      await loadAttempts();
      return data;
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      toast.error("Fehler beim Starten des Quiz");
      throw error;
    }
  };

  const saveAnswer = async (attemptId: string, questionId: string, answer: string) => {
    try {
      const attempt = currentAttempt || attempts.find(a => a.id === attemptId);
      if (!attempt) throw new Error("Attempt not found");

      const updatedAnswers = {
        ...attempt.answers,
        [questionId]: answer,
      };

      const { error } = await supabase
        .from("lms_quiz_attempts")
        .update({ answers: updatedAnswers })
        .eq("id", attemptId);

      if (error) throw error;

      if (currentAttempt?.id === attemptId) {
        setCurrentAttempt({ ...currentAttempt, answers: updatedAnswers });
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Fehler beim Speichern der Antwort");
      throw error;
    }
  };

  const submitAttempt = async (
    attemptId: string,
    score: number,
    isPassed: boolean,
    timeSpentSeconds: number
  ) => {
    try {
      const { error } = await supabase
        .from("lms_quiz_attempts")
        .update({
          completed_at: new Date().toISOString(),
          score,
          is_passed: isPassed,
          time_spent_seconds: timeSpentSeconds,
        })
        .eq("id", attemptId);

      if (error) throw error;

      toast.success(isPassed ? "Quiz bestanden!" : "Quiz nicht bestanden");
      setCurrentAttempt(null);
      await loadAttempts();
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      toast.error("Fehler beim Abschicken des Quiz");
      throw error;
    }
  };

  const getBestAttempt = (): QuizAttempt | null => {
    const completedAttempts = attempts.filter(a => a.completed_at && a.score !== null);
    if (completedAttempts.length === 0) return null;

    return completedAttempts.reduce((best, current) => 
      (current.score || 0) > (best.score || 0) ? current : best
    );
  };

  const canRetake = (maxAttempts: number): boolean => {
    return attempts.length < maxAttempts;
  };

  return {
    attempts,
    currentAttempt,
    loading,
    startAttempt,
    saveAnswer,
    submitAttempt,
    getBestAttempt,
    canRetake,
    reload: loadAttempts,
  };
};
