
# Externe KI-Tools auswählen und pro Schritt verlinken

## Ziel
Im Intro-Schritt („So arbeitest du") kann der Nutzer seine bevorzugten externen KI-Tools auswählen. In jedem Framing-Schritt erscheint dann eine kompakte „Externe KI-Hilfe"-Leiste mit direkten Links zu genau diesen Tools — jeder Link öffnet in einem neuen Browser-Tab neben dem Framing/Sprint-Tab.

## Änderungen

### 1. Neue Datei `src/features/framing/externalLlms.ts`
Katalog der unterstützten Tools + LocalStorage-Hook.

```ts
export type ExternalLlmId = "chatgpt" | "claude" | "gemini" | "perplexity" | "copilot" | "grok" | "mistral";

export const EXTERNAL_LLMS: {
  id: ExternalLlmId;
  label: string;
  url: string;      // Ziel, öffnet Chat direkt
  color: string;    // Marken-Akzent (Tailwind-Klasse)
}[] = [
  { id: "chatgpt",    label: "ChatGPT",    url: "https://chat.openai.com/",       color: "..." },
  { id: "claude",     label: "Claude",     url: "https://claude.ai/new",          color: "..." },
  { id: "gemini",     label: "Gemini",     url: "https://gemini.google.com/app",  color: "..." },
  { id: "perplexity", label: "Perplexity", url: "https://www.perplexity.ai/",     color: "..." },
  { id: "copilot",    label: "Copilot",    url: "https://copilot.microsoft.com/", color: "..." },
  { id: "grok",       label: "Grok",       url: "https://grok.com/",              color: "..." },
  { id: "mistral",    label: "Le Chat",    url: "https://chat.mistral.ai/",       color: "..." },
];

// useExternalLlms(): { selected: ExternalLlmId[]; toggle(id); }
// Persistenz: localStorage key "framing.externalLlms"
// Default: ["chatgpt", "claude", "gemini"]
```

### 2. `IntroSlide` erweitern (FramingStepCard.tsx, Block 3)
Statt statischer Aufzählung „Claude, Gemini, ChatGPT" bekommt Block 3 zusätzlich eine Checkbox-Reihe:

```
Deine bevorzugten externen KI-Tools:
[✓] ChatGPT  [✓] Claude  [✓] Gemini  [ ] Perplexity  [ ] Copilot  [ ] Grok  [ ] Le Chat
```

Auswahl wird über `useExternalLlms()` in localStorage gespeichert und beeinflusst sofort alle anderen Schritte. Der bisherige Erklärtext bleibt, wird nur konsistent an die Auswahl angepasst.

### 3. Neue Komponente `ExternalLlmBar`
`src/components/framing/ExternalLlmBar.tsx` — kompakte Leiste:

```
🔎 Externe KI-Hilfe:  [ChatGPT ↗]  [Claude ↗]  [Gemini ↗]
```

- Jeder Button ist ein `<a href={url} target="_blank" rel="noopener noreferrer">` mit `ExternalLink`-Icon (Lucide).
- Rendert nur die ausgewählten Tools aus dem Hook.
- Wenn Auswahl leer: dezenter Hinweis „Im Intro-Schritt KI-Tools auswählen" + Link zum Intro.

### 4. `ExternalLlmBar` in jeden Framing-Schritt einbauen
In `FramingStepCard.tsx` direkt unter dem Step-Header (nach `arbeit`-Beschreibung, vor dem Inhalt) einfügen — für alle Varianten außer `intro` (dort ist die Auswahl-UI selbst).

Optional: Tooltip am Icon mit dem empfohlenen Prompt-Rahmen aus dem Intro („Kontext + aktuelle Frage + 3–5 Stichpunkte").

## Was NICHT passiert
- Keine DB-Änderung (Auswahl bleibt clientseitig via localStorage — pro Browser/User).
- Keine Änderung an Framing-Schritt-Inhalten oder KI-Vorschlags-Logik.
- Keine Übernahme externer Antworten ins Tool (der User kopiert manuell wie bisher).
- Farbregel „übernommene KI-Vorschläge bleiben blau/pink" bleibt unverändert.

## Ergebnis
- Intro: sichtbare Multi-Select für LLM-Präferenzen, Standard = ChatGPT + Claude + Gemini.
- Jeder Schritt: klickbare Direkt-Links zu genau diesen Tools, jeweils in neuem Tab.
- Ein-Klick-Weg vom Framing-Schritt zum Wunsch-LLM, ohne den Sprint-Tab zu verlieren.
