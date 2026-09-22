import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Target, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
export const WorkshopComparisonSection = () => {
  return <section className="border-y border-border bg-muted/35 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-bold uppercase text-primary">Die richtige Fortsetzung</p>
          <h2 className="font-workshop-heading text-3xl md:text-4xl font-bold mb-4">
            Ihr Weg zum erfolgreichen Design Sprint
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ist Ihre Challenge klar definiert? Wählen Sie den passenden Workshop für Ihren Bedarf.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-border bg-card md:grid-cols-2">
          <article className="p-7 md:p-9">
              <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
                <Target className="w-4 h-4" />
                Startpunkt
              </span>
              <h3 className="font-workshop-heading text-2xl font-bold mb-4">
                Problem-Framing-Workshop
              </h3>
              
              <p className="text-lg font-semibold text-primary mb-4">
                Wenn Ihre Challenge noch unklar ist
              </p>
              
              <div className="space-y-3 mb-6">{["1–2 Tage intensive Klärung", "Challenge präzise definieren", "Zielgruppe und Business Value priorisieren", "Sprint-ready machen"].map((item) => <p key={item} className="flex items-start gap-3 text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{item}</p>)}</div>
              
              <p className="text-sm font-semibold mb-4">Preis auf Anfrage</p>
              
              <div className="border-l-2 border-primary bg-muted/50 p-4 mb-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Ein klares Sprint-Briefing für den Design Sprint
                </p>
              </div>
              
              <div className="space-y-3">
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/problem-framing-workshop">
                    Workshop Details ansehen
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/workshop-registration?type=problem-framing">
                    Workshop anfragen
                  </Link>
                </Button>
              </div>
          </article>

          <article className="border-t border-border bg-background p-7 md:border-l md:border-t-0 md:p-9">
              <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Rocket className="w-4 h-4" />
                Nächster Schritt
              </span>
              <h3 className="font-workshop-heading text-2xl font-bold mb-4">
                Design Sprint Workshop
              </h3>
              
              <p className="text-lg font-semibold text-primary mb-4">
                Wenn die Challenge klar ist
              </p>
              
              <div className="space-y-3 mb-6">{["2–4 Tage intensiver Workshop", "Vor Ort oder remote mit Team", "Geleitet von KI-Experten und erfahrenen Moderatoren", "KI-Tools in allen Phasen integriert"].map((item) => <p key={item} className="flex items-start gap-3 text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{item}</p>)}</div>
              
              <p className="text-sm font-semibold mb-4">Preis auf Anfrage</p>
              
              <div className="border-l-2 border-primary bg-primary/10 p-4 mb-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Getesteter Prototyp mit klaren Insights
                </p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/design-sprint-workshop">
                    Workshop Details ansehen
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/workshop-registration?type=design-sprint">
                    Workshop buchen
                  </Link>
                </Button>
              </div>
          </article>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 border-y border-border px-6 py-3">
            <span className="text-sm font-semibold">So funktioniert es:</span>
            <span className="text-sm">Unklar?</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="text-sm">Problem-Framing</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="text-sm">Design Sprint</span>
          </div>
        </div>
      </div>
    </section>;
};