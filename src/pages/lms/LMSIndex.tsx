import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { BookIcon } from "@/components/ui/custom-icons";
import Footer from "@/components/Footer";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Clock, Trophy } from "lucide-react";
import { categoryLabels } from "@/lib/categoryMappings";

const LMSIndex = () => {
  const navigate = useNavigate();
  const { enrollments, currentEnrollment, loading } = useLMSEnrollment();

  useEffect(() => {
    // Redirect to auth if not logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Laden...</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Meine Kurse", active: true, icon: <BookIcon className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meine Design Sprint Kurse</h1>
          <p className="text-muted-foreground">
            Übersicht über Ihre eingeschriebenen Kurse und den Lernfortschritt
          </p>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Noch keine Kurse</h3>
                <p className="text-muted-foreground mb-4">
                  Sie sind aktuell in keinem Kurs eingeschrieben. Bitte wenden Sie sich an Ihren Administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className={enrollment.id === currentEnrollment?.id ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {enrollment.status === "completed" && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                        {enrollment.status === "active" && (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                        Kurs #{enrollment.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        {categoryLabels[enrollment.current_category]} • Status: {
                          enrollment.status === "active" ? "Aktiv" :
                          enrollment.status === "completed" ? "Abgeschlossen" :
                          "Abgebrochen"
                        }
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Fortschritt</span>
                        <span className="font-semibold">{enrollment.progress_percentage}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage} />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Eingeschrieben am: {new Date(enrollment.enrolled_at).toLocaleDateString("de-DE")}</p>
                      {enrollment.completed_at && (
                        <p className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Abgeschlossen am: {new Date(enrollment.completed_at).toLocaleDateString("de-DE")}
                        </p>
                      )}
                    </div>

                    {enrollment.status === "active" && (
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/lms/enrollment/${enrollment.id}`)}
                      >
                        Kurs fortsetzen
                      </Button>
                    )}
                    {enrollment.status === "completed" && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/lms/enrollment/${enrollment.id}`)}
                      >
                        Kurs ansehen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer isEditMode={false} />
    </div>
  );
};

export default LMSIndex;
