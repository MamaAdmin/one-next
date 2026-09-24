import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  Focus,
  Layers,
  Lightbulb,
  Map,
  MessageSquareText,
  MonitorSmartphone,
  Pencil,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema, createFAQSchema } from "@/config/seoConfig";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import onlineSprintImage from "@/assets/online-sprint.jpg";

const framingPhases = [
  { title: "Kick-off & Zielbild", time: "Teil 1", desc: "Kontext, Langfristziel und die klare Abgrenzung dessen, was nicht zum Sprint gehört.", icon: Compass },
  { title: "Stakeholder & Zielgruppe", time: "Teil 1", desc: "Primäre Zielgruppe festlegen, weitere Stakeholder bewusst parken.", icon: Users },
  { title: "Ursachen & Hindernisse", time: "Teil 1", desc: "Smart Sailboat und 5 Whys trennen Symptome von den echten Ursachen.", icon: Focus },
  { title: "Annahmen, Risiken & Erfolg", time: "Teil 1", desc: "Annahmen priorisieren, Rahmenbedingungen und messbaren Erfolg festhalten.", icon: ShieldCheck },
  { title: "Priorisierung & Challenge Statement", time: "Teil 1", desc: "NUF-Bewertung führt zur Top-Sprint-Frage und einem freigegebenen Challenge Statement.", icon: FileCheck2 },
];

const sprintPhases = [
  { title: "Map & Zielübernahme", time: "Teil 2", desc: "Ziel, Sprint-Fragen und Zielgruppe kommen automatisch aus dem Problem Framing.", icon: Map },
  { title: "Skizzieren & Crazy 8s", time: "Teil 2", desc: "Ideation im Team, auf Wunsch direkt auf einem verbundenen Miro-Board.", icon: Pencil },
  { title: "Entscheiden & Storyboard", time: "Teil 2", desc: "Stille Abstimmung, Heatmap und ein Storyboard als Bauplan für den Prototyp.", icon: MessageSquareText },
  { title: "Prototyp bauen", time: "Teil 2", desc: "Ein testbarer Prototyp entsteht – digital, klickbar, bewusst auf das Nötigste reduziert.", icon: Layers },
  { title: "Testen & Erkenntnisse", time: "Teil 2", desc: "Nutzertests mit Leitfaden, gebündeltes Feedback und eine klare Empfehlung.", icon: TestTube },
];

const outcomes = [
  ["Challenge Statement", "Eine geschärfte, testbare Problemstellung, auf die sich das ganze Team festgelegt hat."],
  ["Getesteter Prototyp", "Ein klickbarer Lösungsansatz mit echtem Nutzerfeedback statt einer Ideensammlung."],
  ["Lückenlose Dokumentation", "Jeder Schritt wird im Tool festgehalten – ohne dass jemand Notizen abtippt."],
  ["Klare Empfehlung", "Weiterbauen, anpassen oder verwerfen – die Entscheidung ist belegt."],
  ["Bereit für die Umsetzung", "Die Ergebnisse gehen direkt in die individuelle KI-Entwicklung über."],
];

const OnlineSprintLanding = () => {
  const structuredData = [
    createEventSchema(
      "Online Problem Framing & Design Sprint",
      "Selbstentwickeltes Online-Tool von one-next: zuerst Problem Framing, dann KI-gestützter Design Sprint – ohne externen Moderator.",
      "https://one-next.de/sprint-uebersicht/online",
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "KI Design Sprint", url: "https://one-next.de/sprint-uebersicht" },
      { name: "Online Problem Framing & Design Sprint", url: "https://one-next.de/sprint-uebersicht/online" },
    ]),
    createFAQSchema([
      { question: "Brauchen wir einen Moderator?", answer: "Nein. Das Tool führt Ihr Team eigenständig durch jeden Schritt: Anleitungen, Timeboxes, Vorlagen und KI-Vorschläge ersetzen die externe Moderation. Das spart Kosten und Vorlaufzeit." },
      { question: "Warum zuerst Problem Framing und dann der Design Sprint?", answer: "Ein Design Sprint liefert nur dann gute Ergebnisse, wenn er am richtigen Problem arbeitet. Das Problem Framing klärt Ursachen, Zielgruppe und Erfolgskriterien und übergibt das Ergebnis direkt an den Sprint." },
      { question: "Wie unterstützt die KI konkret?", answer: "Die KI schlägt Annahmen, Stakeholder und Sprint-Fragen vor, bewertet und ordnet Team-Antworten, formuliert das Challenge Statement und dokumentiert jeden Schritt automatisch." },
      { question: "Können wir pausieren?", answer: "Ja. Sie arbeiten synchron oder asynchron im eigenen Tempo, jeder Zwischenstand wird automatisch gespeichert." },
    ]),
  ];

  return (
    <>
      <SEO
        title="Online Problem Framing & Design Sprint | Eigenes KI-Tool | one-next"
        description="Unser selbstentwickeltes Online-Tool: zuerst Problem Framing, dann KI-gestützter Design Sprint – ohne externen Moderator, das spart Kosten und Zeit."
        keywords="Online Design Sprint, Problem Framing online, KI Design Sprint, ohne Moderator, Remote Sprint Tool"
        canonical="https://one-next.de/sprint-uebersicht/online"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />
        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Unser eigenes Online-Tool"
            badgeIcon={Sparkles}
            title="Online Problem Framing & Design Sprint"
            titleAccent="Erst die richtige Challenge, dann die getestete Lösung"
            description="Ein von uns selbst entwickeltes Tool, in dem Ihr Team beides online durchläuft – geführt von KI statt von einem externen Moderator. Das spart Kosten und Zeit."
            actions={
              <>
                <Button size="lg" asChild>
                  <Link to="/sprint">Jetzt im Tool starten <ArrowRight /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/problem-framing-workshop">Moderierte Variante ansehen</Link>
                </Button>
              </>
            }
            facts={[
              { value: "Flexibel", label: "Im eigenen Tempo" },
              { value: "Ohne Moderator", label: "KI führt durch" },
              { value: "2 Teile", label: "Framing → Sprint" },
            ]}
            image={onlineSprintImage}
            imageAlt="Team arbeitet remote am Laptop im Online-Sprint-Tool von one-next"
          />

          {/* Ausgangslage und Ziel */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ausgangslage und Ziel</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Ein Tool, zwei aufeinander aufbauende Schritte</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <Target className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Zweck</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      Ihr Team klärt zuerst im <strong className="text-foreground">Problem Framing</strong>, worum es wirklich geht, und prüft danach im <strong className="text-foreground">Design Sprint</strong> die passende Lösung – vollständig online.
                    </p>
                  </div>
                  <div className="border-l-2 border-border pl-6 md:pl-8">
                    <FileCheck2 className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Ergebnis</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      Ein freigegebenes Challenge Statement, ein getesteter Prototyp, Nutzerfeedback und eine vollständige Dokumentation als Grundlage für die Umsetzung.
                    </p>
                  </div>
                </div>
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                  {[
                    [Wallet, "Keine Moderationskosten", "Die Prozessführung übernimmt das Tool. Es braucht keine externe Moderation für jeden Termin."],
                    [Clock3, "Kein Warten auf Termine", "Sie starten sofort und arbeiten synchron oder asynchron, wann es Ihrem Team passt."],
                    [Route, "Kein Medienbruch", "Alle Ergebnisse aus dem Problem Framing fliessen automatisch in den Design Sprint."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof Focus;
                    return (
                      <Card key={title as string} className="border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
                        <CardContent className="p-6">
                          <ItemIcon className="mb-5 size-7 text-primary" />
                          <h3 className="font-workshop-heading text-lg font-semibold">{title as string}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Unsere Lösung im Tool */}
          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Selbst entwickelt</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">So sehen unsere Lösungen mit KI aus</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                    Wir haben das Tool selbst gebaut, weil wir die Methodik aus unseren moderierten Workshops kennen. Die KI übernimmt darin die Rolle, die sonst eine Moderatorin oder ein Moderator ausfüllt.
                  </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="border border-border-accent bg-background p-7">
                    <span className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Schritt 1</span>
                    <h3 className="mt-2 font-workshop-heading text-2xl font-semibold">Problem Framing mit KI</h3>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      Zehn geführte Etappen mit Anleitung, Timebox und Beispielen. Die KI schlägt Stakeholder, Annahmen und Sprint-Fragen vor, hinterfragt vage Formulierungen und verdichtet alles am Ende zu einem messbaren Challenge Statement. Jeder Vorschlag lässt sich übernehmen, ändern oder verwerfen.
                    </p>
                    <div className="mt-6 space-y-3">
                      {["Stakeholder-Map und Zielgruppe", "Smart Sailboat und 5 Whys", "Annahmen, Risiken und Erfolgskriterien", "NUF-Priorisierung und Challenge Statement"].map((item) => (
                        <div key={item} className="flex gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                          <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border-accent bg-background p-7">
                    <span className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Schritt 2</span>
                    <h3 className="mt-2 font-workshop-heading text-2xl font-semibold">Online Design Sprint mit KI</h3>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      Der Sprint startet nicht bei null: Ziel, Zielgruppe, Erfolgsmessung und Sprint-Fragen sind bereits aus dem Problem Framing übernommen und bleiben jederzeit änderbar. Die KI recherchiert Referenzen, bündelt Ideen und hilft beim Bewerten – entschieden wird im Team.
                    </p>
                    <div className="mt-6 space-y-3">
                      {["Übernahme aller Framing-Ergebnisse", "Ideation inklusive Miro-Anbindung", "Stille Abstimmung und Heatmap", "Prototyp, Nutzertests und Auswertung"].map((item) => (
                        <div key={item} className="flex gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                          <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ablauf */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Der Ablauf im Tool</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Zuerst Problem Framing, dann Design Sprint</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Beide Teile lassen sich pausieren und später fortsetzen. Der Fortschritt bleibt für das ganze Team sichtbar.</p>
                </div>

                {/* Vor dem Start */}
                <div className="mb-10 border border-border-accent bg-accent-soft/40">
                  <div className="border-b border-border-accent px-6 py-3">
                    <h3 className="font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">Vor dem Start</h3>
                  </div>
                  <div className="grid gap-0 sm:grid-cols-3">
                    {[
                      { title: "Team-Konstellation", desc: "Rollen festlegen und das Team per E-Mail einladen.", icon: Users },
                      { title: "Einführung", desc: "Ablauf, Regeln und Ziele werden im Tool erklärt.", icon: Compass },
                      { title: "So arbeitest du hier", desc: "Anleitung, Beispiele und Videos zu jedem Schritt.", icon: MonitorSmartphone },
                    ].map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.title} className="border-b border-border-accent px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                          <div className="flex items-start gap-3">
                            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                            <div>
                              <h4 className="font-workshop-heading text-sm font-semibold">{step.title}</h4>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {[
                  { label: "Teil 1 · Problem Framing", items: framingPhases, offset: 0 },
                  { label: "Teil 2 · Online Design Sprint", items: sprintPhases, offset: framingPhases.length },
                ].map((block) => (
                  <div key={block.label} className="mb-10 last:mb-0">
                    <h3 className="mb-4 font-workshop-heading text-sm font-bold uppercase tracking-wide text-primary">{block.label}</h3>

                    <div className="hidden grid-cols-2 gap-x-16 gap-y-0 md:grid">
                      {block.items.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <article key={step.title} className="group relative border-b border-border py-7">
                            <div className="flex items-start gap-5">
                              <span className="font-workshop-heading text-3xl font-bold text-border-strong">{String(block.offset + index + 1).padStart(2, "0")}</span>
                              <Icon className="mt-1 size-6 shrink-0 text-primary" />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-workshop-heading text-lg font-semibold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <Accordion type="single" collapsible className="md:hidden">
                      {block.items.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <AccordionItem key={step.title} value={`${block.label}-${index}`}>
                            <AccordionTrigger className="gap-3 text-left hover:no-underline">
                              <span className="font-workshop-heading text-muted-foreground">{String(block.offset + index + 1).padStart(2, "0")}</span>
                              <Icon className="size-5 shrink-0 text-primary" />
                              <span className="flex-1 font-workshop-heading">{step.title}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-16">
                                <p className="leading-relaxed text-muted-foreground">{step.desc}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                ))}

                <div className="mt-10 flex gap-4 border-l-4 border-primary bg-accent-soft p-6">
                  <FileCheck2 className="size-7 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-workshop-heading font-semibold">Definition of Done</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Challenge Statement freigegeben, Prototyp gebaut, mit echten Nutzer:innen getestet und die Ergebnisse dokumentiert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Arbeitsweise */}
          <section className="border-y border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Arbeitsweise</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Die KI führt, Ihr Team entscheidet</h2>
                  <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                    Jeder Schritt hat eine Anleitung, eine Zeitvorgabe und die Daten aus den früheren Schritten. Die KI liefert Vorschläge und Einschätzungen – die Entscheidung trifft immer Ihr Team.
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { title: "Geführte Anleitung", icon: Compass },
                    { title: "KI-Vorschläge zum Annehmen", icon: Bot },
                    { title: "Automatische Dokumentation", icon: FileCheck2 },
                    { title: "Pausieren und fortsetzen", icon: Clock3 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="border-t border-border-accent pt-4">
                        <Icon className="mb-3 size-5 text-primary" />
                        <p className="font-workshop-heading font-semibold">{item.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Ergebnis */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ihr Ergebnis</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Belastbare Grundlage statt Ideensammlung</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                    Am Ende steht ein geprüfter Lösungsweg, den Sie direkt weiterentwickeln können – ohne Ergebnisse nachträglich zusammenzutragen.
                  </p>
                </div>
                <div className="space-y-0">
                  {outcomes.map(([title, text]) => (
                    <div key={title} className="flex gap-4 border-b border-border py-5 first:pt-0">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                      <p className="text-muted-foreground">
                        <strong className="font-workshop-heading text-foreground">{title}:</strong> {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Für wen */}
          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Passt zu Ihnen, wenn</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Für Teams, die eigenständig vorankommen wollen</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {[
                    [Lightbulb, "Startups und kleine Teams", "Sie wollen schnell validieren, ohne Budget für externe Moderation zu binden."],
                    [Users, "Verteilte Teams", "Sie arbeiten remote über mehrere Standorte und Zeitzonen hinweg."],
                    [Sparkles, "Innovationsteams", "Sie testen mehrere Ideen nacheinander und brauchen einen wiederholbaren Ablauf."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof Focus;
                    return (
                      <Card key={title as string} className="border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
                        <CardContent className="p-6">
                          <ItemIcon className="mb-5 size-7 text-primary" />
                          <h3 className="font-workshop-heading text-lg font-semibold">{title as string}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text as string}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl">
                <div className="mb-10 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Häufige Fragen</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Gut zu wissen</h2>
                </div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="moderator">
                    <AccordionTrigger className="text-left">Brauchen wir einen Moderator?</AccordionTrigger>
                    <AccordionContent>
                      Nein. Anleitungen, Zeitvorgaben, Vorlagen und KI-Vorschläge führen Ihr Team durch jeden Schritt. Das spart die Kosten für externe Moderation und die Zeit für die Terminabstimmung.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="reihenfolge">
                    <AccordionTrigger className="text-left">Warum zuerst Problem Framing und dann der Design Sprint?</AccordionTrigger>
                    <AccordionContent>
                      Ein Sprint liefert nur dann Wert, wenn er am richtigen Problem arbeitet. Das Problem Framing klärt Ursachen, Zielgruppe und Erfolgskriterien und übergibt das Ergebnis direkt an den Sprint.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="ki">
                    <AccordionTrigger className="text-left">Wie unterstützt die KI konkret?</AccordionTrigger>
                    <AccordionContent>
                      Sie schlägt Stakeholder, Annahmen und Sprint-Fragen vor, bewertet und ordnet die Antworten des Teams, formuliert das Challenge Statement und dokumentiert jeden Schritt automatisch.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="vorkenntnisse">
                    <AccordionTrigger className="text-left">Brauchen wir Vorkenntnisse?</AccordionTrigger>
                    <AccordionContent>
                      Nein. Jeder Schritt ist erklärt und mit Beispielen hinterlegt. Erfahrung mit Design Sprints ist hilfreich, aber nicht nötig.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pause">
                    <AccordionTrigger className="text-left">Können wir zwischendurch pausieren?</AccordionTrigger>
                    <AccordionContent>
                      Ja. Sie arbeiten im eigenen Tempo, gemeinsam oder zeitversetzt. Jeder Zwischenstand wird automatisch gespeichert.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="preis">
                    <AccordionTrigger className="text-left">Was kostet die Nutzung?</AccordionTrigger>
                    <AccordionContent>
                      Der Preis richtet sich nach Umfang und Teamgrösse. Schreiben Sie uns an info@one-next.com für ein individuelles Angebot.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Bereit für Problem Framing und Design Sprint?</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Legen Sie Ihr Projekt an, laden Sie Ihr Team ein und starten Sie direkt mit dem Problem Framing.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link to="/sprint">Jetzt im Tool starten <ArrowRight /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/kontakt">Angebot anfragen</Link>
                  </Button>
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

export default OnlineSprintLanding;
