import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useContentManager = () => {
  const [isContentManager, setIsContentManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkContentManagerStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsContentManager(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "content_manager"])
          .maybeSingle();

        if (error) {
          console.error("Error checking content manager status:", error);
          setIsContentManager(false);
        } else {
          setIsContentManager(!!data);
        }
      } catch (error) {
        console.error("Error in checkContentManagerStatus:", error);
        setIsContentManager(false);
      } finally {
        setLoading(false);
      }
    };

    checkContentManagerStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkContentManagerStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isContentManager, loading };
};
