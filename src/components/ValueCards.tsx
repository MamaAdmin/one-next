import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import workshopPostits from "@/assets/workshop-stickynotes-blue.jpg";
import customAiDevelopment from "@/assets/custom-ai-development.jpg";
import workshopCollaboration from "@/assets/workshop-collaboration.jpg";
import { CalendarBookingDialog } from "./CalendarBookingDialog";

interface ValueCardsProps {
  isEditMode?: boolean;
}

const ValueCards = ({ isEditMode = false }: ValueCardsProps) => {
  const { content, updateContent } = usePageContent("value-cards");

  return (
    <section className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:auto-rows-[380px]">

          {/* 01 Expertise – Text */}
          <div className="bg-secondary rounded-2xl p-8 md:p-10 h-full flex flex-col justify-between text-foreground">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                01 · Innovation mit Methode
              </span>
              <InlineTextField
                value={content.expertise_title || "Expertise"}
                onSave={(value) => updateContent("expertise_title", value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light tracking-tight"
                placeholder="Titel des Expertise-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={
                  content.expertise_description ||
                  "Wir klären zuerst die richtige Problemstellung im Problem Framing und testen Lösungsansätze schnell mit echten Nutzenden – strukturiert und nachvollziehbar."
                }
                onSave={(value) => updateContent("expertise_description", value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-foreground/75 leading-relaxed"
                placeholder="Beschreibung des Expertise-Abschnitts"
                minRows={3}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <CalendarBookingDialog
                buttonText={content.expertise_button || "Kostenlose Beratung vereinbaren"}
                buttonSize="lg"
                buttonClassName="rounded-none border border-border-accent bg-background text-foreground hover:bg-background/90"
              />
            </div>
          </div>

          {/* 01 Expertise – Bild */}
          <div className="rounded-2xl overflow-hidden group h-64 lg:h-full">
            <img
              src={workshopPostits}
              alt="Hände arbeiten an einer Post-it-Wand während eines Workshops"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: "saturate(0.9)" }}
            />
          </div>

          {/* 02 Effizienz – Bild */}
          <div className="rounded-2xl overflow-hidden group h-64 lg:h-full lg:order-none order-2">
            <img
              src={customAiDevelopment}
              alt="Arbeitstisch mit Skizzen zu einem KI-Arbeitsablauf"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: "saturate(0.9)" }}
            />
          </div>

          {/* 02 Effizienz – Text */}
          <div className="bg-foreground text-background rounded-2xl p-8 md:p-10 h-full flex flex-col justify-between order-1 lg:order-none">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.22em] text-background/60">
                02 · Innovation beschleunigen
              </span>
              <InlineTextField
                value={content.efficiency_title || "Effizienz"}
                onSave={(value) => updateContent("efficiency_title", value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light text-background tracking-tight"
                placeholder="Titel des Effizienz-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={
                  content.efficiency_description ||
                  "Aus dem getesteten Ansatz wird ein sicherer KI-Arbeitsablauf mit klaren Rollen, Datenquellen, Prüfungen und menschlicher Freigabe."
                }
                onSave={(value) => updateContent("efficiency_description", value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-background/75 leading-relaxed"
                placeholder="Beschreibung des Effizienz-Abschnitts"
                minRows={2}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-none border-background/40 hover:bg-background/10 text-background hover:text-background"
              >
                <Link to="/custom-ai-development">
                  {content.efficiency_button || "KI-Arbeitsablauf entwickeln"}
                </Link>
              </Button>
            </div>
          </div>

          {/* 03 Erfolg – Text */}
          <div className="rounded-2xl p-8 md:p-10 bg-muted h-full flex flex-col justify-between order-3 lg:order-none">
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                03 · Individuelle KI-Qualität
              </span>
              <InlineTextField
                value={content.success_title || "Erfolg"}
                onSave={(value) => updateContent("success_title", value)}
                isEditMode={isEditMode}
                className="text-2xl md:text-3xl font-light tracking-tight"
                placeholder="Titel des Erfolgs-Abschnitts"
                as="h2"
              />
              <InlineTextArea
                value={
                  content.success_description ||
                  "Wir messen die Wirkung an realen Aufgaben, prüfen die Datenqualität und schaffen eine belastbare Grundlage für die Entscheidung zum Ausbau."
                }
                onSave={(value) => updateContent("success_description", value)}
                isEditMode={isEditMode}
                className="text-sm md:text-base text-foreground/75 leading-relaxed"
                placeholder="Beschreibung des Erfolgs-Abschnitts"
                minRows={2}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <Button asChild variant="outline" size="lg" className="rounded-none border-border-accent hover:bg-accent-soft">
                <Link to="/data-quality-audit">{content.success_button || "Datenqualitäts-Audit ansehen"}</Link>
              </Button>
            </div>
          </div>

          {/* 03 Erfolg – Bild */}
          <div className="rounded-2xl overflow-hidden group h-64 lg:h-full order-4 lg:order-none">
            <img
              src={workshopCollaboration}
              alt="Team bespricht gemeinsam sichtbare Ergebnisse"
              loading="lazy"
              width={1280}
              height={1280}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: "saturate(0.9)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueCards;
