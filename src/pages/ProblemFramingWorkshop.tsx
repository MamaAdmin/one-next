import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, Users, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkshopComparisonSection } from "@/components/WorkshopComparisonSection";
import { WorkshopFlowDiagram } from "@/components/WorkshopFlowDiagram";
import workshopImage from "@/assets/workshop-collaboration.jpg";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { SEO } from "@/components/SEO";
import { createEventSchema, createBreadcrumbSchema, createFAQSchema } from "@/config/seoConfig";

const ProblemFramingWorkshop = () => {
  const structuredData = [
    createEventSchema(
      "Problem-Framing-Workshop",
      "1-2 Tage intensive Challenge-Klärung zur präzisen Definition Ihrer Herausforderung und Vorbereitung für den Design Sprint.",
      "https://one-next.de/problem-framing-workshop"
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Workshops", url: "https://one-next.de/sprint-uebersicht" },
      { name: "Problem Framing Workshop", url: "https://one-next.de/problem-framing-workshop" }
    ]),
    createFAQSchema([
      {
        question: "Wann brauche ich einen Problem-Framing-Workshop?",
        answer: "Wenn Ihre Challenge noch unklar ist, die Zielgruppe nicht definiert oder das Problem nicht präzise formuliert werden kann. Der Workshop schafft Klarheit bevor der Design Sprint startet."
      },
      {
        question: "Wie lange dauert der Problem-Framing-Workshop?",
        answer: "Der Workshop dauert 1-2 Tage, je nach Komplexität der Challenge und Anzahl der Stakeholder."
      },
      {
        question: "Was ist das Ergebnis des Workshops?",
        answer: "Eine klar definierte Challenge, priorisierte Zielgruppe und ein sprint-ready Setup für den anschließenden Design Sprint."
      }
    ])
  ];

  return (
    <>
      <SEO
        title="Problem-Framing-Workshop | Challenge definieren | one-next"
        description="1-2 Tage intensive Challenge-Klärung. Definieren Sie Ihre Herausforderung präzise und machen Sie Ihr Team sprint-ready für den Design Sprint."
        keywords="Problem Framing, Challenge Definition, Workshop, Design Sprint Vorbereitung, Stakeholder Alignment"
        canonical="https://one-next.de/problem-framing-workshop"
        structuredData={structuredData}
      />
      <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                <Target className="w-4 h-4" />
                Der Startpunkt
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Problem-Framing-Workshop
                <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                  Wenn Ihre Challenge noch unklar ist
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                1–2 Tage intensive Klärung, um Ihre Challenge präzise zu definieren, 
                die Zielgruppe zu priorisieren und sprint-ready zu machen – 
                perfekt vorbereitet für den Design Sprint.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/workshop-registration">
                  <Button size="lg" variant="secondary">
                    Workshop Assessment starten
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button asChild size="lg" variant="outline">
                  <Link to="/design-sprint-workshop">
                    Direkt zum Design Sprint
                  </Link>
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Ergebnis: Ein klares Sprint-Briefing für den Design Sprint
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src={workshopImage} 
                alt="Team bei einem kollaborativen Problem-Framing-Workshop mit Whiteboard und Post-its zur Challenge-Definition" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Purpose & Outcome */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Zweck & <span className="text-primary">Ergebnis</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Ziel</h3>
                  <p className="text-muted-foreground">
                    Eine <strong>klare, fokussierte und testbare</strong> Problemformulierung erstellen, 
                    die als Grundlage für Ihren (KI) Design Sprint dient.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Deliverables</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Challenge Statement (präzise Problemdefinition)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Scope (In-/Out-of-Scope), Zielgruppe, Constraints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Sprint-Fragen (Decision Questions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Erfolgskriterien & Metriken</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Risiken & Annahmen (priorisiert)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Participants & Roles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Teilnehmer & <span className="text-primary">Rollen</span>
            </h2>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-primary" />
                  <p className="text-lg text-muted-foreground">
                    <strong className="text-foreground">6–8 Personen</strong> für optimale Zusammenarbeit
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Decider</p>
                      <p className="text-sm text-muted-foreground">Entscheidungsbefugt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Produkt/Business-Owner</p>
                      <p className="text-sm text-muted-foreground">Strategische Perspektive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">UX/Service Design</p>
                      <p className="text-sm text-muted-foreground">Nutzerperspektive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Tech Lead / Data/IT</p>
                      <p className="text-sm text-muted-foreground">Technische Machbarkeit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Fach-/Domänenexpert:in</p>
                      <p className="text-sm text-muted-foreground">Spezifisches Know-how</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Moderator:in</p>
                      <p className="text-sm text-muted-foreground">Moderiert, hält Timeboxes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* When is this workshop useful? */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Wann ist dieser Workshop <span className="text-primary">sinnvoll?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Challenge unklar</h3>
                  <p className="text-sm text-muted-foreground">
                    Die Problemstellung ist zu breit, vage oder nicht konkret genug formuliert.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Zielgruppe diffus</h3>
                  <p className="text-sm text-muted-foreground">
                    Es gibt mehrere mögliche Zielgruppen, aber keine klare Priorisierung.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Nicht testbar</h3>
                  <p className="text-sm text-muted-foreground">
                    Die Anforderungen sind zu abstrakt oder können nicht in 5 Tagen getestet werden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Process/Agenda - Detailed 10 Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Workshop-Ablauf <span className="text-primary">(3–4 Stunden, timeboxed)</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Strukturierter Prozess in 10 Schritten für maximale Klarheit
            </p>
            <div className="space-y-4">
              {[
                { title: "Kick-off & Zielbild", time: "10–15'", desc: "Kontext, Ziel des Workshops, Definition 'Was ist *kein* Sprint-Ziel?'" },
                { title: "'Warum jetzt?' & Default Future", time: "15'", desc: "Was passiert, wenn Sie nichts tun? (kurz, wirkungsorientiert)" },
                { title: "Stakeholder & Zielgruppe", time: "15'", desc: "Primäre Zielgruppe festlegen (sekundäre parken)" },
                { title: "Smart Sailboat", time: "30'", desc: "Treiber/Wind, Anker/Hindernisse, Hafen/Ziel, Eisberg/Risiken – gemeinsames Bild der Lage" },
                { title: "Root Cause & Komplexität", time: "20'", desc: "5 Whys + Cynefin Light – Welche Ursachen sind adressierbar?" },
                { title: "Annahmen & Risiken", time: "20'", desc: "Assumption Mapping – Annahmen nach Unsicherheit × Einfluss priorisieren" },
                { title: "Erfolg & Constraints", time: "20'", desc: "Messbares 5-Tage-Ergebnis, harte Randbedingungen (Compliance, Systeme, Daten)" },
                { title: "Scope-Cut & Sprint-Fragen", time: "25'", desc: "In Scope / Out of Scope, Formulierung der Sprint-Fragen (Decision Questions)" },
                { title: "Priorisierung", time: "15'", desc: "NUF-Test (Neuheit, Nutzen, Machbarkeit) – Auswahl der Top-1 Challenge" },
                { title: "Entscheidung & Next Steps", time: "10–15'", desc: "Sprint-Go? Pre-Sprint-To-dos (Decider fix, ≥5 Testnutzer:innen, Datenzugang)" }
              ].map((step, index) => (
                <Card key={index} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Definition of Done</p>
                    <p className="text-sm text-muted-foreground">
                      Challenge Statement sign-off, Scope klar, Messziel definiert, Decider bestätigt, 
                      Rekrutierung von ≥5 Nutzer:innen angestoßen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology - Without Templates */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Arbeitsweise: <span className="text-primary">Ohne starre Vorlagen & Tools</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Im Gegensatz zum Design Sprint, der mit standardisierten Templates und KI-Tools arbeitet, 
              ist der Problem-Framing-Workshop <strong>flexibel und situativ</strong>. 
              Wir nutzen bewährte Facilitationstechniken, die sich an Ihr Team und Ihre Challenge anpassen.
            </p>
            
            <div className="space-y-8">
              {/* Flexible Facilitation */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Moderationsbasierter Ansatz
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Statt vorgefertigter Formulare setzen wir auf <strong>moderierte Diskussionen</strong>, 
                    Whiteboards und <strong>kollaborative Denkprozesse</strong>. Der Moderator passt 
                    Methoden und Fragen dynamisch an den Flow und die Bedürfnisse des Teams an.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Moderierte Gespräche</p>
                        <p className="text-xs text-muted-foreground">Strukturierte Diskussionen statt Ausfüllen von Templates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Adaptive Methoden</p>
                        <p className="text-xs text-muted-foreground">Techniken passen sich Ihrem Team an</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Situative Fragetechniken</p>
                        <p className="text-xs text-muted-foreground">Offene Fragen statt vorgegebene Antwortfelder</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Live-Dokumentation</p>
                        <p className="text-xs text-muted-foreground">Gemeinsam am Whiteboard entwickeln</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Distinction */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Der Unterschied zum Design Sprint
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Problem-Framing-Workshop:</strong> Keine standardisierten Templates oder KI-Tools. 
                      Fokus liegt auf <strong>Moderation, Dialog und individuellem Zuschnitt</strong> auf Ihre spezifische Situation.
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">KI Design Sprint:</strong> Arbeitet mit bewährten Templates, KI-gestützten Tools 
                      und einem <strong>strukturierten 5-Tage-Prozess</strong> – perfekt, wenn die Challenge bereits klar ist.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* When Problem Framing instead of Sprint */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Wann Problem Framing <span className="text-primary">statt Sprint?</span>
            </h2>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <p className="text-lg mb-6">
                  Ein Problem-Framing-Workshop ist <strong>notwendig</strong>, wenn:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-muted-foreground">
                      Thema ist <strong>zu breit/unklar</strong> formuliert
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Keine primäre Zielgruppe</strong> definiert
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Kein Decider</strong> identifiziert
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Kein Nutzerzugang</strong> für Tests vorhanden
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  → Erst Problem Framing (heute) + 1 Woche Pre-Sprint-Setup; Sprinttermin danach.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expected Outcomes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Was Sie <span className="text-primary">erwartet</span>
            </h2>
            <div className="bg-card p-8 rounded-lg border border-border space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Geschärfte Challenge:</strong> Eine klare, 
                  fokussierte Problemstellung, die in einem Design Sprint lösbar ist.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Identifizierte Zielgruppen:</strong> Eine 
                  priorisierte Liste der relevantesten Nutzer:innen und Stakeholder.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Messbare Erfolgskriterien:</strong> Konkrete, 
                  testbare Ziele für Ihren Design Sprint.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Sprint-Ready-Zustand:</strong> Alle 
                  Voraussetzungen (Entscheider, Nutzer, Testbarkeit) sind geklärt.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Workshop-Dokumentation:</strong> Vollständiges 
                  Protokoll und Vorbereitung für den nachfolgenden Design Sprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Flow */}
      <WorkshopFlowDiagram />

      {/* Comparison Section */}
      <WorkshopComparisonSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Bereit, Ihre Challenge zu <span className="text-primary">schärfen?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Starten Sie mit einem Problem-Framing-Workshop und legen Sie das Fundament 
              für einen erfolgreichen Design Sprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/workshop-registration">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  Jetzt Workshop anfragen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <CalendarBookingDialog
                buttonText="Kostenlose Beratung"
                buttonSize="lg"
                buttonClassName="border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
};

export default ProblemFramingWorkshop;
