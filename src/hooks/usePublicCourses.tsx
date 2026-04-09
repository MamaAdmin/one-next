import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  description_html: string | null;
  price_chf: number;
  currency: string;
  featured_image: string | null;
  youtube_url: string | null;
  max_participants: number | null;
  is_active: boolean;
  slug: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicCourseDate {
  id: string;
  course_id: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export interface PublicCourseRegistration {
  id: string;
  course_id: string;
  course_date_id: string | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  payment_method: string;
  payment_status: string;
  stripe_session_id: string | null;
  amount_paid: number | null;
  registered_at: string;
}

export const usePublicCourses = () => {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("public_courses")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const createCourse = async (courseData: Partial<PublicCourse>) => {
    try {
      const { error } = await supabase
        .from("public_courses")
        .insert([courseData as any]);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Kurs wurde erstellt" });
      loadCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      toast({ title: "Fehler", description: "Kurs konnte nicht erstellt werden", variant: "destructive" });
    }
  };

  const updateCourse = async (id: string, updates: Partial<PublicCourse>) => {
    try {
      const { error } = await supabase
        .from("public_courses")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Kurs wurde aktualisiert" });
      loadCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({ title: "Fehler", description: "Kurs konnte nicht aktualisiert werden", variant: "destructive" });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("public_courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Kurs wurde gelöscht" });
      loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({ title: "Fehler", description: "Kurs konnte nicht gelöscht werden", variant: "destructive" });
    }
  };

  return { courses, loading, createCourse, updateCourse, deleteCourse, reload: loadCourses };
};

export const useCourseDates = (courseId: string | null) => {
  const [dates, setDates] = useState<PublicCourseDate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadDates = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("public_course_dates")
        .select("*")
        .eq("course_id", courseId)
        .order("event_date", { ascending: true });

      if (error) throw error;
      setDates(data || []);
    } catch (error) {
      console.error("Error loading dates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, [courseId]);

  const addDate = async (dateData: Partial<PublicCourseDate>) => {
    try {
      const { error } = await supabase
        .from("public_course_dates")
        .insert([{ ...dateData, course_id: courseId } as any]);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Termin wurde hinzugefügt" });
      loadDates();
    } catch (error) {
      console.error("Error adding date:", error);
      toast({ title: "Fehler", description: "Termin konnte nicht hinzugefügt werden", variant: "destructive" });
    }
  };

  const deleteDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("public_course_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Termin wurde gelöscht" });
      loadDates();
    } catch (error) {
      console.error("Error deleting date:", error);
      toast({ title: "Fehler", description: "Termin konnte nicht gelöscht werden", variant: "destructive" });
    }
  };

  return { dates, loading, addDate, deleteDate, reload: loadDates };
};

export const useCourseRegistrations = (courseId?: string) => {
  const [registrations, setRegistrations] = useState<PublicCourseRegistration[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase.from("public_course_registrations").select("*");
      if (courseId) query = query.eq("course_id", courseId);
      const { data, error } = await query.order("registered_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error loading registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [courseId]);

  return { registrations, loading, reload: loadRegistrations };
};
