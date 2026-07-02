import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import workshopPostits from "@/assets/workshop-stickynotes-blue.jpg";
import workshopTable from "@/assets/workshop-table.jpg";
import { CalendarBookingDialog } from "./CalendarBookingDialog";

interface ValueCardsProps {
  isEditMode?: boolean;
}

const ValueCards = ({ isEditMode = false }: ValueCardsProps) => {
  const { content, updateContent } = usePageContent('value-cards');

  return (
    <section className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:auto-rows-[380px]">

          {/* Expertise – Text-Karte */}
          <div className="bg-secondary rounded-2xl p-8 md:p-10 md:col-span-2 lg:col-span-1 h-full flex flex-col justify-between text-foreground">
            <div className="space-y-5">
              <InlineTextField
                value={content.expertise_title || 'Expertise'}
                onSave={(value) => updateContent('expertise_title', value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light tracking-tight"
                placeholder="Titel des Expertise-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={content.expertise_description || 'Wir verbinden Menschen, Technologie und Prozesse. Mit agilen Methoden wie dem Design Sprint entwickeln und testen wir Ideen in wenigen Tagen – für schnellere, bessere Entscheidungen. Unser Fokus: Strategie, Coaching und digitale Kompetenz.'}
                onSave={(value) => updateContent('expertise_description', value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-foreground/75 leading-relaxed"
                placeholder="Beschreibung des Expertise-Abschnitts"
                minRows={3}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <CalendarBookingDialog
                buttonText={content.expertise_button || 'Kostenlose Beratung vereinbaren'}
                buttonSize="lg"
                buttonClassName="rounded-full border border-foreground/15 bg-background text-foreground hover:bg-background/90"
              />
            </div>
          </div>

          {/* Bild 1 – Workshop, Post-its (großformatig, span 2 auf desktop) */}
          <div className="rounded-2xl overflow-hidden group md:col-span-2 lg:col-span-2 h-64 md:h-full">
            <img
              src={workshopPostits}
              alt="Hände arbeiten an einer Post-it-Wand während eines Design Sprints"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'saturate(0.9)' }}
            />
          </div>

          {/* Bild 2 – Arbeitstisch */}
          <div className="rounded-2xl overflow-hidden group md:col-span-2 lg:col-span-1 h-64 md:h-full">
            <img
              src={workshopTable}
              alt="Zwei Personen arbeiten gemeinsam an Wireframes und Skizzen"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'saturate(0.9)' }}
            />
          </div>

          {/* Effizienz – schwarze Karte */}
          <div className="bg-foreground text-background rounded-2xl p-8 md:p-10 lg:col-span-1 h-full flex flex-col justify-between">
            <div className="space-y-5">
              <InlineTextField
                value={content.efficiency_title || 'Effizienz'}
                onSave={(value) => updateContent('efficiency_title', value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light text-background tracking-tight"
                placeholder="Titel des Effizienz-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={content.efficiency_description || 'Mit modernsten Technologien und Automatisierungen reduzieren wir Aufwände, beschleunigen Prozesse und schaffen Freiräume für wertschöpfende Tätigkeiten.'}
                onSave={(value) => updateContent('efficiency_description', value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-background/75 leading-relaxed"
                placeholder="Beschreibung des Effizienz-Abschnitts"
                minRows={2}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <Button variant="outline" size="lg" className="rounded-full border-background/25 hover:bg-background/10 text-foreground hover:text-background">
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
          </div>

          {/* Erfolg – ruhige, gedämpfte Karte */}
          <div className="rounded-2xl p-8 md:p-10 bg-muted lg:col-span-1 h-full flex flex-col justify-between md:col-span-2">
            <div className="space-y-5">
              <InlineTextField
                value={content.success_title || 'Erfolg'}
                onSave={(value) => updateContent('success_title', value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light tracking-tight"
                placeholder="Titel des Erfolgs-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={content.success_description || 'Erst wenn unsere Kunden erfolgreich sind, sind wir zufrieden. Mit Beratung, Coaching und agilen Methoden sorgen wir dafür, dass unsere Umsetzungen Wirkung zeigen.'}
                onSave={(value) => updateContent('success_description', value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-foreground/75 leading-relaxed"
                placeholder="Beschreibung des Erfolgs-Abschnitts"
                minRows={2}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <Button variant="outline" size="lg" className="rounded-full border-foreground/15 hover:bg-foreground/5">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueCards;
