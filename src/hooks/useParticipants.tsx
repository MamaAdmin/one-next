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
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: participantData.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        options: {
          data: {
            full_name: participantData.full_name,
          },
        },
      });

      if (authError) throw authError;

      // Then create participant record
      const { error: participantError } = await (supabase as any)
        .from("participants")
        .insert([
          {
            user_id: authData.user?.id,
            customer_id: participantData.customer_id,
            email: participantData.email,
            full_name: participantData.full_name,
          },
        ]);

      if (participantError) throw participantError;

      toast({
        title: "Erfolg",
        description: "Teilnehmer wurde erstellt",
      });
      
      loadParticipants();
    } catch (error: any) {
      console.error("Error creating participant:", error);
      toast({
        title: "Fehler",
        description: error.message || "Teilnehmer konnte nicht erstellt werden",
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
