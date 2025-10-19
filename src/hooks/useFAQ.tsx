import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category_id: string;
  sort_order: number;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export const useFAQ = (categoryId?: string) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFAQs = async () => {
    try {
      let query = supabase
        .from("faq_items")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({
        title: "Fehler",
        description: "FAQs konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();

    // Realtime subscription
    const channel = supabase
      .channel("faq-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "faq_items",
        },
        () => {
          fetchFAQs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  const trackView = async (faqId: string) => {
    try {
      await supabase.rpc("increment_faq_view", { faq_id: faqId });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const trackHelpful = async (faqId: string, isHelpful: boolean) => {
    try {
      await supabase.rpc("record_faq_vote", {
        faq_id: faqId,
        is_helpful: isHelpful,
      });

      toast({
        title: "Danke für Ihr Feedback!",
        description: isHelpful
          ? "Wir freuen uns, dass wir helfen konnten."
          : "Wir arbeiten daran, diese Antwort zu verbessern.",
      });
    } catch (error) {
      console.error("Error tracking helpful:", error);
    }
  };

  return { faqs, loading, trackView, trackHelpful, refetch: fetchFAQs };
};

export const useFAQCategories = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("faq_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Realtime subscription for categories
    const channel = supabase
      .channel("faq-category-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "faq_categories",
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { categories, loading, refetch: fetchCategories };
};
