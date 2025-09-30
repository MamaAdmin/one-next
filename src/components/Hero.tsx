import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-ai-illustration.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Ihr vertrauenswürdiger Partner für{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                KI-Entwicklung
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Nutzen Sie unsere KI-Expertise und bringen Sie Ihr Unternehmen mit maßgeschneiderter
              Machine Learning Software auf die nächste Stufe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              >
                KI-Beratung vereinbaren
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6"
              >
                Mehr erfahren
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <img
              src={heroImage}
              alt="AI Technology Illustration"
              className="w-full h-auto rounded-2xl shadow-hover animate-float"
            />
          </div>
        </div>

        <a 
          href="#about" 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="w-8 h-8 text-primary" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
