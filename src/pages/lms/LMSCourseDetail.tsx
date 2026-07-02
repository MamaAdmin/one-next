import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useLMSModules } from "@/hooks/useLMSModules";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { BookIcon } from "@/components/ui/custom-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import { GDPRConsent } from "@/components/lms/GDPRConsent";
import { TemplateRenderer } from "@/components/lms/TemplateRenderer";
import { supabase } from "@/integrations/supabase/client";
import { PublicCourseView } from "@/components/course/PublicCourseView";
import { LessonsList } from "@/components/lms/LessonsList";
import { QuizView } from "@/components/lms/QuizView";
import { categoryLabels } from "@/lib/categoryMappings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LMSCourseDetail() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { currentEnrollment, loading: enrollmentLoading } = useLMSEnrollment();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [showGDPRConsent, setShowGDPRConsent] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  
  // Load course ID and course data from enrollment
  useEffect(() => {
    const loadCourseData = async () => {
      if (!currentEnrollment) return;
      
      const { data: purchase } = await supabase
        .from("lms_course_purchases")
        .select("course_id")
        .eq("id", currentEnrollment.purchase_id)
        .maybeSingle();
      
      const loadedCourseId = purchase?.course_id || null;
      setCourseId(loadedCourseId);
      setParticipantId(currentEnrollment.participant_id);

      if (loadedCourseId) {
        const { data: course } = await supabase
          .from("lms_courses_with_stats")
          .select("*")
          .eq("id", loadedCourseId)
          .maybeSingle();
        
        setCourseData(course);
      }
    };
    loadCourseData();
  }, [currentEnrollment]);

  // Check GDPR consent
  useEffect(() => {
    const checkConsent = async () => {
      if (!participantId) return;
      
      const { data: consent } = await supabase
        .from("lms_gdpr_consents")
        .select("*")
        .eq("participant_id", participantId)
        .eq("consent_type", "data_processing")
        .eq("is_granted", true)
        .maybeSingle();
      
      if (!consent) {
        setShowGDPRConsent(true);
      }
    };
    checkConsent();
  }, [participantId]);
  
  const { modules, progress, loading: modulesLoading } = useLMSModules(courseId || "", enrollmentId);

  if (enrollmentLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentModule = selectedModuleId
    ? modules.find((m) => m.id === selectedModuleId)
    : modules[0];

  const getModuleIcon = (moduleId: string) => {
    const moduleProgress = progress[moduleId];
    const isCompleted = moduleProgress?.is_completed || false;
    
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-primary" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  if (showGDPRConsent && participantId) {
    return (
      <div className="container mx-auto py-8">
        <GDPRConsent
          participantId={participantId}
          onComplete={() => setShowGDPRConsent(false)}
        />
      </div>
    );
  }

  const breadcrumbItems = useMemo(() => {
    const items: Array<{label: string; href?: string; icon?: React.ReactNode; active?: boolean}> = [
      { label: "Meine Kurse", href: "/lms", icon: <BookIcon className="h-4 w-4" /> },
    ];
    
    if (courseData) {
      items.push({ 
        label: courseData.title, 
        href: `/lms/enrollment/${enrollmentId}` 
      });
    }
    
    if (currentModule) {
      items.push({ label: currentModule.title, active: true });
    } else if (courseData) {
      items[items.length - 1].active = true;
    }
    
    return items;
  }, [courseData, currentModule, enrollmentId]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 mt-32">
      <LMSBreadcrumb items={breadcrumbItems} />
      <div className="mb-4">
        <Link to="/lms">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zu Kursen
          </Button>
        </Link>
      </div>

      {/* Kursvorschau im Public-Layout */}
      {courseData && (
        <div className="mb-8 -mx-4">
          <PublicCourseView
            course={{
              title: courseData.title,
              description: courseData.description,
              description_html: courseData.description_html || courseData.description,
              price_chf: courseData.price_chf,
              thumbnail_url: courseData.thumbnail_url,
              featured_image: courseData.featured_image,
              youtube_url: courseData.youtube_url,
            }}
            primaryCta={{ label: "Zum Lernbereich ↓", onClick: () => {
              document.getElementById("lms-modules")?.scrollIntoView({ behavior: "smooth" });
            }}}
            secondaryCta={{ label: "Alle Kurse", href: "/lms" }}
            showQuote={false}
            ctaSectionEyebrow="Lernen"
            ctaSectionTitle="Bereit weiterzumachen?"
            ctaSectionSubtitle="Setzen Sie Ihren Lernfortschritt fort und schließen Sie den Kurs ab."
          />
        </div>
      )}

      {/* Modulnavigation */}
      <div id="lms-modules" className="mb-6 scroll-mt-32">
        <h2 className="text-2xl font-bold mb-2">Kursmodule</h2>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            {(currentEnrollment?.current_category && categoryLabels[currentEnrollment.current_category]) || "Verstehen"}
          </span>
          <Progress value={currentEnrollment?.progress_percentage || 0} className="flex-1 max-w-xs" />
          <span className="text-sm font-medium">
            {currentEnrollment?.progress_percentage || 0}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Seitenleiste */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                  selectedModuleId === module.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {getModuleIcon(module.id)}
                <span className="text-sm">{module.title}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Inhaltsbereich */}
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentModule?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentModule && (
                <div className="space-y-4">
                  {currentModule.description && (
                    <p className="text-muted-foreground">{currentModule.description}</p>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Typ:</span> {currentModule.module_type}
                  </div>
                  {currentModule.duration_minutes && (
                    <div className="text-sm">
                      <span className="font-medium">Dauer:</span> {currentModule.duration_minutes} Minuten
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lektionen & Quizzes */}
          {currentModule && enrollmentId && (
            <Tabs defaultValue="lessons" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lessons">Lektionen</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              </TabsList>
              <TabsContent value="lessons">
                <LessonsList
                  moduleId={currentModule.id}
                  enrollmentId={enrollmentId}
                />
              </TabsContent>
              <TabsContent value="quizzes">
                <QuizView
                  moduleId={currentModule.id}
                  enrollmentId={enrollmentId}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* Tools Section */}
          {currentModule?.module_tools && currentModule.module_tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tools für dieses Modul</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentModule.module_tools.map((mt: any) => {
                    const tool = mt.tool;
                    if (!tool) return null;
                    
                    return (
                      <Card key={tool.id} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-base">{tool.title}</CardTitle>
                          {tool.description && (
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {tool.tool_type === 'external' && tool.external_url && (
                            <Button 
                              onClick={() => window.open(tool.external_url, '_blank')}
                              className="w-full"
                            >
                              Tool öffnen
                            </Button>
                          )}
                          {tool.tool_type === 'embedded' && tool.embed_code && (
                            <div 
                              className="border rounded p-4 bg-muted"
                              dangerouslySetInnerHTML={{ __html: tool.embed_code }}
                            />
                          )}
                          {tool.tool_type === 'template' && tool.template_data && (
                            <TemplateRenderer 
                              data={tool.template_data}
                              enrollmentId={enrollmentId}
                              moduleId={currentModule.id}
                            />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
