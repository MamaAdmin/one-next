import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { cn } from "@/lib/utils";
import expertiseImage from "@/assets/workshop-stickynotes-blue.jpg";
import efficiencyImage from "@/assets/custom-ai-development.jpg";
import successImage from "@/assets/workshop-collaboration.jpg";

interface HeroProps {
  isEditMode?: boolean;
}

type Pillar = {
  key: string;
  number: string;
  title: string;
  claim: string;
  description: string;
  image: string;
  imageAlt: string;
  offers: { label: string; href: string }[];
};

const pillars: Pillar[] = [
  {
    key: "expertise",
    number: "01",
    title: "Expertise",
    claim: "Innovation mit Methode",
    description:
      "Wir klären das richtige Problem und testen Lösungen klein, bevor viel investiert wird – strukturiert, nachvollziehbar und mit echten Nutzenden.",
    image: expertiseImage,
    imageAlt: "Hände arbeiten an einer Post-it-Wand während eines Workshops",
    offers: [
      { label: "Problem Framing", href: "/problem-framing-workshop" },
      { label: "KI Design Sprint", href: "/sprint-uebersicht" },
    ],
  },
  {
    key: "effizienz",
    number: "02",
    title: "Effizienz",
    claim: "Innovation beschleunigen",
    description:
      "Aus dem getesteten Ansatz wird ein sicherer KI-Arbeitsablauf mit klaren Rollen, Datenquellen, Prüfungen und menschlicher Freigabe.",
    image: efficiencyImage,
    imageAlt: "Arbeitstisch mit Skizzen zu einem KI-Arbeitsablauf",
    offers: [
      { label: "KI-Arbeitsablauf entwickeln", href: "/custom-ai-development" },
      { label: "KI-Beratung", href: "/ai-consulting-services" },
    ],
  },
  {
    key: "erfolg",
    number: "03",
    title: "Erfolg",
    claim: "Individuelle KI-Qualität",
    description:
      "Wir messen Wirkung an realen Fällen, prüfen die Datenbasis und entscheiden auf belegter Grundlage über Anpassung oder Ausbau.",
    image: successImage,
    imageAlt: "Team bespricht gemeinsam sichtbare Ergebnisse",
    offers: [
      { label: "Datenqualitäts-Audit", href: "/data-quality-audit" },
      { label: "Wirkung messen und skalieren", href: "/ai-consulting-services" },
    ],
  },
];

const Hero = ({ isEditMode = false }: HeroProps) => {
  const { content, updateContent } = usePageContent("index");
  const [active, setActive] = useState(0);
  const current = pillars[active];

  return (
    <section className="relative bg-gradient-hero pt-20 border-b border-border/60">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="space-y-8 animate-fade-in max-w-5xl">
          <span className="inline-block text-sm md:text-base uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Von der Idee zur fertigen Lösung · End-to-End KI-Entwicklung & Schulungen
          </span>
          <InlineTextField
            value={content.hero_title || "we define your way forward"}
            onSave={(value) => updateContent("hero_title", value)}
            isEditMode={isEditMode}
            className="text-6xl lg:text-8xl font-light leading-tight lowercase"
            placeholder="Titel des Hero-Bereichs"
            as="h1"
          />
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto px-6 py-16 md:py-24 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div role="tablist" aria-label="Unsere drei Bausteine" className="flex flex-col border-t border-border">
            {pillars.map((p, i) => (
              <button
                key={p.key}
                role="tab"
                aria-selected={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex items-center gap-5 border-b border-border py-5 text-left transition-colors",
                  active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="text-sm tabular-nums self-center">{p.number}</span>
                <img
                  src={p.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className={cn(
                    "size-12 md:size-14 shrink-0 self-center rounded-xl object-cover transition-all duration-500",
                    active === i ? "opacity-100 grayscale-0" : "opacity-60 grayscale",
                  )}
                />
                <span className="text-3xl md:text-4xl font-light tracking-tight self-center">{p.title}</span>
                <span
                  className={cn(
                    "ml-auto hidden text-sm md:inline transition-opacity",
                    active === i ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                  )}
                >
                  {p.claim}
                </span>
              </button>
            ))}
          </div>

          <div
            key={current.key}
            role="tabpanel"
            className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-background/70 flex flex-col justify-between"
          >
            <img
              src={current.image}
              alt={current.imageAlt}
              loading="lazy"
              className="h-44 md:h-56 w-full object-cover"
            />
            <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {current.title} · {current.claim}
              </span>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/85">{current.description}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {current.offers.map((o) => (
                <Link
                  key={o.label}
                  to={o.href}
                  className="inline-flex items-center justify-between gap-3 border border-border-accent px-4 py-3 text-sm hover:bg-accent-soft transition-colors"
                >
                  {o.label}
                  <ArrowRight className="size-4" />
                </Link>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
