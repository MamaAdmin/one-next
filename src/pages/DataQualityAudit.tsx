import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";

export default function DataQualityAuditPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager } = useContentManager();
  const { content, loading, updateContent } = usePageContent('data-quality-audit');
  const phases = [
    {
      title: "Phase 1 – Kick-off & Scope-Definition",
      points: [
        "Stakeholder-Alignment, Ziele klären",
        "Kritische Datendomänen identifizieren",
        "Zeitplan und Zugriffe definieren"
      ]
    },
    {
      title: "Phase 2 – Datenquellen-Inventarisierung",
      points: [
        "Systeme, Datenbanken, Schnittstellen kartieren",
        "Datenflüsse und Dependencies dokumentieren",
        "Verantwortlichkeiten klären"
      ]
    },
    {
      title: "Phase 3 – Qualitätsdimensionen-Assessment",
      points: [
        "6 Dimensionen systematisch prüfen",
        "Tool-gestützte Analysen (Profiling, DQ-Tools)",
        "Metriken und Scores erfassen"
      ]
    },
    {
      title: "Phase 4 – Gap-Analyse & Root-Cause",
      points: [
        "Abweichungen von Soll-Zustand identifizieren",
        "Ursachen für Qualitätsprobleme ermitteln",
        "Business-Impact bewerten"
      ]
    },
    {
      title: "Phase 5 – Maßnahmenplanung",
      points: [
        "Quick Wins vs. langfristige Maßnahmen",
        "Priorisierung nach Impact × Aufwand",
        "Roadmap mit Verantwortlichkeiten"
      ]
    },
    {
      title: "Phase 6 – Übergabe & Empfehlungen",
      points: [
        "Data Quality Report & Executive Summary",
        "Dashboard mit KPIs",
        "Governance-Empfehlungen"
      ]
    }
  ];

  const dimensions = [
    {
      title: "Vollständigkeit",
      subtitle: "Completeness",
      desc: "Sind alle erforderlichen Daten vorhanden? Fehlende Werte, NULL-Anteil"
    },
    {
      title: "Genauigkeit",
      subtitle: "Accuracy",
      desc: "Stimmen Daten mit der Realität überein? Referenzdaten-Abgleich, Plausibilität"
    },
    {
      title: "Konsistenz",
      subtitle: "Consistency",
      desc: "Sind Daten über Systeme hinweg einheitlich? Widersprüche, Format-Differenzen"
    },
    {
      title: "Aktualität",
      subtitle: "Timeliness",
      desc: "Sind die Daten aktuell genug für den Use-Case? Verzögerungen, Update-Frequenz"
    },
    {
      title: "Eindeutigkeit",
      subtitle: "Uniqueness",
      desc: "Gibt es Duplikate oder Mehrfacheinträge? Deduplizierung, Master-Data"
    },
    {
      title: "Validität",
      subtitle: "Validity",
      desc: "Entsprechen Daten definierten Regeln/Standards? Business Rules, Formate, Constraints"
    }
  ];

  const benefits = [
    {
      title: "Transparenz",
      desc: "Klare Sicht auf Datenqualität und Verbesserungspotenziale",
    },
    {
      title: "Fundierte Entscheidungen",
      desc: "Invest-Sicherheit durch faktenbasierte Bewertungen",
    },
    {
      title: "Compliance & Governance",
      desc: "DSGVO/DSG-konform, audit-ready und nachvollziehbar",
    },
    {
      title: "Risikominimierung",
      desc: "Fehler und Fehlinvestitionen frühzeitig vermeiden",
    },
    {
      title: "Quick Wins",
      desc: "Sofort umsetzbare Verbesserungen mit messbarem Impact",
    },
    {
      title: "Datenkultur",
      desc: "Gemeinsames Verständnis und klare Ownership etablieren",
    },
  ];

  const deliverables = [
    "Data Quality Score (DQS) pro Datendomäne",
    "Gap-Analyse-Bericht mit Root-Causes",
    "Priorisierte Maßnahmenliste (Quick Wins + Roadmap)",
    "Datenqualitäts-Dashboard (optional tool-gestützt)",
    "Governance-Empfehlungen (Rollen, Prozesse, Policies)",
    "Executive Summary für C-Level"
  ];

  const faqs = [
    {
      q: "Für wen ist ein Data Quality Audit geeignet?",
      a: "Für Unternehmen, die Daten für Entscheidungen, Reporting, KI oder Analytics nutzen und Transparenz über ihre Datenqualität benötigen. Besonders wertvoll vor größeren AI/Analytics-Projekten oder bei wiederkehrenden Datenproblemen."
    },
    {
      q: "Wie lange dauert ein Audit?",
      a: "Je nach Umfang: Quick Scan 1-2 Wochen, Standard-Audit 4-6 Wochen, umfassendes Assessment 8-12 Wochen. Im Erstgespräch definieren wir gemeinsam den optimalen Scope."
    },
    {
      q: "Welche Datenquellen werden geprüft?",
      a: "Das definieren wir gemeinsam im Kick-off. Typisch: ERP, CRM, Data Warehouse, Cloud-Datenbanken, APIs. Wir fokussieren auf die geschäftskritischen Datenquellen."
    },
    {
      q: "Benötigen Sie Zugriff auf Produktionsdaten?",
      a: "Idealerweise ja, aber wir arbeiten nach Need-to-know-Prinzip und können auch mit anonymisierten Daten oder Testumgebungen arbeiten. Alle Zugriffe werden dokumentiert."
    },
    {
      q: "Ist das DSGVO/DSG-konform?",
      a: "Ja, wir arbeiten nach Datenschutz-Prinzipien und dokumentieren alle Zugriffe. Keine sensiblen Daten in Arbeitsdokumenten, strikte Vertraulichkeit."
    },
    {
      q: "Was passiert nach dem Audit?",
      a: "Sie erhalten einen umfassenden Bericht mit priorisierten Maßnahmen. Optional begleiten wir die Umsetzung, führen PoCs durch oder unterstützen beim Governance-Setup."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-hero pt-24">
        <div className="mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-block rounded-full bg-accent text-accent-foreground text-xs font-medium px-3 py-1 mb-4">
              Data Quality Audit · 1-12 Wochen · Messbar · Umsetzbar
            </p>
            {isEditMode ? (
              <InlineTextArea
                value={content.hero_title || 'Datenqualität messbar machen und strategisch verbessern'}
                onSave={(value) => updateContent('hero_title', value)}
                isEditMode={isEditMode}
                placeholder="Hero title"
                minRows={2}
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                {content.hero_title || 'Datenqualität messbar machen und strategisch verbessern'}
              </h1>
            )}
            <InlineTextArea
              value={content.hero_description || 'Systematische Analyse Ihrer Datenlandschaft mit klaren Handlungsempfehlungen für nachhaltige Verbesserungen. Von Quick Scan bis umfassendem Assessment.'}
              onSave={(value) => updateContent('hero_description', value)}
              isEditMode={isEditMode}
              className="mt-4 text-lg text-muted-foreground"
              placeholder="Hero description"
              minRows={3}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <CalendarBookingDialog
                buttonText="Erstgespräch buchen"
                buttonSize="default"
                buttonClassName="rounded-2xl px-5 py-3"
              />
              <a href="#pakete" className="rounded-2xl px-5 py-3 bg-card border border-border font-medium hover:bg-secondary transition-colors">
                Pakete & Preise
              </a>
            </div>
            <ul className="mt-6 text-sm text-muted-foreground list-disc pl-5">
              <li>DSGVO/DSG-konform · Need-to-know-Prinzip</li>
              <li>Tool-gestützte Analysen mit etablierten Standards</li>
              <li>Von Quick Wins bis langfristige Roadmap</li>
            </ul>
          </div>
          <div className="md:pl-8">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-lg">Warum Data Quality?</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Schlechte Datenqualität kostet Unternehmen durchschnittlich 15-25% ihres Umsatzes 
                und führt zu Fehlinvestitionen in AI/Analytics. Ein systematisches Audit schafft 
                Transparenz und eine fundierte Grundlage für Verbesserungen.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border p-3">
                  <span className="font-medium">Kosten ↓</span>
                  <p className="text-muted-foreground">Fehler und Nacharbeit reduzieren</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <span className="font-medium">Vertrauen ↑</span>
                  <p className="text-muted-foreground">Verlässliche Daten für Entscheidungen</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <span className="font-medium">Compliance ✓</span>
                  <p className="text-muted-foreground">DSGVO/DSG-konform und audit-ready</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <span className="font-medium">AI-Ready ✓</span>
                  <p className="text-muted-foreground">Fundament für erfolgreiche AI-Projekte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist ein Data Quality Audit */}
      <section className="py-14 border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Was ist ein Data Quality Audit?</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground leading-relaxed">
                Ein Data Quality Audit ist eine systematische Bewertung Ihrer Datenlandschaft 
                nach etablierten Qualitätsdimensionen. Anders als Ad-hoc-Prüfungen liefert ein 
                strukturiertes Audit messbare Ergebnisse, klare Ursachenanalysen und konkrete 
                Handlungsempfehlungen.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Wir kombinieren Interviews mit Stakeholdern, tool-gestützte Datenanalysen und 
                Governance-Checks, um ein vollständiges Bild Ihrer Datenqualität zu erhalten – 
                von technischen Metriken bis zu organisatorischen Prozessen.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold mb-3">Typische Trigger für ein Audit:</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Wiederkehrende Probleme mit Datenqualität</li>
                <li>Vorbereitung auf AI/Analytics-Projekte</li>
                <li>Compliance-Anforderungen (DSGVO, Audits)</li>
                <li>Mangelndes Vertrauen in Daten/Reports</li>
                <li>Fehlende Transparenz über Datenquellen</li>
                <li>Hohe Kosten durch Datenbereinigung</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Audit-Prozess */}
      <section id="prozess" className="py-14 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Der Audit-Prozess</h2>
          <p className="mt-2 text-muted-foreground">
            6 Phasen für eine systematische und fundierte Bewertung Ihrer Datenqualität.
          </p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {phases.map((p, i) => (
              <div key={i} className="rounded-3xl bg-card border border-border p-6 shadow-card hover:shadow-hover transition-shadow">
                <div className="text-xs text-muted-foreground mb-2">{String(i + 1).padStart(2, '0')} / 06</div>
                <h3 className="font-semibold">{p.title}</h3>
                <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {p.points.map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualitätsdimensionen */}
      <section id="dimensionen" className="py-14 border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Die 6 Qualitätsdimensionen</h2>
          <p className="mt-2 text-muted-foreground">
            Etablierte Standards für die Bewertung von Datenqualität.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dimensions.map((d, i) => (
              <div key={i} className="rounded-3xl border border-border bg-card p-6 shadow-card hover:shadow-hover transition-shadow">
                <h3 className="font-semibold text-lg">{d.title}</h3>
                <p className="text-xs text-accent-foreground font-medium mt-1">{d.subtitle}</p>
                <p className="mt-3 text-muted-foreground text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nutzen */}
      <section id="nutzen" className="py-14 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Ihr Nutzen</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-3xl border border-border p-6 shadow-card">
                <h3 className="font-medium">{b.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section id="deliverables" className="py-14 border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Ergebnisse & Artefakte</h2>
          <ul className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
            {deliverables.map((d, i) => (
              <li key={i} className="rounded-2xl bg-card border border-border p-4 shadow-card">{d}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Optional: PoC/Pilot für DQ-Tools, Data Governance Setup, Schulungen (Add-ons).
          </p>
        </div>
      </section>

      {/* Pakete & Preise */}
      <section id="pakete" className="py-14 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Pakete & Preise</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border p-6 shadow-card">
              <h3 className="font-semibold">Quick Scan</h3>
              <p className="text-sm text-muted-foreground mt-1">Data Health Check · 1-2 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Stakeholder-Interviews</li>
                <li>High-Level Review der Datenlandschaft</li>
                <li>Erste Findings & Quick Wins</li>
                <li>Kompakter Bericht (5-10 Seiten)</li>
              </ul>
              <div className="mt-6 font-semibold text-primary">ab CHF 5'000 – 15'000</div>
              <div className="mt-4">
                <CalendarBookingDialog
                  buttonText="Anfragen"
                  buttonSize="sm"
                  buttonClassName="rounded-2xl px-4 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-3xl border-2 border-primary p-6 shadow-hover">
              <div className="inline-block rounded-full bg-accent text-accent-foreground text-xs font-medium px-2 py-1 mb-2">
                Empfohlen
              </div>
              <h3 className="font-semibold">Mittleres Audit</h3>
              <p className="text-sm text-muted-foreground mt-1">Standard · 4-6 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Interviews + Tool-gestützte Analysen (DQ-Tools, Data Profiling)</li>
                <li>Bewertung aller 6 Qualitätsdimensionen</li>
                <li>Governance-Check & Gap-Analyse</li>
                <li>Priorisierte Handlungsempfehlungen</li>
                <li>Data Quality Dashboard</li>
              </ul>
              <div className="mt-6 font-semibold text-primary">Preis auf Anfrage</div>
              <div className="mt-4">
                <CalendarBookingDialog
                  buttonText="Anfragen"
                  buttonSize="sm"
                  buttonClassName="rounded-2xl px-4 py-2 text-sm"
                />
              </div>
            </div>
            <div className="rounded-3xl border border-border p-6 shadow-card">
              <h3 className="font-semibold">Umfassendes Assessment</h3>
              <p className="text-sm text-muted-foreground mt-1">DQ & Governance · 8-12 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Alles aus "Mittleres Audit"</li>
                <li>Mehrere Datendomänen/Systeme</li>
                <li>Governance-Framework-Design</li>
                <li>Tool-Evaluation & PoC</li>
                <li>Schulungen & Change Management</li>
                <li>Langfristige Roadmap (12+ Monate)</li>
              </ul>
              <div className="mt-6 font-semibold text-primary">Preis auf Anfrage</div>
              <div className="mt-4">
                <CalendarBookingDialog
                  buttonText="Anfragen"
                  buttonSize="sm"
                  buttonClassName="rounded-2xl px-4 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 border-t border-border">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Häufige Fragen</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-2xl bg-card border border-border p-5 shadow-card">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – Termin */}
      <section id="termin" className="py-16 bg-gradient-hero border-t border-border">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Loslegen mit einem 20‑Min‑Erstgespräch</h2>
          <p className="mt-2 text-muted-foreground">
            Wir klären Ziele, Scope und ob ein Data Quality Audit für Sie passt. 
            Auf Wunsch erhalten Sie im Anschluss einen 2‑seitigen Audit-Summary (PDF).
          </p>
          <div className="mt-6">
            <CalendarBookingDialog
              buttonText="Termin buchen"
              buttonSize="lg"
              buttonClassName="rounded-2xl"
            />
          </div>
        </div>
      </section>

      <Footer />
      {isContentManager && !loading && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}
    </div>
  );
}
