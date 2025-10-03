import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Lightbulb, TrendingUp, Users, Building2, Brain, Shield, Rocket, BarChart3, Cpu, GraduationCap, Scale } from "lucide-react";

const AIConsultingServices = () => {
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
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI Consulting Services</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground">
              Strategische KI-Beratung für Ihren nachhaltigen Wettbewerbsvorteil
            </h1>
            
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Entwickeln Sie eine maßgeschneiderte AI-Roadmap für Ihr Unternehmen. Wir analysieren Ihre 
              Geschäftsziele, identifizieren strategische AI-Potenziale und erstellen einen langfristigen 
              Implementierungsplan für Ihre erfolgreiche digitale Transformation.
            </p>
            
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6 mt-6"
            >
              Beratungsgespräch vereinbaren
            </Button>
          </div>
        </div>
      </section>

      {/* What is AI Consulting Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              Was ist{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI Consulting?
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI Consulting ist mehr als nur Technologieberatung – es ist ein strategischer Ansatz zur 
              ganzheitlichen Transformation Ihres Unternehmens. Wir helfen Ihnen, künstliche Intelligenz 
              nicht als isolierte Technologie, sondern als integralen Bestandteil Ihrer Geschäftsstrategie 
              zu verstehen und einzusetzen.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Von der ersten Potenzialanalyse über die Strategieentwicklung bis zur Implementierungsplanung – 
              unsere erfahrenen AI-Experten begleiten Sie auf dem gesamten Weg Ihrer AI-Journey. Wir 
              identifizieren nicht nur technologische Möglichkeiten, sondern bewerten auch deren 
              wirtschaftlichen Impact, organisatorische Anforderungen und ethische Implikationen.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Unser Beratungsansatz kombiniert technisches Know-how mit tiefer Branchenkenntnis und 
              betriebswirtschaftlichem Verständnis, um maßgeschneiderte AI-Lösungen zu entwickeln, die 
              echten Business Value schaffen.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              Unser{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Beratungsansatz
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <Target className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Geschäftsziele verstehen</h3>
                  <p className="text-muted-foreground">
                    Wir analysieren Ihre strategischen Ziele und identifizieren, wo AI den größten 
                    Impact erzielen kann.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <Brain className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">AI-Potenziale identifizieren</h3>
                  <p className="text-muted-foreground">
                    Erkennung konkreter Use Cases und Bewertung ihrer technischen Machbarkeit und 
                    ihres ROI.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <Lightbulb className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Roadmap entwickeln</h3>
                  <p className="text-muted-foreground">
                    Erstellung einer detaillierten Implementierungsstrategie mit klaren Meilensteinen 
                    und Prioritäten.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <Cpu className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Technologie-Auswahl</h3>
                  <p className="text-muted-foreground">
                    Empfehlung der optimalen AI-Technologien und -Plattformen für Ihre spezifischen 
                    Anforderungen.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <BarChart3 className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">ROI-Bewertung</h3>
                  <p className="text-muted-foreground">
                    Quantifizierung des erwarteten Business Value und Entwicklung von KPIs zur 
                    Erfolgsmessung.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <Users className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Change Management</h3>
                  <p className="text-muted-foreground">
                    Unterstützung bei der organisatorischen Transformation und Mitarbeiter-Enablement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Consulting Services Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Unsere{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Beratungsleistungen
            </span>
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">AI-Strategie-Entwicklung</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Entwicklung einer umfassenden AI-Strategie, die mit Ihren Unternehmenszielen 
                  abgestimmt ist. Wir definieren Vision, Ziele und konkrete Maßnahmen für Ihre 
                  AI-Transformation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Machbarkeitsanalysen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detaillierte technische und wirtschaftliche Bewertung Ihrer AI-Ideen. Wir prüfen 
                  Datenverfügbarkeit, technologische Reife und erwarteten ROI.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Technologie-Evaluierung</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Auswahl der optimalen AI-Technologien, Tools und Plattformen. Von Cloud-Infrastruktur 
                  bis zu spezialisierten ML-Frameworks – wir finden die beste Lösung.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Implementierungs-Roadmaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Erstellung detaillierter Implementierungspläne mit Zeitlinien, Ressourcenplanung, 
                  Budgetierung und Risk Management für erfolgreiche AI-Projekte.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Team-Training & Workshops</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Befähigung Ihrer Teams durch praxisnahe Trainings, Workshops und Knowledge Transfer. 
                  Von AI-Grundlagen bis zu spezialisierten Themen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <Scale className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">Ethik & Governance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Entwicklung von AI-Governance-Frameworks, ethischen Richtlinien und Compliance-Strategien 
                  für verantwortungsvollen AI-Einsatz.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-center">
              Branchen &{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Use Cases
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Wir beraten Unternehmen in verschiedenen Branchen und entwickeln AI-Lösungen für vielfältige 
              Anwendungsfälle:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <Building2 className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Fertigung & Industrie</h3>
                  <p className="text-muted-foreground">
                    Predictive Maintenance, Qualitätskontrolle, Supply Chain Optimierung, 
                    Produktionsplanung und autonome Systeme.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <TrendingUp className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Finanzdienstleistungen</h3>
                  <p className="text-muted-foreground">
                    Fraud Detection, Risikomanagement, algorithmischer Handel, 
                    Kreditbewertung und personalisierte Kundenberatung.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <Users className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Handel & E-Commerce</h3>
                  <p className="text-muted-foreground">
                    Personalisierung, Empfehlungssysteme, dynamische Preisgestaltung, 
                    Nachfrageprognose und Customer Experience Optimierung.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <Shield className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-bold">Gesundheitswesen</h3>
                  <p className="text-muted-foreground">
                    Diagnostische Assistenzsysteme, Patientendatenanalyse, 
                    Medikamentenentwicklung und Ressourcenoptimierung.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why one-next Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">
            Warum{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              one-next?
            </span>
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <Brain className="w-10 h-10 text-primary" />
                <h3 className="text-xl font-bold">Tiefe Expertise</h3>
                <p className="text-muted-foreground">
                  Erfahrene AI-Experten, Data Scientists und Branchenspezialisten mit nachweislicher 
                  Erfolgsbilanz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <Target className="w-10 h-10 text-primary" />
                <h3 className="text-xl font-bold">Ganzheitlicher Ansatz</h3>
                <p className="text-muted-foreground">
                  Von Strategie über Technologie bis Change Management – wir decken alle Aspekte 
                  Ihrer AI-Transformation ab.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <Rocket className="w-10 h-10 text-primary" />
                <h3 className="text-xl font-bold">Praxiserfahrung</h3>
                <p className="text-muted-foreground">
                  Wir kennen die Herausforderungen der Implementierung und bringen bewährte Best 
                  Practices mit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-hover transition-all">
              <CardContent className="p-6 space-y-3">
                <BarChart3 className="w-10 h-10 text-primary" />
                <h3 className="text-xl font-bold">Messbare Ergebnisse</h3>
                <p className="text-muted-foreground">
                  Fokus auf ROI und Business Value – wir entwickeln Lösungen, die echten Mehrwert 
                  schaffen.
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
              Starten Sie Ihre AI-Journey mit uns
            </h2>
            
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Lassen Sie uns gemeinsam herausfinden, wie künstliche Intelligenz Ihr Unternehmen 
              transformieren kann. Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren 
              AI-Experten und erhalten Sie eine erste Einschätzung Ihrer AI-Potenziale.
            </p>
            
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 transition-opacity text-lg px-8 py-6"
            >
              Kostenloses Beratungsgespräch vereinbaren
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIConsultingServices;
