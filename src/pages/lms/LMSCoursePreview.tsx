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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("lms_courses_with_stats")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Fehler",
          description: "Kurs nicht gefunden",
          variant: "destructive"
        });
        navigate("/admin/lms/courses");
        return;
      }

      setCourse(data);
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

        <CoursePreview course={course} />
      </main>

      <Footer isEditMode={false} />
    </div>
  );
}
