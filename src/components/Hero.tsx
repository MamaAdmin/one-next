import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";

interface HeroProps {
  isEditMode?: boolean;
}

const Hero = ({ isEditMode = false }: HeroProps) => {
  const { content, updateContent } = usePageContent('index');
  return (
    <section className="relative min-h-[70vh] flex items-center bg-gradient-hero pt-24 border-b border-border/60">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              KI-Entwicklung · Design Sprints
            </span>
            <InlineTextField
              value={content.hero_title || 'we define your way forward'}
              onSave={(value) => updateContent('hero_title', value)}
              isEditMode={isEditMode}
              className="font-display text-6xl md:text-7xl lg:text-[8rem] lowercase text-foreground"
              placeholder="Titel des Hero-Bereichs"
              as="h1"
            />
          </div>

          <div className="relative animate-fade-in-up flex justify-center lg:justify-end">
            <div className="w-56 h-56 md:w-64 md:h-64 relative opacity-90">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const x1 = 100 + Math.cos((angle * Math.PI) / 180) * 40;
                  const y1 = 100 + Math.sin((angle * Math.PI) / 180) * 40;
                  const x2 = 100 + Math.cos((angle * Math.PI) / 180) * 100;
                  const y2 = 100 + Math.sin((angle * Math.PI) / 180) * 100;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-foreground"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
