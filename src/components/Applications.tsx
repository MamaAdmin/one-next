import { Card, CardContent } from "@/components/ui/card";
import { Cog, TrendingUp, Eye, Users, Target } from "lucide-react";

const Applications = () => {
  const applications = [
    {
      icon: Cog,
      title: "Automatisierung und Kostenreduzierung",
      description:
        "Erreichen Sie operative Effizienz durch AI-Technologie mit automatisierten Schritten und optimierten Prozessen. Produktivität, Zuverlässigkeit und Effizienz können durch Deep Learning-Techniken verbessert werden.",
    },
    {
      icon: TrendingUp,
      title: "Bessere Entscheidungsfindung durch Data Science",
      description:
        "Transformation von Daten in umsetzbare Intelligenz, die strategische und taktische Geschäftsentscheidungen informiert. Nutzen Sie Big Data Analytics oder Predictive Analytics zur Verbesserung Ihrer Produkte.",
    },
    {
      icon: Eye,
      title: "Computer Vision für Ihr System",
      description:
        "Wir entwickeln Computer-Vision-Systeme für Bild- und Videoerkennung. Mit neuronalen Netzwerken können wir ein System trainieren, Objekte, Personen, Gesten oder Bewegungen zu identifizieren.",
    },
    {
      icon: Users,
      title: "Kundenerlebnis auf Steroiden",
      description:
        "Schaffen Sie natürliche Interaktionen mit Ihren Nutzern durch Natural Language Processing. Verbessern Sie die User Experience bei gleichzeitiger Kostenreduzierung mit AI-Automatisierung und Chatbots.",
    },
    {
      icon: Target,
      title: "Empfehlungen mit Vertrauen",
      description:
        "Antizipieren Sie Nutzerverhalten zur Schaffung personalisierter Kundenerlebnisse mit maschinellem Lernen. Empfehlungssysteme können Ihren Umsatz steigern oder Erlebnisse mit personalisierten Filteroptionen optimieren.",
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Wo können wir{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI für Sie einsetzen?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Künstliche Intelligenz hat die digitale Transformation auf den Agenden der meisten CEOs
            ersetzt. Unternehmen, die sich für die Integration von AI-Technologie entscheiden,
            profitieren vom wahrhaft transformativen Potenzial der AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {applications.map((app, index) => {
            const Icon = app.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-hover transition-all duration-300 border-border hover:border-primary/50 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">{app.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{app.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Applications;
