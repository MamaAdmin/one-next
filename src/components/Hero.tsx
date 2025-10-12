import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-ai-illustration.jpg";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";

interface HeroProps {
  isEditMode?: boolean;
}

const Hero = ({ isEditMode = false }: HeroProps) => {
  const { content, updateContent } = usePageContent('index');
  return (
    <section className="relative min-h-[50vh] flex items-center bg-background pt-20">
      <div className="container mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-fade-in">
            <InlineTextField
              value={content.hero_title || 'wir weisen dir den weg nach vorn'}
              onSave={(value) => updateContent('hero_title', value)}
              isEditMode={isEditMode}
              className="text-6xl lg:text-8xl font-light leading-tight lowercase"
              placeholder="Titel des Hero-Bereichs"
              as="h1"
            />
          </div>

          <div className="relative animate-fade-in-up flex justify-end">
            <div className="w-64 h-64 relative">
              {/* Starburst icon */}
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
                      strokeWidth="3"
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
