import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvitations } from "@/hooks/useInvitations";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { acceptInvitation } = useInvitations();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationData, setInvitationData] = useState<{ email: string; fullName: string } | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Ungültiger Einladungslink");
        navigate("/");
        return;
      }

      try {
        // Validate invitation token
        const { data: invitation, error } = await supabase
          .from("user_invitations")
          .select("email, full_name, status, expires_at")
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
          fullName: invitation.full_name,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    if (!token) return;

    setSubmitting(true);
    try {
      await acceptInvitation(token, password);
      toast.success("Account erfolgreich erstellt!");
      navigate("/profile");
    } catch {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!invitationValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Einladung annehmen</CardTitle>
          <CardDescription>
            Erstellen Sie Ihr Passwort, um Ihren Account zu aktivieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {invitationData && (
              <>
                <div>
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    id="fullName"
                    value={invitationData.fullName}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    value={invitationData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                required
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Account erstellen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
