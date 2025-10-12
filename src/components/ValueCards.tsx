import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import geometricPaper from "@/assets/geometric-paper.jpg";
import decorativeEgg from "@/assets/decorative-egg.jpg";
import pinkPodium from "@/assets/pink-podium.jpg";

interface ValueCardsProps {
  isEditMode?: boolean;
}

const ValueCards = ({ isEditMode = false }: ValueCardsProps) => {
  const { content, updateContent } = usePageContent('value-cards');
  
  return (
    <section className="py-8 md:py-16 bg-[#fff0ed]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Mobile: Stack vertically, Tablet: 2 cols, Desktop: Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Expertise Card - spans 1 col on mobile, 2 cols on tablet, 1 col on desktop */}
          <div className="bg-secondary rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 space-y-4 md:space-y-6 md:col-span-2 lg:col-span-1">
            <InlineTextField
              value={content.expertise_title || 'Expertise'}
              onSave={(value) => updateContent('expertise_title', value)}
              isEditMode={isEditMode}
              className="text-2xl md:text-4xl font-light"
              placeholder="Titel des Expertise-Abschnitts"
              as="h2"
            />
            <InlineTextArea
              value={content.expertise_description || 'Wir verbinden Menschen, Technologie und Prozesse. Mit agilen Methoden und Frameworks wie dem Design Sprint helfen wir, in wenigen Tagen Ideen zu entwickeln, Prototypen zu testen und schneller die richtigen Entscheidungen zu treffen. Unser Fokus: Strategieberatung, Coaching, maßgeschneiderte IT- und AI-Lösungen sowie die Förderung digitaler Kompetenz.'}
              onSave={(value) => updateContent('expertise_description', value)}
              isEditMode={isEditMode}
              className="text-sm md:text-base text-foreground/80 leading-relaxed"
              placeholder="Beschreibung des Expertise-Abschnitts"
              minRows={3}
            />
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              {isEditMode ? (
                <InlineTextField
                  value={content.expertise_button || 'Kostenlose Beratung vereinbaren'}
                  onSave={(value) => updateContent('expertise_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button-Text"
                  as="span"
                />
              ) : (
                content.expertise_button || 'Kostenlose Beratung vereinbaren'
              )}
            </Button>
          </div>

          {/* Decorative Image 1 - hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group lg:col-span-1">
            <img 
              src={geometricPaper} 
              alt="Dekorative geometrische Papierobjekte"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Effizienz Card - black background */}
          <div className="bg-foreground text-background rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 space-y-4 md:space-y-6 lg:col-span-1">
            <InlineTextField
              value={content.efficiency_title || 'Effizienz'}
              onSave={(value) => updateContent('efficiency_title', value)}
              isEditMode={isEditMode}
              className="text-2xl md:text-4xl font-light text-background"
              placeholder="Titel des Effizienz-Abschnitts"
              as="h2"
            />
            <InlineTextArea
              value={content.efficiency_description || 'Wir generieren Effizienz durch die neusten Technologien und Automatisierungen'}
              onSave={(value) => updateContent('efficiency_description', value)}
              isEditMode={isEditMode}
              className="text-sm md:text-base text-background/80 leading-relaxed"
              placeholder="Beschreibung des Effizienz-Abschnitts"
              minRows={2}
            />
            <Button variant="outline" size="lg" className="rounded-full border-background/20 hover:bg-background/10 text-foreground hover:text-background">
              {isEditMode ? (
                <InlineTextField
                  value={content.efficiency_button || 'Neuesten Bericht lesen'}
                  onSave={(value) => updateContent('efficiency_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button-Text"
                  as="span"
                />
              ) : (
                content.efficiency_button || 'Neuesten Bericht lesen'
              )}
            </Button>
          </div>

          {/* Decorative Image 2 - hidden on mobile */}
          <div className="hidden md:block rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group lg:col-span-1">
            <img 
              src={decorativeEgg} 
              alt="Dekoratives Oster-Ei"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Erfolg Card - gold background */}
          <div className="rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 space-y-4 md:space-y-6 bg-[#b0a377] lg:col-span-1">
            <InlineTextField
              value={content.success_title || 'Erfolg'}
              onSave={(value) => updateContent('success_title', value)}
              isEditMode={isEditMode}
              className="text-2xl md:text-4xl font-light"
              placeholder="Titel des Erfolgs-Abschnitts"
              as="h2"
            />
            <InlineTextArea
              value={content.success_description || 'Erst wenn unsere Kunden erfolgreich mit unseren Produkten sind, sind wir zufrieden!'}
              onSave={(value) => updateContent('success_description', value)}
              isEditMode={isEditMode}
              className="text-sm md:text-base text-foreground/80 leading-relaxed"
              placeholder="Beschreibung des Erfolgs-Abschnitts"
              minRows={2}
            />
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              {isEditMode ? (
                <InlineTextField
                  value={content.success_button || 'Unsere Lösungen'}
                  onSave={(value) => updateContent('success_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button-Text"
                  as="span"
                />
              ) : (
                content.success_button || 'Unsere Lösungen'
              )}
            </Button>
          </div>

          {/* Starburst Icon Card with decorative image - shown on all screens */}
          <div className="bg-muted rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group lg:col-span-1">
            <img 
              src={pinkPodium} 
              alt="Dekoratives pinkes Podest"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueCards;
