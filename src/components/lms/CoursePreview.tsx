import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Share2, DollarSign, Users, Book, FileQuestion, BarChart, Globe, Mail, Link as LinkIcon } from "lucide-react";
import { UsersIcon, StarburstIcon, BookIcon, QuizIcon } from "@/components/ui/custom-icons";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import DOMPurify from 'dompurify';
import { CourseRating } from "./CourseRating";
import { CourseTabs } from "./CourseTabs";
import { CourseCard } from "./CourseCard";
interface CoursePreviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    price_chf: number | null;
    skill_level?: string;
    difficulty?: string;
    total_lessons?: number;
    total_quizzes?: number;
    rating?: number;
    rating_count?: number;
    enrolled_students_count?: number;
    completion_deadline_days?: number;
    includes_certificate?: boolean;
    language?: string;
    course_type: string;
    updated_at?: string;
  };
  enrollment?: {
    enrolled_at: string;
    progress_percentage: number;
    current_phase: number;
  };
  modules?: Array<{
    id: string;
    title: string;
    duration_minutes?: number;
    phase_number: number;
  }>;
  relatedCourses?: Array<{
    id: string;
    title: string;
    thumbnail_url?: string;
    price_chf: number | null;
    total_lessons?: number;
    difficulty?: string;
  }>;
}
export function CoursePreview({
  course,
  enrollment,
  modules = [],
  relatedCourses = []
}: CoursePreviewProps) {
  // Übersetzungs-Mappings
  const difficultyLabels: Record<string, string> = {
    'beginner': 'Anfänger',
    'intermediate': 'Fortgeschritten',
    'advanced': 'Experte',
    'all': 'Alle Schwierigkeitsgrade'
  };
  const courseTypeLabels: Record<string, string> = {
    'custom': 'Individuell',
    'sprint': 'Sprint',
    'workshop': 'Workshop',
    'online': 'Online-Kurs',
    'hybrid': 'Hybrid'
  };

  // HTML sicher rendern
  const sanitizeHtml = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html)
    };
  };
  const completionDate = enrollment ? addDays(new Date(enrollment.enrolled_at), course.completion_deadline_days || 30) : null;
  
  const completedLessons = enrollment ? Math.floor((enrollment.progress_percentage / 100) * (course.total_lessons || 0)) : 0;
  const totalLessons = course.total_lessons || 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte - 2/3 Breite */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            
            <CourseRating 
              rating={course.rating || 0} 
              ratingCount={course.rating_count || 0} 
            />
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
              {course.updated_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Aktualisiert: {format(new Date(course.updated_at), "yyyy", { locale: de })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {course.language || "Deutsch"}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <CourseTabs
            overview={
              <>
                {/* Über den Kurs */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Über den Kurs</h2>
                  <h3 className="text-lg font-medium mb-3">Kursziel</h3>
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={sanitizeHtml(course.description)} 
                  />
                </div>

                {/* Kursinhalt */}
                {modules.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Kursinhalt</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {modules.map((module, index) => (
                        <AccordionItem key={module.id} value={`module-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{module.title}</span>
                              {module.duration_minutes && (
                                <span className="text-sm text-muted-foreground">
                                  {module.duration_minutes} Min
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">
                              Phase {module.phase_number}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </>
            }
          />
        </div>

        {/* Rechte Spalte - 1/3 Breite */}
        <div className="space-y-4">
          {/* Großes Thumbnail */}
          {course.thumbnail_url && (
            <img 
              src={course.thumbnail_url} 
              alt={course.title} 
              className="w-full h-48 object-cover rounded-lg shadow-md" 
            />
          )}
          
          {/* Course Includes Card */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold text-lg mb-4">Course Includes</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Preis</span>
                </div>
                <Badge variant={course.price_chf === 0 || course.price_chf === null ? "secondary" : "default"}>
                  {course.price_chf === 0 || course.price_chf === null ? "Kostenlos" : `CHF ${course.price_chf}`}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Teilnehmende</span>
                </div>
                <span className="text-sm font-medium">
                  {course.enrolled_students_count || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Lektionen</span>
                </div>
                <span className="text-sm font-medium">
                  {course.total_lessons || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Quizze</span>
                </div>
                <span className="text-sm font-medium">
                  {course.total_quizzes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Schwierigkeit</span>
                </div>
                <Badge variant="outline">
                  {difficultyLabels[course.skill_level || course.difficulty || ''] || "Alle"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Sprache</span>
                </div>
                <span className="text-sm font-medium">
                  {course.language || "Deutsch"}
                </span>
              </div>

              {course.includes_certificate && (
                <div className="flex items-center gap-2 text-sm text-green-600 pt-2 border-t">
                  <StarburstIcon className="h-4 w-4" />
                  <span>Zertifikat nach Abschluss</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fortschritt */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold">Kursfortschritt</h3>
              <div>
                <p className="text-3xl font-bold">
                  {completedLessons}/{totalLessons}
                </p>
                <p className="text-sm text-muted-foreground">
                  {enrollment?.progress_percentage || 0}% Abgeschlossen
                </p>
              </div>
              {enrollment && enrollment.progress_percentage > 0 && (
                <Progress value={enrollment.progress_percentage} className="h-2" />
              )}
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Mit dem Lernen beginnen
            </Button>
            <Button variant="outline" className="w-full">
              Zu Wunschliste hinzufügen
            </Button>
          </div>

          {/* GDPR Checkbox */}
          <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox id="gdpr" />
            <label htmlFor="gdpr" className="text-xs leading-relaxed cursor-pointer">
              Ich habe die{" "}
              <a href="/agb" className="underline hover:text-primary">
                AGB
              </a>{" "}
              gelesen und bin einverstanden
            </label>
          </div>

          {/* Share This */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Share This:</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Link kopieren">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Per E-Mail teilen">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Teilen">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedCourses.map(relatedCourse => (
              <CourseCard key={relatedCourse.id} course={relatedCourse} />
            ))}
          </div>
        </div>
      )}
    </>
  );

}