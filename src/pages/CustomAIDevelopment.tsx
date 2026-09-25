import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileCheck2,
  FileText,
  GitBranch,
  Layers,
  Map,
  Settings,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import { ServiceProcessContext } from "@/components/service/ServiceProcessContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { createBreadcrumbSchema, createServiceSchema } from "@/config/seoConfig";
import developmentImage from "@/assets/custom-ai-development.jpg";

const processSteps = [
  {
    number: "01",
    icon: Target,
    title: "Problem Framing",
    description: "Challenge, Zielgruppe, Scope, Erfolgskriterien sowie Risiken und Annahmen bilden das fachliche Fundament.",
    result: "Eine klar definierte und priorisierte Challenge.",
    href: "/problem-framing-workshop",
    linkLabel: "Zum Problem Framing",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "KI-unterstützter Design Sprint",
    description: "Der priorisierte Lösungsansatz, Prototyp und gewonnene Erkenntnisse machen die Richtung greifbar und überprüfbar – moderiert oder selbstgeführt.",
    result: "Ein gemeinsam bewerteter Lösungsansatz.",
    href: "/design-sprint-workshop",
    linkLabel: "Zum Design Sprint",
    alternativeHref: "/sprint-uebersicht/online",
    alternativeLinkLabel: "Zum Online KI-Sprint-Tool",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "KI-Arbeitsablauf planen",
    description: "Die Ergebnisse beider Workshops werden mit BMAD zu einem fachlichen und technischen Plan für den sicheren Arbeitsablauf verbunden.",
    result: "Ein abgestimmter Plan mit Rollen, Daten, Prüfungen und Roadmap.",
  },
] as const;

const bmadModules = [
  { icon: Target, title: "Business Alignment", description: "Die KI-Lösung wird klar mit den strategischen Unternehmenszielen und dem erwarteten Nutzen verbunden." },
  { icon: FileText, title: "Use Case Definition", description: "Die validierten Anwendungsfälle werden präzisiert, priorisiert und gegeneinander abgegrenzt." },
  { icon: Database, title: "Datenanforderungen", description: "Relevante Datenquellen, Qualität, Volumen sowie erste Datenschutz- und Compliance-Fragen werden eingeordnet." },
  { icon: Settings, title: "KI Solution Design", description: "Passende Lösungs- und Modellansätze werden aus den validierten Use Cases abgeleitet und auf hoher Ebene beschrieben." },
  { icon: Layers, title: "Architektur-Blueprint", description: "Systemarchitektur, Schnittstellen und Integrationspunkte werden als verständliche High-Level-Skizze festgehalten." },
  { icon: Users, title: "Rollen und Verantwortlichkeiten", description: "Verantwortlichkeiten für Analyse, Produkt, Architektur, Koordination und Entwicklung werden sichtbar zugeordnet." },
  { icon: Map, title: "Roadmap und Milestones", description: "Die Umsetzung wird in nachvollziehbare Schritte, Meilensteine und Akzeptanzkriterien gegliedert." },
] as const;

const outcomes = [
  ["Gemeinsames Zielbild", "Fachliche Ziele, Nutzen und technische Richtung sind aufeinander abgestimmt."],
  ["Klare Entscheidungsgrundlage", "Annahmen, Abhängigkeiten und offene Entscheidungen sind transparent dokumentiert."],
  ["Strukturierte Umsetzung", "Roadmap, Meilensteine und Verantwortlichkeiten schaffen Orientierung für die nächsten Schritte."],
  ["Nachvollziehbare Übergabe", "Ergebnisse werden für die weitere Arbeit in Jira und Confluence Cloud strukturiert aufbereitet."],
] as const;

const CustomAIDevelopment = () => {
  const { content, updateContent } = usePageContent("custom-ai-development");
  const { isContentManager } = useContentManager();
  const [isEditMode, setIsEditMode] = useState(false);

  const structuredData = [
    createServiceSchema(
      "KI-Arbeitsablauf entwickeln",
      "Vom validierten Lösungsansatz zum sicheren KI-Arbeitsablauf: one-next überführt die Ergebnisse aus Problem Framing und Design Sprint in einen Ablauf mit Daten, Rollen, Prüfungen und menschlicher Freigabe – geplant mit BMAD.",
      "https://one-next.de/custom-ai-development",
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Leistungen", url: "https://one-next.de/#services" },
      { name: "KI-Arbeitsablauf entwickeln", url: "https://one-next.de/custom-ai-development" },
    ]),
  ];

  return (
    <>
      <SEO
        title="Sicherer KI-Arbeitsablauf entwickeln | one-next"
        description="Wir überführen den validierten Lösungsansatz in einen sicheren KI-Arbeitsablauf mit Daten, Rollen, Prüfungen und menschlicher Freigabe – geplant mit BMAD."
        keywords="KI-Arbeitsablauf, sicherer KI-Arbeitsablauf, menschliche Freigabe, Rollen, Daten, Prüfungen, BMAD, KI-Erprobung, Roadmap"
        canonical="https://one-next.de/custom-ai-development"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />

        {isContentManager && (
          <EditToggleButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
        )}

        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Der nächste Schritt"
            badgeIcon={ShieldCheck}
            titleSlot={
              <div>
                <InlineTextField
                  value={content.hero_title || "Einen sicheren KI-Arbeitsablauf entwickeln"}
                  onSave={(value) => updateContent("hero_title", value, "text")}
                  isEditMode={isEditMode}
                  as="h1"
                  className="font-workshop-heading text-4xl font-bold leading-tight md:text-6xl"
                />
                <p className="mt-3 font-workshop-heading text-2xl font-semibold text-primary-glow md:text-3xl">
                  Daten, Rollen, Prüfungen und menschliche Freigabe
                </p>
              </div>
            }
            descriptionSlot={
              <div className="mt-6 max-w-2xl">
                <InlineTextArea
                  value={content.hero_description || "Wir überführen den validierten Lösungsansatz in einen umsetzbaren Arbeitsablauf: mit klaren Datenquellen, Rollen, Prüfungen und menschlicher Freigabe. BMAD strukturiert die Planung – von Anforderungen bis Roadmap –, damit die Erprobung verlässlich vorbereitet ist."}
                  onSave={(value) => updateContent("hero_description", value, "text")}
                  isEditMode={isEditMode}
                  className="text-lg leading-relaxed text-muted-foreground md:text-xl"
                  minRows={3}
                />
              </div>
            }
            actions={
              <>
                <CalendarBookingDialog buttonText="Erstgespräch buchen" buttonSize="lg" />
                <Button size="lg" variant="outline" asChild>
                  <Link to="/design-sprint-workshop">Zum Design Sprint</Link>
                </Button>
              </>
            }
            facts={[
              { value: "Rollen & Freigabe", label: "Verantwortung" },
              { value: "Daten & Prüfungen", label: "Sicherheit" },
              { value: "Roadmap & Übergabe", label: "Planung" },
            ]}
            image={developmentImage}
            imageAlt="Team entwickelt einen sicheren KI-Arbeitsablauf mit Rollen, Daten und Freigaben"
          />

          <ServiceProcessContext activeStep={3} />

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ausgangslage und Ziel</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Aus Workshop-Ergebnissen wird ein gemeinsamer Umsetzungsplan</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <Target className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Zweck</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Die Ergebnisse aus Problem Framing und Design Sprint werden zu einem <strong className="text-foreground">gemeinsamen fachlichen und technischen Zielbild</strong> verbunden.</p>
                  </div>
                  <div className="border-l-2 border-border pl-6 md:pl-8">
                    <FileCheck2 className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Ergebnis</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">Ein verständlicher High-Level-Plan für KI-Lösung, Architektur, Daten, Verantwortlichkeiten, Roadmap und Milestones.</p>
                  </div>
                </div>
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                  {[
                    [FileCheck2, "Validierte Grundlage", "Challenge, Zielgruppe und Lösungsansatz sind bereits gemeinsam erarbeitet und bewertet."],
                    [Layers, "Technische Orientierung", "Die fachlichen Ergebnisse werden mit Architektur, Daten und Integrationspunkten verbunden."],
                    [Map, "Blick nach vorn", "Roadmap und Milestones machen Abhängigkeiten, Entscheidungen und nächste Schritte sichtbar."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof FileCheck2;
                    return <Card key={title as string} className="border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover"><CardContent className="p-6"><ItemIcon className="mb-5 size-7 text-primary" /><h3 className="font-workshop-heading text-lg font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p></CardContent></Card>;
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ein zusammenhängender Prozess</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Drei Schritte von der Challenge zum Arbeitsablauf</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">Der Arbeitsablauf setzt nicht wieder bei null an. Die bereits getroffenen Entscheidungen und erarbeiteten Ergebnisse werden konsequent weitergeführt.</p>
                </div>
                <div className="grid gap-x-12 md:grid-cols-3">
                  {processSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <article key={step.number} className="border-t border-border-accent py-7">
                        <div className="flex items-center justify-between gap-4"><span className="font-workshop-heading text-3xl font-bold text-border-strong">{step.number}</span><Icon className="size-6 text-primary" /></div>
                        <h3 className="mt-5 font-workshop-heading text-xl font-semibold">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                        <p className="mt-5 border-l-2 border-border-accent pl-4 text-sm"><strong>Ergebnis:</strong> {step.result}</p>
                        {"href" in step && step.href ? (
                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                            <Button variant="link" className="h-auto p-0" asChild><Link to={step.href}>{step.linkLabel}<ArrowRight className="ml-2 size-4" /></Link></Button>
                            {"alternativeHref" in step && step.alternativeHref ? <Button variant="link" className="h-auto p-0" asChild><Link to={step.alternativeHref}>{step.alternativeLinkLabel}<ArrowRight className="ml-2 size-4" /></Link></Button> : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Planung mit BMAD</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Die Methode hinter der Planung des Arbeitsablaufs</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">BMAD (Breakthrough Method of Agile AI-Driven Development) ist die Methode, mit der wir den sicheren KI-Arbeitsablauf planen. Sie verbindet fachliche und technische Anforderungen zu einem vollständigen Spezifikations-Paket. Ein nach der BMAD-Methode erstellter Blueprint ist ein in Markdown-Dokumenten festgehaltenes Paket, das alle folgenden Phasen der Entwicklung trägt.</p>
                </div>

                <div className="grid gap-0 border-t border-border md:grid-cols-3">
                  {[
                    [FileText, "Product Requirements Document (PRD)", "Eine präzise Beschreibung aller Anforderungen und Systemgrenzen."],
                    [Layers, "Architektur-Spezifikation", "Die technische Struktur, Datenflüsse, API-Anbindungen und die Auswahl der passenden KI-Modelle."],
                    [GitBranch, "User Stories & Epics", "In kleine, testbare Häppchen zerlegte Aufgabenpakete für die Entwicklung."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof FileText;
                    return (
                      <div key={title as string} className="border-b border-border px-0 py-7 md:border-r md:border-b-0 md:last:border-r-0 md:px-8 md:first:pl-0">
                        <ItemIcon className="mb-5 size-7 text-primary" />
                        <h3 className="font-workshop-heading text-lg font-semibold">{title as string}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 flex gap-4 border-l-4 border-primary bg-accent-soft p-6">
                  <FileCheck2 className="size-7 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-workshop-heading font-semibold">Der Zweck des Blueprints</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Mit dem fertigen Dokument erhalten Sie ein umsetzungsreifes Lastenheft. Dieser KI-Bauplan ist so detailliert und präzise aufbereitet, dass er direkt an externe Softwareentwickler oder an KI-Entwicklungs-Agenten wie Claude Code oder Cursor übergeben werden kann. Dadurch werden Missverständnisse, Fehler und unnötige Entwicklungsschleifen minimiert.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Planungsbausteine mit BMAD</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Vom Business Alignment zur Roadmap</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Sieben aufeinander abgestimmte Bausteine strukturieren den Plan für Ihren KI-Arbeitsablauf.</p>
                </div>

                <div className="hidden grid-cols-2 gap-x-16 md:grid">
                  {bmadModules.map((module, index) => {
                    const Icon = module.icon;
                    return <article key={module.title} className="border-b border-border py-7"><div className="flex items-start gap-5"><span className="font-workshop-heading text-3xl font-bold text-border-strong">{String(index + 1).padStart(2, "0")}</span><Icon className="mt-1 size-6 shrink-0 text-primary" /><div><h3 className="font-workshop-heading text-lg font-semibold">{module.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.description}</p></div></div></article>;
                  })}
                </div>
                <Accordion type="single" collapsible className="md:hidden">
                  {bmadModules.map((module, index) => {
                    const Icon = module.icon;
                    return <AccordionItem key={module.title} value={`module-${index}`}><AccordionTrigger className="gap-3 text-left hover:no-underline"><span className="font-workshop-heading text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><Icon className="size-5 shrink-0 text-primary" /><span className="flex-1 font-workshop-heading">{module.title}</span></AccordionTrigger><AccordionContent><p className="pl-16 leading-relaxed text-muted-foreground">{module.description}</p></AccordionContent></AccordionItem>;
                  })}
                </Accordion>

                <div className="mt-10 flex gap-4 border-l-4 border-primary bg-accent-soft p-6">
                  <FileCheck2 className="size-7 shrink-0 text-primary" />
                  <div><h3 className="font-workshop-heading font-semibold">Definition of Done</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Der High-Level-Plan ist gemeinsam abgestimmt. Ziele, Lösungsrichtung, Architektur, Datenanforderungen, Verantwortlichkeiten, Abhängigkeiten und nächste Meilensteine sind nachvollziehbar dokumentiert.</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Gemeinsame Ausarbeitung</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Ihre Ergebnisse bleiben der Ausgangspunkt</h2>
                  <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">Wir prüfen, ergänzen und priorisieren die Workshop-Ergebnisse gemeinsam mit Ihnen. So bleibt der Plan fachlich anschlussfähig, technisch verständlich und auf Ihre Organisation ausgerichtet.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    [Users, "Gemeinsame Abstimmung"],
                    [CheckCircle2, "Nachvollziehbare Entscheidungen"],
                    [FileText, "Dokumentation in Confluence Cloud"],
                    [Map, "Arbeitsplanung in Jira"],
                  ].map(([Icon, item]) => {
                    const ItemIcon = Icon as typeof Users;
                    return <div key={item as string} className="border-t border-border-accent pt-4"><ItemIcon className="mb-3 size-5 text-primary" /><p className="font-workshop-heading font-semibold">{item as string}</p></div>;
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ihr Ergebnis</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Bereit für den nächsten Umsetzungsschritt</h2>
                  <InlineTextArea
                    value={content.benefits_description || "Am Ende steht kein loses Konzept, sondern ein gemeinsam abgestimmter High-Level-Plan. Er gibt Ihrem Team und den beteiligten Umsetzungspartnern Orientierung für die nächsten Entscheidungen."}
                    onSave={(value) => updateContent("benefits_description", value, "text")}
                    isEditMode={isEditMode}
                    className="mt-5 leading-relaxed text-muted-foreground"
                  />
                </div>
                <div>{outcomes.map(([title, text]) => <div key={title} className="flex gap-4 border-b border-border py-5 first:pt-0"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-muted-foreground"><strong className="font-workshop-heading text-foreground">{title}:</strong> {text}</p></div>)}</div>
              </div>
            </div>
          </section>

          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Bereit für Ihren sicheren KI-Arbeitsablauf?</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Nutzen Sie die Ergebnisse aus Problem Framing und Design Sprint, um einen Arbeitsablauf mit klaren Rollen, Daten, Prüfungen und menschlicher Freigabe vorzubereiten – geplant mit BMAD.</p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <CalendarBookingDialog buttonText="Jetzt Erstgespräch buchen" buttonSize="lg" />
                  <Button size="lg" variant="outline" asChild><Link to="/ai-consulting-services">Begleitung für Erprobung und Skalierung</Link></Button>
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

export default CustomAIDevelopment;