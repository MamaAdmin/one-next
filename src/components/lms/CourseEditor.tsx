import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Save, Eye } from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { CourseEditorSidebar } from "./CourseEditorSidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourseEditorProps {
  courseId?: string;
  onSave?: () => void;
}

export interface CourseFormData {
  title: string;
  slug: string;
  description_html: string;
  visibility: "public" | "private" | "draft";
  timed_release_enabled: boolean;
  featured_image: string | null;
  intro_video: {
    source: "upload" | "url" | null;
    file: string | null;
    url: string | null;
  };
  pricing: {
    type: "free" | "paid";
    price_chf: number | null;
    currency: string;
  };
  difficulty: string;
  categories: string[];
  tags: string[];
  author_id: string | null;
  options: {
    public_course: boolean;
    manual_enrollment: boolean;
    content_drip: any[];
  };
}

export const CourseEditor = ({ courseId, onSave }: CourseEditorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    slug: "",
    description_html: "",
    visibility: "draft",
    timed_release_enabled: false,
    featured_image: null,
    intro_video: { source: null, file: null, url: null },
    pricing: { type: "free", price_chf: null, currency: "CHF" },
    difficulty: "all",
    categories: [],
    tags: [],
    author_id: null,
    options: { public_course: true, manual_enrollment: false, content_drip: [] },
  });

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const loadCourse = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description_html: data.description_html || "",
        visibility: (data.visibility as "public" | "private" | "draft") || "draft",
        timed_release_enabled: data.timed_release_enabled || false,
        featured_image: data.featured_image || null,
        intro_video: (data.intro_video as any) || { source: null, file: null, url: null },
        pricing: (data.pricing as any) || { type: "free", price_chf: null, currency: "CHF" },
        difficulty: data.difficulty || "all",
        categories: (data.categories as string[]) || [],
        tags: (data.tags as string[]) || [],
        author_id: data.author_id || null,
        options: (data.options as any) || { public_course: true, manual_enrollment: false, content_drip: [] },
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CourseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (value: string) => {
    handleChange("title", value);
    if (!courseId) {
      handleChange("slug", generateSlug(value));
    }
  };

  const copyUrl = () => {
    const url = `https://learning.one-next.com/courses/${formData.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL kopiert", description: "Kurs-URL in Zwischenablage kopiert" });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({ title: "Fehler", description: "Titel ist erforderlich", variant: "destructive" });
      return false;
    }

    if (formData.visibility === "public") {
      if (!formData.description_html.trim()) {
        toast({ title: "Fehler", description: "Beschreibung erforderlich für öffentliche Kurse", variant: "destructive" });
        return false;
      }
      if (!formData.featured_image) {
        toast({ title: "Fehler", description: "Beitragsbild erforderlich für öffentliche Kurse", variant: "destructive" });
        return false;
      }
    }

    if (formData.pricing.type === "paid" && (!formData.pricing.price_chf || formData.pricing.price_chf <= 0)) {
      toast({ title: "Fehler", description: "Preis muss größer als 0 sein", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSave = async (publish = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const saveData = {
        ...formData,
        visibility: publish ? "public" : formData.visibility,
        updated_at: new Date().toISOString(),
      };

      if (courseId) {
        const { error } = await supabase
          .from("lms_courses")
          .update(saveData)
          .eq("id", courseId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("lms_courses")
          .insert([saveData])
          .select()
          .single();

        if (error) throw error;
        navigate(`/admin/lms/courses/${data.id}/edit`);
      }

      setIsDirty(false);
      toast({
        title: publish ? "Kurs veröffentlicht" : "Entwurf gespeichert",
        description: publish ? "Der Kurs wurde erfolgreich veröffentlicht" : "Änderungen wurden gespeichert",
      });

      if (onSave) onSave();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (courseId) {
      window.open(`/preview/courses/${courseId}`, "_blank");
    } else {
      toast({ title: "Hinweis", description: "Bitte speichern Sie den Kurs zuerst", variant: "default" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Warning Banner */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <Alert className="rounded-none border-x-0 border-t-0">
          <AlertDescription className="text-sm text-muted-foreground">
            ⚠️ Bitte keine personenbezogenen Daten oder Firmen-Interna eingeben.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Titel</label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Kurs-Titel eingeben..."
                className="text-lg"
              />
            </div>

            {/* URL */}
            <div>
              <label className="text-sm font-medium mb-2 block">Kurs-URL</label>
              <div className="flex gap-2">
                <Input
                  value={`https://learning.one-next.com/courses/${formData.slug}`}
                  readOnly
                  className="bg-muted"
                />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Slug: <Badge variant="outline">{formData.slug || "wird-generiert"}</Badge>
              </p>
            </div>

            {/* Description WYSIWYG */}
            <div>
              <label className="text-sm font-medium mb-2 block">Beschreibung</label>
              <div className="min-h-[500px]">
                <RichTextEditor
                  value={formData.description_html}
                  onSave={async (value) => handleChange("description_html", value)}
                  isEditMode={true}
                  placeholder="Kurs-Beschreibung eingeben..."
                  className="[&_.ql-container]:min-h-[400px]"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <CourseEditorSidebar
            formData={formData}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={formData.visibility === "public" ? "default" : "secondary"}>
              {formData.visibility === "public" ? "Veröffentlicht" : "Entwurf"}
            </Badge>
            {isDirty && <Badge variant="outline">Nicht gespeichert</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Vorschau
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading}>
              Veröffentlichen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
