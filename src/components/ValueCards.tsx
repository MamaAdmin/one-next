import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";

interface ValueCardsProps {
  isEditMode?: boolean;
}

const ValueCards = ({ isEditMode = false }: ValueCardsProps) => {
  const { content, updateContent } = usePageContent('value-cards');
  return (
    <section className="py-16 bg-[#fff0ed]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Expertise Card */}
          <div className="bg-secondary rounded-[2rem] p-12 space-y-6">
            <InlineTextField
              value={content.expertise_title || 'Expertise'}
              onSave={(value) => updateContent('expertise_title', value)}
              isEditMode={isEditMode}
              className="text-4xl font-light"
              placeholder="Expertise title"
              as="h2"
            />
            <InlineTextArea
              value={content.expertise_description || 'Unsere Firma ist spezialisiert auf digitale Transformation, Strategieberatung und Coaching. Wir bieten maßgeschneiderte IT-Lösungen, AI-Implementierungsstrategien, optimieren Geschäftsprozesse und fördern digitale Kompetenz durch gezielte Schulungen und Workshops.'}
              onSave={(value) => updateContent('expertise_description', value)}
              isEditMode={isEditMode}
              className="text-foreground/80 leading-relaxed"
              placeholder="Expertise description"
              minRows={4}
            />
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              {isEditMode ? (
                <InlineTextField
                  value={content.expertise_button || 'Kostenlose Beratung vereinbaren'}
                  onSave={(value) => updateContent('expertise_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button text"
                  as="span"
                />
              ) : (
                content.expertise_button || 'Kostenlose Beratung vereinbaren'
              )}
            </Button>
          </div>

          {/* Effizienz Card */}
          <div className="bg-foreground text-background rounded-[2rem] p-12 space-y-6">
            <InlineTextField
              value={content.efficiency_title || 'Effizienz'}
              onSave={(value) => updateContent('efficiency_title', value)}
              isEditMode={isEditMode}
              className="text-4xl font-light text-background"
              placeholder="Efficiency title"
              as="h2"
            />
            <InlineTextArea
              value={content.efficiency_description || 'Wir generieren Effizienz durch die neusten Technologien und Automatisierungen'}
              onSave={(value) => updateContent('efficiency_description', value)}
              isEditMode={isEditMode}
              className="text-background/80 leading-relaxed"
              placeholder="Efficiency description"
              minRows={2}
            />
            <Button variant="outline" size="lg" className="rounded-full border-background/20 hover:bg-background/10 text-foreground hover:text-foreground">
              {isEditMode ? (
                <InlineTextField
                  value={content.efficiency_button || 'Neuesten Bericht lesen'}
                  onSave={(value) => updateContent('efficiency_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button text"
                  as="span"
                />
              ) : (
                content.efficiency_button || 'Neuesten Bericht lesen'
              )}
            </Button>
          </div>
        </div>

        {/* Erfolg Card */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-[2rem] p-12 space-y-6 bg-[#b0a377]">
            <InlineTextField
              value={content.success_title || 'Erfolg'}
              onSave={(value) => updateContent('success_title', value)}
              isEditMode={isEditMode}
              className="text-4xl font-light"
              placeholder="Success title"
              as="h2"
            />
            <InlineTextArea
              value={content.success_description || 'Erst wenn unsere Kunden erfolgreich mit unseren Produkten sind, sind wir zufrieden!'}
              onSave={(value) => updateContent('success_description', value)}
              isEditMode={isEditMode}
              className="text-foreground/80 leading-relaxed"
              placeholder="Success description"
              minRows={2}
            />
            <Button variant="outline" size="lg" className="rounded-full border-foreground/20 hover:bg-foreground/5">
              {isEditMode ? (
                <InlineTextField
                  value={content.success_button || 'Unsere Lösungen'}
                  onSave={(value) => updateContent('success_button', value)}
                  isEditMode={isEditMode}
                  placeholder="Button text"
                  as="span"
                />
              ) : (
                content.success_button || 'Unsere Lösungen'
              )}
            </Button>
          </div>

          <div className="bg-muted rounded-[2rem] p-12 flex items-center justify-center">
            <div className="w-48 h-48 relative">
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

export default ValueCards;
