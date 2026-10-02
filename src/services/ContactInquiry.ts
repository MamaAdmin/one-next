import { supabase } from "@/integrations/supabase/client";

export type ContactInquiryInput = {
  name: string;
  email: string;
  company: string;
  services: string[];
  timing: string;
  message: string;
  website: string;
};

export async function submitContactInquiry(input: ContactInquiryInput): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-contact-inquiry", { body: input });
  if (error) throw error;
}
