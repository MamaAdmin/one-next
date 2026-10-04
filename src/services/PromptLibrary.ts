import { supabase } from "@/integrations/supabase/client";

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  created_at: string;
}

export const listPromptTemplates = async (): Promise<PromptTemplate[]> => {
  const { data, error } = await supabase
    .from("image_prompt_library")
    .select("id, title, prompt, created_at")
    .order("title");
  if (error) throw error;
  return data ?? [];
};

export const savePromptTemplate = async (input: { id?: string; title: string; prompt: string }) => {
  const { error } = input.id
    ? await supabase.from("image_prompt_library").update({ title: input.title, prompt: input.prompt }).eq("id", input.id)
    : await supabase.from("image_prompt_library").insert({ title: input.title, prompt: input.prompt });
  if (error) throw error;
};

export const deletePromptTemplate = async (id: string) => {
  const { error } = await supabase.from("image_prompt_library").delete().eq("id", id);
  if (error) throw error;
};
