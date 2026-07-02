import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

export default function LMSPurchaseConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const purchaseId = searchParams.get('purchase_id');

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!sessionId || !purchaseId) {
        toast.error("Ungültige Kaufbestätigung");
        navigate('/lms');
        return;
      }

      try {
        const { error } = await supabase.functions.invoke('verify-course-purchase', {
          body: { sessionId, purchaseId }
        });

        if (error) throw error;

        // Load purchase details
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('lms_course_purchases')
          .select(`
            *,
            lms_courses (
              id,
              title,
              slug
            ),
            lms_course_enrollments (
              id,
              participant_id
            )
          `)
          .eq('id', purchaseId)
          .single();

        if (purchaseError) throw purchaseError;
        setPurchase(purchaseData);
        
        toast.success("Kauf erfolgreich abgeschlossen!");
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Fehler bei der Kaufbestätigung");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPurchase();
  }, [sessionId, purchaseId, navigate]);

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p>Kaufbestätigung wird überprüft...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!purchase) {
    return null;
  }

  const courseSlug = purchase.lms_courses?.slug;
  const enrollmentCount = purchase.lms_course_enrollments?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-green-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Kauf erfolgreich abgeschlossen!</CardTitle>
          <CardDescription>
            Vielen Dank für Ihren Kauf. Sie haben jetzt Zugang zum Kurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Kurs:</span>
              <span>{purchase.lms_courses?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Lizenzen:</span>
              <span>{purchase.number_of_licenses}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Erstelle Enrollments:</span>
              <span>{enrollmentCount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Gesamt:</span>
              <span>CHF {purchase.total_price?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details zu Ihrem Kauf.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(`/lms/courses/${courseSlug}`)}
                className="flex-1"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Zum Kurs
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile?tab=purchases')}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Kaufhistorie
              </Button>
            </div>
          </div>

          {enrollmentCount < purchase.number_of_licenses && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Hinweis:</strong> Sie haben {purchase.number_of_licenses} Lizenzen gekauft, 
                aber nur {enrollmentCount} wurde(n) automatisch erstellt. 
                Sie können weitere Teammitglieder über die Enrollment-Verwaltung einladen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
