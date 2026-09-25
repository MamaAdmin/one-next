import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Lightbulb,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WorkshopComparisonSection } from "@/components/WorkshopComparisonSection";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import workshopImage from "@/assets/design-sprint-workshop.jpg";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema } from "@/config/seoConfig";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import { ServiceProcessContext } from "@/components/service/ServiceProcessContext";

const roles = [
  ["Decider", "Entscheidungsbefugt für Sprint-Ziele"],
  ["Product Owner", "Strategische Produktperspektive"],
  ["UX/Design", "Nutzerzentrierte Perspektive"],
  ["Tech Lead / KI-Expert", "Technische und KI-Machbarkeit"],
  ["Fachexperten", "Domänenwissen und Use Cases"],
  ["Moderator (wir stellen)", "Expertenmoderation und KI-Werkzeuge"],
];

const agenda = [
  { day: "1", title: "Verstehen & fokussieren", icon: Target, desc: "Challenge und Sprint-Ziel ausrichten, Zielgruppe und Nutzerreise verstehen, vorhandene Erkenntnisse mit ChatGPT und Claude recherchieren und verdichten sowie Sprint-Fragen festlegen." },
  { day: "2", title: "Ideen entwickeln & entscheiden", icon: Lightbulb, desc: "Lösungsräume öffnen, Inspiration und Varianten KI-unterstützt erweitern, Ideen skizzieren, bewerten und zu einem gemeinsamen Storyboard verdichten." },
  { day: "3", title: "Prototyp entwickeln", icon: Rocket, desc: "Nutzerfluss, Inhalte und Interaktionen ausarbeiten. KI-Werkzeuge unterstützen Texte und Varianten; Figma oder Lovable beschleunigen den testbaren Prototyp." },
  { day: "4", title: "Testen & nächste Schritte sichern", icon: FileCheck2, desc: "Prototyp mit Nutzer:innen prüfen, Rückmeldungen strukturiert auswerten, Machbarkeit einordnen und Roadmap sowie nächste Entscheidungen festhalten." },
];

const formats = [
  ["1 Tag", "Fokus, priorisierter Lösungsansatz und nächste Schritte"],
  ["2 Tage", "Konzept und schneller Prototyp"],
  ["3 Tage", "Ausgearbeiteter Prototyp und vorbereiteter Test"],
  ["4 Tage", "Nutzerfeedback, Auswertung und Umsetzungsplan"],
];

const outcomes = [
  ["Priorisierter Lösungsansatz", "Eine gemeinsam bewertete Lösung, die zu Challenge, Zielgruppe und Erfolgskriterien passt."],
  ["Passender Reifegrad", "Je nach Dauer ein klares Konzept, ein Prototyp oder zusätzlich ausgewertetes Nutzerfeedback."],
  ["Geprüfte Machbarkeit", "Technische und wirtschaftliche Rahmenbedingungen sind eingeordnet."],
  ["Dokumentierte Erkenntnisse", "Die Ergebnisse und Bewertungen aus dem Sprint sind nachvollziehbar festgehalten."],
  ["Klare nächste Schritte", "Die nächsten Entscheidungen und Meilensteine bilden eine belastbare Grundlage für die Umsetzung."],
];

const DesignSprintWorkshop = () => {
  const structuredData = [
    createEventSchema(
      "KI-unterstützter Design Sprint",
      "Moderierter 1–4-Tage-Workshop zur Entwicklung und Validierung tragfähiger Lösungen – beschleunigt mit ChatGPT, Claude und weiteren KI-Werkzeugen.",
      "https://one-next.de/design-sprint-workshop",
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Workshops", url: "https://one-next.de/sprint-uebersicht" },
      { name: "KI-unterstützter Design Sprint", url: "https://one-next.de/design-sprint-workshop" },
    ]),
  ];

  return (
    <>
      <SEO
        title="KI-unterstützter Design Sprint | 1–4 Tage | one-next"
        description="Testen Sie in einem moderierten KI Design Sprint über 1–4 Tage eine kleine Lösung, bevor Sie in die sichere KI-Entwicklung investieren."
        keywords="KI Design Sprint, Lösung klein testen, Prototyp, Nutzertest, KI-unterstützter Workshop"
        canonical="https://one-next.de/design-sprint-workshop"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />
        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Nächster Schritt"
            badgeIcon={Rocket}
            title="KI-unterstützter Design Sprint"
            titleAccent="Von der klaren Challenge zum getesteten Lösungsansatz"
            description="Moderierter Workshop über 1–4 Tage, vor Ort oder remote. ChatGPT, Claude und weitere KI-Werkzeuge beschleunigen Recherche, Verdichtung, Ideenentwicklung, Prototyping und Auswertung."
            actions={
              <>
                <Button size="lg" asChild><Link to="/workshop-registration">Workshop Assessment starten <ArrowRight /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link to="/problem-framing-workshop">Challenge erst klären</Link></Button>
              </>
            }
            facts={[
              { value: "1–4 Tage", label: "Dauer" },
              { value: "Vor Ort oder remote", label: "Format" },
              { value: "Prototyp", label: "Ergebnis" },
            ]}
            image={workshopImage}
            imageAlt="KI Design Sprint Workshop mit Teilnehmern und Moderator bei der Entwicklung eines Prototyps"
          />

          <ServiceProcessContext activeStep={2} />

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ausgangslage und Ziel</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Von der klaren Challenge zur tragfähigen Lösung</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <Target className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Zweck</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Von der <strong className="text-foreground">klaren Challenge zum tragfähigen Lösungsansatz</strong> – fokussiert, gemeinsam entschieden und schnell greifbar gemacht.</p>
                  </div>
                  <div className="border-l-2 border-border pl-6 md:pl-8">
                    <FileCheck2 className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Ergebnis</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Je nach Format entstehen ein priorisiertes Konzept, ein Prototyp, Nutzerfeedback sowie ein Machbarkeitscheck und klare nächste Schritte.</p>
                  </div>
                </div>
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                  {[
                    [Target, "Klare Challenge", "Das Team startet mit einem gemeinsamen Zielbild und klaren Sprint-Fragen."],
                    [Lightbulb, "Lösungsrichtung entscheiden", "Ideen werden erweitert, bewertet und zu einem gemeinsamen Ansatz verdichtet."],
                    [Rocket, "Schnell testen", "Ein greifbarer Prototyp schafft früh belastbare Erkenntnisse für die Umsetzung."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof Target;
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
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Die richtigen Perspektiven im Sprint</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Optimal sind 6–8 Personen. Das interdisziplinäre Team verbindet Entscheidungskompetenz, Nutzerperspektive, Fachwissen und technische Machbarkeit.</p>
                </div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {roles.map(([role, detail]) => <div key={role} className="flex gap-4 border-b border-border py-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><h3 className="font-workshop-heading font-semibold">{role}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Moderierter Ablauf</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Eine modulare Agenda für 1–4 Tage</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Die Module werden passend zu Challenge, Vorarbeit und gewünschtem Ergebnis zusammengestellt.</p>
                </div>

                <div className="mb-10 border border-border-accent bg-accent-soft/40">
                  <div className="border-b border-border-accent px-6 py-3"><h3 className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Passender Umfang</h3></div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                    {formats.map(([duration, result]) => <div key={duration} className="border-b border-border-accent p-5 last:border-b-0 sm:border-r sm:even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0"><p className="font-workshop-heading font-semibold text-primary">{duration}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result}</p></div>)}
                  </div>
                </div>

                <div className="hidden grid-cols-2 gap-x-16 md:grid">
                  {agenda.map((step) => { const Icon = step.icon; return <article key={step.day} className="border-b border-border py-7"><div className="flex items-start gap-5"><span className="font-workshop-heading text-3xl font-bold text-border-strong">0{step.day}</span><Icon className="mt-1 size-6 shrink-0 text-primary" /><div><h3 className="font-workshop-heading text-lg font-semibold">Tag {step.day}: {step.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p></div></div></article>; })}
                </div>
                <Accordion type="single" collapsible className="md:hidden">
                  {agenda.map((step) => { const Icon = step.icon; return <AccordionItem key={step.day} value={`day-${step.day}`}><AccordionTrigger className="gap-3 text-left hover:no-underline"><span className="font-workshop-heading text-muted-foreground">0{step.day}</span><Icon className="size-5 shrink-0 text-primary" /><span className="flex-1 font-workshop-heading">Tag {step.day}: {step.title}</span></AccordionTrigger><AccordionContent><p className="pl-16 leading-relaxed text-muted-foreground">{step.desc}</p></AccordionContent></AccordionItem>; })}
                </Accordion>

                <div className="mt-10 flex gap-4 border-l-4 border-primary bg-accent-soft p-6"><FileCheck2 className="size-7 shrink-0 text-primary" /><div><h3 className="font-workshop-heading font-semibold">Definition of Done</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Ein gemeinsam priorisierter Lösungsansatz mit dokumentierten Erkenntnissen und klaren nächsten Schritten – je nach gewähltem Umfang ergänzt um Prototyp, Nutzerfeedback und Umsetzungsplan.</p></div></div>
              </div>
            </div>
          </section>

          <section className="border-y border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Arbeitsweise</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Moderation und KI im Zusammenspiel</h2>
                  <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">ChatGPT und Claude unterstützen Recherche, strukturieren Erkenntnisse und erweitern Ideen sowie Varianten. KI liefert Vorschläge und beschleunigt Arbeitsschritte; Auswahl, Bewertung und Entscheidungen bleiben jederzeit bei Ihrem Team.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    [Users, "Moderation und Timeboxes"],
                    [BrainCircuit, "ChatGPT und Claude"],
                    [Rocket, "Schnelles Prototyping"],
                    [CheckCircle2, "Entscheidungen durch das Team"],
                  ].map(([Icon, item]) => { const ItemIcon = Icon as typeof Users; return <div key={item as string} className="border-t border-border-accent pt-4"><ItemIcon className="mb-3 size-5 text-primary" /><p className="font-workshop-heading font-semibold">{item as string}</p></div>; })}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <div><p className="mb-3 text-sm font-bold uppercase text-primary">Ihr Ergebnis</p><h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Bereit für die Umsetzung</h2><p className="mt-5 leading-relaxed text-muted-foreground">Am Ende steht keine lose Ideensammlung, sondern ein gemeinsam bewerteter Lösungsansatz mit dem passenden Reifegrad.</p></div>
                <div>{outcomes.map(([title, text]) => <div key={title} className="flex gap-4 border-b border-border py-5 first:pt-0"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-muted-foreground"><strong className="font-workshop-heading text-foreground">{title}:</strong> {text}</p></div>)}</div>
              </div>
            </div>
          </section>

          <WorkshopComparisonSection />
          <WorkshopFlowDiagram />

          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Bereit für Ihren KI-unterstützten Design Sprint?</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Starten Sie mit einem moderierten 1–4-Tage-Workshop oder wählen Sie für einfachere Challenges den selbstgeführten Online Sprint.</p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild><Link to="/workshop-registration">Jetzt Workshop anfragen <ArrowRight /></Link></Button>
                  <Button size="lg" variant="outline" asChild><Link to="/custom-ai-development">Weiter zum KI-Arbeitsablauf</Link></Button>
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

export default DesignSprintWorkshop;