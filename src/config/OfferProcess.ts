export type OfferProcessStep = {
  number: string;
  title: string;
  service: string;
  question: string;
  description: string;
  result: string;
  href: string;
  linkLabel: string;
  alternativeLinks?: { href: string; label: string }[];
  example: string;
};

export const offerProcessSteps: OfferProcessStep[] = [
  {
    number: "01",
    title: "Das richtige Problem klären",
    service: "Problem Framing",
    question: "Welches Problem entsteht für wen – und woran erkennen wir eine Verbesserung?",
    description: "Wir trennen Symptome von Ursachen, legen Zielgruppe und Verantwortung fest und definieren eine messbare Challenge.",
    result: "Ein freigegebenes Challenge Statement mit Scope und Erfolgskriterien.",
    href: "/problem-framing-workshop",
    linkLabel: "Problem Framing ansehen",
    example: "Das Team erkennt: Nicht die Preisentscheidung, sondern die Suche nach freigegebenen Unterlagen verursacht viel Wartezeit.",
  },
  {
    number: "02",
    title: "Eine Lösung klein testen",
    service: "Design Sprint",
    question: "Welche kleine Lösung lässt sich prüfen, bevor viel investiert wird?",
    description: "Im moderierten oder selbstgeführten Sprint entwickeln wir mehrere Ansätze, bauen einen einfachen Prototyp und testen ihn mit echten Nutzenden.",
    result: "Ein getesteter Lösungsansatz mit belegten Erkenntnissen.",
    href: "/sprint-uebersicht",
    linkLabel: "Sprintform wählen",
    example: "Ein Assistent findet freigegebene Produktinformationen und erstellt einen Angebotsentwurf. Versendet wird noch nichts automatisch.",
  },
  {
    number: "03",
    title: "Einen sicheren KI-Arbeitsablauf entwickeln",
    service: "KI-Arbeitsablauf",
    question: "Wie arbeiten Menschen und KI verlässlich zusammen?",
    description: "Wir überführen den validierten Ansatz in einen umsetzbaren Ablauf mit Datenquellen, Rollen, Prüfungen und menschlicher Freigabe.",
    result: "Ein erprobbarer KI-Arbeitsablauf mit klarer Verantwortung.",
    href: "/custom-ai-development",
    linkLabel: "KI-Arbeitsablauf ansehen",
    example: "Die KI erstellt den Entwurf, der Verkauf prüft Bedarf und Ton, eine verantwortliche Person bestätigt Preise und Zusagen.",
  },
  {
    number: "04",
    title: "Wirkung messen, verbessern und skalieren",
    service: "Erprobung und Weiterentwicklung",
    question: "Ist das vollständige Ergebnis besser – nicht nur der erste Entwurf schneller?",
    description: "Wir vergleichen reale Fälle, berücksichtigen Korrekturen, Fehler, Nacharbeit und Risiken und entscheiden danach über Anpassung, Abbruch oder Ausbau.",
    result: "Eine belastbare Entscheidung und ein schrittweiser Ausbauplan.",
    href: "/ai-consulting-services",
    linkLabel: "Begleitung besprechen",
    example: "Nach vier Wochen werden Bearbeitungszeit, Fehler, Nacharbeit und Rückfragen mit dem Ausgangswert von fünf Arbeitstagen verglichen.",
  },
];

export const supportingOffers = [
  {
    title: "KI-Beratung",
    description: "Begleitet den gesamten Weg bei Orientierung, Priorisierung, Governance und Veränderung.",
    href: "/ai-consulting-services",
    linkLabel: "KI-Beratung ansehen",
  },
  {
    title: "Datenqualitäts-Audit",
    description: "Prüft bei Bedarf, ob Daten für einen verlässlichen Test oder die spätere Umsetzung geeignet sind.",
    href: "/data-quality-audit",
    linkLabel: "Datenqualität prüfen",
  },
];