import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: any;
  points: number;
  explanation: string | null;
  sort_order: number;
}

export const useQuizzes = (moduleId?: string) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = async () => {
    if (!moduleId) {
      setQuizzes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_quizzes")
        .select("*")
        .eq("module_id", moduleId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.error("Fehler beim Laden der Quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [moduleId]);

  const createQuiz = async (quizData: Omit<Quiz, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("lms_quizzes")
        .insert([quizData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Quiz erstellt");
      await loadQuizzes();
      return data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Fehler beim Erstellen des Quiz");
      throw error;
    }
  };

  const updateQuiz = async (id: string, updates: Partial<Quiz>) => {
    try {
      const { error } = await supabase
        .from("lms_quizzes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast.success("Quiz aktualisiert");
      await loadQuizzes();
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error("Fehler beim Aktualisieren des Quiz");
      throw error;
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lms_quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Quiz gelöscht");
      await loadQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Fehler beim Löschen des Quiz");
      throw error;
    }
  };

  // Question management
  const loadQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from("lms_quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Fehler beim Laden der Fragen");
      return [];
    }
  };

  const createQuestion = async (questionData: Omit<QuizQuestion, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("lms_quiz_questions")
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Frage hinzugefügt");
      return data;
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Fehler beim Erstellen der Frage");
      throw error;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<QuizQuestion>) => {
    try {
      const { error } = await supabase
        .from("lms_quiz_questions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast.success("Frage aktualisiert");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Fehler beim Aktualisieren der Frage");
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lms_quiz_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Frage gelöscht");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Fehler beim Löschen der Frage");
      throw error;
    }
  };

  return {
    quizzes,
    loading,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reload: loadQuizzes,
  };
};
