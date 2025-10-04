import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FeasibilityData {
  challenge: string;
  relevance: string;
  targetAudience: string[];
  consequences: string;
  successCriteria: string;
}

export interface BookingData {
  name: string;
  email: string;
  company?: string;
  teamSize: number;
  preferredStartDate?: Date;
  notes?: string;
}

export interface BookingState {
  currentStep: number;
  feasibilityData: FeasibilityData | null;
  sprintScore: number | null;
  recommendedType: string | null;
  bookingData: BookingData | null;
  bookingId: string | null;
  sessionToken: string | null;
}

export const useSprintBooking = () => {
  const [state, setState] = useState<BookingState>({
    currentStep: 1,
    feasibilityData: null,
    sprintScore: null,
    recommendedType: null,
    bookingData: null,
    bookingId: null,
    sessionToken: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const calculateSprintSuitability = (answers: FeasibilityData): number => {
    let score = 0;

    // Challenge clarity (0-25 points)
    if (answers.challenge.length > 100) score += 25;
    else if (answers.challenge.length > 50) score += 15;

    // Urgency (0-25 points)
    if (["Marktveränderungen", "Wettbewerb"].includes(answers.relevance)) {
      score += 25;
    } else {
      score += 15;
    }

    // Complexity - multiple target audiences (0-20 points)
    score += Math.min(answers.targetAudience.length * 10, 20);

    // Clear consequences (0-20 points)
    if (answers.consequences.length > 100) score += 20;
    else if (answers.consequences.length > 30) score += 10;

    // Measurable success criteria (0-20 points)
    const keywords = ["Prototyp", "Test", "Entscheidung", "Validierung", "Feedback"];
    const hasKeyword = keywords.some((kw) =>
      answers.successCriteria.toLowerCase().includes(kw.toLowerCase())
    );
    if (hasKeyword) score += 20;
    else score += 10;

    return Math.min(score, 100);
  };

  const recommendSprintType = (score: number): string => {
    if (score >= 75) return "Strategy Sprint";
    if (score >= 50) return "Discovery Sprint";
    return "Process Sprint";
  };

  const submitFeasibilityCheck = async (data: FeasibilityData) => {
    const score = calculateSprintSuitability(data);
    const type = recommendSprintType(score);

    setState((prev) => ({
      ...prev,
      feasibilityData: data,
      sprintScore: score,
      recommendedType: type,
      currentStep: 2,
    }));

    // Save to localStorage
    localStorage.setItem("sprint_booking_feasibility", JSON.stringify(data));
    localStorage.setItem("sprint_booking_score", score.toString());
    localStorage.setItem("sprint_booking_type", type);
  };

  const saveBooking = async (data: BookingData) => {
    setIsLoading(true);
    try {
      if (!state.feasibilityData || !state.sprintScore || !state.recommendedType) {
        throw new Error("Machbarkeitscheck fehlt");
      }

      const { data: booking, error } = await supabase
        .from("sprint_bookings")
        .insert({
          name: data.name,
          email: data.email,
          company: data.company,
          team_size: data.teamSize,
          preferred_start_date: data.preferredStartDate?.toISOString().split("T")[0],
          notes: data.notes,
          challenge_description: state.feasibilityData.challenge,
          relevance_reason: state.feasibilityData.relevance,
          target_audience: state.feasibilityData.targetAudience,
          consequences: state.feasibilityData.consequences,
          success_criteria: state.feasibilityData.successCriteria,
          sprint_suitability_score: state.sprintScore,
          recommended_sprint_type: state.recommendedType,
        })
        .select()
        .single();

      if (error) throw error;

      // Send to N8N
      await supabase.functions.invoke("send-booking-to-n8n", {
        body: { bookingId: booking.id },
      });

      // Send booking received email
      await supabase.functions.invoke("send-booking-email", {
        body: {
          to: data.email,
          type: "booking_received",
          data: {
            name: data.name,
            sprintType: state.recommendedType,
          },
        },
      });

      setState((prev) => ({
        ...prev,
        bookingData: data,
        bookingId: booking.id,
        currentStep: 5,
      }));

      toast({
        title: "Buchung erfolgreich erstellt",
        description: "Bitte schließen Sie die Zahlung ab.",
      });

      return booking.id;
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Fehler",
        description: "Buchung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = async () => {
    setIsLoading(true);
    try {
      if (!state.bookingId) {
        throw new Error("Buchung nicht gefunden");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: { bookingId: state.bookingId },
        }
      );

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Fehler",
        description: "Zahlung konnte nicht gestartet werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  return {
    state,
    isLoading,
    submitFeasibilityCheck,
    saveBooking,
    initiatePayment,
    goToStep,
  };
};
