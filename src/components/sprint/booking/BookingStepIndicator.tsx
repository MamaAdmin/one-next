import { Lock, CheckCircle2, Circle } from "lucide-react";
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
  const getStepStatus = (index: number): "locked" | "active" | "completed" => {
    const stepNumber = index + 1;
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "locked";
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3">
          {steps.slice(0, totalSteps).map((step, index) => {
            const status = getStepStatus(index);
            const stepNumber = index + 1;

            return (
              <div
                key={stepNumber}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                  status === "active" && "bg-primary/10 text-primary font-semibold",
                  status === "locked" && "text-muted-foreground opacity-60",
                  status === "completed" && "text-foreground"
                )}
              >
                {status === "locked" && <Lock className="h-3 w-3" />}
                {status === "completed" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                {status === "active" && <Circle className="h-3 w-3" />}
                
                <span className="text-sm">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
