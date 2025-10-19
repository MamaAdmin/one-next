import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Target, Laptop, Check } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { useState } from "react";
import { Link } from "react-router-dom";
const AIDesignSprint = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    isContentManager,
    loading
  } = useContentManager();
  const {
    content,
    updateContent
  } = usePageContent('sprint-uebersicht');
  return <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Badge with Icon */}
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <Target className="w-5 h-5" />
              <span className="font-semibold">AI Design Sprint</span>
            </div>
            
            <InlineTextField value={content.hero_title || 'AI Design Sprint'} onSave={value => updateContent('hero_title', value)} isEditMode={isEditMode} className="text-5xl lg:text-6xl font-bold text-white" placeholder="Titel des Hero-Bereichs" as="h1" />
            
            <InlineTextArea value={content.hero_description || 'Wählen Sie den passenden Ansatz für Ihr Team - intensiver 2-Tage Workshop oder flexibler Step by Step online Sprint'} onSave={value => updateContent('hero_description', value)} isEditMode={isEditMode} className="text-xl text-white/90 leading-relaxed" placeholder="Beschreibung des Hero-Bereichs" minRows={3} />
            
            {/* CTA Button */}
            <div className="mt-6">
              <CalendarBookingDialog
                buttonText="Beratungsgespräch vereinbaren"
                buttonSize="lg"
                buttonClassName="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Was ist ein AI Design Sprint Workshop? */}
      <section id="workshop-details" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold">
                <InlineTextField value={content.what_is_title || 'Der AI Design Sprint Workshop'} onSave={value => updateContent('what_is_title', value)} isEditMode={isEditMode} className="text-4xl font-bold" placeholder="Titel des Abschnitts" as="h2" />
              </h2>
              <InlineTextArea value={content.what_is_description || 'Ein intensiver 2-Tage-Workshop, der Ihrem Team hilft, AI-Potenziale zu identifizieren und zu nutzen.'} onSave={value => updateContent('what_is_description', value)} isEditMode={isEditMode} className="text-xl text-muted-foreground leading-relaxed" placeholder="Beschreibung des Abschnitts" />
            </div>
          </div>
        </div>
      </section>

      {/* Was können Sie erwarten? */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <InlineTextField value={content.expect_title || 'Was können Sie erwarten?'} onSave={value => updateContent('expect_title', value)} isEditMode={isEditMode} className="text-3xl font-bold" placeholder="Titel des Abschnitts" as="h2" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">Vor Ort & Remote</h3>
                <p className="text-muted-foreground text-sm">Flexibel nach Ihren Bedürfnissen</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">2 Tage intensiv</h3>
                <p className="text-muted-foreground text-sm">Fokussierte AI-Konzeptentwicklung</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">Expert-Team</h3>
                <p className="text-muted-foreground text-sm">AI-Ingenieure & Facilitatoren</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Agenda - Shortened */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Workshop-Agenda</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tag 1 */}
              <Card className="hover:shadow-hover transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-foreground">1</span>
                    </div>
                    <h3 className="text-xl font-bold">Verstehen & Definieren</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Problem analysieren, AI-Potenziale identifizieren, Ziele definieren
                  </p>
                </CardContent>
              </Card>

              {/* Tag 2 */}
              <Card className="hover:shadow-hover transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-foreground">2</span>
                    </div>
                    <h3 className="text-xl font-bold">Ideation & Roadmap</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Lösungen entwickeln, Machbarkeit bewerten, Implementierungsplan erstellen
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ergebnisse - Reduced */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Was Sie am Ende haben</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="text-3xl mb-2">1</div>
                <h3 className="text-lg font-bold">Machbarkeitsanalyse</h3>
                <p className="text-muted-foreground text-sm">Bewertung der AI-Potenziale</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="text-3xl mb-2">2</div>
                <h3 className="text-lg font-bold">Entwicklungs-Roadmap</h3>
                <p className="text-muted-foreground text-sm">Klarer Implementierungsplan</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="text-3xl mb-2">3</div>
                <h3 className="text-lg font-bold">Detaillierter Report</h3>
                <p className="text-muted-foreground text-sm">Dokumentation & Empfehlungen</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vorteile - Reduced to 2 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Warum ein AI Design Sprint Workshop?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">Potenziale systematisch identifizieren</h3>
                <p className="text-muted-foreground text-sm">
                  Mit Expertenbegleitung Chancen erkennen und bewerten
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">Schnell zur umsetzbaren Roadmap</h3>
                <p className="text-muted-foreground text-sm">
                  In 2 Tagen von der Idee zum konkreten Implementierungsplan
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wählen Sie Ihren Design Sprint Ansatz */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Wählen Sie Ihren Design Sprint Ansatz</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Beide Formate führen zu AI-Innovation - wählen Sie den Ansatz, der am besten zu Ihrem Team passt
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Problem-Framing-Workshop */}
            <Card className="hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Problem-Framing-Workshop</h3>
                  <p className="text-sm text-muted-foreground">Ihre Challenge schärfen</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>1-2 Tage intensive Klärung</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Challenge präzise definieren</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Zielgruppe priorisieren</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Sprint-Ready machen</span>
                  </li>
                </ul>
                <div className="pt-4 border-t space-y-4">
                  <p className="text-sm font-semibold">Preis auf Anfrage</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/problem-framing-workshop">Workshop-Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Design Sprint Workshop (Mit AI) */}
            <Card className="hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Design Sprint Workshop (Mit AI)</h3>
                  <p className="text-sm text-muted-foreground">Intensiv, expert-geführt, maßgeschneidert</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>2 bis 4 Tage intensive Workshops</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Vor Ort oder Remote mit Team</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Geleitet von AI-Experten & Facilitatoren</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Maßgeschneidert für Ihre Bedürfnisse</span>
                  </li>
                </ul>
                <div className="pt-4 border-t space-y-4">
                  <p className="text-sm font-semibold">Preis auf Anfrage</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/design-sprint-workshop">Workshop-Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Online Design Sprint */}
            <Card className="hover:shadow-hover transition-all relative">
              <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Neu verfügbar
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <Laptop className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Online Design Sprint</h3>
                  <p className="text-sm text-muted-foreground">Flexibel, strukturiert, selbstgeführt</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Strukturierter Prozess</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Selbstgeführt mit digitalen Tools</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Flexibel für verteilte Teams</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Schritt-für-Schritt Anleitung</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Experten-Input optional</span>
                  </li>
                </ul>
                <div className="pt-4 border-t space-y-4">
                  <p className="text-sm font-semibold">Preis auf Anfrage</p>
                  <Button className="w-full bg-black hover:bg-black/90 text-white" asChild>
                    <Link to="/sprint-uebersicht/online">Online Sprint entdecken</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Dual Option */}
      <section id="cta-section" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#FFF0ED' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Card className="bg-white border-2 shadow-2xl max-w-5xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center space-y-8">
                <h2 className="text-4xl font-bold">
                  Bereit für Ihren{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    AI Design Sprint?
                  </span>
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Wählen Sie den Ansatz, der am besten zu Ihrem Team passt
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Workshop buchen</h3>
                    <p className="text-muted-foreground text-sm">
                      Facilitierter 2-Tage Workshop mit AI-Experten
                    </p>
                    <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                      Kontakt aufnehmen
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Online Sprint starten</h3>
                    <p className="text-muted-foreground text-sm">
                      Selbstgeführter Online Sprint
                    </p>
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <Link to="/sprint-uebersicht/online">Mehr erfahren</Link>
                    </Button>
                  </div>
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