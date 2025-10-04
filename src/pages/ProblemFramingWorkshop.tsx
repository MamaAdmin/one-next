import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, Users, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProblemFramingWorkshop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Problem-Framing-Workshop:
              <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                Die Challenge schärfen
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ihre Challenge ist noch nicht sprint-ready? Kein Problem! In unserem 1-2-tägigen 
              Problem-Framing-Workshop entwickeln wir gemeinsam eine klare, testbare und 
              strategisch relevante Fragestellung – perfekt vorbereitet für einen Design Sprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/sprint/assessment">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  Workshop anfragen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Termin vereinbaren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* When is this workshop useful? */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Wann ist dieser Workshop <span className="text-primary">sinnvoll?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Challenge unklar</h3>
                  <p className="text-sm text-muted-foreground">
                    Die Problemstellung ist zu breit, vage oder nicht konkret genug formuliert.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Zielgruppe diffus</h3>
                  <p className="text-sm text-muted-foreground">
                    Es gibt mehrere mögliche Zielgruppen, aber keine klare Priorisierung.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Nicht testbar</h3>
                  <p className="text-sm text-muted-foreground">
                    Die Anforderungen sind zu abstrakt oder können nicht in 5 Tagen getestet werden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Process/Agenda */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Workshop-Ablauf <span className="text-primary">(1-2 Tage)</span>
            </h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Problem-Definition</h3>
                    <p className="text-muted-foreground">
                      Wir analysieren die aktuelle Situation, identifizieren Schmerz­punkte und 
                      formulieren eine klare, lösbare Challenge.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Stakeholder & Zielgruppen-Mapping</h3>
                    <p className="text-muted-foreground">
                      Gemeinsam priorisieren wir die relevantesten Zielgruppen und identifizieren 
                      die richtigen Entscheider:innen und Nutzer:innen.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Erfolgskriterien & Testbarkeit</h3>
                    <p className="text-muted-foreground">
                      Wir definieren messbare Erfolgskriterien und stellen sicher, dass Ihre 
                      Challenge in einem 5-Tage-Sprint testbar ist.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sprint-Ready-Status erreichen</h3>
                    <p className="text-muted-foreground">
                      Am Ende haben Sie eine geschärfte Challenge, eine priorisierte Zielgruppe 
                      und einen klaren Plan für den nachfolgenden Design Sprint.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Expected Outcomes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Was Sie <span className="text-primary">erwartet</span>
            </h2>
            <div className="bg-card p-8 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Geschärfte Challenge:</strong> Eine klare, 
                  fokussierte Problemstellung, die in einem Design Sprint lösbar ist.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Identifizierte Zielgruppen:</strong> Eine 
                  priorisierte Liste der relevantesten Nutzer:innen und Stakeholder.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Messbare Erfolgskriterien:</strong> Konkrete, 
                  testbare Ziele für Ihren Design Sprint.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Sprint-Ready-Zustand:</strong> Alle 
                  Voraussetzungen (Entscheider, Nutzer, Testbarkeit) sind geklärt.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Workshop-Dokumentation:</strong> Vollständiges 
                  Protokoll und Vorbereitung für den nachfolgenden Design Sprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Bereit, Ihre Challenge zu <span className="text-primary">schärfen?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Starten Sie mit einem Problem-Framing-Workshop und legen Sie das Fundament 
              für einen erfolgreichen Design Sprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/sprint/assessment">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  Jetzt Workshop anfragen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Kostenlose Beratung
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProblemFramingWorkshop;
