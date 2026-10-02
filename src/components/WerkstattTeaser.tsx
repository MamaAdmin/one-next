import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import preview from "@/assets/werkstatt-preview.jpg";

const steps = ["Problem Framing", "Design Sprint", "KI-Arbeitsablauf entwickeln", "Prüfen und freigeben", "Wirkung messen und skalieren"];

export function WerkstattTeaser() {
  return (
    <section id="werkstatt" className="border-y border-border-accent bg-accent-soft py-20 md:py-24">
      <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <span className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Die one-next Werkstatt</span>
          <h2 className="mt-4 text-3xl font-bold lg:text-4xl">So wird aus Ihrer Herausforderung eine wirksame KI-Lösung</h2>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
            Begleiten Sie ein Beispielprojekt durch unsere Werkstatt: vom klar definierten Problem über den getesteten Prototyp bis zum sicheren KI-Arbeitsablauf mit messbarer Wirkung – Schritt für Schritt nachvollziehbar.
          </p>
          <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="tabular-nums text-muted-foreground">0{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Button asChild size="lg" variant="outline" className="mt-8 bg-background">
            <Link to="/werkstatt">Werkstatt erleben <ArrowRight /></Link>
          </Button>
        </div>
        <Link to="/werkstatt" aria-label="Werkstatt erleben" className="group block overflow-hidden rounded-2xl border border-border-accent bg-background shadow-card">
          <img
            src={preview}
            alt="Vorschau der one-next Werkstatt: Fliessband mit Bots und dem Schritt Design Sprint"
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      </div>
    </section>
  );
}
