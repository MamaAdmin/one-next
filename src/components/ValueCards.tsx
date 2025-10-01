import { Button } from "@/components/ui/button";
const ValueCards = () => {
  return <section className="py-16 bg-[#fff0ed]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Expertise Card */}
          <div className="bg-secondary rounded-[2rem] p-12 space-y-6">
            <h2 className="text-4xl font-light">Expertise</h2>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Unsere Firma ist spezialisiert auf digitale Transformation, Strategieberatung und Coaching.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Wir bieten maßgeschneiderte IT-Lösungen, AI-Implementierungsstrategien, optimieren 
                Geschäftsprozesse und fördern digitale Kompetenz durch gezielte Schulungen und Workshops.
              </p>
            </div>
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              Kostenlose Beratung vereinbaren
            </Button>
          </div>

          {/* Effizienz Card */}
          <div className="bg-foreground text-background rounded-[2rem] p-12 space-y-6">
            <h2 className="text-4xl font-light">Effizienz</h2>
            <p className="text-background/80 leading-relaxed">
              Wir generieren Effizienz durch die neusten Technologien und Automatisierungen
            </p>
            <Button variant="outline" size="lg" className="rounded-full border-background/20 hover:bg-background/10 text-foreground hover:text-foreground">
              Neuesten Bericht lesen
            </Button>
          </div>
        </div>

        {/* Erfolg Card */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-[2rem] p-12 space-y-6 bg-stone-300">
            <h2 className="text-4xl font-light">Erfolg</h2>
            <p className="text-foreground/80 leading-relaxed">
              Erst wenn unsere Kunden erfolgreich mit unseren Produkten sind sind wir zufrieden!
            </p>
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              Unsere Lösungen
            </Button>
          </div>

          <div className="bg-muted rounded-[2rem] p-12 flex items-center justify-center">
            <div className="w-48 h-48 relative">
              {/* Starburst icon */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {Array.from({
                length: 24
              }).map((_, i) => {
                const angle = i * 360 / 24;
                const x1 = 100 + Math.cos(angle * Math.PI / 180) * 40;
                const y1 = 100 + Math.sin(angle * Math.PI / 180) * 40;
                const x2 = 100 + Math.cos(angle * Math.PI / 180) * 100;
                const y2 = 100 + Math.sin(angle * Math.PI / 180) * 100;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" className="text-foreground" />;
              })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ValueCards;