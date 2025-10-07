import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-team-collaboration.jpg";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";

interface HeroProps {
  isEditMode?: boolean;
}

const Hero = ({ isEditMode = false }: HeroProps) => {
  const { content, updateContent } = usePageContent('index');
  return (
    <section className="relative min-h-[70vh] flex items-center bg-background pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-fade-in">
            <InlineTextField
              value={content.hero_title || 'we define your way forward'}
              onSave={(value) => updateContent('hero_title', value)}
              isEditMode={isEditMode}
              className="text-5xl md:text-6xl lg:text-8xl font-light leading-tight lowercase"
              placeholder="Hero title"
              as="h1"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
