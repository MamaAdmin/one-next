import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StarburstIcon, ArrowsOutIcon, GridIcon, BracketsIcon, MessageIcon } from "@/components/ui/custom-icons";

const Services = () => {
  const services = [
    {
      icon: StarburstIcon,
      title: "Digitale Transformation mit KI starten",
      description:
        "Identifizieren Sie KI-Chancen und nutzen Sie diese für Resilienz und Geschäftsergebnisse. Wir organisieren AI Design Sprint Workshops, in denen Sie das KI-Potenzial freisetzen und neuen Wert für Ihr Unternehmen schaffen können.",
    },
    {
      icon: ArrowsOutIcon,
      title: "Proof of AI Development",
      description:
        "Entwickeln Sie vom AI Design Sprint zur ersten Implementierung. Wir entwickeln eine wettbewerbsfähige KI-Lösung, die Ihre Anforderungen erfüllt und Feedback sammelt. Die MVP-Version garantiert deutlich reduziertes Risiko.",
    },
    {
      icon: GridIcon,
      title: "Datenqualitäts-Audit",
      description:
        "Professionelle Data Science Analyse für Ihr Modellvorschlag. Wir schlagen eine Datenerfassungsstrategie vor, die die Genauigkeit Ihres Modells verbessert und besseren Wert für Ihr Unternehmen liefert.",
    },
    {
      icon: BracketsIcon,
      title: "Maßgeschneiderte KI-Entwicklung",
      description:
        "Implementieren Sie Ihre eigene dedizierte KI-Lösung, verknüpft mit anderen Services. Mit unseren Computer Vision-Lösungen und NLP können Sie sich auf unser KI-Team verlassen.",
    },
    {
      icon: MessageIcon,
      title: "Machine Learning Beratung",
      description:
        "Mit umfangreicher Expertise bei der Implementierung von KI-Lösungen überprüft unser Team Ihre Anforderungen und berät zu weiteren Schritten, um Ihr Geschäftsziel mit Wirkung zu erreichen.",
    },
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Wie können wir Ihnen{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              helfen?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bei one-next glauben wir, dass maschinelles Lernen uns helfen kann, intelligente
            Produkte, Services und Systeme zu entwerfen, die das tägliche Leben der Menschen
            verbessern. Unser Angebot umfasst fortschrittliche KI-Entwicklungsservices für jeden
            Bedarf und jede Phase des KI-Lebenszyklus.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity mt-6"
          >
            Termin vereinbaren
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-hover transition-all duration-300 border-border hover:border-primary/50 animate-scale-in overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  {index === 0 ? (
                    <Link to="/ai-design-sprint">
                      <Button 
                        variant="ghost" 
                        className="group/btn p-0 h-auto text-primary hover:text-primary-glow"
                      >
                        Mehr erfahren
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="group/btn p-0 h-auto text-primary hover:text-primary-glow"
                    >
                      Mehr erfahren
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
