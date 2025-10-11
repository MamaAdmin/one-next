import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string | null;
  billing_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Fehler beim Laden der Kunden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const createCustomer = async (customerData: {
    company_name: string;
    contact_email: string;
    contact_name?: string;
    billing_address?: any;
    notes?: string;
  }) => {
    try {
      const { data, error } = await (supabase as any)
        .from("customers")
        .insert(customerData)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Kunde erfolgreich angelegt");
      await loadCustomers();
      return data;
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast.error(error.message || "Fehler beim Anlegen des Kunden");
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await (supabase as any)
        .from("customers")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Kunde aktualisiert");
      await loadCustomers();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Fehler beim Aktualisieren");
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Kunde gelöscht");
      await loadCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast.error(error.message || "Fehler beim Löschen");
      throw error;
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    reload: loadCustomers
  };
};
