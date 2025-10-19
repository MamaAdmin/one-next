import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  redirect_type: number;
  is_active: boolean;
}

export const useRedirects = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_redirects")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error("Error fetching redirects:", error);
    }
  };

  const checkRedirect = () => {
    const currentPath = location.pathname;
    const redirect = redirects.find((r) => r.from_path === currentPath);
    
    if (redirect) {
      navigate(redirect.to_path, { replace: true });
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  useEffect(() => {
    if (redirects.length > 0) {
      checkRedirect();
    }
  }, [location.pathname, redirects]);

  return { redirects, fetchRedirects };
};
