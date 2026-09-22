import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Laptop,
  Lightbulb,
  Route,
  Target,
  Users,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import { SEO } from "@/components/SEO";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { createBreadcrumbSchema, createFAQSchema, createServiceSchema } from "@/config/seoConfig";
import sprintImage from "@/assets/sprint-overview.jpg";

const offers = [
  {
    icon: Target,
    label: "Startpunkt",
    title: "Problem-Framing-Workshop",
    fit: "Wenn Ihre Challenge noch unklar ist",
    mode: "Moderiert · 1–2 Tage",
    points: ["Challenge präzise definieren", "Zielgruppe priorisieren", "Scope und Erfolgskriterien klären"],
    result: "Ein klares Sprint-Briefing",
    href: "/problem-framing-workshop",
    cta: "Problem Framing ansehen",
  },
  {
    icon: Users,
    label: "Nächster Schritt",
    title: "KI-unterstützter Design Sprint",
    fit: "Wenn die Challenge klar ist und Sie moderiert arbeiten möchten",
    mode: "Moderiert · 1–4 Tage",
    points: ["Lösungsansätze entwickeln und priorisieren", "Prototyp greifbar machen", "Erkenntnisse und nächste Schritte sichern"],
    result: "Ein getesteter Lösungsansatz",
    href: "/design-sprint-workshop",
    cta: "Design Sprint ansehen",
  },
  {
    icon: Laptop,
    label: "Flexible Alternative",
    title: "Online Design Sprint",
    fit: "Wenn Sie flexibel und selbstgeführt arbeiten möchten",
    mode: "Selbstgeführt · modular",
    points: ["Problem Framing optional auswählen", "Design-Sprint-Module selbst zusammenstellen", "Allein oder im Team arbeiten"],
    result: "Einen individuell zusammengestellten Sprint",
    href: "/sprint-uebersicht/online",
    cta: "Online Sprint ansehen",
  },
];

const transitionSteps = [
  {
    number: "01",
    icon: Target,
    title: "Challenge schärfen",
    text: "Ist die Ausgangslage noch nicht klar, schafft das Problem Framing ein gemeinsames Verständnis von Challenge, Zielgruppe, Scope und Erfolg.",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Briefing übergeben",
    text: "Das freigegebene Challenge Statement und die weiteren Ergebnisse werden als belastbares Briefing in den Design Sprint übernommen.",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Lösung entwickeln und testen",
    text: "Im KI-unterstützten Design Sprint entwickelt das Team daraus einen priorisierten Lösungsansatz und macht ihn als Prototyp testbar.",
  },
];

const AIDesignSprint = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager, loading } = useContentManager();
  const { content, updateContent } = usePageContent("sprint-uebersicht");

  const structuredData = [
    createServiceSchema(
      "KI Design Sprint – die passende Sprintform wählen",
      "Problem Framing, moderierter KI Design Sprint oder modularer Online Design Sprint: Finden Sie den passenden Weg für Ihre Ausgangslage.",
      "https://one-next.de/sprint-uebersicht",
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Leistungen", url: "https://one-next.de/#services" },
      { name: "Sprintübersicht", url: "https://one-next.de/sprint-uebersicht" },
    ]),
    createFAQSchema([
      {
        question: "Wann starte ich mit einem Problem-Framing-Workshop?",
        answer: "Wenn Challenge, Zielgruppe oder Scope noch nicht klar sind. Das Ergebnis dient als Briefing für den anschliessenden Design Sprint.",
      },
      {
        question: "Wann passt der KI-unterstützte Design Sprint?",
        answer: "Wenn die Challenge klar ist und ein moderiertes Team in 1–4 Tagen einen priorisierten und getesteten Lösungsansatz entwickeln möchte.",
      },
      {
        question: "Was enthält der Online Design Sprint?",
        answer: "Der Online Design Sprint ist selbstgeführt und modular. Sie wählen ein nicht moderiertes Problem Framing, den Design-Sprint-Prozess oder beide Module als durchgängigen Weg.",
      },
    ]),
  ];

  return (
    <>
      <SEO
        title="Sprintübersicht | Den passenden KI Design Sprint wählen | one-next"
        description="Vergleichen Sie Problem Framing, moderierten KI Design Sprint und modularen Online Design Sprint und wählen Sie den passenden Weg für Ihre Challenge."
        keywords="KI Design Sprint, Problem Framing, Design Sprint Workshop, Online Design Sprint, Entscheidungshilfe"
        canonical="https://one-next.de/sprint-uebersicht"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />
        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Sprintübersicht"
            badgeIcon={Route}
            titleSlot={
              <InlineTextField
                value={content.hero_title || "Der passende Weg für Ihre Challenge"}
                onSave={(value) => updateContent("hero_title", value)}
                isEditMode={isEditMode}
                className="font-workshop-heading text-4xl font-bold leading-tight md:text-6xl"
                placeholder="Titel des Einstiegs"
                as="h1"
              />
            }
            descriptionSlot={
              <div className="mt-6 max-w-2xl">
                <InlineTextArea
                  value={content.hero_description || "Problem Framing, moderierter KI Design Sprint oder flexibler Online Design Sprint: Wählen Sie den Aufbau, der zu Ihrer Ausgangslage, Ihrem Team und Ihrer gewünschten Arbeitsweise passt."}
                  onSave={(value) => updateContent("hero_description", value)}
                  isEditMode={isEditMode}
                  className="text-lg leading-relaxed text-muted-foreground md:text-xl"
                  placeholder="Beschreibung des Einstiegs"
                  minRows={3}
                />
              </div>
            }
            actions={<CalendarBookingDialog buttonText="Beratungsgespräch vereinbaren" buttonSize="lg" />}
            facts={[
              { value: "3 Wege", label: "Auswahl" },
              { value: "Moderiert oder selbstgeführt", label: "Arbeitsweise" },
              { value: "Modular", label: "Aufbau" },
            ]}
            image={sprintImage}
            imageAlt="Sprint-Team arbeitet an einem Whiteboard mit Skizzen und Haftnotizen"
          />

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-3xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Drei Angebote auf einen Blick</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Wählen Sie nach Ihrer Ausgangslage</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Die drei Angebote greifen ineinander, können aber auch passend zu Ihrer Situation einzeln gewählt werden.</p>
                </div>
                <div className="grid overflow-hidden border border-border md:grid-cols-3">
                  {offers.map((offer, index) => {
                    const Icon = offer.icon;
                    return (
                      <article key={offer.title} className={`flex flex-col p-6 md:p-8 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
                        <div className="mb-7 flex items-center justify-between gap-4">
                          <p className="text-xs font-bold uppercase text-primary">{offer.label}</p>
                          <Icon className="size-6 text-primary" />
                        </div>
                        <h3 className="font-workshop-heading text-2xl font-bold">{offer.title}</h3>
                        <p className="mt-4 font-semibold text-primary">{offer.fit}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{offer.mode}</p>
                        <div className="my-7 space-y-3">
                          {offer.points.map((point) => <p key={point} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{point}</p>)}
                        </div>
                        <div className="mt-auto border-l-2 border-primary bg-accent-soft/40 p-4">
                          <p className="text-xs font-bold uppercase text-primary">Ergebnis</p>
                          <p className="mt-1 text-sm font-semibold">{offer.result}</p>
                        </div>
                        <Button className="mt-6 w-full" variant="outline" asChild><Link to={offer.href}>{offer.cta} <ArrowRight /></Link></Button>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-3xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Vom Problem zur Lösung</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Problem Framing und Design Sprint bauen aufeinander auf</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Das Problem Framing klärt, woran gearbeitet werden soll. Der Design Sprint nutzt dieses Ergebnis, um eine passende Lösung zu entwickeln, greifbar zu machen und zu prüfen.</p>
                </div>
                <div className="grid gap-x-16 md:grid-cols-3">
                  {transitionSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <article key={step.number} className="border-b border-border py-7">
                        <div className="flex items-start gap-5">
                          <span className="font-workshop-heading text-3xl font-bold text-border-strong">{step.number}</span>
                          <Icon className="mt-1 size-6 shrink-0 text-primary" />
                          <div><h3 className="font-workshop-heading text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p></div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-10 flex flex-col gap-4 border-l-4 border-primary bg-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="font-workshop-heading font-semibold">Ihre Challenge ist bereits klar?</h3><p className="mt-1 text-sm text-muted-foreground">Dann können Sie direkt mit dem KI-unterstützten Design Sprint starten.</p></div>
                  <Button variant="outline" asChild><Link to="/design-sprint-workshop">Direkt zum Design Sprint <ArrowRight /></Link></Button>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Selbstgeführt und modular</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Der Online Design Sprint passt sich Ihrem Weg an</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Sie stellen selbst zusammen, welche Module Sie benötigen, und bearbeiten diese ohne Moderation in Ihrem eigenen Tempo – allein oder gemeinsam im Team.</p>
                  <Button className="mt-8" variant="outline" asChild><Link to="/sprint-uebersicht/online">Online Sprint entdecken <ArrowRight /></Link></Button>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    ["Nur Problem Framing", "Die Challenge selbstgeführt klären und als Briefing festhalten."],
                    ["Nur Design Sprint", "Mit einer bereits klaren Challenge direkt in die Lösungsentwicklung starten."],
                    ["Beide Module", "Vom nicht moderierten Problem Framing durchgängig bis zum Design Sprint arbeiten."],
                  ].map(([title, text]) => <div key={title} className="border-t border-border-accent pt-5"><CheckCircle2 className="mb-4 size-5 text-primary" /><h3 className="font-workshop-heading font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Entscheidungshilfe</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Welcher Weg passt zu Ihnen?</h2>
                </div>
                <div className="grid overflow-hidden border border-border md:grid-cols-3">
                  {offers.map((offer, index) => (
                    <article key={offer.fit} className={`flex flex-col p-6 md:p-8 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
                      <p className="font-workshop-heading text-xl font-bold">{offer.fit}</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Dann passt der <strong className="text-foreground">{offer.title}</strong>. Sie erhalten {offer.result.charAt(0).toLowerCase() + offer.result.slice(1)}.</p>
                      <Button className="mt-7 w-full" asChild variant={index === 1 ? "default" : "outline"}><Link to={offer.href}>{offer.cta} <ArrowRight /></Link></Button>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Noch unsicher, welcher Sprint zu Ihnen passt?</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Wählen Sie oben direkt Ihr Angebot oder klären Sie gemeinsam mit uns, welcher Aufbau zu Ihrer Challenge passt.</p>
                <div className="mt-9 flex justify-center"><CalendarBookingDialog buttonText="Beratungsgespräch vereinbaren" buttonSize="lg" /></div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        {isContentManager && !loading && <EditToggleButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
      </div>
    </>
  );
};

export default AIDesignSprint;