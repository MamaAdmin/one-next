import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invitation {
  id: string;
  customer_id: string;
  invited_by: string;
  email: string;
  full_name: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export const useInvitations = (customerId?: string) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    if (!customerId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("Fehler beim Laden der Einladungen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [customerId]);

  const createInvitation = async (email: string, fullName: string) => {
    try {
      if (!customerId) throw new Error("Keine Firma zugeordnet");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const token = crypto.randomUUID();

      const { error } = await supabase
        .from("user_invitations")
        .insert({
          customer_id: customerId,
          invited_by: user.id,
          email,
          full_name: fullName,
          token,
          status: "pending",
        });

      if (error) throw error;

      // TODO: Send invitation email via edge function
      
      toast.success("Einladung versendet");
      await loadInvitations();
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Fehler beim Erstellen der Einladung");
      throw error;
    }
  };

  const acceptInvitation = async (token: string, password: string) => {
    try {
      // Get invitation
      const { data: invitation, error: invError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();

      if (invError) throw invError;
      if (!invitation) throw new Error("Einladung nicht gefunden oder bereits verwendet");

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error("Einladung ist abgelaufen");
      }

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: invitation.full_name,
            company_id: invitation.customer_id,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Fehler beim Erstellen des Accounts");

      // Create participant
      const { error: participantError } = await supabase
        .from("participants")
        .insert({
          user_id: authData.user.id,
          customer_id: invitation.customer_id,
          full_name: invitation.full_name,
          email: invitation.email,
        });

      if (participantError) throw participantError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      toast.success("Account erfolgreich erstellt!");
      return authData.user;
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Fehler beim Akzeptieren der Einladung");
      throw error;
    }
  };

  return {
    invitations,
    loading,
    createInvitation,
    acceptInvitation,
    reload: loadInvitations,
  };
};
