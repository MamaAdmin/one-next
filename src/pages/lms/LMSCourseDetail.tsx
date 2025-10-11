import { useParams, Link } from "react-router-dom";
import { useLMSModules } from "@/hooks/useLMSModules";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { useGDPRConsent } from "@/hooks/useGDPRConsent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ModuleRenderer } from "@/components/sprint/modules/ModuleRenderer";
import { GDPRConsent } from "@/components/lms/GDPRConsent";
import { supabase } from "@/integrations/supabase/client";

export default function LMSCourseDetail() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { currentEnrollment, loading: enrollmentLoading } = useLMSEnrollment();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [showGDPRConsent, setShowGDPRConsent] = useState(false);
  
  // Load course ID from enrollment
  useEffect(() => {
    const loadCourseId = async () => {
      if (!currentEnrollment) return;
      
      const { data: purchase } = await supabase
        .from("lms_course_purchases")
        .select("course_id")
        .eq("id", currentEnrollment.purchase_id)
        .single();
      
      setCourseId(purchase?.course_id || null);
      setParticipantId(currentEnrollment.participant_id);
    };
    loadCourseId();
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Link to="/lms">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zu Kursen
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">5-Day Design Sprint</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Phase {currentEnrollment?.current_phase || 0}/5
          </span>
          <Progress value={currentEnrollment?.progress_percentage || 0} className="flex-1 max-w-xs" />
          <span className="text-sm font-medium">
            {currentEnrollment?.progress_percentage || 0}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
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

        {/* Content Area */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{currentModule?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentModule && (
                <ModuleRenderer
                  moduleType={currentModule.module_type}
                  moduleConfig={currentModule.config}
                  data={{}}
                  onDataChange={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
