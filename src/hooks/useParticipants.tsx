import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  user_id: string;
  customer_id: string;
  email: string;
  full_name: string;
  created_at: string;
  customers?: {
    company_name: string;
  };
}

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadParticipants = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("participants")
        .select(`
          *,
          customers (
            company_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error("Error loading participants:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const createParticipant = async (participantData: {
    customer_id: string;
    email: string;
    full_name: string;
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht angemeldet");
      }

      // Call Edge Function with Service Role Key for secure participant creation
      const { data, error } = await supabase.functions.invoke("create-participant", {
        body: participantData,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: data.message || "Teilnehmer wurde erstellt",
      });
      
      loadParticipants();
    } catch (error: any) {
      console.error("Error creating participant:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const updateParticipant = async (id: string, updates: Partial<Participant>) => {
    try {
      const { error } = await (supabase as any)
        .from("participants")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Teilnehmer wurde aktualisiert",
      });
      
      loadParticipants();
    } catch (error) {
      console.error("Error updating participant:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("participants")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Teilnehmer wurde gelöscht",
      });
      
      loadParticipants();
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  return {
    participants,
    loading,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    reload: loadParticipants,
  };
};
