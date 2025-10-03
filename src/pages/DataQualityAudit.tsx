import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function DataQualityAuditPage() {
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-24">
        <div className="mx-auto max-w-7xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-block rounded-full bg-green-100 text-green-900 text-xs font-medium px-3 py-1 mb-4">
              Data Quality Audit · 1-12 Wochen · Messbar · Umsetzbar
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              Datenqualität messbar machen und{" "}
              <span className="text-green-700">strategisch verbessern</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Systematische Analyse Ihrer Datenlandschaft mit klaren Handlungsempfehlungen 
              für nachhaltige Verbesserungen. Von Quick Scan bis umfassendem Assessment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#termin" className="rounded-2xl px-5 py-3 bg-green-600 text-white font-medium shadow hover:bg-green-700">
                Erstgespräch buchen
              </a>
              <a href="#pakete" className="rounded-2xl px-5 py-3 bg-white border border-gray-300 font-medium hover:bg-gray-100">
                Pakete & Preise
              </a>
            </div>
            <ul className="mt-6 text-sm text-gray-600 list-disc pl-5">
              <li>DSGVO/DSG-konform · Need-to-know-Prinzip</li>
              <li>Tool-gestützte Analysen mit etablierten Standards</li>
              <li>Von Quick Wins bis langfristige Roadmap</li>
            </ul>
          </div>
          <div className="md:pl-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg">Warum Data Quality?</h3>
              <p className="mt-2 text-gray-700 text-sm">
                Schlechte Datenqualität kostet Unternehmen durchschnittlich 15-25% ihres Umsatzes 
                und führt zu Fehlinvestitionen in AI/Analytics. Ein systematisches Audit schafft 
                Transparenz und eine fundierte Grundlage für Verbesserungen.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <span className="font-medium">Kosten ↓</span>
                  <p className="text-gray-600">Fehler und Nacharbeit reduzieren</p>
                </div>
                <div className="rounded-xl border p-3">
                  <span className="font-medium">Vertrauen ↑</span>
                  <p className="text-gray-600">Verlässliche Daten für Entscheidungen</p>
                </div>
                <div className="rounded-xl border p-3">
                  <span className="font-medium">Compliance ✓</span>
                  <p className="text-gray-600">DSGVO/DSG-konform und audit-ready</p>
                </div>
                <div className="rounded-xl border p-3">
                  <span className="font-medium">AI-Ready ✓</span>
                  <p className="text-gray-600">Fundament für erfolgreiche AI-Projekte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was ist ein Data Quality Audit */}
      <section className="py-14 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Was ist ein Data Quality Audit?</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 leading-relaxed">
                Ein Data Quality Audit ist eine systematische Bewertung Ihrer Datenlandschaft 
                nach etablierten Qualitätsdimensionen. Anders als Ad-hoc-Prüfungen liefert ein 
                strukturiertes Audit messbare Ergebnisse, klare Ursachenanalysen und konkrete 
                Handlungsempfehlungen.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Wir kombinieren Interviews mit Stakeholdern, tool-gestützte Datenanalysen und 
                Governance-Checks, um ein vollständiges Bild Ihrer Datenqualität zu erhalten – 
                von technischen Metriken bis zu organisatorischen Prozessen.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Typische Trigger für ein Audit:</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
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
      <section id="prozess" className="py-14 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Der Audit-Prozess</h2>
          <p className="mt-2 text-gray-700">
            6 Phasen für eine systematische und fundierte Bewertung Ihrer Datenqualität.
          </p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {phases.map((p, i) => (
              <div key={i} className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 mb-2">{String(i + 1).padStart(2, '0')} / 06</div>
                <h3 className="font-semibold">{p.title}</h3>
                <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
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
      <section id="dimensionen" className="py-14 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Die 6 Qualitätsdimensionen</h2>
          <p className="mt-2 text-gray-700">
            Etablierte Standards für die Bewertung von Datenqualität.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dimensions.map((d, i) => (
              <div key={i} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg">{d.title}</h3>
                <p className="text-xs text-green-700 font-medium mt-1">{d.subtitle}</p>
                <p className="mt-3 text-gray-700 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nutzen */}
      <section id="nutzen" className="py-14 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Ihr Nutzen</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-medium">{b.title}</h3>
                <p className="mt-2 text-gray-700 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section id="deliverables" className="py-14 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Ergebnisse & Artefakte</h2>
          <ul className="mt-6 grid md:grid-cols-2 gap-4 text-sm text-gray-800">
            {deliverables.map((d, i) => (
              <li key={i} className="rounded-2xl bg-white border p-4 shadow-sm">{d}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Optional: PoC/Pilot für DQ-Tools, Data Governance Setup, Schulungen (Add-ons).
          </p>
        </div>
      </section>

      {/* Pakete & Preise */}
      <section id="pakete" className="py-14 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Pakete & Preise</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl border p-6 shadow-sm">
              <h3 className="font-semibold">Quick Scan</h3>
              <p className="text-sm text-gray-600 mt-1">Data Health Check · 1-2 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Stakeholder-Interviews</li>
                <li>High-Level Review der Datenlandschaft</li>
                <li>Erste Findings & Quick Wins</li>
                <li>Kompakter Bericht (5-10 Seiten)</li>
              </ul>
              <div className="mt-6 font-semibold text-green-700">ab CHF 5'000 – 15'000</div>
              <a href="#termin" className="mt-4 inline-block rounded-2xl px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800">
                Anfragen
              </a>
            </div>
            <div className="rounded-3xl border-2 border-green-600 p-6 shadow-sm">
              <div className="inline-block rounded-full bg-green-100 text-green-900 text-xs font-medium px-2 py-1 mb-2">
                Empfohlen
              </div>
              <h3 className="font-semibold">Mittleres Audit</h3>
              <p className="text-sm text-gray-600 mt-1">Standard · 4-6 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Interviews + Tool-gestützte Analysen (DQ-Tools, Data Profiling)</li>
                <li>Bewertung aller 6 Qualitätsdimensionen</li>
                <li>Governance-Check & Gap-Analyse</li>
                <li>Priorisierte Handlungsempfehlungen</li>
                <li>Data Quality Dashboard</li>
              </ul>
              <div className="mt-6 font-semibold text-green-700">Preis auf Anfrage</div>
              <a href="#termin" className="mt-4 inline-block rounded-2xl px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700">
                Anfragen
              </a>
            </div>
            <div className="rounded-3xl border p-6 shadow-sm">
              <h3 className="font-semibold">Umfassendes Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">DQ & Governance · 8-12 Wochen</p>
              <ul className="mt-4 text-sm list-disc pl-5 space-y-1">
                <li>Alles aus "Mittleres Audit"</li>
                <li>Mehrere Datendomänen/Systeme</li>
                <li>Governance-Framework-Design</li>
                <li>Tool-Evaluation & PoC</li>
                <li>Schulungen & Change Management</li>
                <li>Langfristige Roadmap (12+ Monate)</li>
              </ul>
              <div className="mt-6 font-semibold text-green-700">Preis auf Anfrage</div>
              <a href="#termin" className="mt-4 inline-block rounded-2xl px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800">
                Anfragen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Häufige Fragen</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-2xl bg-white border p-5 shadow-sm">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – Termin */}
      <section id="termin" className="py-16 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Loslegen mit einem 20‑Min‑Erstgespräch</h2>
          <p className="mt-2 text-gray-700">
            Wir klären Ziele, Scope und ob ein Data Quality Audit für Sie passt. 
            Auf Wunsch erhalten Sie im Anschluss einen 2‑seitigen Audit-Summary (PDF).
          </p>
          <div className="mt-6">
            <Button asChild size="lg" className="rounded-2xl">
              <a href="mailto:contact@one-next.com">Termin buchen</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
