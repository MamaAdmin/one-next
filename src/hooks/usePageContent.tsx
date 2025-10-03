import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PageContent {
  [key: string]: string;
}

export const usePageContent = (pageName: string) => {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_name", pageName);

        if (error) throw error;

        const contentMap: PageContent = {};
        data?.forEach((item) => {
          contentMap[item.section_name] = item.content;
        });

        setContent(contentMap);
      } catch (error) {
        console.error("Error fetching page content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageName]);

  const updateContent = async (sectionName: string, value: string, contentType: string = 'text') => {
    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_name: pageName,
          section_name: sectionName,
          content_type: contentType,
          content: value,
        }, {
          onConflict: 'page_name,section_name'
        });

      if (error) throw error;

      setContent((prev) => ({
        ...prev,
        [sectionName]: value,
      }));

      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { content, loading, updateContent };
};
