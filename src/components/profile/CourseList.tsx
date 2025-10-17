import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { useState } from "react";
import { CourseRatingDialog } from "./CourseRatingDialog";

interface Course {
  id: string;
  title: string;
  progress: number;
  isCompleted: boolean;
  enrollmentId: string;
  rating?: number;
}

interface CourseListProps {
  courses: Course[];
  onRatingSubmit: (courseId: string, enrollmentId: string, rating: number, review?: string) => Promise<void>;
}

export const CourseList = ({ courses, onRatingSubmit }: CourseListProps) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const activeCourses = courses.filter(c => !c.isCompleted);
  const completedCourses = courses.filter(c => c.isCompleted);

  return (
    <div className="space-y-6">
      {activeCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Aktive Kurse</h3>
          <div className="space-y-4">
            {activeCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    Fortschritt: {course.progress}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={course.progress} className="mb-4" />
                  <Button variant="outline" size="sm">
                    Fortsetzen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Abgeschlossene Kurse</h3>
          <div className="space-y-4">
            {completedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.title}</span>
                    <span className="text-green-600 text-sm font-normal">
                      Abgeschlossen
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.rating ? (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= course.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourse(course)}
                      >
                        Bewertung ändern
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Kurs bewerten
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && (
        <CourseRatingDialog
          course={selectedCourse}
          open={!!selectedCourse}
          onOpenChange={(open) => !open && setSelectedCourse(null)}
          onSubmit={async (rating, review) => {
            await onRatingSubmit(
              selectedCourse.id,
              selectedCourse.enrollmentId,
              rating,
              review
            );
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};
