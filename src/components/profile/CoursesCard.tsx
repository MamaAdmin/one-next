import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseList } from "./CourseList";
import type { EnrollmentWithCourse } from "@/hooks/useEnrollmentsWithCourses";

interface Course {
  id: string;
  title: string;
  slug: string;
  progress: number;
  isCompleted: boolean;
  enrollmentId: string;
  rating?: number;
}

interface CoursesCardProps {
  enrollments: EnrollmentWithCourse[];
  onRatingSubmit: (
    courseId: string,
    enrollmentId: string,
    rating: number,
    review?: string
  ) => Promise<void>;
}

export const CoursesCard = ({ enrollments, onRatingSubmit }: CoursesCardProps) => {
  // Transform enrollments to course format
  const courses: Course[] = enrollments.map((enrollment) => ({
    id: enrollment.purchase?.course?.id || "",
    title: enrollment.purchase?.course?.title || "Unbekannter Kurs",
    slug: enrollment.purchase?.course?.slug || "",
    progress: enrollment.progress_percentage || 0,
    isCompleted: !!enrollment.completed_at,
    enrollmentId: enrollment.id,
    rating: enrollment.rating?.rating,
  }));

  const activeCourses = courses.filter((c) => !c.isCompleted);
  const completedCourses = courses.filter((c) => c.isCompleted);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meine Kurse</CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Sie sind noch in keinen Kursen eingeschrieben
          </p>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">
                Aktive Kurse ({activeCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Abgeschlossen ({completedCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeCourses.length > 0 ? (
                <CourseList
                  courses={activeCourses}
                  variant="active"
                  onRatingSubmit={onRatingSubmit}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Keine aktiven Kurse
                </p>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedCourses.length > 0 ? (
                <CourseList
                  courses={completedCourses}
                  variant="completed"
                  onRatingSubmit={onRatingSubmit}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Keine abgeschlossenen Kurse
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
