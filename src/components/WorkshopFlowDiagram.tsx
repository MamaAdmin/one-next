import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const WorkshopFlowDiagram = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-sm font-bold uppercase text-primary">Orientierung</p>
          <h2 className="mb-12 text-center font-workshop-heading text-3xl font-bold md:text-4xl">
            Welcher Workshop passt zu Ihnen?
          </h2>

          <div className="space-y-10">
            <div className="border-y border-border bg-muted/35 p-7 md:p-9">
              <div className="flex items-center gap-4 justify-center">
                <HelpCircle className="w-8 h-8 text-primary" />
                <h3 className="font-workshop-heading text-xl font-bold md:text-2xl">
                  Ist Ihre Challenge klar definiert?
                </h3>
              </div>
            </div>

            <div className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-2">
              <div className="p-7 md:p-9">
                <div className="mb-5 flex items-center gap-2 font-semibold text-primary">
                  <span className="text-xl">NEIN</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                  <h4 className="mb-3 font-workshop-heading text-xl font-bold">Problem-Framing-Workshop</h4>
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

                  <div className="mb-4 border-t border-border pt-4">
                    <p className="text-sm font-semibold">
                      Dann weiter zum Design Sprint →
                    </p>
                  </div>
                  
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/problem-framing-workshop">
                      Workshop anfragen
                    </Link>
                  </Button>
              </div>

              <div className="border-t border-border bg-background p-7 md:border-l md:border-t-0 md:p-9">
                <div className="mb-5 flex items-center gap-2 font-semibold text-primary">
                  <span className="text-xl">JA</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                  <h4 className="mb-3 font-workshop-heading text-xl font-bold">KI-unterstützter Design Sprint</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    1–4 Tage modularer Workshop
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

                  <div className="mb-4 border-t border-border pt-4">
                    <p className="text-sm font-semibold">
                      Direkt starten!
                    </p>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to="/design-sprint-workshop">
                      Workshop buchen
                    </Link>
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
