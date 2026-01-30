import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRoles = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBmadUser, setIsBmadUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setIsBmadUser(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error checking roles:", error);
          setIsAdmin(false);
          setIsBmadUser(false);
        } else {
          const roles = data?.map(r => r.role) || [];
          setIsAdmin(roles.includes("admin"));
          setIsBmadUser(roles.includes("bmad_user"));
        }
      } catch (error) {
        console.error("Error in checkRoles:", error);
        setIsAdmin(false);
        setIsBmadUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRoles();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, isBmadUser, loading };
};
