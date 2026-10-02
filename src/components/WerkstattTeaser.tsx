import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = ["Problem Framing", "Design Sprint", "KI-Arbeitsablauf entwickeln", "Prüfen und freigeben", "Wirkung und Skalierung"];

export function WerkstattTeaser() {
  return (
    <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-border-accent bg-card p-8 text-left md:p-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Die one-next Werkstatt</p>
      <h3 className="mt-3 text-2xl font-semibold md:text-3xl">Vom echten Geschäftsproblem zur belegten Wirkung</h3>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Erleben Sie am Beispiel Rechnungseingang mit KI, wie aus einer Idee in fünf Schritten ein sicherer KI-Arbeitsablauf wird.
      </p>
      <ol className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
