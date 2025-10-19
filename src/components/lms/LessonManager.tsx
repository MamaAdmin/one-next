import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToolSelector } from "./ToolSelector";

interface Lesson {
  id?: string;
  module_id: string;
  title: string;
  description: string;
  lesson_type: string;
  content_text: string;
  content_video_url: string;
  duration_minutes: number;
  sort_order: number;
  is_required: boolean;
}

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

export const LessonManager = ({ moduleId, courseId }: { moduleId: string; courseId: string }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLessonTools, setEditingLessonTools] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadLessons();
  }, [moduleId]);

  const loadLessons = async () => {
    const { data, error } = await supabase
      .from("lms_lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order");

    if (error) {
      console.error("Error loading lessons:", error);
    } else {
      setLessons(data || []);
    }
    setLoading(false);
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      module_id: moduleId,
      title: "Neue Lektion",
      description: "",
      lesson_type: "theory",
      content_text: "",
      content_video_url: "",
      duration_minutes: 15,
      sort_order: lessons.length + 1,
      is_required: true
    };
    setLessons([...lessons, newLesson]);
    setEditingId("new");
    setEditingLessonTools(prev => ({ ...prev, new: [] }));
  };

  const saveLessonTools = async (lessonId: string, toolIds: string[]) => {
    // Delete existing lesson tools
    const { error: deleteError } = await supabase
      .from("lms_lesson_tools")
      .delete()
      .eq("lesson_id", lessonId);

    if (deleteError) throw deleteError;

    // Insert new lesson tools
    if (toolIds.length > 0) {
      const toolsToInsert = toolIds.map((toolId, index) => ({
        lesson_id: lessonId,
        tool_id: toolId,
        sort_order: index + 1,
      }));

      const { error: insertError } = await supabase
        .from("lms_lesson_tools")
        .insert(toolsToInsert);

      if (insertError) throw insertError;
    }
  };

  const saveLesson = async (lesson: Lesson) => {
    try {
      let lessonId: string;

      if (lesson.id) {
        const { error } = await supabase
          .from("lms_lessons")
          .update(lesson)
          .eq("id", lesson.id);

        if (error) throw error;
        lessonId = lesson.id;
      } else {
        const { data, error } = await supabase
          .from("lms_lessons")
          .insert([lesson])
          .select()
          .single();

        if (error) throw error;
        lessonId = data.id;
      }

      // Save lesson tools
      const toolIds = editingLessonTools[lesson.id || 'new'] || [];
      await saveLessonTools(lessonId, toolIds);

      toast({ title: "Erfolg", description: "Lektion gespeichert" });
      loadLessons();
      setEditingId(null);
    } catch (error: any) {
      toast({ 
        title: "Fehler", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const loadLessonTools = async (lessonId: string) => {
    const { data } = await supabase
      .from("lms_lesson_tools")
      .select("tool_id")
      .eq("lesson_id", lessonId)
      .order("sort_order");

    return data?.map(lt => lt.tool_id) || [];
  };

  const handleEditLesson = async (lessonId: string) => {
    if (lessonId !== 'new') {
      const toolIds = await loadLessonTools(lessonId);
      setEditingLessonTools(prev => ({ ...prev, [lessonId]: toolIds }));
    }
    setEditingId(lessonId);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Lektion wirklich löschen?")) return;

    const { error } = await supabase
      .from("lms_lessons")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ 
        title: "Fehler", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Erfolg", description: "Lektion gelöscht" });
      loadLessons();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lektionen verwalten</h3>
        <Button onClick={addLesson} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Lektion hinzufügen
        </Button>
      </div>

      {lessons.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Lektionen vorhanden. Klicke auf "Lektion hinzufügen".
          </CardContent>
        </Card>
      )}

      {lessons.map((lesson, index) => (
        <Card key={lesson.id || `new-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {editingId === (lesson.id || "new") ? (
                  <Input
                    value={lesson.title}
                    onChange={(e) => {
                      const updated = [...lessons];
                      updated[index].title = e.target.value;
                      setLessons(updated);
                    }}
                    className="h-8"
                  />
                ) : (
                  lesson.title
                )}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {editingId === (lesson.id || "new") ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => saveLesson(lesson)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      loadLessons();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditLesson(lesson.id || 'new')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {lesson.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteLesson(lesson.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardHeader>

          {editingId === (lesson.id || "new") && (
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Typ</Label>
                  <Select
                    value={lesson.lesson_type}
                    onValueChange={(value) => {
                      const updated = [...lessons];
                      updated[index].lesson_type = value;
                      setLessons(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {getLessonTypeLabel(lesson.lesson_type)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory">Theorie</SelectItem>
                      <SelectItem value="practice">Praxis</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="case_study">Fallstudie</SelectItem>
                      <SelectItem value="reflection">Reflexion</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exercise">Übung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dauer (Min)</Label>
                  <Input
                    type="number"
                    value={lesson.duration_minutes}
                    onChange={(e) => {
                      const updated = [...lessons];
                      updated[index].duration_minutes = parseInt(e.target.value) || 0;
                      setLessons(updated);
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Textarea
                  value={lesson.description}
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[index].description = e.target.value;
                    setLessons(updated);
                  }}
                  rows={3}
                />
              </div>

              <div>
                <Label>Inhalt (Markdown)</Label>
                <Textarea
                  value={lesson.content_text}
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[index].content_text = e.target.value;
                    setLessons(updated);
                  }}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              {lesson.lesson_type === "video" && (
                <div>
                  <Label>Video URL</Label>
                  <Input
                    type="url"
                    value={lesson.content_video_url}
                    onChange={(e) => {
                      const updated = [...lessons];
                      updated[index].content_video_url = e.target.value;
                      setLessons(updated);
                    }}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              )}

              <div>
                <Label>Tools</Label>
                <ToolSelector
                  selectedTools={editingLessonTools[lesson.id || 'new'] || []}
                  onChange={(toolIds) => {
                    setEditingLessonTools(prev => ({
                      ...prev,
                      [lesson.id || 'new']: toolIds
                    }));
                  }}
                  filterByCourseId={courseId}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Wähle Tools aus, die für diese Lektion verfügbar sein sollen.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
