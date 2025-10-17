import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Target, CheckCircle2, Rocket, TrendingUp, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WorkshopComparisonSection } from "@/components/WorkshopComparisonSection";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import workshopImage from "@/assets/design-sprint-workshop.jpg";
const AIDesignSprint = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    isContentManager,
    loading
  } = useContentManager();
  const {
    content,
    updateContent
  } = usePageContent('ai-design-sprint');
  return <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">
                  <InlineTextField 
                    value={content.hero_badge || 'AI Design Sprint'} 
                    onSave={value => updateContent('hero_badge', value)}
                    isEditMode={isEditMode}
                    className="font-semibold"
                    placeholder="Hero Badge Text"
                    as="span"
                  />
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <InlineTextField 
                  value={content.hero_title || 'Entdecken Sie die Möglichkeiten künstlicher Intelligenz und'} 
                  onSave={value => updateContent('hero_title', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold"
                  placeholder="Hero Titel"
                  as="span"
                />
                <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                  <InlineTextField 
                    value={content.hero_subtitle || 'transformieren Sie Ihr Unternehmen'} 
                    onSave={value => updateContent('hero_subtitle', value)}
                    isEditMode={isEditMode}
                    className="bg-gradient-primary bg-clip-text text-transparent"
                    placeholder="Hero Untertitel"
                    as="span"
                  />
                </span>
              </h1>
              
              <InlineTextArea 
                value={content.hero_description || 'Mit zwei Tagen intensiver Arbeit identifiziert Ihr Team zusammen mit unseren AI-Ingenieuren und Design-Facilitatoren das Potenzial von AI-Lösungen, um neue Ideen und Visionen für Ihr Unternehmen zu schaffen.'} 
                onSave={value => updateContent('hero_description', value)}
                isEditMode={isEditMode}
                className="text-xl text-muted-foreground"
                placeholder="Hero Beschreibung"
              />
              
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
            </div>
            
            <div className="relative">
              <img 
                src={workshopImage} 
                alt="AI Design Sprint Workshop" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Zweck & Ergebnis */}
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
                  <InlineTextArea 
                    value={content.purpose_goal || 'Von der Challenge zur umsetzbaren AI-Lösung in 2 Tagen – mit validiertem Konzept, Machbarkeitsanalyse und klarem Implementierungsplan.'} 
                    onSave={value => updateContent('purpose_goal', value)}
                    isEditMode={isEditMode}
                    className="text-muted-foreground"
                    placeholder="Ziel-Beschreibung"
                  />
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
                      <InlineTextField 
                        value={content.deliverable_1 || 'Validierter Prototyp oder Konzept'} 
                        onSave={value => updateContent('deliverable_1', value)}
                        isEditMode={isEditMode}
                        placeholder="Deliverable 1"
                        as="span"
                      />
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <InlineTextField 
                        value={content.deliverable_2 || 'Machbarkeitsanalyse (technisch & wirtschaftlich)'} 
                        onSave={value => updateContent('deliverable_2', value)}
                        isEditMode={isEditMode}
                        placeholder="Deliverable 2"
                        as="span"
                      />
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <InlineTextField 
                        value={content.deliverable_3 || 'Entwicklungs-Roadmap mit Meilensteinen'} 
                        onSave={value => updateContent('deliverable_3', value)}
                        isEditMode={isEditMode}
                        placeholder="Deliverable 3"
                        as="span"
                      />
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <InlineTextField 
                        value={content.deliverable_4 || 'Detaillierter Report mit Empfehlungen'} 
                        onSave={value => updateContent('deliverable_4', value)}
                        isEditMode={isEditMode}
                        placeholder="Deliverable 4"
                        as="span"
                      />
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist ein AI Design Sprint Workshop? */}
      <section id="workshop-details" className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold">
                <InlineTextField 
                  value={content.what_is_title || 'Was ist ein AI Design Sprint Workshop?'} 
                  onSave={value => updateContent('what_is_title', value)}
                  isEditMode={isEditMode}
                  className="text-4xl font-bold"
                  placeholder="Titel"
                  as="h2"
                />
              </h2>
              <InlineTextArea 
                value={content.what_is_description || 'Ein intensiver 2-Tage-Workshop, der Ihrem Team hilft, AI-Potenziale systematisch zu identifizieren, zu bewerten und in konkrete Lösungen umzusetzen. Geleitet von erfahrenen AI-Experten und Facilitatoren.'} 
                onSave={value => updateContent('what_is_description', value)}
                isEditMode={isEditMode}
                className="text-xl text-muted-foreground leading-relaxed"
                placeholder="Beschreibung"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Teilnehmer & Rollen */}
      <section className="py-16 bg-muted/30">
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
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

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">AI-Tools & Methoden</h3>
                  <p className="text-sm text-muted-foreground">
                    Modernste AI-Tools in allen Phasen: Research, Ideation, Prototyping
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Schnelle Validierung</h3>
                  <p className="text-sm text-muted-foreground">
                    Von der Idee zum validierten Konzept in nur 2 Tagen
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Umsetzbare Ergebnisse</h3>
                  <p className="text-sm text-muted-foreground">
                    Konkrete Roadmap und Report für die direkte Implementierung
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Agenda - Detailed */}
      <section className="py-16 bg-muted/30">
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
                <h3 className="text-2xl font-bold">Tag 1: Verstehen & Definieren</h3>
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
      <section className="py-16 bg-background">
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
                    Klarer Implementierungsplan mit Meilensteinen und Quick Wins
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
                    Dokumentation mit allen Erkenntnissen, Empfehlungen und nächsten Schritten
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Methodiken & Templates */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Methodiken & <span className="text-primary">Templates</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Bewährte Frameworks und Tools für strukturierte AI-Konzeptentwicklung
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">Design Sprint Canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    Strukturiertes Framework zur systematischen Erfassung aller Sprint-Elemente
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">AI Opportunity Matrix</h3>
                  <p className="text-sm text-muted-foreground">
                    Bewertungs-Tool für AI-Potenziale nach Impact, Machbarkeit und Aufwand
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">Feasibility Assessment Framework</h3>
                  <p className="text-sm text-muted-foreground">
                    Systematische Machbarkeitsanalyse mit technischen, wirtschaftlichen und organisatorischen Kriterien
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">Rapid Prototyping Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-gestützte Tools wie Lovable, Figma AI, v0 für schnelles Visualisieren
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Flow Diagram */}
      <WorkshopFlowDiagram />

      {/* Vorteile - Erweitert */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Warum ein AI Design Sprint Workshop?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Expert-geleitete Sprint-Facilitation kombiniert AI-Tools mit bewährten Design-Methoden
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Expert-Facilitation & AI-Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Professionelle Moderation mit neuesten AI-Tools in allen Sprint-Phasen
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
                    Mit bewährten Frameworks AI-Chancen erkennen, priorisieren und bewerten
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Schnell zur Roadmap</h3>
                  <p className="text-sm text-muted-foreground">
                    In 2 Tagen von der Idee zum konkreten Implementierungsplan mit Quick Wins
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Validierte Ergebnisse</h3>
                  <p className="text-sm text-muted-foreground">
                    Machbarkeit technisch, wirtschaftlich und organisatorisch geprüft
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Team-Alignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Alle Stakeholder arbeiten gemeinsam an einer klaren Vision
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Risk Mitigation</h3>
                  <p className="text-sm text-muted-foreground">
                    Frühzeitige Identifikation von Risiken und Entwicklung von Mitigation-Strategien
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Comparison */}
      <WorkshopComparisonSection />

      {/* CTA Section - Improved Dual Option */}
      <section id="cta-section" className="py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Card className="bg-background/95 backdrop-blur-sm border-none shadow-2xl max-w-5xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold">
                  Bereit für Ihren{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    AI Design Sprint?
                  </span>
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Wählen Sie den Ansatz, der am besten zu Ihrem Team passt
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6">
                  <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all">
                    <CardContent className="p-8 space-y-6">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Workshop buchen</h3>
                        <p className="text-muted-foreground mb-4">
                          Facilitierter 2-Tage Workshop mit AI-Experten vor Ort oder remote
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Expert-Moderation & AI-Tools</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Strukturierter 2-Tage-Prozess</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Validierte Ergebnisse & Roadmap</span>
                          </li>
                        </ul>
                      </div>
                      <Link to="/workshop-registration" className="block">
                        <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                          Workshop Assessment starten
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border hover:border-primary/30 transition-all">
                    <CardContent className="p-8 space-y-6">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center">
                        <Rocket className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Online Sprint starten</h3>
                        <p className="text-muted-foreground mb-4">
                          Selbstgeführter Online Sprint in Ihrem eigenen Tempo
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Flexibles Tempo & Timeboxing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Alle Templates & AI-Tools</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Interaktiver Sprint-Guide</span>
                          </li>
                        </ul>
                      </div>
                      <Button size="lg" variant="outline" className="w-full" asChild>
                        <Link to="/ai-design-sprint/online">
                          Mehr erfahren
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      
      {isContentManager && !loading && <EditToggleButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
    </div>;
};
export default AIDesignSprint;