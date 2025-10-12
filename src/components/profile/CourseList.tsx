import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseRatingDialog } from "./CourseRatingDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  progress: number;
  isCompleted: boolean;
  enrollmentId: string;
  rating?: number;
}

interface CourseListProps {
  courses: Course[];
  variant: "active" | "completed";
  onRatingSubmit: (courseId: string, enrollmentId: string, rating: number, review?: string) => Promise<void>;
}

export const CourseList = ({ courses, variant, onRatingSubmit }: CourseListProps) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadCertificate = async (enrollmentId: string) => {
    try {
      setDownloadingCert(enrollmentId);
      const { data, error } = await supabase.functions.invoke(
        "generate-completion-certificate",
        { body: { enrollmentId } }
      );

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Zertifikat-${enrollmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Zertifikat heruntergeladen");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Fehler beim Herunterladen des Zertifikats");
    } finally {
      setDownloadingCert(null);
    }
  };

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{course.title}</span>
              {variant === "completed" && (
                <span className="text-green-600 text-sm font-normal">
                  ✓ Abgeschlossen
                </span>
              )}
            </CardTitle>
            {variant === "active" && (
              <CardDescription>
                Fortschritt: {course.progress}%
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {variant === "active" && (
              <>
                <Progress value={course.progress} />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/lms/courses/${course.slug}`)}
                  >
                    Fortsetzen
                  </Button>
                </div>
              </>
            )}

            {variant === "completed" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadCertificate(course.enrollmentId)}
                  disabled={downloadingCert === course.enrollmentId}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadingCert === course.enrollmentId
                    ? "Lädt..."
                    : "Zertifikat"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

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
