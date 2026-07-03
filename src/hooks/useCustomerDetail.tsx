import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  company_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  role: string;
}

export const useCustomerDetail = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomerDetail = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from("participants")
        .select(`
          id,
          full_name,
          email,
          phone,
          user_id
        `)
        .eq("customer_id", customerId);

      if (employeesError) throw employeesError;

      // Get roles for employees
      const employeesWithRoles = await Promise.all(
        (employeesData || []).map(async (emp) => {
          if (!emp.user_id) {
            return { ...emp, role: "pending" };
          }
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", emp.user_id)
            .maybeSingle();
          
          return { ...emp, role: roleData?.role || "user" };
        })
      );

      setEmployees(employeesWithRoles);
    } catch (error) {
      console.error("Error loading customer detail:", error);
      toast.error("Fehler beim Laden der Kundendetails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerDetail();
  }, [customerId]);

  const updateCustomer = async (updates: Partial<Customer>) => {
    try {
      if (!customer) throw new Error("Kein Kunde geladen");

      const { error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", customer.id);

      if (error) throw error;
      
      toast.success("Kunde aktualisiert");
      await loadCustomerDetail();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Fehler beim Aktualisieren");
      throw error;
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      if (!customer) throw new Error("Kein Kunde geladen");

      const fileExt = file.name.split('.').pop();
      const filePath = `${customer.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      await updateCustomer({ logo_url: publicUrl });
      
      toast.success("Logo hochgeladen");
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Fehler beim Hochladen");
      throw error;
    }
  };

  return {
    customer,
    employees,
    loading,
    updateCustomer,
    uploadLogo,
    reload: loadCustomerDetail,
  };
};
