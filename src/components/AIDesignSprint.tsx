import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const AIDesignSprint = () => {
  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <Card className="bg-background/95 backdrop-blur-sm border-none shadow-2xl max-w-5xl mx-auto">
          <CardContent className="p-12">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI Design Sprint</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold">
                Entdecken Sie die Möglichkeiten künstlicher Intelligenz und
                <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                  transformieren Sie Ihr Unternehmen
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Mit zwei Tagen intensiver Arbeit identifiziert Ihr Team zusammen mit unseren
                KI-Ingenieuren und Design-Facilitatoren das Potenzial von KI-Lösungen, um neue
                Ideen und Visionen für Ihr Unternehmen zu schaffen.
              </p>

              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 mt-6"
              >
                Mehr über AI Design Sprint erfahren
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIDesignSprint;
