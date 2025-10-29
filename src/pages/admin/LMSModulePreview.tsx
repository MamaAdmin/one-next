import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Edit, Clock, Video, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CourseCategory, categoryLabels, categoryColors } from "@/lib/categoryMappings";
import { ModuleContentPreview } from "@/components/lms/ModuleContentPreview";
import { useLMSLessons } from "@/hooks/useLMSLessons";
import { useQuizzes } from "@/hooks/useQuizzes";

interface Module {
  id: string;
  course_id: string;
  category: CourseCategory;
  title: string;
  description: string;
  module_type: string;
  duration_minutes: number;
  content_text?: string;
  content_video_url?: string;
  resources?: { title: string; url: string }[];
  tags?: string[];
  author?: string;
  prerequisites?: string[];
  tool_recommendation?: string;
  module_tools?: Array<{
    tool: {
      id: string;
      title: string;
      description: string | null;
      tool_type: string;
      external_url: string | null;
    };
  }>;
}

export default function LMSModulePreview() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const { lessons, loading: lessonsLoading } = useLMSLessons(moduleId || "");
  const { quizzes, loading: quizzesLoading } = useQuizzes(moduleId || "");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (moduleId) {
      loadModule();
    }
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_course_modules")
        .select(`
          *,
          module_tools:lms_module_tools(
            tool:lms_tools(*)
          )
        `)
        .eq("id", moduleId)
        .single();

      if (error) throw error;
      setModule({
        ...data,
        category: data.category as CourseCategory,
        resources: (data.resources as { title: string; url: string }[]) || [],
        tags: (data.tags as string[]) || [],
        prerequisites: (data.prerequisites as string[]) || []
      });
    } catch (error) {
      console.error("Error loading module:", error);
      toast({
        title: "Fehler",
        description: "Modul konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin || !module) return null;

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Module", href: `/admin/lms/modules${courseId ? `?course=${courseId}` : ""}` },
    { label: module.title, active: true }
  ];

  const tools = module.module_tools?.map(mt => mt.tool) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/lms/modules${courseId ? `?course=${courseId}` : ""}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>

          <Alert className="mb-4">
            <AlertDescription>
              Dies ist eine Vorschau. Änderungen müssen im Editor vorgenommen werden.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryColors[module.category]}>
                  {categoryLabels[module.category]}
                </Badge>
                <Badge variant="outline">{module.module_type}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {module.duration_minutes} Min
                </span>
                {lessons.length > 0 && (
                  <span>{lessons.length} Lektion{lessons.length !== 1 ? "en" : ""}</span>
                )}
                {quizzes.length > 0 && (
                  <span>{quizzes.length} Quiz{quizzes.length !== 1 ? "ze" : ""}</span>
                )}
              </div>
            </div>
            <Button
              onClick={() => navigate(`/admin/lms/modules/${moduleId}/edit${courseId ? `?courseId=${courseId}` : ""}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          </div>

          {module.description && (
            <p className="text-muted-foreground mt-4">{module.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="lessons">
              Lektionen {lessons.length > 0 && `(${lessons.length})`}
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              Quizzes {quizzes.length > 0 && `(${quizzes.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <ModuleContentPreview
              contentText={module.content_text}
              contentVideoUrl={module.content_video_url}
              toolRecommendation={module.tool_recommendation}
              resources={module.resources}
              tools={tools}
              tags={module.tags}
              author={module.author}
              prerequisites={module.prerequisites}
            />
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons">
            {lessonsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : lessons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Keine Lektionen vorhanden
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge variant="secondary">{lesson.lesson_type}</Badge>
                            {lesson.is_required && (
                              <Badge variant="destructive">Pflicht</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{lesson.title}</CardTitle>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {lesson.duration_minutes} Min
                        </div>
                      </div>
                    </CardHeader>
                    {(lesson.content_text || lesson.content_video_url) && (
                      <CardContent className="pt-0">
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          {lesson.content_text && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Text
                            </span>
                          )}
                          {lesson.content_video_url && (
                            <span className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              Video
                            </span>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            {quizzesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Keine Quizzes vorhanden
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz, index) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            {quiz.is_required && (
                              <Badge variant="destructive">Pflicht</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{quiz.title}</CardTitle>
                          {quiz.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{quiz.passing_score}% zum Bestehen</div>
                          {quiz.max_attempts > 0 && (
                            <div className="text-muted-foreground">
                              Max. {quiz.max_attempts} Versuch{quiz.max_attempts !== 1 ? "e" : ""}
                            </div>
                          )}
                          {quiz.time_limit_minutes && (
                            <div className="text-muted-foreground">
                              {quiz.time_limit_minutes} Min Zeitlimit
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}
