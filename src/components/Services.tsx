import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StarburstIcon, ArrowsOutIcon, GridIcon, MessageIcon } from "@/components/ui/custom-icons";
const Services = () => {
  const services = [{
    icon: StarburstIcon,
    step: "Schritt 1/4 – Vom Workshop zum Entwurf",
    title: "Digitale Transformation mit KI starten",
    description: "Identifizieren Sie KI-Chancen durch unsere KI Design Sprints - als facilitierter 2-Tage Workshop oder flexibler Online Sprint. Challenge noch unklar? Unser Problem-Framing-Workshop bereitet Sie optimal vor."
  }, {
    icon: ArrowsOutIcon,
    step: "Schritt 2/4 – Vom Entwurf zur ersten Version",
    title: "Proof of KI Development",
    description: "Entwickeln Sie vom KI Design Sprint zur ersten Implementierung. Wir entwickeln eine wettbewerbsfähige KI-Lösung, die Ihre Anforderungen erfüllt und Feedback sammelt. Die MVP-Version garantiert deutlich reduziertes Risiko."
  }, {
    icon: GridIcon,
    step: "Schritt 3/4 – Von Rohdaten zur Datenqualität",
    title: "Datenqualitäts-Audit",
    description: "Professionelle Daten Analyse für Ihr Unternehmen, denn Daten sind die Grundlage für alles. Wir schlagen eine Datenerfassungsstrategie vor die besseren Wert für Ihr Unternehmen liefert."
  }, {
    icon: MessageIcon,
    step: "Schritt 4/4 – Vom ersten Entwurf zur Skalierung",
    title: "KI Consulting Services",
    description: "Entwickeln Sie eine maßgeschneiderte KI-Roadmap für Ihr Unternehmen. Wir analysieren Ihre Geschäftsziele, identifizieren strategische KI-Potenziale und erstellen einen langfristigen Implementierungsplan, der Ihre digitale Transformation nachhaltig vorantreibt."
  }];
  return <section id="services" className="border-y border-border bg-muted/30 py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16 animate-fade-in">
          <p className="text-sm font-bold uppercase text-primary">Unsere Leistungen</p>
          <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">In kleinen Schritten zum Ziel</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <Card key={index} className="group overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-hover animate-scale-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-none bg-accent-soft border border-border-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-semibold text-primary leading-tight">{service.step}</p>
                    <h3 className="font-workshop-heading text-xl font-bold md:text-2xl">{service.title}</h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  {index === 0 ? <Link to="/sprint-uebersicht">
                      <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary-glow">
                        Workshop & Online Sprint
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link> : index === 2 ? <Link to="/data-quality-audit">
                      <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary-glow">
                        Mehr erfahren
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link> : index === 3 ? <Link to="/ai-consulting-services">
                      <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary-glow">
                        Mehr erfahren
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link> : <Link to="/custom-ai-development">
                      <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary-glow">
                        Mehr erfahren
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>}
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default Services;