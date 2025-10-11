import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoursePurchase {
  id: string;
  customer_id: string;
  course_id: string;
  licenses: number;
  price_chf: number;
  status: string;
  purchased_at: string;
  customers?: {
    company_name: string;
  };
  lms_courses?: {
    title: string;
  };
}

export const useCoursePurchase = () => {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPurchases = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("lms_course_purchases")
        .select(`
          *,
          customers (
            company_name
          ),
          lms_courses (
            title
          )
        `)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Error loading purchases:", error);
      toast({
        title: "Fehler",
        description: "Käufe konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const createPurchase = async (purchaseData: {
    customer_id: string;
    course_id: string;
    licenses: number;
    price_chf: number;
  }) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_course_purchases")
        .insert([
          {
            ...purchaseData,
            status: "pending",
          },
        ]);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kauf wurde erstellt",
      });
      
      loadPurchases();
    } catch (error) {
      console.error("Error creating purchase:", error);
      toast({
        title: "Fehler",
        description: "Kauf konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const updatePurchase = async (id: string, updates: Partial<CoursePurchase>) => {
    try {
      const { error } = await (supabase as any)
        .from("lms_course_purchases")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Kauf wurde aktualisiert",
      });
      
      loadPurchases();
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast({
        title: "Fehler",
        description: "Kauf konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  return {
    purchases,
    loading,
    createPurchase,
    updatePurchase,
    reload: loadPurchases,
  };
};
