import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Map, Pencil, CheckCircle, Wrench, TestTube, Clipboard, Users, Clock, Zap, FileText, BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema, createFAQSchema } from "@/config/seoConfig";
const OnlineSprintLanding = () => {
  const structuredData = [createEventSchema("Online Design Sprint", "Flexibler Online Design Sprint über mehrere Wochen. Arbeiten Sie im eigenen Tempo mit KI-Unterstützung und automatisierter Dokumentation.", "https://one-next.de/sprint-uebersicht/online"), createBreadcrumbSchema([{
    name: "Home",
    url: "https://one-next.de/"
  }, {
    name: "KI Design Sprint",
    url: "https://one-next.de/sprint-uebersicht"
  }, {
    name: "Online Sprint",
    url: "https://one-next.de/sprint-uebersicht/online"
  }]), createFAQSchema([{
    question: "Wie unterscheidet sich der Online Sprint vom Workshop?",
    answer: "Der Online Sprint ist flexibel über mehrere Wochen durchführbar, während der Workshop konzentriert an 2 Tagen vor Ort stattfindet. Beide nutzen das gleiche Design Sprint Framework."
  }, {
    question: "Welche KI-Unterstützung gibt es?",
    answer: "KI-gestützte Tools für HMW-Generierung, Ideen-Clustering, automatisierte Report-Erstellung und intelligente Vorschläge während des gesamten Sprint-Prozesses."
  }, {
    question: "Kann ich den Sprint pausieren?",
    answer: "Ja, Sie können jederzeit pausieren und später fortsetzen. Alle Daten werden automatisch gespeichert."
  }])];
  const phases = [{
    icon: Clipboard,
    title: "Setup-Phase",
    description: "Team zusammenstellen (4 Kern-Rollen), Kick-off Meeting planen, Experten einladen (optional)"
  }, {
    icon: Target,
    title: "Phase 1: Problem Framing",
    description: "Cynefin Framework zur Einordnung, Smart Sailboat für Ziele & Hindernisse, Challenge Priorisierung"
  }, {
    icon: Map,
    title: "Phase 2: Map",
    description: "Langfristziel definieren, Journey Map erstellen, How-Might-We Fragen generieren, Experten-Input (optional)"
  }, {
    icon: Pencil,
    title: "Phase 3: Sketch",
    description: "Crazy 8 Ideation, detaillierte Solution Sketches, Team-Voting"
  }, {
    icon: CheckCircle,
    title: "Phase 4: Decide",
    description: "Heatmap Voting für beste Ideen, Storyboard erstellen, Prototyp-Plan festlegen"
  }, {
    icon: Wrench,
    title: "Phase 5: Prototype",
    description: "Prototyp entwickeln (digital oder Figma), Test-Szenarien vorbereiten"
  }, {
    icon: TestTube,
    title: "Phase 6: Test",
    description: "User Testing durchführen, Feedback sammeln, Experten-Review (optional), automatisierter Report-Generator"
  }];
  const features = [{
    icon: Clock,
    title: "Flexible Durchführung",
    description: "Arbeiten Sie in Ihrem eigenen Tempo - pausieren und fortsetzen wann Sie möchten"
  }, {
    icon: Users,
    title: "Verteilte Teams",
    description: "Perfekt für remote und async Zusammenarbeit über verschiedene Zeitzonen"
  }, {
    icon: Zap,
    title: "Automatische Tools",
    description: "Digitale Vorlagen, automatische E-Mail-Einladungen, Kalender-Integration"
  }, {
    icon: FileText,
    title: "PDF-Report",
    description: "Automatisch generierter Sprint-Report mit allen Ergebnissen nach Tag 5"
  }];
  const targetAudiences = [{
    title: "Startups & kleine Teams",
    description: "Budget-freundliche Alternative für schnelle Validation und Ideenfindung"
  }, {
    title: "Verteilte Teams",
    description: "Remote-friendly und async-kompatibel mit flexibler Zeiteinteilung"
  }, {
    title: "Innovation Teams",
    description: "Experimentieren ohne große Investition mit iterativem Ansatz"
  }];
  return <>
      <SEO title="Online Design Sprint | Flexibel & Remote | one-next" description="Flexibler Online Design Sprint mit KI-Unterstützung. Arbeiten Sie im eigenen Tempo über mehrere Wochen mit automatisierten Tools und Reports." keywords="Online Design Sprint, Remote Sprint, Digital Design Sprint, KI-gestützt, Async Sprint" canonical="https://one-next.de/sprint-uebersicht/online" structuredData={structuredData} />
      <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-hero pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold">
              Online Design Sprint
              <span className="block mt-4 bg-gradient-primary bg-clip-text text-transparent">zur Problemlösung</span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Selbstgeführter, strukturierter Prozess für verteilte Teams – flexibel, digital, mit Schritt-für-Schritt-Anleitung.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-6">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6" asChild>
                <Link to="/sprint">Jetzt starten</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link to="/sprint-uebersicht">Workshop-Variante ansehen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist es? */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Was ist der{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Online Design Sprint?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground text-center mb-12">Ein selbstgeführter, digitaler Prozess über mehrere Tage, der Ihrem Team hilft, Probleme zu identifizieren, zu bewerten und zu prototypisieren - ohne teure Tainer und in Ihrem eigenen Tempo.</p>

            {/* Timeline Visualization */}
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary -translate-x-1/2" />
              
              <div className="space-y-8">
                {phases.map((phase, index) => {
                  const Icon = phase.icon;
                  return <div key={index} className="relative flex items-center gap-8">
                      <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'order-2'}`}>
                        <Card className="inline-block text-left max-w-md">
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">{phase.title}</h3>
                            <p className="text-muted-foreground">{phase.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center z-10 flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      
                      <div className={`flex-1 ${index % 2 === 0 ? 'order-2' : ''}`} />
                    </div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Feature Highlights
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return <Card key={index} className="text-center hover:shadow-hover transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>;
            })}
          </div>
        </div>
      </section>

      {/* Für wen ist es geeignet? */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Für wen ist der Online Sprint{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              geeignet?
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {targetAudiences.map((audience, index) => <Card key={index} className="hover:shadow-hover transition-all">
                <CardContent className="p-8 space-y-4">
                  <BarChart3 className="w-12 h-12 text-primary" />
                  <h3 className="text-xl font-bold">{audience.title}</h3>
                  <p className="text-muted-foreground">{audience.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Häufig gestellte{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Fragen
              </span>
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="duration">
                <AccordionTrigger>Wie lange dauert jede Phase?</AccordionTrigger>
                <AccordionContent>
                  Jede Phase dauert ca. 2-4 Stunden, abhängig von Ihrer Team-Größe und dem Umfang der Diskussionen. 
                  Sie können die Zeit flexibel aufteilen und Pausen einlegen.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="experience">
                <AccordionTrigger>Brauche ich Vorkenntnisse?</AccordionTrigger>
                <AccordionContent>
                  Nein, der Online Sprint ist so gestaltet, dass keine Design Sprint-Erfahrung notwendig ist. 
                  Alle Schritte sind detailliert erklärt mit Vorlagen und Beispielen.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="pause">
                <AccordionTrigger>Kann ich Pausen machen zwischen den Phasen?</AccordionTrigger>
                <AccordionContent>
                  Ja, absolut! Der Online Sprint ist flexibel - Sie können Pausen zwischen den Phasen einlegen 
                  und im eigenen Tempo arbeiten. Ihr Fortschritt wird automatisch gespeichert.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="difference">
                <AccordionTrigger>Was ist der Unterschied zum facilitierten Workshop?</AccordionTrigger>
                <AccordionContent>
                  Der facilitierte Workshop ist ein intensiver 2-Tage-Workshop mit KI-Experten und Moderatoren vor Ort oder remote. 
                  Der Online Sprint ist selbstgeführt über 6 Phasen mit digitalen Tools und flexibler Zeiteinteilung.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="experts">
                <AccordionTrigger>Wie funktioniert die Experten-Einbindung?</AccordionTrigger>
                <AccordionContent>
                  Sie können optional externe Experten zu Phase 2 (Map) und Phase 6 (Test) einladen. 
                  Diese erhalten automatisch E-Mail-Einladungen mit Kalender-Terminen und haben nur Zugriff auf ihre spezifischen Phasen.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="pricing">
                <AccordionTrigger>Was kostet der Online Sprint?</AccordionTrigger>
                <AccordionContent>
                  Der Preis richtet sich nach dem Umfang Ihres Projekts und der Anzahl der Teilnehmer. 
                  Kontaktieren Sie uns für ein individuelles Angebot.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <Card className="bg-background/95 backdrop-blur-sm border-none shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl font-bold">
                Bereit für Ihren{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Online Design Sprint?
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Starten Sie noch heute und entdecken Sie KI-Potenziale für Ihr Unternehmen
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6" asChild>
                  <Link to="/sprint">Sprint starten</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Angebot anfordern
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground pt-4">
                Preis auf Anfrage - abhängig vom Umfang
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
    </>;
};
export default OnlineSprintLanding;