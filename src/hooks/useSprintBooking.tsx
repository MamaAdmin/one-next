import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FeasibilityData {
  challenge: string;
  relevance: string;
  targetAudience: string[];
  consequences: string;
  successCriteria: string;
  testableIn5Days: "Ja" | "Teilweise" | "Nein";
  deciderAvailable: "Ja" | "Nein";
  userAccessCount: number;
  impactScale: number;
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
  gatesOk: boolean | null;
  showPaymentStep: boolean;
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
    gatesOk: null,
    showPaymentStep: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const calculateSprintSuitability = (answers: FeasibilityData): number => {
    let score = 0;

    // === DESIRABILITY (0-25) ===
    if (/\b(für|bei|weil|damit)\b/i.test(answers.challenge)) {
      score += 5;
    }
    if (/\b\d+|\b%|\bTage|\bWochen\b/i.test(answers.challenge)) {
      score += 5;
    }
    if (/[A-ZÄÖÜ][a-zäöüß]+/.test(answers.challenge)) {
      score += 5;
    }
    if (answers.targetAudience.length === 1) {
      score += 10;
    } else if (answers.targetAudience.length > 1) {
      score += 5;
    }

    // === VIABILITY (0-25) ===
    score += answers.impactScale * 4;
    if (answers.consequences.length > 100) {
      score += 5;
    } else if (answers.consequences.length > 30) {
      score += 3;
    }

    // === FEASIBILITY (0-25) ===
    if (answers.testableIn5Days === "Ja") {
      score += 25;
    } else if (answers.testableIn5Days === "Teilweise") {
      score += 15;
    } else {
      score += 5;
    }

    // === SPRINTABILITY (0-25) ===
    const keywords = [
      "Prototyp", "Test", "Nutzertest", "Entscheidung", 
      "Validierung", "Feedback", "Hypothese", "MVP", 
      "A/B", "Wizard", "Fake Door", "Smoke Test"
    ];
    const hasKeyword = keywords.some(kw =>
      answers.successCriteria.toLowerCase().includes(kw.toLowerCase())
    );
    score += hasKeyword ? 15 : 8;
    if (answers.deciderAvailable === "Ja") {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const calculateGatesOk = (answers: FeasibilityData): boolean => {
    return (
      answers.testableIn5Days !== "Nein" &&
      answers.deciderAvailable === "Ja" &&
      answers.userAccessCount >= 5
    );
  };

  const recommendSprintType = (score: number, relevance: string): string => {
    if (score >= 80) {
      return "Strategy Sprint";
    }
    if (score >= 60 && score <= 79) {
      if (["Kundenbedürfnisse", "Interne Probleme"].includes(relevance)) {
        return "Process Sprint";
      }
      return "Discovery Sprint";
    }
    if (score >= 40 && score <= 59) {
      return "Pre-Sprint (1 Woche Vorbereitung)";
    }
    return "Problem-Framing-Workshop";
  };

  const submitFeasibilityCheck = async (data: FeasibilityData) => {
    const score = calculateSprintSuitability(data);
    const gatesOk = calculateGatesOk(data);
    const type = recommendSprintType(score, data.relevance);
    const showPaymentStep = score >= 60 && gatesOk;

    setState((prev) => ({
      ...prev,
      feasibilityData: data,
      sprintScore: score,
      recommendedType: type,
      gatesOk,
      showPaymentStep,
      currentStep: 2,
    }));

    localStorage.setItem("sprint_booking_feasibility", JSON.stringify(data));
    localStorage.setItem("sprint_booking_score", score.toString());
    localStorage.setItem("sprint_booking_type", type);
    localStorage.setItem("sprint_booking_gates_ok", gatesOk.toString());
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
          testable_in_5_days: state.feasibilityData.testableIn5Days,
          decider_available: state.feasibilityData.deciderAvailable === "Ja",
          user_access_count: state.feasibilityData.userAccessCount,
          impact_scale: state.feasibilityData.impactScale,
          gates_ok: state.gatesOk,
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
