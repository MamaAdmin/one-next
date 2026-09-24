import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  Focus,
  Lightbulb,
  Map,
  MessageSquareText,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WorkshopComparisonSection } from "@/components/WorkshopComparisonSection";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import workshopImage from "@/assets/workshop-collaboration.jpg";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema, createFAQSchema } from "@/config/seoConfig";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useVideoSlot } from "@/hooks/useVideoLibrary";

const preSteps = [
  { title: "Team-Konstellation", desc: "Decider optional, Rollen und Erwartungen klären.", icon: Users },
  { title: "Einführung", desc: "Ablauf, Regeln und Ziele des Workshops vorstellen.", icon: Compass },
  { title: "So arbeitest du hier", desc: "Methoden, Werkzeuge und Zusammenarbeit erklären.", icon: Map },
];

const agenda = [
  { title: "Kick-off & Zielbild", time: "15'", desc: "Kontext, Ziel des Workshops und die klare Abgrenzung dessen, was kein Sprint-Ziel ist.", icon: Compass },
  { title: "Gegenwart, Vergangenheit & Zukunft", time: "15'", desc: "Wir machen sichtbar, was passiert, wenn nichts verändert wird.", icon: Clock3 },
  { title: "Stakeholder & Zielgruppe", time: "30'", desc: "Die primäre Zielgruppe wird festgelegt, sekundäre Zielgruppen werden geparkt.", icon: Users },
  { title: "Smart Sailboat", time: "15'", desc: "Treiber, Hindernisse, Ziel und Risiken ergeben ein gemeinsames Bild der Lage.", icon: Map },
  { title: "Root Cause (5 Whys)", time: "15'", desc: "Mit 5 Whys identifizieren wir Ursachen, die das Team tatsächlich adressieren kann.", icon: Focus },
  { title: "Annahmen & Risiken", time: "20'", desc: "Annahmen werden nach Unsicherheit und Einfluss priorisiert.", icon: ShieldCheck },
  { title: "Erfolg & Constraints", time: "20'", desc: "Wir definieren ein messbares Ergebnis und harte Randbedingungen.", icon: Target },
  { title: "Scope-Cut & Sprint-Fragen", time: "25'", desc: "In Scope, Out of Scope und die entscheidenden Sprint-Fragen werden festgehalten.", icon: MessageSquareText },
  { title: "Priorisierung (NUF)", time: "15'", desc: "Der NUF-Test führt zur Auswahl der wichtigsten Challenge.", icon: Sparkles },
  { title: "Entscheidung & Next Steps", time: "15'", desc: "Sprint-Go und alle notwendigen Vorbereitungen werden verbindlich geklärt.", icon: Route },
];

const postSteps = [
  { title: "Abschluss · Challenge Statement", desc: "Challenge Statement freigegeben, Scope klar, Messziel definiert.", icon: FileCheck2 },
];

const outcomes = [
  ["Geschärfte Challenge", "Eine klare, fokussierte Problemstellung, die in einem Design Sprint lösbar ist."],
  ["Identifizierte Zielgruppen", "Eine priorisierte Liste der relevantesten Nutzer:innen und Stakeholder."],
  ["Messbare Erfolgskriterien", "Konkrete, testbare Ziele für Ihren Design Sprint."],
  ["Sprint-Ready-Zustand", "Alle Voraussetzungen, Zugänge und Verantwortlichkeiten sind geklärt."],
  ["Workshop-Dokumentation", "Ein vollständiges Protokoll als Vorbereitung für den Design Sprint."],
];

const ProblemFramingWorkshop = () => {
  const introVideo = useVideoSlot("framing_landing");
  const structuredData = [
    createEventSchema(
      "Problem-Framing-Workshop",
      "1-2 Tage intensive Challenge-Klärung zur präzisen Definition Ihrer Herausforderung und Vorbereitung für den Design Sprint.",
      "https://one-next.de/problem-framing-workshop",
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Workshops", url: "https://one-next.de/sprint-uebersicht" },
      { name: "Problem Framing Workshop", url: "https://one-next.de/problem-framing-workshop" },
    ]),
    createFAQSchema([
      { question: "Wann brauche ich einen Problem-Framing-Workshop?", answer: "Wenn Ihre Challenge noch unklar ist, die Zielgruppe nicht definiert oder das Problem nicht präzise formuliert werden kann. Der Workshop schafft Klarheit bevor der Design Sprint startet." },
      { question: "Wie lange dauert der Problem-Framing-Workshop?", answer: "Der Workshop dauert 1-2 Tage, je nach Komplexität der Challenge und Anzahl der Stakeholder." },
      { question: "Was ist das Ergebnis des Workshops?", answer: "Eine klar definierte Challenge, priorisierte Zielgruppe und ein Design Sprint-ready Setup für den anschließenden Design Sprint." },
    ]),
  ];

  return (
    <>
      <SEO
        title="Problem-Framing-Workshop | Challenge definieren | one-next"
        description="1-2 Tage intensive Challenge-Klärung. Definieren Sie Ihre Herausforderung präzise und machen Sie Ihr Team Design Sprint-ready für den Design Sprint."
        keywords="Problem Framing, Challenge Definition, Workshop, Design Sprint Vorbereitung, Stakeholder Alignment"
        canonical="https://one-next.de/problem-framing-workshop"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />
        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Der Startpunkt"
            badgeIcon={Target}
            title="Problem-Framing-Workshop"
            titleAccent="Wenn Ihre Challenge noch unklar ist"
            description="1–2 Tage intensive Klärung, um Ihre Challenge präzise zu definieren, die Zielgruppe zu priorisieren und Ihr Team optimal auf den Design Sprint vorzubereiten."
            actions={
              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild><Link to="/workshop-registration">Workshop Assessment starten <ArrowRight /></Link></Button>
                  <Button size="lg" variant="outline" asChild><Link to="/design-sprint-workshop">Direkt zum Design Sprint</Link></Button>
                </div>
                <div className="w-full pt-4">
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">Was ist Problem Framing? – in 2 Minuten erklärt</p>
                  <VideoPlayer
                    url={introVideo.data?.video_url}
                    title="Was ist Problem Framing"
                    placeholder="Video folgt in Kürze"
                  />
                </div>
              </div>
            }
            facts={[
              { value: "1–2 Tage", label: "Dauer" },
              { value: "6–8", label: "Personen" },
              { value: "1 Briefing", label: "Ergebnis" },
            ]}
            image={workshopImage}
            imageAlt="Team bei einem kollaborativen Problem-Framing-Workshop"
          />

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ausgangslage und Ziel</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Aus Unsicherheit wird ein gemeinsames Zielbild</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <Target className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Zweck</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Eine <strong className="text-foreground">klare, fokussierte und testbare</strong> Problemformulierung erstellen, die als Grundlage für Ihren Design Sprint dient.</p>
                  </div>
                  <div className="border-l-2 border-border pl-6 md:pl-8">
                    <FileCheck2 className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Ergebnis</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Challenge Statement, Scope, priorisierte Zielgruppe, Sprint-Fragen, Erfolgskriterien sowie bewertete Risiken und Annahmen.</p>
                  </div>
                </div>
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                  {[
                    [Focus, "Challenge unklar", "Die Problemstellung ist zu breit, vage oder nicht konkret genug formuliert."],
                    [Users, "Zielgruppe diffus", "Mehrere mögliche Zielgruppen stehen ohne klare Priorisierung nebeneinander."],
                    [Lightbulb, "Noch nicht testbar", "Die Anforderungen sind zu abstrakt, um sie im Sprint sinnvoll zu testen."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof Focus;
                    return <Card key={title as string} className="border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover"><CardContent className="p-6"><ItemIcon className="mb-5 size-7 text-primary" /><h3 className="font-workshop-heading text-lg font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p></CardContent></Card>;
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Team und Rollen</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Die richtigen Perspektiven am Tisch</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Optimal sind 6–8 Personen. Die Rolle der entscheidungsbefugten Person kann je nach Teamkonstellation besetzt werden.</p>
                </div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {[
                    ["Decider (optional)", "Entscheidungsbefugte Perspektive"], ["Produkt-/Business-Owner", "Strategische Perspektive"],
                    ["UX/Service Design", "Nutzerperspektive"], ["Tech Lead / Data / IT", "Technische Machbarkeit"],
                    ["Fach-/Domänenexpert:in", "Spezifisches Know-how"], ["Moderator:in", "Moderation und Timeboxes"],
                  ].map(([role, detail]) => <div key={role} className="flex gap-4 border-b border-border py-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><h3 className="font-workshop-heading font-semibold">{role}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Moderierter Ablauf</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Zehn Schritte zu maximaler Klarheit</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Der Kernworkshop dauert 3–4 Stunden und folgt klaren Timeboxes.</p>
                </div>

                {/* Vor dem Start */}
                <div className="mb-10 border border-border-accent bg-accent-soft/40">
                  <div className="border-b border-border-accent px-6 py-3">
                    <h3 className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Vor dem Start</h3>
                  </div>
                  <div className="grid gap-0 sm:grid-cols-3">
                    {preSteps.map((step) => { const Icon = step.icon; return <div key={step.title} className="border-b border-border-accent px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><div className="flex items-start gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-primary" /><div><h4 className="font-workshop-heading text-sm font-semibold">{step.title}</h4><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p></div></div></div>; })}
                  </div>
                </div>

                {/* Zehn Schritte */}
                <div className="hidden grid-cols-2 gap-x-16 gap-y-0 md:grid">
                  {agenda.map((step, index) => {
                    const Icon = step.icon;
                    return <article key={step.title} className="group relative border-b border-border py-7">
                      <div className="flex items-start gap-5"><span className="font-workshop-heading text-3xl font-bold text-border-strong">{String(index + 1).padStart(2, "0")}</span><Icon className="mt-1 size-6 shrink-0 text-primary" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="font-workshop-heading text-lg font-semibold">{step.title}</h3><span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">{step.time}</span></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p></div></div>
                    </article>;
                  })}
                </div>
                <Accordion type="single" collapsible className="md:hidden">
                  {agenda.map((step, index) => { const Icon = step.icon; return <AccordionItem key={step.title} value={`step-${index}`}><AccordionTrigger className="gap-3 text-left hover:no-underline"><span className="font-workshop-heading text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><Icon className="size-5 shrink-0 text-primary" /><span className="flex-1 font-workshop-heading">{step.title}</span></AccordionTrigger><AccordionContent><div className="pl-16"><span className="text-xs font-semibold text-primary">{step.time}</span><p className="mt-2 leading-relaxed text-muted-foreground">{step.desc}</p></div></AccordionContent></AccordionItem>; })}
                </Accordion>

                {/* Abschluss */}
                <div className="mt-10 border border-border-accent bg-accent-soft/40">
                  <div className="border-b border-border-accent px-6 py-3">
                    <h3 className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Abschluss</h3>
                  </div>
                  <div className="px-6 py-5">
                    {postSteps.map((step) => { const Icon = step.icon; return <div key={step.title} className="flex items-start gap-4"><Icon className="mt-0.5 size-6 shrink-0 text-primary" /><div><h4 className="font-workshop-heading text-base font-semibold">{step.title}</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p></div></div>; })}
                  </div>
                </div>

                <div className="mt-10 flex gap-4 border-l-4 border-primary bg-accent-soft p-6"><FileCheck2 className="size-7 shrink-0 text-primary" /><div><h3 className="font-workshop-heading font-semibold">Definition of Done</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Challenge Statement freigegeben, Scope klar, Messziel definiert und die Vorbereitung für den Design Sprint angestossen.</p></div></div>
              </div>
            </div>
          </section>

          <section className="border-y border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Arbeitsweise</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Moderation statt starrer Vorlagen</h2>
                  <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">Moderierte Gespräche, Whiteboards und kollaborative Denkprozesse passen sich Ihrem Team und Ihrer Challenge an. Methoden und Fragen werden situativ gewählt.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {["Moderierte Gespräche", "Adaptive Methoden", "Situative Fragetechniken", "Live-Dokumentation"].map((item) => <div key={item} className="border-t border-border-accent pt-4"><CheckCircle2 className="mb-3 size-5 text-primary" /><p className="font-workshop-heading font-semibold">{item}</p></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <div><p className="mb-3 text-sm font-bold uppercase text-primary">Ihr Ergebnis</p><h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Bereit für den nächsten Schritt</h2><p className="mt-5 leading-relaxed text-muted-foreground">Am Ende steht keine lose Ideensammlung, sondern eine belastbare Grundlage für den anschliessenden Design Sprint.</p></div>
                <div className="space-y-0">{outcomes.map(([title, text]) => <div key={title} className="flex gap-4 border-b border-border py-5 first:pt-0"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-muted-foreground"><strong className="font-workshop-heading text-foreground">{title}:</strong> {text}</p></div>)}</div>
              </div>
            </div>
          </section>

          <WorkshopComparisonSection />

          <WorkshopFlowDiagram />

          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Bereit, Ihre Challenge zu schärfen?</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Legen Sie mit einem Problem-Framing-Workshop das Fundament für einen erfolgreichen Design Sprint.</p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild><Link to="/workshop-registration">Jetzt Workshop anfragen <ArrowRight /></Link></Button>
                  <CalendarBookingDialog buttonText="Kostenlose Beratung" buttonSize="lg" buttonClassName="border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground" />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProblemFramingWorkshop;