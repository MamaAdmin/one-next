import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { offerProcessSteps, supportingOffers } from "@/config/OfferProcess";
import { cn } from "@/lib/utils";

interface ServiceProcessContextProps {
  activeStep?: number;
  supportingOffer?: "consulting" | "data";
  showExample?: boolean;
  variant?: "full" | "teaser";
}

const ProcessTeaser = ({ activeStep, supportingOffer }: Pick<ServiceProcessContextProps, "activeStep" | "supportingOffer">) => {
  const activeSupporting = supportingOffers.find((_, index) => supportingOffer === (index === 0 ? "consulting" : "data"));
  return (
    <section className="border-y border-border bg-white py-10 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm font-bold uppercase text-primary">Der one-next-Prozess</p>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/#services">Gesamten Prozess ansehen<ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
          <h2 className="mt-2 font-workshop-heading text-xl font-semibold md:text-2xl">Vom echten Geschäftsproblem zur belegten Wirkung</h2>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {offerProcessSteps.map((step, index) => {
              const isActive = activeStep === index + 1;
              return (
                <li key={step.number} className={cn("border border-border px-4 py-3", isActive ? "border-primary bg-accent-soft/60" : "bg-white")}>
                  <p className="font-workshop-heading text-sm font-bold text-border-strong">{step.number}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug">{step.service}</p>
                  {isActive && <p className="mt-1 text-xs font-bold uppercase text-primary">Sie sind hier</p>}
                </li>
              );
            })}
          </ol>

          {activeSupporting && (
            <p className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">
              Begleitender Baustein: <strong className="text-foreground">{activeSupporting.title}</strong> · Sie sind hier
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export const ServiceProcessContext = ({ activeStep, supportingOffer, showExample = false, variant = "teaser" }: ServiceProcessContextProps) => variant === "teaser" ? (
  <ProcessTeaser activeStep={activeStep} supportingOffer={supportingOffer} />
) : (
  <section className="border-y border-border bg-white py-16 md:py-24">
    <div className="container px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase text-primary">Der one-next-Prozess</p>
          <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Vom echten Geschäftsproblem zur belegten Wirkung</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">Sie können dort einsteigen, wo Ihr Unternehmen steht. Die vier Phasen halten Problem, Lösung, Arbeitsablauf und Wirkung zusammen.</p>
        </div>

        {showExample && (
          <div className="mb-10 border-l-4 border-primary bg-accent-soft p-6">
            <p className="text-xs font-bold uppercase text-primary">Erfundenes Praxisbeispiel</p>
            <p className="mt-2 max-w-4xl leading-relaxed text-muted-foreground">Ein Betrieb mit 45 Mitarbeitenden erstellt massgeschneiderte Angebote. Kundinnen warten im Schnitt fünf Arbeitstage. Die Geschäftsführung möchte diese Zeit halbieren, ohne falsche Preise oder unzulässige Datennutzung zu riskieren.</p>
          </div>
        )}


        <div className="grid border-t border-border md:grid-cols-2">
          {offerProcessSteps.map((step, index) => {
            const isActive = activeStep === index + 1;
            return (
              <article key={step.number} className={cn("border-b border-border py-8 md:px-8 md:first:pl-0", isActive && "bg-accent-soft/50")}>
                <div className="flex items-start gap-5">
                  <span className="font-workshop-heading text-3xl font-bold text-border-strong">{step.number}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-primary">{step.service}{isActive ? " · Sie sind hier" : ""}</p>
                    <h3 className="mt-2 font-workshop-heading text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm font-semibold">{step.question}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    <p className="mt-4 flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong>Ergebnis:</strong> {step.result}</span></p>
                    {showExample && <p className="mt-4 border-l-2 border-border-accent pl-4 text-sm italic text-muted-foreground">{step.example}</p>}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      <Button variant="link" className="h-auto p-0" asChild><Link to={step.href}>{step.linkLabel}<ArrowRight className="ml-2 size-4" /></Link></Button>
                      {step.alternativeLinks?.map((link) => (
                        <Button key={link.href} variant="link" className="h-auto p-0" asChild><Link to={link.href}>{link.label}<ArrowRight className="ml-2 size-4" /></Link></Button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12">
          <p className="text-sm font-bold uppercase text-primary">Begleitende Bausteine</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {supportingOffers.map((offer, index) => {
              const isActive = supportingOffer === (index === 0 ? "consulting" : "data");
              return <div key={offer.title} className={cn("border-l-2 border-border-accent pl-6", isActive && "border-primary")}><h3 className="font-workshop-heading text-lg font-semibold">{offer.title}{isActive ? " · Sie sind hier" : ""}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offer.description}</p><Button variant="link" className="mt-3 h-auto p-0" asChild><Link to={offer.href}>{offer.linkLabel}<ArrowRight className="ml-2 size-4" /></Link></Button></div>;
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);