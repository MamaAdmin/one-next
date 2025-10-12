import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import workshopImage from "@/assets/workshop-collaboration.jpg";
export const WorkshopComparisonSection = () => {
  return <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Hero Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={workshopImage} 
            alt="Workshop Collaboration" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ihr Weg zum erfolgreichen Design Sprint
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ist Ihre Challenge klar definiert? Wählen Sie den passenden Workshop für Ihren Bedarf.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Problem Framing Workshop */}
          <Card className="p-8 relative border-2 border-secondary hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-4 left-8">
              <span className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                <Target className="w-4 h-4" />
                Startpunkt
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Problem-Framing-Workshop
              </h3>
              
              <p className="text-lg font-semibold text-primary mb-4">
                Wenn Ihre Challenge noch unklar ist
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">1–2 Tage intensive Klärung</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">Challenge präzise definieren</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">Zielgruppe und Business Value priorisieren</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">Sprint-Ready machen</p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Ein klares Sprint-Briefing für den Design Sprint
                </p>
              </div>
              
              <div className="space-y-3">
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/problem-framing-workshop">
                    Workshop Details ansehen
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/workshop-registration?type=problem-framing">
                    Workshop anfragen
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Design Sprint Workshop */}
          <Card className="p-8 relative border-2 border-primary hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-4 left-8">
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Nächster Schritt
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Design Sprint Workshop
              </h3>
              
              <p className="text-lg font-semibold text-primary mb-4">
                Wenn die Challenge klar ist
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">2–4 Tage intensiver Workshop</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">Vor Ort oder remote mit Team</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">Geleitet von AI-Experten & Facilitatoren</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">KI-Tools in allen Phasen integriert</p>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Getesteter Prototyp mit klaren Insights
                </p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/design-sprint-workshop">
                    Workshop Details ansehen
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/workshop-registration?type=design-sprint">
                    Workshop buchen
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Flow Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-muted/50 rounded-full px-6 py-3">
            <span className="text-sm font-semibold">So funktioniert es:</span>
            <span className="text-sm">Unklar?</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="text-sm">Problem-Framing</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span className="text-sm">Design Sprint</span>
          </div>
        </div>
      </div>
    </section>;
};