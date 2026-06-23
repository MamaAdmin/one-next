import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, Search, Target } from "lucide-react";

const Analysis = () => {
  return (
    <>
      <SEO 
        title="KI-Analyse | One Next"
        description="Professionelle KI-Analyse für Ihr Unternehmen. Wir evaluieren Ihre KI-Potenziale und entwickeln maßgeschneiderte Strategien."
        canonical="/analyse"
      />
      <Navigation />
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">KI-Analyse</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Identifizieren Sie KI-Potenziale in Ihrem Unternehmen und entwickeln Sie eine datengetriebene Strategie für nachhaltigen Erfolg.
              </p>
              <Button size="lg">
                Analyse anfragen
              </Button>
            </div>
          </div>
        </section>

        {/* Analysis Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Unser Analyse-Prozess</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Bestandsaufnahme</h3>
                <p className="text-muted-foreground">
                  Erfassung Ihrer aktuellen Prozesse und Datenlandschaft
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Potenzialanalyse</h3>
                <p className="text-muted-foreground">
                  Identifikation von KI-Use-Cases und Quick Wins
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Roadmap</h3>
                <p className="text-muted-foreground">
                  Entwicklung einer priorisierten Umsetzungsstrategie
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">4. Empfehlungen</h3>
                <p className="text-muted-foreground">
                  Konkrete Handlungsempfehlungen für Ihr Team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Was Sie erhalten</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Detaillierter Analysebericht</h3>
                    <p className="text-muted-foreground">Umfassende Dokumentation aller Erkenntnisse und Empfehlungen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Priorisierte Use-Cases</h3>
                    <p className="text-muted-foreground">ROI-basierte Bewertung von KI-Anwendungsfällen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Implementierungs-Roadmap</h3>
                    <p className="text-muted-foreground">Zeitplan und Ressourcenplanung für die Umsetzung</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Workshop-Präsentation</h3>
                    <p className="text-muted-foreground">Interaktive Vorstellung der Ergebnisse mit Ihrem Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Bereit für Ihre KI-Analyse?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Lassen Sie uns gemeinsam die KI-Potenziale in Ihrem Unternehmen entdecken.
              </p>
              <Button size="lg">
                Jetzt Termin vereinbaren
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Analysis;
