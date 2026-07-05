import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, LogIn, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Invitation {
  id: string;
  sprint_id: string;
  sprint_title: string;
  email: string;
  full_name: string;
  role_type: string;
  status: string;
  expires_at: string;
}

const ROLE_LABEL: Record<string, string> = {
  decider: "Decider",
  sprint_leader: "Sprint Leader",
  finance: "Finance Expert",
  marketing: "Marketing Expert",
  customer: "Customer Expert",
  tech: "Tech / Logistics Expert",
  design: "Design Expert",
  wildcard: "Wildcard",
  viewer: "Beobachter",
};

export default function AcceptSprintInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      const [{ data: authData }, { data: inviteData, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.rpc("get_sprint_invitation_by_token", { p_token: token }),
      ]);
      setUserEmail(authData.user?.email ?? null);
      setUserId(authData.user?.id ?? null);
      if (error) {
        toast({
          title: "Einladung konnte nicht geladen werden",
          description: error.message,
          variant: "destructive",
        });
      }
      const row = Array.isArray(inviteData) ? inviteData[0] : inviteData;
      setInvitation((row as Invitation) ?? null);
      setLoading(false);
    }
    load();
  }, [token]);

  async function handleAccept() {
    if (!token || !invitation) return;
    setAccepting(true);
    try {
      const { error } = await supabase.functions.invoke("accept-sprint-team-invite", {
        body: { token },
      });
      if (error) throw error;
      toast({ title: "Einladung angenommen", description: "Willkommen im Sprint-Team." });
      navigate(`/sprint/${invitation.sprint_id}`);
    } catch (e) {
      toast({
        title: "Annahme fehlgeschlagen",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  }

  const expired = invitation ? new Date(invitation.expires_at) < new Date() : false;
  const notPending = invitation ? invitation.status !== "pending" : false;
  const emailMismatch =
    invitation && userEmail
      ? invitation.email.toLowerCase() !== userEmail.toLowerCase()
      : false;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 container mx-auto px-6 py-16 max-w-2xl">
        <Card className="border-none shadow-xl">
          <CardContent className="p-8 space-y-6">
            {loading ? (
              <p className="text-muted-foreground">Einladung wird geladen …</p>
            ) : !invitation ? (
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div>
                  <h1 className="text-2xl font-bold">Einladung ungültig</h1>
                  <p className="text-muted-foreground mt-2">
                    Der Link ist unbekannt oder wurde widerrufen.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/">Zur Startseite</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Badge variant="secondary" className="mb-2">
                    Sprint-Einladung
                  </Badge>
                  <h1 className="text-2xl font-bold">Willkommen im Sprint</h1>
                  <p className="text-muted-foreground mt-2">
                    {invitation.full_name || invitation.email}, du wurdest als{" "}
                    <span className="font-semibold text-foreground">
                      {ROLE_LABEL[invitation.role_type] ?? invitation.role_type}
                    </span>{" "}
                    zum Sprint{" "}
                    <span className="font-semibold text-foreground">
                      „{invitation.sprint_title}"
                    </span>{" "}
                    eingeladen.
                  </p>
                </div>

                {expired || notPending ? (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                    <div>
                      {expired ? "Diese Einladung ist abgelaufen." : "Diese Einladung ist nicht mehr aktiv."}
                      {" "}Bitte den Sprint-Owner, dir eine neue zu schicken.
                    </div>
                  </div>
                ) : !userId ? (
                  <div className="rounded-lg border p-4 text-sm space-y-3">
                    <p>
                      Melde dich mit der E-Mail{" "}
                      <span className="font-semibold">{invitation.email}</span> an oder registriere
                      dich, um beizutreten.
                    </p>
                    <Button asChild>
                      <Link to={`/auth?redirect=${encodeURIComponent(`/sprint/invite/${token}`)}`}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Anmelden
                      </Link>
                    </Button>
                  </div>
                ) : emailMismatch ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
                    Du bist mit <span className="font-semibold">{userEmail}</span> angemeldet, aber
                    diese Einladung wurde an <span className="font-semibold">{invitation.email}</span>{" "}
                    ausgestellt. Melde dich mit der eingeladenen Adresse an.
                  </div>
                ) : (
                  <Button
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={handleAccept}
                    disabled={accepting}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {accepting ? "Wird angenommen …" : "Einladung annehmen"}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
