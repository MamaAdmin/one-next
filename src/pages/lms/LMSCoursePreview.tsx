import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicCourseView } from "@/components/course/PublicCourseView";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("lms_courses")
        .select("*")
        .eq("id", courseId ?? "")
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Fehler",
          description: "Kurs konnte nicht geladen werden",
          variant: "destructive",
        });
        navigate("/admin/lms/courses");
        return;
      }

      setCourse(data);

      const { data: modulesData } = await supabase
        .from("lms_course_modules")
        .select("id, title, description, duration_minutes, phase_number, sort_order")
        .eq("course_id", courseId ?? "")
        .order("phase_number", { ascending: true })
        .order("sort_order", { ascending: true });

      setModules(modulesData || []);
    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms", icon: <BookIcon className="h-4 w-4" /> },
    { label: "Kurse", href: "/admin/lms/courses" },
    { label: "Vorschau", active: true },
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

  if (!course) return null;

  const mappedModules = modules.map((m) => ({
    id: m.id,
    title: m.title,
    content_html: m.description ? `<p>${m.description}</p>` : null,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="flex-1 mt-24">
        <div className="container mx-auto px-6 pt-4">
          <Button variant="ghost" onClick={() => navigate("/admin/lms/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </div>
        <PublicCourseView
          course={{
            title: course.title,
            description: course.description,
            description_html: course.description_html || course.description,
            price_chf: course.price_chf,
            thumbnail_url: course.thumbnail_url,
            featured_image: course.featured_image,
            youtube_url: course.youtube_url,
          }}
          modules={mappedModules}
          primaryCta={{ label: "Kurs bearbeiten →", href: `/admin/lms/courses` }}
          secondaryCta={{ label: "Zur Übersicht", href: "/admin/lms/courses" }}
          showQuote={false}
        />
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}

