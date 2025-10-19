import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CoursePreview } from "@/components/lms/CoursePreview";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HomeIcon, BookIcon } from "@/components/ui/custom-icons";

export default function LMSCoursePreview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      // Load course without protected author join
      const { data, error } = await supabase
        .from("lms_courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();

      if (error) {
        console.error("Error loading course:", error.message);
        if (error.message?.includes("permission denied")) {
          toast({
            title: "Keine Berechtigung",
            description: "Du hast keine Berechtigung, diesen Kurs anzuzeigen. Bitte als Admin anmelden.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fehler",
            description: "Kurs konnte nicht geladen werden",
            variant: "destructive"
          });
        }
        navigate("/admin/lms/courses");
        return;
      }

      if (!data) {
        toast({
          title: "Fehler",
          description: "Kurs nicht gefunden oder nicht aktiv",
          variant: "destructive"
        });
        navigate("/admin/lms/courses");
        return;
      }

      setCourse(data);

      // Load public author info separately
      const { data: authorMeta } = await supabase
        .from("lms_courses_with_stats")
        .select("author_name, author_avatar")
        .eq("id", courseId)
        .maybeSingle();

      if (authorMeta) {
        setCourse(prev => prev ? {
          ...prev,
          author: { 
            full_name: authorMeta.author_name, 
            avatar_url: authorMeta.author_avatar 
          }
        } : prev);
      }

      // Load modules with robust error handling
      const { data: modulesData, error: modulesError } = await supabase
        .from("lms_course_modules")
        .select("id, title, duration_minutes, phase_number, sort_order")
        .eq("course_id", courseId)
        .order("phase_number", { ascending: true })
        .order("sort_order", { ascending: true });

      if (modulesError) {
        console.warn("Module können nicht geladen werden (RLS):", modulesError.message);
        setModules([]);
      } else {
        setModules(modulesData || []);
      }

      // Load related courses (same course_type)
      const { data: relatedData } = await supabase
        .from("lms_courses_with_stats")
        .select("id, title, thumbnail_url, price_chf, total_lessons, difficulty")
        .eq("course_type", data.course_type)
        .eq("is_active", true)
        .neq("id", courseId)
        .limit(4);

      if (relatedData) {
        setRelatedCourses(relatedData);
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms", icon: <BookIcon className="h-4 w-4" /> },
    { label: "Kurse", href: "/admin/lms/courses" },
    { label: "Vorschau", active: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <LMSBreadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center min-h-[60vh] mt-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer isEditMode={false} />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/lms/courses")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </div>

        <CoursePreview 
          course={course} 
          modules={modules}
          relatedCourses={relatedCourses}
        />
      </main>

      <Footer isEditMode={false} />
    </div>
  );
}
