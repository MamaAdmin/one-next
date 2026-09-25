import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  Compass,
  Cpu,
  FileCheck2,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Network,
  Rocket,
  Scale,
  ShoppingBag,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { SEO } from "@/components/SEO";
import { createServiceSchema, createBreadcrumbSchema, createFAQSchema } from "@/config/seoConfig";
import { ServicePageHero } from "@/components/service/ServicePageHero";
import { ServiceProcessContext } from "@/components/service/ServiceProcessContext";
import consultingImage from "@/assets/ai-consulting-strategy.jpg";

const approach = [
  { title: "Geschäftsziele verstehen", desc: "Wir analysieren Ihre strategischen Ziele und identifizieren, wo KI den größten Impact erzielen kann.", icon: Target },
  { title: "KI-Potenziale identifizieren", desc: "Konkrete Use Cases erkennen und ihre technische Machbarkeit sowie ihren ROI bewerten.", icon: Brain },
  { title: "Roadmap entwickeln", desc: "Eine Implementierungsstrategie mit klaren Meilensteinen und Prioritäten erstellen.", icon: Lightbulb },
  { title: "Technologie-Auswahl", desc: "Die passenden KI-Technologien und -Plattformen für Ihre Anforderungen empfehlen.", icon: Cpu },
  { title: "ROI-Bewertung", desc: "Den erwarteten Business Value quantifizieren und KPIs zur Erfolgsmessung definieren.", icon: BarChart3 },
  { title: "Change Management", desc: "Die organisatorische Transformation und das Enablement der Mitarbeitenden begleiten.", icon: Users },
];

const services = [
  { title: "KI-Strategie-Entwicklung", desc: "Eine umfassende KI-Strategie, abgestimmt auf Ihre Unternehmensziele: Vision, Ziele und konkrete Maßnahmen für Ihre KI-Transformation.", icon: Target },
  { title: "Machbarkeitsanalysen", desc: "Technische und wirtschaftliche Bewertung Ihrer KI-Ideen – Datenverfügbarkeit, technologische Reife und erwarteter ROI.", icon: Lightbulb },
  { title: "Technologie-Evaluierung", desc: "Auswahl der passenden KI-Technologien, Tools und Plattformen – von der Cloud-Infrastruktur bis zu spezialisierten ML-Frameworks.", icon: Cpu },
  { title: "Implementierungs-Roadmaps", desc: "Detaillierte Pläne mit Zeitlinien, Ressourcenplanung, Budgetierung und Risikobetrachtung für Ihre KI-Projekte.", icon: Rocket },
  { title: "Team-Training & Workshops", desc: "Praxisnahe Trainings, Workshops und Wissenstransfer – von KI-Grundlagen bis zu spezialisierten Themen.", icon: GraduationCap },
  { title: "Ethik & Governance", desc: "KI-Governance-Frameworks, ethische Richtlinien und Compliance-Strategien für verantwortungsvollen KI-Einsatz.", icon: Scale },
];

const industries = [
  { title: "Fertigung & Industrie", desc: "Predictive Maintenance, Qualitätskontrolle, Supply-Chain-Optimierung, Produktionsplanung und autonome Systeme.", icon: Building2 },
  { title: "Finanzdienstleistungen", desc: "Fraud Detection, Risikomanagement, algorithmischer Handel, Kreditbewertung und personalisierte Kundenberatung.", icon: TrendingUp },
  { title: "Handel & E-Commerce", desc: "Personalisierung, Empfehlungssysteme, dynamische Preisgestaltung, Nachfrageprognose und Customer Experience.", icon: ShoppingBag },
  { title: "Gesundheitswesen", desc: "Diagnostische Assistenzsysteme, Patientendatenanalyse, Medikamentenentwicklung und Ressourcenoptimierung.", icon: HeartPulse },
];

const nextSteps = [
  { title: "Problem-Framing-Workshop", desc: "Wenn die Challenge noch unklar ist: Problemstellung schärfen, Zielgruppe priorisieren, Erfolgskriterien definieren.", to: "/problem-framing-workshop" },
  { title: "KI-unterstützter Design Sprint", desc: "Wenn die Challenge steht: Lösungsansatz entwickeln, Prototyp bauen und mit Nutzenden testen.", to: "/design-sprint-workshop" },
  { title: "Individuelle KI-Entwicklung", desc: "Wenn der Lösungsansatz validiert ist: BMAD-Blueprint und umsetzungsreifer High-Level-Plan.", to: "/custom-ai-development" },
];

const AIConsultingServices = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager } = useContentManager();
  const { content, loading, updateContent } = usePageContent('ai-consulting-services');

  const structuredData = [
    createServiceSchema(
      "KI Consulting Services",
      "Persönliche KI-Beratung für Unternehmen – von der Potenzialanalyse bis zur Umsetzungsbegleitung. Für spezialisierte Themen vermitteln wir gezielt Fachleute aus unserem Netzwerk.",
      "https://one-next.de/ai-consulting-services"
    ),
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "Services", url: "https://one-next.de/#services" },
      { name: "KI Consulting", url: "https://one-next.de/ai-consulting-services" }
    ]),
    createFAQSchema([
      {
        question: "Was umfasst KI Consulting?",
        answer: "KI Consulting umfasst die strategische Beratung von Unternehmen bei der Identifikation, Bewertung und Umsetzung von KI-Potenzialen - von der ersten Analyse bis zur erfolgreichen Implementierung."
      },
      {
        question: "Für welche Unternehmen eignet sich KI Consulting?",
        answer: "KI Consulting eignet sich für Unternehmen jeder Größe, die KI-Technologien strategisch nutzen möchten, um Prozesse zu optimieren, neue Geschäftsmodelle zu entwickeln oder Wettbewerbsvorteile zu schaffen."
      },
      {
        question: "Beraten Sie alle Themen selbst?",
        answer: "Die strategische Beratung zu Zielen, Potenzialen und Vorgehen übernehme ich persönlich. Für spezialisierte Themen vermittle ich gezielt geprüfte Fachleute aus meinem Netzwerk und begleite die Zusammenarbeit weiter."
      }
    ])
  ];

  return (
    <>
      <SEO
        title="KI Consulting Services | Persönliche KI-Beratung | one-next"
        description="Persönliche KI-Beratung begleitet Ihren Weg vom Geschäftsproblem bis zur belegten Wirkung – mit Priorisierung, Governance, Veränderung und Skalierung."
        keywords="KI Consulting, KI-Beratung, KI Strategie, Künstliche Intelligenz Beratung, KI Transformation, Innovation Consulting"
        canonical="https://one-next.de/ai-consulting-services"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-workshop text-foreground">
        <Navigation />
        <main className="overflow-hidden pt-16">
          <ServicePageHero
            badge="Orientierung und Strategie"
            badgeIcon={Compass}
            titleSlot={
              <InlineTextField
                value={content.hero_title || 'KI-Beratung'}
                onSave={(value) => updateContent('hero_title', value)}
                isEditMode={isEditMode}
                className="font-workshop-heading text-4xl font-bold leading-tight md:text-6xl"
                placeholder="Hero title"
                as="h1"
              />
            }
            descriptionSlot={
              <>
                <span className="mt-3 block font-workshop-heading text-3xl font-bold leading-tight text-primary-glow md:text-4xl">
                  Persönlich beraten, im Netzwerk verstärkt
                </span>
                <div className="mt-6 max-w-2xl">
                  <InlineTextArea
                    value={content.hero_description || 'Ich berate Sie persönlich zu Zielen, Potenzialen und Vorgehen rund um KI – von der ersten Einordnung bis zur Roadmap. Braucht ein Thema tiefe Spezialkenntnisse, vermittle ich gezielt geprüfte Fachleute aus meinem Netzwerk und bleibe als Ansprechpartnerin an Ihrer Seite.'}
                    onSave={(value) => updateContent('hero_description', value)}
                    isEditMode={isEditMode}
                    className="text-lg leading-relaxed text-muted-foreground md:text-xl"
                    placeholder="Hero description"
                    minRows={3}
                  />
                </div>
              </>
            }
            actions={<CalendarBookingDialog buttonText="Beratungsgespräch vereinbaren" buttonSize="lg" />}
            facts={[
              { value: "Persönlich", label: "Beratung" },
              { value: "Netzwerk", label: "Expertinnen und Experten" },
              { value: "Individuell", label: "Umfang" },
            ]}
            image={consultingImage}
            imageAlt="Beratungsteam entwickelt eine KI-Roadmap an einer Wandübersicht"
          />

          <ServiceProcessContext supportingOffer="consulting" />

          {/* Ausgangslage und Ziel */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Ausgangslage und Ziel</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Aus vielen Möglichkeiten wird ein klarer Weg</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <Target className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Zweck</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      KI nicht als isolierte Technologie betrachten, sondern als <strong className="text-foreground">Teil Ihrer Geschäftsstrategie</strong> – mit realistischer Einschätzung von Nutzen, Aufwand und organisatorischen Voraussetzungen.
                    </p>
                  </div>
                  <div className="border-l-2 border-border pl-6 md:pl-8">
                    <FileCheck2 className="mb-5 size-8 text-primary" />
                    <h3 className="font-workshop-heading text-2xl font-semibold">Ergebnis</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      Bewertete KI-Potenziale, eine priorisierte Roadmap mit Meilensteinen sowie eine klare Empfehlung, welcher nächste Schritt für Sie sinnvoll ist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Persönliche Beratung und Netzwerk */}
          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Wer berät</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Persönliche Beratung und Netzwerk</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                    Sie haben eine feste Ansprechpartnerin – und bei Bedarf Zugriff auf spezialisierte Fachleute, ohne selbst suchen zu müssen.
                  </p>
                </div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {[
                    [UserRound, "Beratung durch mich", "Strategie, Potenziale, Priorisierung und Vorgehen bespreche ich persönlich mit Ihnen."],
                    [Network, "Fachleute aus dem Netzwerk", "Für spezialisierte Themen vermittle ich gezielt geprüfte Expertinnen und Experten."],
                    [Compass, "Begleitung bleibt", "Auch bei Weitergabe bleibe ich Ansprechpartnerin und behalte den roten Faden."],
                    [CheckCircle2, "Kein Overhead", "Sie erhalten die Kompetenz, die Ihr Thema braucht – ohne grosse Beratungsstruktur."],
                  ].map(([Icon, title, text]) => {
                    const ItemIcon = Icon as typeof Compass;
                    return (
                      <div key={title as string} className="flex gap-4 border-b border-border py-5">
                        <ItemIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div>
                          <h3 className="font-workshop-heading font-semibold">{title as string}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text as string}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Beratungsansatz */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Beratungsansatz</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Sechs Schritte von der Idee zur Roadmap</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                    Der Umfang richtet sich nach Ihrer Ausgangslage – die Reihenfolge bleibt dieselbe.
                  </p>
                </div>

                <div className="hidden grid-cols-2 gap-x-16 md:grid">
                  {approach.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <article key={step.title} className="border-b border-border py-7">
                        <div className="flex items-start gap-5">
                          <span className="font-workshop-heading text-3xl font-bold text-border-strong">{String(index + 1).padStart(2, "0")}</span>
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
                  {approach.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <AccordionItem key={step.title} value={`approach-${index}`}>
                        <AccordionTrigger className="gap-3 text-left hover:no-underline">
                          <span className="font-workshop-heading text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                          <Icon className="size-5 shrink-0 text-primary" />
                          <span className="flex-1 font-workshop-heading">{step.title}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="pl-16 leading-relaxed text-muted-foreground">{step.desc}</p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </div>
          </section>

          {/* Beratungsleistungen */}
          <section className="border-y border-border-accent bg-accent-soft/40 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Beratungsleistungen</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Was Sie konkret buchen können</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                    Einzeln oder kombiniert – je nachdem, wo Sie gerade stehen.
                  </p>
                </div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div key={service.title} className="flex gap-4 border-b border-border-accent py-5">
                        <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div>
                          <h3 className="font-workshop-heading font-semibold">{service.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Branchen und Use Cases */}
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Branchen und Use Cases</p>
                  <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Wo KI bereits Wirkung zeigt</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                    Wir beraten Unternehmen in verschiedenen Branchen und entwickeln KI-Lösungen für vielfältige Anwendungsfälle.
                  </p>
                </div>
                <div className="grid gap-x-12 gap-y-0 md:grid-cols-2">
                  {industries.map((industry) => {
                    const Icon = industry.icon;
                    return (
                      <div key={industry.title} className="flex gap-5 border-b border-border py-6">
                        <Icon className="mt-1 size-6 shrink-0 text-primary" />
                        <div>
                          <h3 className="font-workshop-heading text-lg font-semibold">{industry.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{industry.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Einordnung in die Leistungen */}
          <section className="border-y border-border bg-muted/35 py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="mb-12 max-w-2xl">
                  <p className="mb-3 text-sm font-bold uppercase text-primary">Der nächste Schritt</p>
                   <h2 className="font-workshop-heading text-3xl font-bold md:text-4xl">Wie Beratung den gesamten Prozess begleitet</h2>
                  <p className="mt-5 leading-relaxed text-muted-foreground">
                     Die Beratung ordnet ein, priorisiert und begleitet Entscheidungen vor, während oder nach den Kernphasen. Die drei Formate bauen aufeinander auf, sind aber kein starrer Pflichtpfad.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {nextSteps.map((step, index) => (
                    <Link
                      key={step.title}
                      to={step.to}
                      className="group border border-border bg-background p-6 transition-colors hover:border-border-accent hover:bg-accent-soft/40"
                    >
                      <span className="font-workshop-heading text-3xl font-bold text-border-strong">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="mt-4 font-workshop-heading text-lg font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Mehr erfahren <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Abschluss */}
          <section className="border-t border-border bg-muted/40 py-20 md:py-28">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="font-workshop-heading text-3xl font-bold md:text-5xl">Starten Sie Ihre KI-Journey</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Lassen Sie uns gemeinsam herausfinden, wo KI in Ihrem Unternehmen wirklich Nutzen stiftet. Im unverbindlichen Erstgespräch erhalten Sie eine erste Einschätzung Ihrer Potenziale – und eine klare Empfehlung für den nächsten Schritt.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <CalendarBookingDialog buttonText="Kostenloses Beratungsgespräch vereinbaren" buttonSize="lg" />
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/problem-framing-workshop">Zum Problem Framing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        {isContentManager && !loading && (
          <EditToggleButton
            isEditMode={isEditMode}
            onToggle={() => setIsEditMode(!isEditMode)}
          />
        )}
      </div>
    </>
  );
};

export default AIConsultingServices;
