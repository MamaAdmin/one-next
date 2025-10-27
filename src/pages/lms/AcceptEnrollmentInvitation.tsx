import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AcceptEnrollmentInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationData, setInvitationData] = useState<{ 
    email: string; 
    purchaseId: string;
    courseTitle: string;
  } | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Ungültiger Einladungslink");
        navigate("/");
        return;
      }

      try {
        // Validate enrollment invitation token
        const { data: invitation, error } = await (supabase as any)
          .from("lms_enrollment_invitations")
          .select(`
            email,
            purchase_id,
            status,
            expires_at,
            lms_course_purchases!inner(
              course_id,
              lms_courses!inner(title)
            )
          `)
          .eq("token", token)
          .maybeSingle();

        if (error) throw error;
        
        if (!invitation) {
          setInvitationValid(false);
          toast.error("Einladung nicht gefunden");
          return;
        }

        if (invitation.status !== "pending") {
          setInvitationValid(false);
          toast.error("Diese Einladung wurde bereits verwendet");
          return;
        }

        if (new Date(invitation.expires_at) < new Date()) {
          setInvitationValid(false);
          toast.error("Diese Einladung ist abgelaufen");
          return;
        }

        setInvitationData({
          email: invitation.email,
          purchaseId: invitation.purchase_id,
          courseTitle: (invitation.lms_course_purchases as any)?.lms_courses?.title || "Kurs",
        });
        setInvitationValid(true);
      } catch (error) {
        console.error("Error validating invitation:", error);
        setInvitationValid(false);
        toast.error("Fehler beim Validieren der Einladung");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleAccept = async () => {
    if (!token || !invitationData) return;

    setSubmitting(true);
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Bitte melden Sie sich an, um die Einladung anzunehmen");
        navigate(`/auth?redirect=/accept-enrollment-invitation?token=${token}`);
        return;
      }

      // Check if user email matches invitation
      if (user.email !== invitationData.email) {
        toast.error("Diese Einladung gilt für eine andere E-Mail-Adresse");
        return;
      }

      // Get or create participant
      let { data: participant } = await (supabase as any)
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!participant) {
        const { data: newParticipant, error: participantError } = await (supabase as any)
          .from("participants")
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split("@")[0],
          })
          .select()
          .single();

        if (participantError) throw participantError;
        participant = newParticipant;
      }

      // Create enrollment
      const { error: enrollmentError } = await (supabase as any)
        .from("lms_course_enrollments")
        .insert({
          purchase_id: invitationData.purchaseId,
          participant_id: participant.id,
          status: "active",
        });

      if (enrollmentError) throw enrollmentError;

      // Update invitation status
      await (supabase as any)
        .from("lms_enrollment_invitations")
        .update({ status: "accepted" })
        .eq("token", token);

      toast.success("Einladung erfolgreich angenommen!");
      
      // Get course_id from purchase to redirect
      const { data: purchase } = await supabase
        .from("lms_course_purchases")
        .select("course_id")
        .eq("id", invitationData.purchaseId)
        .single();

      if (purchase) {
        navigate(`/lms/courses/${purchase.course_id}`);
      } else {
        navigate("/lms");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Fehler beim Annehmen der Einladung");
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <Footer isEditMode={false} />
      </div>
    );
  }

  if (!invitationValid) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Ungültige Einladung</CardTitle>
              <CardDescription>
                Diese Einladung ist nicht gültig oder bereits abgelaufen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer isEditMode={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Kurs-Einladung annehmen</CardTitle>
            <CardDescription>
              Sie wurden zum Kurs "{invitationData?.courseTitle}" eingeladen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">E-Mail</p>
              <p className="font-medium">{invitationData?.email}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Kurs</p>
              <p className="font-medium">{invitationData?.courseTitle}</p>
            </div>

            <Button 
              onClick={handleAccept} 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird angenommen...
                </>
              ) : (
                "Einladung annehmen"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer isEditMode={false} />
    </div>
  );
};

export default AcceptEnrollmentInvitation;
