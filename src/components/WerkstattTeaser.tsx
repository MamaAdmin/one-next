import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = ["Problem Framing", "Design Sprint", "KI-Arbeitsablauf entwickeln", "Prüfen und freigeben", "Wirkung messen und skalieren"];

export function WerkstattTeaser() {
  return (
    <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-border-accent bg-card p-8 text-left md:p-12">
      <span className="text-sm uppercase tracking-[0.22em] text-muted-foreground font-medium">Die one-next Werkstatt</span>
      <h3 className="mt-4 text-3xl font-bold lg:text-4xl">So wird aus Ihrer Herausforderung eine wirksame KI-Lösung</h3>
      <p className="mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">
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
      <Button asChild size="lg" variant="outline" className="mt-8">
        <Link to="/werkstatt">Werkstatt erleben <ArrowRight /></Link>
      </Button>
    </div>
  );
}
