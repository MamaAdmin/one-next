import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Users, Award, BookOpen, FileQuestion, 
  Star, Calendar, Share2 
} from "lucide-react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";

interface CoursePreviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    price_chf: number;
    skill_level?: string;
    total_lessons?: number;
    total_quizzes?: number;
    rating?: number;
    rating_count?: number;
    enrolled_students_count?: number;
    completion_deadline_days?: number;
    includes_certificate?: boolean;
    language?: string;
    course_type: string;
  };
  enrollment?: {
    enrolled_at: string;
    progress_percentage: number;
    current_phase: number;
  };
}

export function CoursePreview({ course, enrollment }: CoursePreviewProps) {
  const completionDate = enrollment 
    ? addDays(new Date(enrollment.enrolled_at), course.completion_deadline_days || 30)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Linke Spalte: Kursinfo */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {course.description}
          </p>
          
          {/* Kurs-Bild */}
          {course.thumbnail_url && (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
        </div>

        {/* Kursinfo */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Kursziel</h3>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rechte Spalte: Course Includes */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Course Includes</h3>
            
            {/* Preis */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Preis:</span>
              <Badge variant={course.price_chf === 0 ? "secondary" : "default"}>
                {course.price_chf === 0 ? "Free" : `CHF ${course.price_chf}`}
              </Badge>
            </div>

            {/* Studenten */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eingeschriebene Studenten:</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrolled_students_count || 0} Student{course.enrolled_students_count !== 1 ? 'en' : ''}
              </span>
            </div>

            {/* Lessons */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lessons:</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.total_lessons || 0} Lessons
              </span>
            </div>

            {/* Quiz */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Quiz:</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <FileQuestion className="h-4 w-4" />
                {course.total_quizzes || 0} Quizzes
              </span>
            </div>

            {/* Skill Level */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Skill Level:</span>
              <span className="text-sm font-medium">{course.skill_level || "Alle"}</span>
            </div>

            {/* Kategorie */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Kategorie:</span>
              <span className="text-sm font-medium">{course.course_type}</span>
            </div>

            {/* Certificate */}
            {course.includes_certificate && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Award className="h-4 w-4" />
                <span>Certificate upon completion</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fortschritt (nur wenn enrolled) */}
        {enrollment && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Kursfortschritt</h3>
              <div className="space-y-2">
                <Progress value={enrollment.progress_percentage} />
                <p className="text-sm text-muted-foreground">
                  {enrollment.progress_percentage}% Abgeschlossen
                </p>
              </div>
              <Button className="w-full">
                Mit dem Lernen beginnen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Deadline */}
        {enrollment && completionDate && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Kursabschlussdatum</h3>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(completionDate, "dd. MMMM yyyy", { locale: de })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Share */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Share This:</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
