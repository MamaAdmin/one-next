import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { Target, Zap, GitBranch, Check, Users, Database, Layers, Map, FileText, Settings } from "lucide-react";
import { SEO } from "@/components/SEO";
import { createServiceSchema, createBreadcrumbSchema } from "@/config/seoConfig";

const CustomAIDevelopment = () => {
  const { content, updateContent } = usePageContent("custom-ai-development");
  const { isContentManager } = useContentManager();
  const [isEditMode, setIsEditMode] = useState(false);


  const structuredData = [
    createServiceSchema(
      "Individuelle KI-Entwicklung mit BMAD",
      "Maßgeschneiderte KI-Lösungen von der Konzeption bis zur Umsetzung. Strukturiert nach dem BMAD-Framework für klare, umsetzungsreife KI-Projekte.",
      "https://one-next.de/custom-ai-development"
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Services", url: "https://one-next.de/#services" },
      { name: "Individuelle KI-Entwicklung", url: "https://one-next.de/custom-ai-development" }
    ])
  ];

  const approachSteps = [
    {
      icon: Target,
      title: "Problem Framing",
      description: "Gemeinsam identifizieren wir die relevanten Herausforderungen, Nutzerbedürfnisse und Geschäftspotenziale.",
      result: "Klar definierte Opportunity Statements und priorisierte Problemfelder."
    },
    {
      icon: Zap,
      title: "Design Sprint",
      description: "In nur wenigen Tagen entwickeln wir konkrete Lösungsideen, erste Prototypen und sammeln Nutzerfeedback.",
      result: "Validiertes Konzept mit ersten User Journeys und Use Cases."
    },
    {
      icon: GitBranch,
      title: "BMAD-Integration",
      description: "Die Ergebnisse aus Problem Framing und Design Sprint überführen wir in einen strukturierten BMAD-Blueprint – einen vollständigen Bauplan für die KI-Entwicklung.",
      result: "Vollständiger Blueprint für externe Entwickler."
    }
  ];

  const bmadAdvantages = [
    {
      icon: Target,
      title: "Business Alignment",
      description: "Klare Verbindung von KI-Projekt zu strategischen Unternehmenszielen."
    },
    {
      icon: FileText,
      title: "Use Case Definition",
      description: "Präzise beschriebene KI-Anwendungsfälle mit Mehrwert, Priorisierung und Abgrenzung."
    },
    {
      icon: Database,
      title: "Datenanforderungen",
      description: "Übersicht über relevante Datenquellen, Qualität, Volumen und erste Datenschutz-/Compliance-Bewertung."
    },
    {
      icon: Settings,
      title: "KI Solution Design",
      description: "Vorstrukturierte Modell-Ideen (z. B. Klassifikation, Generative KI, Empfehlungssysteme) basierend auf den validierten Use Cases."
    },
    {
      icon: Layers,
      title: "Architektur-Blueprint",
      description: "High-Level-Skizze von Systemarchitektur, Schnittstellen und Integrationspunkten."
    },
    {
      icon: Users,
      title: "Rollen & Verantwortlichkeiten",
      description: "Zuweisung nach BMAD-Methodik (Analyst, Product Manager, Architect, Orchestrator, Developer)."
    },
    {
      icon: Map,
      title: "Roadmap & Milestones",
      description: "Klare Umsetzungsschritte für externe Entwickler, ergänzt durch Akzeptanzkriterien."
    }
  ];

  const benefits = [
    "Zeit sparen durch klare Vorgaben",
    "Risiken reduzieren durch validierte Konzepte",
    "Business-Relevanz von Anfang an sicherstellen",
    "Nahtlose Übergabe an externe Entwickler"
  ];

  return (
    <>
      <SEO
        title="Individuelle KI-Entwicklung | KI-Lösungen mit BMAD | one-next"
        description="Von der Idee zum umsetzungsreifen KI-Projekt: Mit dem BMAD-Ansatz bringt one-next Ihr Unternehmen mit maßgeschneiderten KI-Lösungen auf die nächste Stufe."
        keywords="KI-Entwicklung, Individuelle KI-Entwicklung, BMAD Framework, KI-Beratung, KI-Lösungen, Blueprint"
        canonical="https://one-next.de/custom-ai-development"
        structuredData={structuredData}
      />
      <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {isContentManager && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Badge with Icon */}
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Individuelle KI-Entwicklung</span>
            </div>
            
            <InlineTextField
              value={content.hero_title || "Von der Idee zum umsetzungsreifen KI-Projekt"}
              onSave={(value) => updateContent("hero_title", value, "text")}
              isEditMode={isEditMode}
              as="h1"
              className="text-5xl lg:text-6xl font-bold text-primary-foreground"
            />
            
            <InlineTextArea
              value={content.hero_description || "Nicht jedes Unternehmen hat die Kapazität oder das interne Know-how, KI-Lösungen selbst zu entwickeln. Genau hier setzen wir an: Wir bringen Ihre Idee in eine klare, umsetzungsreife Form – von der ersten Problemdefinition bis zum vollständigen Blueprint, mit dem ein Entwicklungsteam direkt starten kann. Strukturiert nach dem BMAD-Framework."}
              onSave={(value) => updateContent("hero_description", value, "text")}
              isEditMode={isEditMode}
              className="text-xl text-primary-foreground/90 leading-relaxed"
              minRows={3}
            />
            
            {/* CTA Button */}
            <div className="mt-6">
              <CalendarBookingDialog
                buttonText="Erstgespräch buchen"
                buttonSize="lg"
                buttonClassName="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section id="approach" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <InlineTextField
                value={content.approach_title || "🔹 So funktioniert es"}
                onSave={(value) => updateContent("approach_title", value, "text")}
                isEditMode={isEditMode}
                as="h2"
                className="text-3xl md:text-4xl font-bold"
              />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {approachSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{step.description}</p>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">→ Ergebnis:</p>
                      <p className="text-sm text-muted-foreground">{step.result}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* BMAD Advantages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <InlineTextField
                value={content.bmad_title || "✅ Das ist in Ihrem BMAD-Blueprint bereits enthalten"}
                onSave={(value) => updateContent("bmad_title", value, "text")}
                isEditMode={isEditMode}
                as="h2"
                className="text-3xl md:text-4xl font-bold"
              />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bmadAdvantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <Card key={index} className="hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{advantage.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Nächster Schritt: Externe Umsetzung
            </h2>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-lg mb-6">
                  <InlineTextArea
                    value={content.benefits_description || "Mit diesem vollständig vorbereiteten BMAD-Blueprint können externe Entwickler und Experten sofort produktiv starten – ohne Umwege, ohne offene Grundsatzfragen."}
                    onSave={(value) => updateContent("benefits_description", value, "text")}
                    isEditMode={isEditMode}
                    className="text-lg"
                  />
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-accent-soft">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Bereit für Ihre individuelle KI-Lösung?
            </h2>
            <p className="text-xl text-muted-foreground">
              Vereinbaren Sie ein unverbindliches Erstgespräch und erfahren Sie, wie der BMAD-Ansatz Ihr KI-Projekt zum Erfolg führt.
            </p>
            <div className="pt-4">
              <CalendarBookingDialog
                buttonText="Jetzt Erstgespräch buchen"
                buttonSize="lg"
                buttonClassName="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
};

export default CustomAIDevelopment;
