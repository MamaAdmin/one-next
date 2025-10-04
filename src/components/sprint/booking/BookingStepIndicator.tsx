import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Machbarkeitscheck",
  "Empfehlung",
  "Video",
  "Buchung",
  "Zahlung",
];

export const BookingStepIndicator = ({
  currentStep,
  totalSteps,
}: BookingStepIndicatorProps) => {
  return (
    <div className="w-full bg-background border-b border-border py-12">
      <div className="container mx-auto px-6">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between min-w-max md:min-w-0 max-w-5xl mx-auto">
          {steps.slice(0, totalSteps).map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div key={stepNumber} className="flex items-center flex-1 min-w-[120px]">
                {/* Step Circle + Label */}
                <div className="flex flex-col items-center flex-1 gap-2">
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-foreground text-primary-foreground shadow-card",
                      isCurrent && "bg-gradient-primary text-primary-foreground shadow-hover scale-105 md:scale-110",
                      isUpcoming && "bg-background border-2 border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                    ) : (
                      <span className="text-xs font-bold">{stepNumber}</span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs text-center transition-all duration-300 max-w-[100px]",
                      isCurrent && "font-semibold text-foreground",
                      isCompleted && "text-muted-foreground",
                      isUpcoming && "text-muted-foreground opacity-60"
                    )}
                  >
                    {step}
                  </span>
                </div>

                {/* Connector Line */}
                {stepNumber < totalSteps && (
                  <div className="flex items-center flex-1 px-2 md:px-4">
                    <div
                      className={cn(
                        "h-[2px] w-full transition-all duration-500",
                        isCompleted ? "bg-foreground" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};
