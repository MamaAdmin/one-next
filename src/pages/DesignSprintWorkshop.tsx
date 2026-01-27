import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, Users, Lightbulb, ArrowRight, Calendar, Rocket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkshopComparisonSection } from "@/components/WorkshopComparisonSection";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import workshopImage from "@/assets/design-sprint-workshop.jpg";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema } from "@/config/seoConfig";

const DesignSprintWorkshop = () => {
  const structuredData = [
    createEventSchema(
      "Design Sprint Workshop",
      "Strukturierter 2-Tage Workshop zur Entwicklung und Testung innovativer Lösungen mit dem Design Sprint Framework.",
      "https://one-next.de/design-sprint-workshop"
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Workshops", url: "https://one-next.de/sprint-uebersicht" },
      { name: "Design Sprint Workshop", url: "https://one-next.de/design-sprint-workshop" }
    ])
  ];

  return (
    <>
      <SEO
        title="Design Sprint Workshop | 2-Tage Intensiv-Workshop | one-next"
        description="Strukturierter Design Sprint Workshop über 2 Tage. Von der Challenge zum getesteten Prototyp mit erfahrenen Facilitators."
        keywords="Design Sprint Workshop, Innovation Workshop, Prototyping, Design Thinking Workshop"
        canonical="https://one-next.de/design-sprint-workshop"
        structuredData={structuredData}
      />
      <div className="min-h-screen flex flex-col">
        <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                <Rocket className="w-4 h-4" />
                Nächster Schritt
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Design Sprint Workshop
                <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                  Wenn die Challenge klar ist
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                2–4 Tage intensiver Workshop vor Ort oder remote mit Ihrem Team. 
                Geleitet von AI-Experten & Facilitatoren mit KI-Tools in allen Phasen: 
                Research, Ideenfindung, Prototyping, Testing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/workshop-registration">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                    Workshop Assessment starten
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button asChild size="lg" variant="outline">
                  <Link to="/problem-framing-workshop">
                    Challenge erst klären
                  </Link>
                </Button>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 mt-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Getesteter Prototyp mit klaren Insights
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src={workshopImage} 
                alt="AI Design Sprint Workshop mit Teilnehmern und Facilitator bei der Entwicklung eines Prototyps" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Purpose & Outcome */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Zweck & <span className="text-primary">Ergebnis</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Ziel</h3>
                  <p className="text-muted-foreground">
                    Von der <strong>Challenge zur umsetzbaren AI-Lösung</strong> in 2 Tagen – 
                    mit validiertem Konzept, Machbarkeitsanalyse und klarem Implementierungsplan.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Deliverables</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Validierter Prototyp oder Konzept</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Machbarkeitsanalyse (technisch & wirtschaftlich)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Entwicklungs-Roadmap mit Meilensteinen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Detaillierter Report mit Empfehlungen</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Participants & Roles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Teilnehmer & <span className="text-primary">Rollen</span>
            </h2>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-primary" />
                  <p className="text-lg text-muted-foreground">
                    <strong className="text-foreground">6–8 Personen</strong> für optimale Zusammenarbeit
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Decider</p>
                      <p className="text-sm text-muted-foreground">Entscheidungsbefugt für Sprint-Ziele</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Product Owner</p>
                      <p className="text-sm text-muted-foreground">Strategische Produktperspektive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">UX/Design</p>
                      <p className="text-sm text-muted-foreground">Nutzerzentrierte Perspektive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Tech Lead / AI-Expert</p>
                      <p className="text-sm text-muted-foreground">Technische & AI-Machbarkeit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Fachexperten</p>
                      <p className="text-sm text-muted-foreground">Domänenwissen & Use Cases</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Facilitator (wir stellen)</p>
                      <p className="text-sm text-muted-foreground">Expert-Moderation & AI-Tools</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Was können Sie erwarten? */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Was können Sie <span className="text-primary">erwarten?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Vor Ort & Remote</h3>
                  <p className="text-sm text-muted-foreground">
                    Flexibel nach Ihren Bedürfnissen – vor Ort bei Ihnen oder vollständig remote
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">2 Tage intensiv</h3>
                  <p className="text-sm text-muted-foreground">
                    Fokussierte AI-Konzeptentwicklung mit strukturiertem Sprint-Prozess
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Expert-Team</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Ingenieure & erfahrene Facilitatoren begleiten Sie durch den Sprint
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Agenda - Detailed 2 Days */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Workshop-Agenda <span className="text-primary">(2 Tage intensiv)</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Strukturierter Prozess von der Challenge zur umsetzbaren AI-Lösung
            </p>

            {/* Tag 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <a href="https://gamma.app/docs/Design-Sprint-Workshop-Tag-1-5fegu8ugsh41wrl?mode=doc" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold hover:text-primary transition-colors">Tag 1: Verstehen & Definieren</a>
              </div>
              
              <div className="space-y-4 ml-18">
                {[
                  { title: "Challenge-Mapping", time: "60'", desc: "Problem verstehen, Kontext klären, Zielgruppe definieren" },
                  { title: "AI-Potenzial-Analyse", time: "90'", desc: "Wo kann AI wirklich Mehrwert schaffen? Use Cases identifizieren und bewerten" },
                  { title: "Zieldefinition & Erfolgskriterien", time: "60'", desc: "Konkrete, messbare Ziele für den Sprint festlegen" },
                  { title: "Lösungs-Ideation", time: "120'", desc: "Brainstorming, Crazy 8s, erste Lösungsansätze entwickeln" }
                ].map((step, index) => (
                  <Card key={index} className="border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold">{step.title}</h4>
                          <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tag 2 */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-2xl font-bold">Tag 2: Konzeption & Validierung</h3>
              </div>
              
              <div className="space-y-4 ml-18">
                {[
                  { title: "Konzept-Entwicklung", time: "90'", desc: "Lösungsansätze konkretisieren, Storyboard erstellen, Nutzerflüsse definieren" },
                  { title: "Prototyping/Visualisierung", time: "120'", desc: "Click-Dummy oder AI-Mock-up erstellen mit AI-Tools (Figma, Lovable, etc.)" },
                  { title: "Machbarkeits-Check", time: "60'", desc: "Technische, wirtschaftliche und organisatorische Machbarkeit bewerten" },
                  { title: "Roadmap & Next Steps", time: "60'", desc: "Implementierungsplan mit Meilensteinen, Quick Wins und Ressourcen" }
                ].map((step, index) => (
                  <Card key={index} className="border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold">{step.title}</h4>
                          <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Definition of Done</p>
                    <p className="text-sm text-muted-foreground">
                      Validiertes Konzept, Machbarkeitsanalyse, Entwicklungs-Roadmap, detaillierter Report 
                      mit allen Erkenntnissen und Empfehlungen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Was Sie am Ende haben */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Was Sie am Ende <span className="text-primary">haben</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Machbarkeitsanalyse</h3>
                  <p className="text-sm text-muted-foreground">
                    Technische, wirtschaftliche und organisatorische Bewertung der AI-Potenziale
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Entwicklungs-Roadmap</h3>
                  <p className="text-sm text-muted-foreground">
                    Klarer Implementierungsplan mit Meilensteinen, Ressourcen und Quick Wins
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Detaillierter Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Vollständige Dokumentation aller Erkenntnisse und Empfehlungen
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Warum ein AI Design Sprint Workshop? */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Warum ein AI Design Sprint <span className="text-primary">Workshop?</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Expert-geführt für maximale Qualität</h3>
                  <p className="text-sm text-muted-foreground">
                    Erfahrene AI-Experten und Facilitatoren begleiten Sie durch den gesamten Prozess 
                    und bringen Best Practices aus zahlreichen Projekten ein.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Potenziale systematisch identifizieren</h3>
                  <p className="text-sm text-muted-foreground">
                    Strukturierte Analyse und Bewertung von AI-Use-Cases, um wirklich wertvolle 
                    Anwendungsfälle zu erkennen und zu priorisieren.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Schnell zur umsetzbaren Roadmap</h3>
                  <p className="text-sm text-muted-foreground">
                    In nur 2 Tagen von der Idee zum konkreten Implementierungsplan mit 
                    klaren nächsten Schritten.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Team-Alignment & Buy-In</h3>
                  <p className="text-sm text-muted-foreground">
                    Alle Stakeholder arbeiten gemeinsam an der Lösung und entwickeln ein 
                    gemeinsames Verständnis – wichtig für erfolgreiche Umsetzung.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Vorlagen & Methoden */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Vorlagen & <span className="text-primary">Methoden</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-3">
                  <Lightbulb className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Design Sprint Canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    Strukturierte Dokumentation des gesamten Sprint-Prozesses
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 space-y-3">
                  <Target className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">AI Opportunity Matrix</h3>
                  <p className="text-sm text-muted-foreground">
                    Systematische Bewertung von AI-Potenzialen nach Wert und Machbarkeit
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 space-y-3">
                  <Rocket className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Rapid Prototyping Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Figma, Lovable, ChatGPT und weitere AI-Tools für schnelles Prototyping
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Wann Workshop statt Online Sprint? */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Wann Workshop statt <span className="text-primary">Online Sprint?</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold">Workshop (facilitiert)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Komplexe oder strategische Challenge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>High-Stakes-Entscheidung mit großer Tragweite</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Expertenwissen & externe Perspektive gewünscht</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Team-Alignment und Buy-In besonders wichtig</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 space-y-3">
                  <Lightbulb className="w-8 h-8 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Online Sprint (selbstgeführt)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Klar definierte, mittlere Komplexität</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Interne Prozesse oder Kundenerlebnisse optimieren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Team hat Sprint-Erfahrung oder ist selbstorganisiert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Budget oder Zeitrahmen begrenzt</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Flow */}
      <WorkshopFlowDiagram />

      {/* Comparison Section */}
      <WorkshopComparisonSection />

      {/* CTA Section - Dual Option */}
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Card className="bg-background/95 backdrop-blur-sm border-none shadow-2xl max-w-5xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center space-y-8">
                <h2 className="text-4xl font-bold">
                  Bereit für Ihren{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    AI Design Sprint Workshop?
                  </span>
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Lassen Sie uns gemeinsam Ihre AI-Potenziale systematisch erschließen
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Workshop anfragen</h3>
                    <p className="text-muted-foreground text-sm">
                      Facilitierter 2-Tage Workshop mit AI-Experten vor Ort oder remote
                    </p>
                    <Link to="/workshop-registration">
                      <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                        Jetzt anfragen
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Online Sprint als Alternative</h3>
                    <p className="text-muted-foreground text-sm">
                      Selbstgeführter Online Sprint für einfachere Challenges
                    </p>
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <Link to="/sprint-uebersicht/online">Mehr zum Online Sprint</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
};

export default DesignSprintWorkshop;