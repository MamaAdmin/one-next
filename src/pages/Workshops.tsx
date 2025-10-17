import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Rocket, Zap, Clock, CheckCircle2, ArrowRight, Users, Calendar, HelpCircle } from "lucide-react";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Workshops = () => {
  const workshopCards = [
    {
      badge: "Der Startpunkt",
      badgeColor: "bg-yellow-500/20 text-yellow-700",
      icon: Target,
      title: "Problem Framing Workshop",
      duration: "1-2 Tage",
      description: "Challenge klären",
      keyPoints: [
        "Problemstellung definieren",
        "Zielgruppe priorisieren",
        "Sprint-ready machen"
      ],
      link: "/problem-framing-workshop",
      price: "Auf Anfrage",
      color: "yellow"
    },
    {
      badge: "Empfohlen",
      badgeColor: "bg-green-500/20 text-green-700",
      icon: Rocket,
      title: "Design Sprint Workshop",
      duration: "2-4 Tage",
      description: "Vor Ort/Remote mit Experten",
      keyPoints: [
        "Expert-Facilitation",
        "AI-Tools in allen Phasen",
        "Validierter Prototyp"
      ],
      link: "/design-sprint-workshop",
      price: "Ab €8.000",
      color: "green"
    },
    {
      badge: "AI-fokussiert",
      badgeColor: "bg-blue-500/20 text-blue-700",
      icon: Zap,
      title: "AI Design Sprint",
      duration: "2 Tage",
      description: "KI-Potenziale identifizieren",
      keyPoints: [
        "AI-Opportunity-Analyse",
        "Machbarkeits-Check",
        "Entwicklungs-Roadmap"
      ],
      link: "/ai-design-sprint",
      price: "Ab €6.000",
      color: "blue"
    },
    {
      badge: "Budget-freundlich",
      badgeColor: "bg-purple-500/20 text-purple-700",
      icon: Clock,
      title: "Online Sprint",
      duration: "6 Phasen",
      description: "Flexibel & asynchron",
      keyPoints: [
        "Eigenes Tempo",
        "Digitale Tools inkl.",
        "Automatischer Report"
      ],
      link: "/ai-design-sprint/online",
      price: "Ab €2.500",
      color: "purple"
    }
  ];

  const personas = [
    {
      title: "Wir wissen nicht genau, wo wir anfangen sollen",
      description: "Die Challenge ist noch unklar oder zu breit definiert",
      recommendation: "Problem Framing → Design Sprint",
      link: "/problem-framing-workshop",
      icon: HelpCircle
    },
    {
      title: "Wir wollen AI-Potenziale in unserem Business erkunden",
      description: "Sie möchten herausfinden, wo KI Mehrwert schaffen kann",
      recommendation: "AI Design Sprint",
      link: "/ai-design-sprint",
      icon: Zap
    },
    {
      title: "Wir haben ein klares Problem und Budget-Constraints",
      description: "Die Challenge ist definiert, aber das Budget ist begrenzt",
      recommendation: "Online Sprint",
      link: "/ai-design-sprint/online",
      icon: Clock
    }
  ];

  const faqs = [
    {
      question: "Wie lange dauert die Vorbereitung?",
      answer: "Die Vorbereitung hängt vom Workshop-Format ab. Für den Design Sprint empfehlen wir 1-2 Wochen Vorlauf, um alle Teilnehmer zu koordinieren und Materialien vorzubereiten. Der Online Sprint kann kurzfristiger starten."
    },
    {
      question: "Brauchen wir Vorkenntnisse?",
      answer: "Nein, alle Workshops sind so gestaltet, dass keine spezifischen Vorkenntnisse erforderlich sind. Wir führen Sie durch jeden Schritt des Prozesses."
    },
    {
      question: "Kann man Workshops kombinieren?",
      answer: "Ja, absolut! Typischerweise beginnen Teams mit dem Problem Framing Workshop und setzen dann mit einem Design Sprint oder AI Design Sprint fort. Wir beraten Sie gerne bei der optimalen Kombination."
    },
    {
      question: "Was ist der Unterschied zu klassischen Workshops?",
      answer: "Unsere Workshops nutzen AI-Tools systematisch in allen Phasen und folgen bewährten Design Sprint-Methoden. Das macht sie deutlich effizienter und führt zu besseren, validierten Ergebnissen."
    },
    {
      question: "Wie viele Teilnehmer sind ideal?",
      answer: "Die ideale Teamgröße liegt bei 6-8 Personen. Das ist groß genug für diverse Perspektiven, aber klein genug für effektive Zusammenarbeit und schnelle Entscheidungen."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
              AI-Workshops &
              <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                Design Sprints
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Finden Sie den richtigen Workshop für Ihre Challenge – von der Problemklärung bis zur validierten Lösung
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90" asChild>
                <a href="#workshop-cards">
                  Alle Workshops ansehen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/workshop-registration">
                  Workshop Assessment starten
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Entscheidungsbaum / Decision Flow */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Welcher Workshop <span className="text-primary">passt zu Ihnen?</span>
          </h2>
          <WorkshopFlowDiagram />
        </div>
      </section>

      {/* Workshop-Karten Sektion */}
      <section id="workshop-cards" className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Unsere <span className="text-primary">Workshop-Formate</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Vom ersten Problem-Framing bis zum validierten Prototyp – wir begleiten Sie auf Ihrem Weg
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workshopCards.map((workshop, index) => {
                const Icon = workshop.icon;
                return (
                  <Card key={index} className="border-border hover:border-primary/50 transition-all hover:shadow-hover">
                    <CardContent className="p-6 space-y-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${workshop.badgeColor}`}>
                        {workshop.badge}
                      </div>
                      
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2">{workshop.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workshop.duration} | {workshop.description}
                        </p>
                      </div>
                      
                      <ul className="space-y-2">
                        {workshop.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-4 space-y-3">
                        <Button asChild className="w-full" variant="outline">
                          <Link to={workshop.link}>Mehr erfahren</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center font-semibold">
                          {workshop.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Vergleichstabelle */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Workshop-Formate im <span className="text-primary">Vergleich</span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-left p-4 font-semibold">Problem Framing</th>
                    <th className="text-left p-4 font-semibold">Design Sprint</th>
                    <th className="text-left p-4 font-semibold">AI Design Sprint</th>
                    <th className="text-left p-4 font-semibold">Online Sprint</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium">Dauer</td>
                    <td className="p-4">1-2 Tage</td>
                    <td className="p-4">2-4 Tage</td>
                    <td className="p-4">2 Tage</td>
                    <td className="p-4">5-7 Tage (flexibel)</td>
                  </tr>
                  <tr className="border-t border-border bg-muted/30">
                    <td className="p-4 font-medium">Facilitation</td>
                    <td className="p-4">✓ Expert</td>
                    <td className="p-4">✓ Expert + AI</td>
                    <td className="p-4">✓ Expert + AI</td>
                    <td className="p-4">✗ Selbstgeführt</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium">Remote-möglich</td>
                    <td className="p-4">✓</td>
                    <td className="p-4">✓</td>
                    <td className="p-4">✓</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-t border-border bg-muted/30">
                    <td className="p-4 font-medium">AI-Tools</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓</td>
                    <td className="p-4">✓✓ (fokussiert)</td>
                    <td className="p-4">✓ (limitiert)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium">Preis</td>
                    <td className="p-4">€€</td>
                    <td className="p-4">€€€€</td>
                    <td className="p-4">€€€</td>
                    <td className="p-4">€</td>
                  </tr>
                  <tr className="border-t border-border bg-muted/30">
                    <td className="p-4 font-medium">Team-Größe</td>
                    <td className="p-4">6-8</td>
                    <td className="p-4">6-8</td>
                    <td className="p-4">6-8</td>
                    <td className="p-4">4-8</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium">Deliverables</td>
                    <td className="p-4">Challenge Brief</td>
                    <td className="p-4">Prototyp</td>
                    <td className="p-4">AI-Roadmap</td>
                    <td className="p-4">Prototyp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Use-Case-basierte Sektion mit Personas */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Welcher Workshop <span className="text-primary">passt zu Ihnen?</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Finden Sie basierend auf Ihrer Situation den optimalen Workshop
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {personas.map((persona, index) => {
                const Icon = persona.icon;
                return (
                  <Card key={index} className="border-border hover:border-primary/50 transition-all hover:shadow-hover">
                    <CardContent className="p-8 space-y-4 text-center">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h3 className="text-xl font-bold">{persona.title}</h3>
                      <p className="text-sm text-muted-foreground">{persona.description}</p>
                      
                      <div className="pt-4">
                        <p className="text-sm font-semibold mb-3">Empfehlung:</p>
                        <p className="text-primary font-bold mb-4">{persona.recommendation}</p>
                        
                        <Button asChild className="w-full">
                          <Link to={persona.link}>
                            Passender Workshop
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Häufig gestellte <span className="text-primary">Fragen</span>
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Noch unsicher?
              <span className="block mt-2">Lassen Sie uns das perfekte Format finden</span>
            </h2>
            
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              In einem kostenlosen Erstgespräch helfen wir Ihnen, den optimalen Workshop für Ihre Herausforderung zu identifizieren
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/workshop-registration">
                  Kostenloses Erstgespräch buchen
                  <Calendar className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/workshop-registration">
                  Workshop Assessment starten
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Workshops;
