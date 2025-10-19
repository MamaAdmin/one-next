import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProcessStep {
  title: string;
  time?: string;
  description: string;
}

interface ProcessStepsProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
}

export const ProcessSteps = ({ title, subtitle, steps }: ProcessStepsProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    {step.time && (
                      <Badge variant="secondary">{step.time}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
