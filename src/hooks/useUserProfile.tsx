import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  customer_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        setParticipant(null);
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      // Load participant
      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (participantError) throw participantError;
      setParticipant(participantData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Fehler beim Laden des Profils");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      
      toast.success("Profil aktualisiert");
      await loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Fehler beim Aktualisieren");
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });
      
      toast.success("Avatar hochgeladen");
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Fehler beim Hochladen");
      throw error;
    }
  };

  const updateParticipantPhone = async (phone: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const { error } = await supabase
        .from("participants")
        .update({ phone })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Telefonnummer aktualisiert");
      await loadProfile();
    } catch (error: any) {
      console.error("Error updating phone:", error);
      toast.error(error.message || "Fehler beim Aktualisieren");
      throw error;
    }
  };

  return {
    profile,
    participant,
    loading,
    updateProfile,
    uploadAvatar,
    updateParticipantPhone,
    reload: loadProfile,
  };
};
