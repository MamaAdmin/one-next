import { useEffect, useState } from "react";

export type ExternalLlmId =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "copilot"
  | "grok"
  | "mistral";

export interface ExternalLlmDef {
  id: ExternalLlmId;
  label: string;
  url: string;
}

export const EXTERNAL_LLMS: ExternalLlmDef[] = [
  { id: "chatgpt", label: "ChatGPT", url: "https://chat.openai.com/" },
  { id: "claude", label: "Claude", url: "https://claude.ai/new" },
  { id: "gemini", label: "Gemini", url: "https://gemini.google.com/app" },
  { id: "perplexity", label: "Perplexity", url: "https://www.perplexity.ai/" },
  { id: "copilot", label: "Copilot", url: "https://copilot.microsoft.com/" },
  { id: "grok", label: "Grok", url: "https://grok.com/" },
  { id: "mistral", label: "Le Chat (Mistral)", url: "https://chat.mistral.ai/" },
];

const STORAGE_KEY = "framing.externalLlms";
const DEFAULT_SELECTION: ExternalLlmId[] = ["chatgpt", "claude", "gemini"];

function readStorage(): ExternalLlmId[] {
  if (typeof window === "undefined") return DEFAULT_SELECTION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SELECTION;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_SELECTION;
    const valid = parsed.filter((v): v is ExternalLlmId =>
      EXTERNAL_LLMS.some((l) => l.id === v),
    );
    return valid;
  } catch {
    return DEFAULT_SELECTION;
  }
}

export function useExternalLlms() {
  const [selected, setSelected] = useState<ExternalLlmId[]>(() => readStorage());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSelected(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next: ExternalLlmId[]) => {
    setSelected(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggle = (id: ExternalLlmId) => {
    persist(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const isSelected = (id: ExternalLlmId) => selected.includes(id);

  const selectedDefs = EXTERNAL_LLMS.filter((l) => selected.includes(l.id));

  return { selected, selectedDefs, toggle, isSelected };
}
