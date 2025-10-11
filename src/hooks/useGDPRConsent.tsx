import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Consent {
  id: string;
  participant_id: string;
  consent_type: string;
  granted: boolean;
  granted_at: string;
}

export const useGDPRConsent = (participantId?: string) => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadConsents = async () => {
    if (!participantId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from("lms_gdpr_consents")
        .select("*")
        .eq("participant_id", participantId)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      setConsents(data || []);
    } catch (error) {
      console.error("Error loading consents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, [participantId]);

  const grantConsent = async (consentType: string) => {
    if (!participantId) return;

    try {
      const { error } = await (supabase as any)
        .from("lms_gdpr_consents")
        .insert([
          {
            participant_id: participantId,
            consent_type: consentType,
            granted: true,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Einwilligung gespeichert",
        description: "Ihre Einwilligung wurde erfolgreich gespeichert",
      });

      loadConsents();
    } catch (error) {
      console.error("Error granting consent:", error);
      toast({
        title: "Fehler",
        description: "Einwilligung konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const revokeConsent = async (consentType: string) => {
    if (!participantId) return;

    try {
      const { error } = await (supabase as any)
        .from("lms_gdpr_consents")
        .insert([
          {
            participant_id: participantId,
            consent_type: consentType,
            granted: false,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Einwilligung widerrufen",
        description: "Ihre Einwilligung wurde widerrufen",
      });

      loadConsents();
    } catch (error) {
      console.error("Error revoking consent:", error);
      toast({
        title: "Fehler",
        description: "Einwilligung konnte nicht widerrufen werden",
        variant: "destructive",
      });
    }
  };

  const hasConsent = (consentType: string) => {
    const consent = consents
      .filter((c) => c.consent_type === consentType)
      .sort((a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime())[0];
    
    return consent?.granted || false;
  };

  return {
    consents,
    loading,
    grantConsent,
    revokeConsent,
    hasConsent,
    reload: loadConsents,
  };
};
