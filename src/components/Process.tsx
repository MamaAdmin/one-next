import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const Process = () => {
  const steps = [
    {
      phase: "Kickoff",
      title: "Briefing",
      duration: "2 Stunden",
      description:
        "Erklären Sie Ihr Geschäft und teilen Sie Ihre Herausforderungen, um Einblicke in KI-Möglichkeiten und einen von unseren Experten entwickelten Ansatz zu erhalten.",
      color: "bg-primary",
    },
    {
      phase: "AI Design",
      title: "Sprint",
      duration: "2 Tage",
      description:
        "Identifizieren Sie ein hochrelevantes Geschäftsproblem und arbeiten Sie mit unseren Experten zusammen, um eine KI-Lösung vorzuschlagen.",
      color: "bg-secondary",
    },
    {
      phase: "Proof of AI",
      title: "Development",
      duration: "4 – 12 Wochen",
      description:
        "Entwickeln und implementieren Sie Ihre KI-Lösung mit unserem erfahrenen Team. Von der ersten Implementierung bis zur vollständigen Integration.",
      color: "bg-accent",
    },
    {
      phase: "Skalierung",
      title: "& Optimierung",
      duration: "Kontinuierlich",
      description:
        "Skalieren Sie Ihre KI-Lösung und optimieren Sie kontinuierlich die Performance. Wir unterstützen Sie bei MLOps und Wartung.",
      color: "bg-primary-glow",
    },
  ];

  return (
    <section id="process" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ein Entwicklungsprozess, der{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              KI-Ergebnisse
            </span>
            <br />
            in Wochen liefert, nicht Jahren
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <Card className="h-full hover:shadow-hover transition-all duration-300 border-border hover:border-primary/50">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                        {step.phase}
                      </div>
                      <h3 className="text-2xl font-bold mt-1">{step.title}</h3>
                    </div>

                    <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium">
                      {step.duration}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
