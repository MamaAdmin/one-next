import { useLMSLessons } from "@/hooks/useLMSLessons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Play, FileQuestion } from "lucide-react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const getLessonTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'theory': 'Theorie',
    'video': 'Video',
    'quiz': 'Quiz',
    'exercise': 'Übung',
    'practice': 'Praxis',
    'workshop': 'Workshop',
    'case_study': 'Fallstudie',
    'reflection': 'Reflexion'
  };
  return labels[type.toLowerCase()] || type;
};

export const LessonsList = ({
  moduleId, 
  enrollmentId 
}: { 
  moduleId: string; 
  enrollmentId?: string;
}) => {
  const { lessons, progress, loading, completeLesson } = useLMSLessons(moduleId, enrollmentId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<Record<string, { count: number; passed: boolean }>>({});

  const currentLesson = selectedLessonId
    ? lessons.find(l => l.id === selectedLessonId)
    : lessons[0];

  // Load quiz data for lessons
  useEffect(() => {
    const loadQuizData = async () => {
      if (!moduleId || !enrollmentId) return;

      try {
        const { data: quizzes } = await supabase
          .from("lms_quizzes")
          .select(`
            id,
            lesson_id,
            lms_quiz_attempts!inner(is_passed)
          `)
          .eq("module_id", moduleId);

        if (quizzes) {
          const quizMap: Record<string, { count: number; passed: boolean }> = {};
          
          quizzes.forEach((quiz: any) => {
            if (quiz.lesson_id) {
              const hasPassed = quiz.lms_quiz_attempts?.some((a: any) => a.is_passed);
              quizMap[quiz.lesson_id] = {
                count: (quizMap[quiz.lesson_id]?.count || 0) + 1,
                passed: hasPassed || quizMap[quiz.lesson_id]?.passed || false
              };
            }
          });

          setQuizData(quizMap);
        }
      } catch (error) {
        console.error("Error loading quiz data:", error);
      }
    };

    loadQuizData();
  }, [moduleId, enrollmentId]);

  const handleComplete = async () => {
    if (!currentLesson || !enrollmentId) return;
    
    setCompleting(true);
    try {
      await completeLesson(currentLesson.id);
      toast({ title: "Erfolg", description: "Lektion als abgeschlossen markiert" });
    } catch (error) {
      toast({ 
        title: "Fehler", 
        description: "Lektion konnte nicht abgeschlossen werden",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Keine Lektionen für dieses Modul verfügbar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lektionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isCompleted = progress[lesson.id]?.is_completed || false;
              const isSelected = selectedLessonId === lesson.id || 
                                 (!selectedLessonId && lessons[0]?.id === lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {lesson.title}
                      {quizData[lesson.id] && (
                        <div className="flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          {quizData[lesson.id].passed && (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-80">
                      {lesson.duration_minutes} Min · {getLessonTypeLabel(lesson.lesson_type)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentLesson && (
        <Card>
          <CardHeader>
            <CardTitle>{currentLesson.title}</CardTitle>
            {currentLesson.description && (
              <p className="text-muted-foreground">{currentLesson.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLesson.lesson_type === "video" && currentLesson.content_video_url && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {currentLesson.content_text && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.content_text }} />
              </div>
            )}

            {enrollmentId && !progress[currentLesson.id]?.is_completed && (
              <Button 
                onClick={handleComplete}
                disabled={completing}
                className="w-full"
              >
                {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Als abgeschlossen markieren
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
