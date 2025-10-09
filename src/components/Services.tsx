import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StarburstIcon, ArrowsOutIcon, GridIcon, BracketsIcon, MessageIcon } from "@/components/ui/custom-icons";
const Services = () => {
  const services = [{
    icon: StarburstIcon,
    step: "Schritt 1/4 – Vom Workshop zum Entwurf",
    title: "Digitale Transformation mit AI starten",
    description: "Identifizieren Sie AI-Chancen durch unsere AI Design Sprints - als facilitierter 2-Tage Workshop oder flexibler Online Sprint. Challenge noch unklar? Unser Problem-Framing-Workshop bereitet Sie optimal vor."
  }, {
    icon: ArrowsOutIcon,
    step: "Schritt 2/4 – Vom Entwurf zur ersten Version",
    title: "Proof of AI Development",
    description: "Entwickeln Sie vom AI Design Sprint zur ersten Implementierung. Wir entwickeln eine wettbewerbsfähige AI-Lösung, die Ihre Anforderungen erfüllt und Feedback sammelt. Die MVP-Version garantiert deutlich reduziertes Risiko."
  }, {
    icon: GridIcon,
    step: "Schritt 3/4 – Von Rohdaten zur Datenqualität",
    title: "Datenqualitäts-Audit",
    description: "Professionelle Daten Analyse für Ihr Unternehmen, denn Daten sind die Grundlage für alles. Wir schlagen eine Datenerfassungsstrategie vor die besseren Wert für Ihr Unternehmen liefert."
  }, {
    icon: MessageIcon,
    step: "Schritt 4/4 – Vom ersten Entwurf zur Skalierung",
    title: "AI Consulting Services",
    description: "Entwickeln Sie eine maßgeschneiderte AI-Roadmap für Ihr Unternehmen. Wir analysieren Ihre Geschäftsziele, identifizieren strategische AI-Potenziale und erstellen einen langfristigen Implementierungsplan, der Ihre digitale Transformation nachhaltig vorantreibt."
  }];
  return <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Ergebnisse</h2>
          <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity mt-6">
            Termin vereinbaren
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
          const Icon = service.icon;
          return <Card key={index} className="group hover:shadow-hover transition-all duration-300 border-border hover:border-primary/50 animate-scale-in overflow-hidden" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-semibold text-primary leading-tight">{service.step}</p>
                    <h3 className="text-xl md:text-2xl font-bold">{service.title}</h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  {index === 0 ? <Link to="/ai-design-sprint">
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
                    </Link> : <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary-glow">
                      Mehr erfahren
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>}
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default Services;