export type RendererKey =
  | "whiteboard"
  | "flat"
  | "motion"
  | "screencast"
  | "isometric"
  | "typography"
  | "avatar";

export interface WhiteboardStyleOption {
  value: string;
  label: string;
  merkmale: string;
  eignung: string;
  skriptart: string;
  beispielUrl: string;
  beispielLabel: string;
  promptSuffix: string;
  renderer: RendererKey;
  generierbar: boolean;
  nichtGenerierbarGrund?: string;
}

export const WHITEBOARD_STYLES: WhiteboardStyleOption[] = [
  {
    value: "whiteboard",
    label: "Whiteboard / Legetrick",
    merkmale: "Hand zeichnet Symbole und Begriffe, linearer Aufbau",
    eignung: "Compliance, Grundlagen, Prozesse, Regeln",
    skriptart: "Problem–Erklärung–Lösung, Schritt für Schritt",
    beispielUrl: "https://www.youtube.com/watch?v=MdBOrEDT5ro",
    beispielLabel: "explainity – Inflation einfach erklärt",
    promptSuffix:
      "Black ink whiteboard marker line drawing, hand drawn doodle style, clean white background, no text, minimal, high contrast.",
    renderer: "whiteboard",
    generierbar: true,
  },
  {
    value: "flat_2d",
    label: "Flat 2D / Vektor",
    merkmale: "Flächige Illustrationen, klare Farben, reduzierte Formen",
    eignung: "Lernmodule, Produktwissen, allgemeine Erklärungen",
    skriptart: "Hook–Kontext–Kernmodell–Zusammenfassung",
    beispielUrl: "https://www.youtube.com/channel/UCsXVk37bltHxD1rDPwtNM8Q",
    beispielLabel: "Kurzgesagt",
    promptSuffix:
      "Flat vector illustration, simple geometric shapes, limited muted color palette, clean light background, no text.",
    renderer: "flat",
    generierbar: true,
  },
  {
    value: "character_2d",
    label: "2D Character Animation",
    merkmale: "Figuren verkörpern Zielgruppe, Problem und Handlung",
    eignung: "Onboarding, Verhalten, Soft Skills",
    skriptart: "Story-driven: Ausgangslage–Konflikt–Veränderung",
    beispielUrl: "https://demoduck.com/",
    beispielLabel: "Demo Duck – Portfolio",
    promptSuffix:
      "Friendly 2D character illustration, flat colors, bold outlines, expressive simple faces, clean light background, no text.",
    renderer: "flat",
    generierbar: true,
  },
  {
    value: "motion_graphics",
    label: "Motion Graphics",
    merkmale: "Typografie, Icons und Formen bewegen sich rhythmisch",
    eignung: "Zahlen, Strategie, Management-Updates",
    skriptart: "These–Belege–Konsequenz–Handlungsaufruf",
    beispielUrl: "https://epipheo.com/epipheo/",
    beispielLabel: "Epipheo – Video Styles",
    promptSuffix:
      "Bold motion graphics key visual, geometric icons and shapes, strong accent colors on dark background, no text.",
    renderer: "motion",
    generierbar: true,
  },
  {
    value: "infografik",
    label: "Infografik-Animation",
    merkmale: "Daten, Abläufe und Kennzahlen stehen im Mittelpunkt",
    eignung: "Wissenschaft, Finanzen, ESG, Reports",
    skriptart: "Frage–Daten–Interpretation–Takeaways",
    beispielUrl: "https://www.yansmedia.com/blog/types-of-explainer-videos",
    beispielLabel: "Yans Media – Stilübersicht",
    promptSuffix:
      "Clean infographic illustration, charts, arrows and process diagram, flat editorial style, light background, no text labels.",
    renderer: "motion",
    generierbar: true,
  },
  {
    value: "screencast",
    label: "Screencast / UI-Demo",
    merkmale: "Softwareoberfläche mit Cursor, Zoom und Hervorhebungen",
    eignung: "Software-Schulung, Tutorials, App-Onboarding",
    skriptart: "Ziel–Schritt 1–Schritt 2–Fehlerhinweis–Ergebnis",
    beispielUrl: "https://www.youtube.com/watch?v=9y927xiDtJo",
    beispielLabel: "Moodcaster – Software Demo",
    promptSuffix:
      "Clean software user interface mockup, dashboard with panels and buttons, subtle shadows, light UI design, no readable text.",
    renderer: "screencast",
    generierbar: false,
    nichtGenerierbarGrund:
      "Braucht eine Bildschirmaufnahme deiner Software. Die KI kann nur Standbilder erzeugen, keine echte Oberfläche.",
  },
  {
    value: "screencast_plus",
    label: "Screencast plus Animation",
    merkmale: "Oberfläche ergänzt durch animierte Erklärungen",
    eignung: "SaaS, komplexe Workflows, digitale Produkte",
    skriptart: "Problem im Alltag–Produktmoment–Workflow–Nutzen",
    beispielUrl: "https://vidico.com/explainer-video-production/",
    beispielLabel: "Vidico – Explainer Production",
    promptSuffix:
      "Software interface mockup combined with flat illustrated icons and callout shapes, light background, no readable text.",
    renderer: "screencast",
    generierbar: false,
    nichtGenerierbarGrund:
      "Braucht eine Bildschirmaufnahme deiner Software. Die KI kann nur Standbilder erzeugen, keine echte Oberfläche.",
  },
  {
    value: "isometric_3d",
    label: "3D / Isometrisch",
    merkmale: "Räumliche Modelle, technische Details, Kamerafahrten",
    eignung: "Industrie, Medizin, Maschinen, Technik",
    skriptart: "Bauteil/Prozess–Funktionsweise–Anwendung–Nutzen",
    beispielUrl: "https://www.yumyumvideos.com/",
    beispielLabel: "Yum Yum Videos – Isometric",
    promptSuffix:
      "Isometric 3D illustration, clean technical render, soft lighting, muted palette, dark neutral background, no text.",
    renderer: "isometric",
    generierbar: true,
  },
  {
    value: "kinetic_typo",
    label: "Kinetic Typography",
    merkmale: "Sprache wird durch bewegte Schrift visualisiert",
    eignung: "Kurzformate, Definitionen, Recaps",
    skriptart: "Starker Hook–3 Kernaussagen–Merksatz",
    beispielUrl: "https://www.kasradesign.com/types-of-explainer-videos/",
    beispielLabel: "Kasra Design – Explainer-Typen",
    promptSuffix:
      "Minimal abstract typographic background texture, bold shapes, high contrast, no readable text.",
    renderer: "typography",
    generierbar: true,
  },
  {
    value: "avatar",
    label: "Avatar / Presenter",
    merkmale: "Ein Avatar spricht direkt zur Zielgruppe",
    eignung: "Standardschulungen, Microlearning, mehrsprachig",
    skriptart: "Begrüssung–Lernziel–Erklärung–Wissenscheck",
    beispielUrl: "https://simpleshow.com/de/erklaervideos/",
    beispielLabel: "simpleshow – Erklärvideo-Formate",
    promptSuffix:
      "Friendly illustrated presenter figure, upper body, neutral studio background, flat vector style, no text.",
    renderer: "avatar",
    generierbar: true,
  },
  {
    value: "mixed_media",
    label: "Mixed Media",
    merkmale: "Realfilm, Animation, Fotos und Typografie kombiniert",
    eignung: "Kampagnen, Case Studies, Change-Themen",
    skriptart: "Fallbeispiel–Problem–Intervention–Ergebnis",
    beispielUrl: "https://demoduck.com/",
    beispielLabel: "Demo Duck – Mixed Media",
    promptSuffix: "",
    renderer: "flat",
    generierbar: false,
    nichtGenerierbarGrund:
      "Dieser Stil dient als Vorlage für eine Produktion und wird nicht automatisch erzeugt.",
  },
  {
    value: "live_action",
    label: "Live-Action",
    merkmale: "Reale Personen, Orte oder Produkte, oft mit Sprecher",
    eignung: "Vertrauen, Führung, Praxisbeispiele",
    skriptart: "Situation–O-Ton–Erklärung–Beweis–Handlung",
    beispielUrl: "https://demoduck.com/",
    beispielLabel: "Demo Duck – Live Action",
    promptSuffix: "",
    renderer: "flat",
    generierbar: false,
    nichtGenerierbarGrund:
      "Dieser Stil dient als Vorlage für eine Produktion und wird nicht automatisch erzeugt.",
  },
];

/** Zuordnung Lernziel → empfohlener Stil (aus der Marktrecherche). */
export const STYLE_RECOMMENDATIONS: Array<{ lernziel: string; stil: string; warum: string }> = [
  {
    lernziel: "Begriff oder Konzept verstehen",
    stil: "Flat 2D oder Whiteboard",
    warum: "Reduziert die kognitive Last und lenkt auf die Kernidee",
  },
  {
    lernziel: "Software bedienen",
    stil: "Screencast",
    warum:
      "Zeigt das tatsächliche Interface und konkrete Handlungen. Aufnahme selbst erstellen, die Vertonung übernimmt das Tool.",
  },
  {
    lernziel: "Prozess oder System verstehen",
    stil: "Motion Graphics oder Infografik",
    warum: "Macht Reihenfolgen, Mengen und Abhängigkeiten sichtbar",
  },
  {
    lernziel: "Verhalten verändern",
    stil: "Character Animation",
    warum: "Erzeugt Identifikation und zeigt soziale Situationen",
  },
  {
    lernziel: "Maschine oder Technik erklären",
    stil: "3D / Isometrisch",
    warum: "Räumliche und technische Zusammenhänge werden sichtbar",
  },
  {
    lernziel: "Wiederholbare Pflichtschulung",
    stil: "Avatar plus 2D-Elemente",
    warum: "Schnell aktualisierbar und gut lokalisierbar",
  },
];

const LEGACY_MAP: Record<string, string> = {
  strichzeichnung: "whiteboard",
  bunte_marker: "whiteboard",
  bleistift: "whiteboard",
  kreide: "whiteboard",
  comic: "character_2d",
  business_flat: "flat_2d",
};

export const normalizeStyle = (value?: string | null): string => {
  if (!value) return "whiteboard";
  if (WHITEBOARD_STYLES.some((s) => s.value === value)) return value;
  return LEGACY_MAP[value] ?? "whiteboard";
};

export const styleOption = (value?: string | null): WhiteboardStyleOption =>
  WHITEBOARD_STYLES.find((s) => s.value === normalizeStyle(value)) ?? WHITEBOARD_STYLES[0];

export const styleLabel = (value?: string | null): string => styleOption(value).label;
