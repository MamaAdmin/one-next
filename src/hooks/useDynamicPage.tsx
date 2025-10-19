import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PageTemplate {
  id: string;
  title: string;
  slug: string;
  layout_type: 'main-service' | 'sub-service';
  content: any;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_image?: string;
  canonical_url?: string;
  is_published: boolean;
}

export const useDynamicPage = (slug: string | undefined) => {
  const [page, setPage] = useState<PageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPage = async () => {
      try {
        const { data, error } = await supabase
          .from("page_templates")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error) throw error;
        setPage(data as PageTemplate);
      } catch (error) {
        console.error("Error fetching page:", error);
        toast({
          title: "Fehler",
          description: "Seite konnte nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, toast]);

  return { page, loading };
};
