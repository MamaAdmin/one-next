import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const WorkshopFlowDiagram = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Welcher Workshop passt zu Ihnen?
          </h2>

          {/* Decision Tree */}
          <div className="space-y-8">
            {/* Question */}
            <Card className="p-8 bg-background border-2">
              <div className="flex items-center gap-4 justify-center">
                <HelpCircle className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold">
                  Ist Ihre Challenge klar definiert?
                </h3>
              </div>
            </Card>

            {/* Branches */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* NEIN Branch */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-destructive font-semibold">
                  <span className="text-xl">NEIN</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <Card className="p-6 border-2 border-secondary hover:shadow-lg transition-all">
                  <h4 className="text-xl font-bold mb-3">Problem-Framing-Workshop</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    1–2 Tage intensive Klärung
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Challenge schärfen</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Zielgruppe definieren</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Sprint-ready machen</span>
                    </li>
                  </ul>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-semibold text-center">
                      Dann weiter zum Design Sprint →
                    </p>
                  </div>
                  
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/problem-framing-workshop">
                      Workshop anfragen
                    </Link>
                  </Button>
                </Card>
              </div>

              {/* JA Branch */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <span className="text-xl">JA</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <Card className="p-6 border-2 border-primary hover:shadow-lg transition-all">
                  <h4 className="text-xl font-bold mb-3">Design Sprint Workshop</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    2–4 Tage intensiver Workshop
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Prototyp entwickeln</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Mit echten Nutzern testen</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>KI-Tools nutzen</span>
                    </li>
                  </ul>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-semibold text-center">
                      Direkt starten!
                    </p>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to="/design-sprint-workshop">
                      Workshop buchen
                    </Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
