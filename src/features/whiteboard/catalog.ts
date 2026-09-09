import { supabase } from "@/integrations/supabase/client";

export interface CatalogSuggestion {
  art: "neu" | "geaendert" | "entfernt";
  name: string;
  display_name?: string;
  provider?: string;
  category?: string;
  unit?: string;
  description_de?: string;
  use_cases?: string[];
  docs_url?: string;
  hinweis?: string;
}

export interface AdviceItem {
  rolle: string;
  modell: string;
  begruendung: string;
  credits?: number;
}

export interface AdviceResult {
  zusammenfassung: string;
  empfehlungen: AdviceItem[];
  gesamt_credits?: number;
  guenstigere_alternative?: AdviceItem | null;
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("kie-catalog", { body });
  if (error) {
    const detail = (data as { error?: string } | null)?.error;
    throw new Error(detail ?? error.message);
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

export const askAdvisor = (prompt: string) =>
  invoke<{ result: AdviceResult; id: string | null }>({ action: "advise", prompt });

export const syncCatalog = () =>
  invoke<{ suggestions: CatalogSuggestion[]; createdAt: string | null }>({ action: "sync" });
