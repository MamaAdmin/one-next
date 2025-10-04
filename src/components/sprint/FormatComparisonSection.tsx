import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Laptop, Check } from "lucide-react";
import { Link } from "react-router-dom";
const FormatComparisonSection = () => {
  return <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Wählen Sie Ihren{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Design Sprint Ansatz
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beide Formate führen zu AI-Innovation - wählen Sie den Ansatz, der am besten zu Ihrem Team passt
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Facilitated Workshop Card */}
          <Card className="border-border hover:shadow-hover transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Design Sprint Workshop (Mit AI)</h3>
                <p className="text-muted-foreground">
                  Intensiv, expert-geführt, maßgeschneidert
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>2 bis 4 Tage intensive Workshops</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Vor Ort oder Remote mit Team</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Geleitet von AI-Experten & Facilitatoren</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Maßgeschneidert für Ihre Bedürfnisse</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Preis auf Anfrage</p>
              <Button variant="outline" className="w-full" onClick={() => {
                const section = document.getElementById('workshop-details');
                if (section) {
                  const navHeight = 80;
                  const elementPosition = section.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - navHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}>
                Workshop Details
              </Button>
              </div>
            </CardContent>
          </Card>

          {/* Online Sprint Card - Highlighted */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 hover:shadow-hover transition-all duration-300 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-none">
              Neu verfügbar
            </Badge>
            
            <CardContent className="p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Laptop className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Online Design Sprint</h3>
                <p className="text-muted-foreground">
                  Flexibel, strukturiert, selbstgeführt
                </p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>strukturierter Prozesse)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Selbstgeführt mit digitalen Tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Flexibel für verteilte Teams</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Schritt-für-Schritt Anleitung</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Experten-Input optional</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Preis auf Anfrage</p>
                <Button className="w-full bg-gradient-primary hover:opacity-90" asChild>
                  <Link to="/ai-design-sprint/online">Online Sprint entdecken</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default FormatComparisonSection;