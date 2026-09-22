import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ServiceFact = { value: string; label: string };

type ServicePageHeroProps = {
  badge: string;
  badgeIcon?: LucideIcon | ((props: { className?: string }) => JSX.Element);
  title?: string;
  titleAccent?: string;
  titleSlot?: ReactNode;
  description?: string;
  descriptionSlot?: ReactNode;
  actions?: ReactNode;
  facts?: ServiceFact[];
  image: string;
  imageAlt: string;
};

/**
 * Einheitlicher Seiteneinstieg für alle Leistungsseiten.
 * Vorlage: Problem-Framing-Workshop.
 */
export const ServicePageHero = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  titleAccent,
  titleSlot,
  description,
  descriptionSlot,
  actions,
  facts,
  image,
  imageAlt,
}: ServicePageHeroProps) => (
  <section className="overflow-hidden border-b border-border bg-gradient-hero py-16 md:py-24">
    <div className="container px-4 md:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
            {BadgeIcon ? <BadgeIcon className="size-4" /> : null}
            {badge}
          </div>

          {titleSlot ?? (
            <h1 className="font-workshop-heading text-4xl font-bold leading-tight md:text-6xl">
              {title}
              {titleAccent ? <span className="mt-3 block text-primary-glow">{titleAccent}</span> : null}
            </h1>
          )}

          {descriptionSlot ?? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{description}</p>
          )}

          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}

          {facts?.length ? (
            <div
              className="mt-8 grid max-w-xl divide-x divide-border border-y border-border py-4"
              style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
            >
              {facts.map((fact) => (
                <div key={fact.label} className="px-4 first:pl-0 last:pr-0">
                  <span className="block font-workshop-heading text-lg font-semibold">{fact.value}</span>
                  <span className="text-xs text-muted-foreground">{fact.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <div className="absolute -inset-4 translate-x-6 translate-y-6 rounded-xl border border-border" aria-hidden="true" />
          <img
            src={image}
            alt={imageAlt}
            width={1200}
            height={900}
            className="relative aspect-[4/3] w-full rounded-lg object-cover shadow-hover"
          />
        </div>
      </div>
    </div>
  </section>
);
