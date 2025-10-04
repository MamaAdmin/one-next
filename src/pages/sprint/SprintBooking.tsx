import { useSprintBooking } from "@/hooks/useSprintBooking";
import { BookingStepIndicator } from "@/components/sprint/booking/BookingStepIndicator";
import { FeasibilityCheck } from "@/components/sprint/booking/FeasibilityCheck";
import { ResultRecommendation } from "@/components/sprint/booking/ResultRecommendation";
import { VideoSection } from "@/components/sprint/booking/VideoSection";
import { BookingForm } from "@/components/sprint/booking/BookingForm";
import { PaymentSection } from "@/components/sprint/booking/PaymentSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SprintBooking = () => {
  const {
    state,
    isLoading,
    submitFeasibilityCheck,
    saveBooking,
    initiatePayment,
    goToStep,
  } = useSprintBooking();

  const handleBack = () => {
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background">
        <BookingStepIndicator currentStep={state.currentStep} totalSteps={5} />
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {state.currentStep > 1 && (
            <div className="mb-4">
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </div>
          )}

          {state.currentStep === 1 && (
            <FeasibilityCheck onSubmit={submitFeasibilityCheck} />
          )}

          {state.currentStep === 2 && state.sprintScore !== null && state.recommendedType && (
            <ResultRecommendation
              score={state.sprintScore}
              sprintType={state.recommendedType}
              onContinue={() => goToStep(3)}
              onViewVideo={() => goToStep(3)}
            />
          )}

          {state.currentStep === 3 && (
            <VideoSection onContinue={() => goToStep(4)} />
          )}

          {state.currentStep === 4 && state.recommendedType && (
            <BookingForm
              onSubmit={async (data) => {
                await saveBooking(data);
              }}
              sprintType={state.recommendedType}
              isLoading={isLoading}
            />
          )}

          {state.currentStep === 5 && state.recommendedType && (
            <PaymentSection
              onInitiatePayment={initiatePayment}
              isLoading={isLoading}
              sprintType={state.recommendedType}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintBooking;
