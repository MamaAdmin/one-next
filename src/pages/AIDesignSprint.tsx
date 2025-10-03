import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SparklesIcon, TargetIcon, LightbulbIcon, CheckCircleIcon, UsersIcon, ClockIcon, MapPinIcon } from "@/components/ui/custom-icons";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";

const AIDesignSprint = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager } = useContentManager();
  const { content, loading, updateContent } = usePageContent('ai-design-sprint');
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-semibold">AI Design Sprint</span>
            </div>
            
            <InlineTextField
              value={content.hero_title || 'Identifizieren und entfesseln Sie die Kraft der AI für Ihr Unternehmen in zwei Tagen'}
              onSave={(value) => updateContent('hero_title', value)}
              isEditMode={isEditMode}
              className="text-5xl lg:text-6xl font-bold text-primary-foreground"
              placeholder="Hero title"
              as="h1"
            />
            
            <InlineTextArea
              value={content.hero_description || 'Mit nur zwei Tagen intensiver Arbeit identifiziert Ihr Team zusammen mit unseren AI-Ingenieuren und Design-Facilitatoren das Potenzial von AI-Lösungen, um neue Ideen und Visionen für Ihr Unternehmen zu schaffen.'}
              onSave={(value) => updateContent('hero_description', value)}
              isEditMode={isEditMode}
              className="text-xl text-primary-foreground/90 leading-relaxed"
              placeholder="Hero description"
              minRows={3}
            />
            
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6 mt-6"
            >
              Jetzt Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </section>

      {/* What is it Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              Was ist ein{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI Design Sprint?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Der AI Design Sprint von one-next ist eine praxisorientierte Erfahrung, bei der wir gemeinsam 
              potenzielle AI-Anwendungsfälle für Ihr Unternehmen identifizieren und die verfügbaren 
              Geschäftsmöglichkeiten erkunden. Heutzutage ist AI ein viel verwendetes Schlagwort, umgeben von 
              Missverständnissen und Fragen bezüglich ihres Zwecks und ihrer Fähigkeiten. Abgesehen von den 
              bekannten ethischen und philosophischen Herausforderungen kann AI der Katalysator für Innovation 
              und großartige Benutzererfahrungen sein.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir haben für jeden Schritt des Design-Thinking-Prozesses Tools entwickelt, um unseren Kunden 
              zu helfen, AI in sozialen, Benutzer- und Geschäftswert zu verwandeln. Innerhalb von nur zwei 
              Tagen kann Ihr Team, unterstützt von unseren AI-Ingenieuren und Design-Facilitatoren, die Kraft 
              aufstrebender Technologien lernen und verstehen, AI-Möglichkeiten erkennen und neue Ideen und 
              Visionen schaffen.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              Was können Sie{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                erwarten?
              </span>
            </h2>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Zwei Tage intensiver kollaborativer Workshops, die von unseren Design-Leadern moderiert werden. 
                Ihr Team arbeitet durch unsere dedizierten Canvases, AI-Ideenkarten und andere Tools, die 
                speziell für AI-Softwareprojekte entwickelt wurden. Jede Session ist auf unternehmensspezifische 
                Bedürfnisse und Anwendungsfälle zugeschnitten.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sie können erwarten, dass unsere ML-Ingenieure und Data Scientists an Ideenfindungs- und 
                Prototyp-Sessions teilnehmen, um Sie durch die Lösung komplexer und abstrakte Probleme zu führen. 
                Wir helfen Ihnen, die Machbarkeit Ihrer spezifischen Ideen zu bewerten, die richtigen Technologien 
                vorzuschlagen und einen Plan für Entwicklung und Einsatz zu erstellen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <MapPinIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Vor Ort & Remote</h3>
                  <p className="text-muted-foreground">
                    Unser AI Design Sprint kann vor Ort in unseren oder Ihren Büros durchgeführt werden. 
                    Wir sind auch erfahren in vollständig remote Facilitation.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-3">
                  <ClockIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">2 Tage</h3>
                  <p className="text-muted-foreground">
                    Intensive Workshops mit strukturiertem Ablauf, die maximalen Wert in minimaler Zeit liefern.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-3">
                  <UsersIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Expert-Team</h3>
                  <p className="text-muted-foreground">
                    AI-Ingenieure, Data Scientists und Design-Facilitatoren arbeiten mit Ihrem Team zusammen.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Agenda
            </span>
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Day 1 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">1</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Tag 1</h3>
                    <p className="text-muted-foreground">Problemidentifikation & Ideenfindung</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  Wir beginnen Tag eins mit der Identifizierung des Ziels und der Kartierung der Herausforderung. 
                  Wir bitten Ihre Domain-Spezialisten, ihr Wissen zu teilen. Wir analysieren Geschäftsanforderungen 
                  und identifizieren erwartete Ergebnisse. Wir bestimmen, welche Probleme einzigartig mit einer 
                  AI-Lösung gelöst werden könnten.
                </p>
                
                <p className="text-muted-foreground leading-relaxed">
                  Mit Hilfe unserer ML-Experten durchlaufen wir eine intensive Ideenfindungs-Session, um mögliche 
                  AI-Lösungen zu kartieren.
                </p>
              </CardContent>
            </Card>

            {/* Day 2 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">2</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Tag 2</h3>
                    <p className="text-muted-foreground">Machbarkeit, Daten & Planung</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  Sobald wir die Ideen ausgewählt haben, die wir verfolgen möchten, treten wir in die Phase der 
                  Feedback- und Machbarkeitsstudie ein. Dieser Schritt erfordert AI-Wissen und Erfahrung, daher 
                  spielen unsere ML-Experten eine große Rolle.
                </p>
                
                <p className="text-muted-foreground leading-relaxed">
                  Wir kartieren unsere Ideen, identifizieren und prüfen die Datenanforderungen und bereiten eine 
                  Roadmap für weitere Untersuchungen und Entwicklung vor. Am Ende des Tages erhält Ihr Team eine 
                  Reihe möglicher Prototypen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Ergebnisse
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              AI Design Sprints helfen Ihnen, das Potenzial künstlicher Intelligenz für Ihr Unternehmen zu 
              entdecken und zu identifizieren, den Wert von Daten zu erkennen, zu überprüfen, welche Informationen 
              bereits verfügbar sind und was Sie sammeln müssen.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <TargetIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Machbarkeitsbewertung</h3>
                  <p className="text-muted-foreground">
                    Sie bestimmen die Machbarkeit Ihrer Ideen und wählen eine AI-Lösung für die Implementierung aus.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-3">
                  <LightbulbIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Entwicklungs-Roadmap</h3>
                  <p className="text-muted-foreground">
                    Planen Sie die mögliche Roadmap für die Feature-Entwicklung mit klaren nächsten Schritten.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-3">
                  <CheckCircleIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Detaillierter Bericht</h3>
                  <p className="text-muted-foreground">
                    Erhalten Sie einen umfassenden AI Design Sprint-Bericht mit Fallstudie, Konzeptdetails und 
                    Datenstrategie.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-3">
                  <UsersIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Follow-up Meeting</h3>
                  <p className="text-muted-foreground">
                    Innerhalb einer Woche nach dem Sprint planen wir ein einstündiges Meeting, um alle Ergebnisse 
                    zusammenzufassen.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Vorteile des{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI Design Sprint
            </span>
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <TargetIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">AI-Chancen Erkennen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identifizieren Sie Geschäftsbereiche, in denen maschinelles Lernen und analytische Lösungen 
                  hervorragende Ergebnisse liefern können. Steigern Sie Ihre Wettbewerbsfähigkeit und Resilienz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <ClockIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Schnell & Agil</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Der Sprint ist eine erschwingliche Möglichkeit, einen echten Bedarf zu umreißen, die Lösung zu 
                  prototypisieren und Feedback zu erhalten, bevor Sie sich zu einer größeren Einführung verpflichten.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Roadmap mit Zuversicht</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Am Ende des Sprints erhalten Sie eine Roadmap, die technische Implementierung, Budget und 
                  Erweiterungsschritte umfasst, die Sie mit Zuversicht präsentieren können.
                </p>
              </CardContent>
            </Card>
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
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground">
              Buchen Sie Ihren ersten AI Design Sprint
            </h2>
            
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Sind Sie interessiert? Erleben Sie unseren einzigartigen menschenzentrierten Ansatz für AI und 
              finden Sie heraus, wie Technologie Ergebnisse für Ihr Unternehmen liefern kann. Kontaktieren Sie 
              uns und wir geben Ihnen gerne weitere Details.
            </p>
            
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6"
            >
              Jetzt Termin vereinbaren
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      {isContentManager && !loading && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}
    </div>
  );
};

export default AIDesignSprint;
