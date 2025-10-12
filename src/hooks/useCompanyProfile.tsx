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
  company_size: string | null;
  country: string | null;
  logo_url: string | null;
  position: string | null;
  primary_admin_id: string | null;
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

export const useCompanyProfile = () => {
  const [company, setCompany] = useState<Customer | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCompany(null);
        setEmployees([]);
        setIsAdmin(false);
        return;
      }

      // Get participant to find customer_id
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (participantError) throw participantError;
      if (!participant?.customer_id) {
        setCompany(null);
        setEmployees([]);
        setIsAdmin(false);
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);

      // Load company
      const { data: companyData, error: companyError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", participant.customer_id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Load employees if admin
      if (roleData) {
        const { data: employeesData, error: employeesError } = await supabase
          .from("participants")
          .select(`
            id,
            full_name,
            email,
            phone,
            user_id
          `)
          .eq("customer_id", participant.customer_id);

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
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
      toast.error("Fehler beim Laden des Unternehmensprofils");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const updateCompany = async (updates: Partial<Customer>) => {
    try {
      if (!company) throw new Error("Kein Unternehmen geladen");
      if (!isAdmin) throw new Error("Keine Berechtigung");

      const { error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", company.id);

      if (error) throw error;
      
      toast.success("Unternehmensprofil aktualisiert");
      await loadCompanyProfile();
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast.error(error.message || "Fehler beim Aktualisieren");
      throw error;
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      if (!company) throw new Error("Kein Unternehmen geladen");
      if (!isAdmin) throw new Error("Keine Berechtigung");

      const fileExt = file.name.split('.').pop();
      const filePath = `${company.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      await updateCompany({ logo_url: publicUrl });
      
      toast.success("Logo hochgeladen");
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Fehler beim Hochladen");
      throw error;
    }
  };

  return {
    company,
    employees,
    isAdmin,
    loading,
    updateCompany,
    uploadLogo,
    reload: loadCompanyProfile,
  };
};
