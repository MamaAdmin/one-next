import { supabase } from "@/integrations/supabase/client";

/**
 * Checks whether the given user account has been approved by an admin.
 * If no profile row exists (yet), access is allowed to avoid lockouts.
 */
export async function isUserApproved(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("approved")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return true;
  return data.approved !== false;
}
