import { useSprintBooking } from "@/hooks/useSprintBooking";
import { BookingStepIndicator } from "@/components/sprint/booking/BookingStepIndicator";
import { FeasibilityCheck } from "@/components/sprint/booking/FeasibilityCheck";
import { ResultRecommendation } from "@/components/sprint/booking/ResultRecommendation";
import { VideoSection } from "@/components/sprint/booking/VideoSection";
import { BookingForm } from "@/components/sprint/booking/BookingForm";
import { PaymentSection } from "@/components/sprint/booking/PaymentSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gradient-hero pt-20">
        {/* Breadcrumb - Integrated in Flow */}
        <BookingStepIndicator currentStep={state.currentStep} totalSteps={5} />

        {/* Content Area */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button - Subtle */}
            {state.currentStep > 1 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack} 
                disabled={isLoading}
                className="mb-6 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Zurück
              </Button>
            )}

            {/* Step Content */}
            {state.currentStep === 1 && (
              <FeasibilityCheck onSubmit={submitFeasibilityCheck} />
            )}

      {state.currentStep === 2 && state.sprintScore !== null && state.recommendedType && (
        <ResultRecommendation
          score={state.sprintScore}
          sprintType={state.recommendedType}
          gatesOk={state.gatesOk || false}
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

      {state.currentStep === 5 && state.showPaymentStep && state.recommendedType && (
        <PaymentSection
          onInitiatePayment={initiatePayment}
          isLoading={isLoading}
          sprintType={state.recommendedType}
        />
      )}

      {state.currentStep === 5 && !state.showPaymentStep && (
        <div className="max-w-2xl mx-auto text-center p-8 bg-card rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Buchung erfasst – Zahlung wird später angefordert
          </h2>
          <p className="text-muted-foreground mb-6">
            Wir melden uns innerhalb von 24h, um das weitere Vorgehen 
            (Pre-Sprint Setup oder Problem-Framing) zu besprechen.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Zur Startseite
          </Button>
        </div>
      )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default SprintBooking;
