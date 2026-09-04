import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const passwordSchema = z
  .string()
  .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
  .regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten")
  .regex(/[a-z]/, "Das Passwort muss mindestens einen Kleinbuchstaben enthalten")
  .regex(/[0-9]/, "Das Passwort muss mindestens eine Zahl enthalten")
  .regex(/[^A-Za-z0-9]/, "Das Passwort muss mindestens ein Sonderzeichen enthalten");

const PASSWORD_HINT =
  "Mindestens 8 Zeichen mit Groß- und Kleinbuchstaben, Zahl und Sonderzeichen";

const translateError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("should be different") || m.includes("same as the old")) {
    return "Das neue Passwort muss sich vom bisherigen unterscheiden";
  }
  if (m.includes("expired") || m.includes("invalid")) {
    return "Der Link ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen an.";
  }
  if (m.includes("weak") || m.includes("pwned") || m.includes("compromised")) {
    return "Dieses Passwort ist unsicher. Bitte wählen Sie ein anderes.";
  }
  if (m.includes("session") || m.includes("auth")) {
    return "Ihre Sitzung ist nicht mehr gültig. Bitte fordern Sie einen neuen Link an.";
  }
  return message;
};

type Status = "checking" | "ready" | "invalid";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    // Fehler kommen entweder als Query- oder als Hash-Parameter zurück
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const err = query.get("error_description") || query.get("error") ||
      hash.get("error_description") || hash.get("error");

    if (err) {
      setLinkError(translateError(decodeURIComponent(err.replace(/\+/g, " "))));
      setStatus("invalid");
      return;
    }

    const markReady = () => {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      setStatus("ready");
    };

    // Der Link aus der E-Mail wird erst asynchron eingelöst –
    // deshalb auf das Auth-Event warten statt sofort zu prüfen.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) markReady();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    timer = setTimeout(() => {
      if (!active) return;
      active = false;
      setLinkError("Der Link ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen an.");
      setStatus("invalid");
    }, 6000);

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwörter stimmen nicht überein");
      }

      const validatedPassword = passwordSchema.parse(newPassword);

      const { error } = await supabase.auth.updateUser({
        password: validatedPassword,
      });

      if (error) throw error;

      toast.success("Passwort erfolgreich aktualisiert", {
        description: "Bitte melden Sie sich mit Ihrem neuen Passwort an",
      });

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error("Ungültiges Passwort", {
          description: error.errors[0].message,
        });
      } else {
        toast.error("Fehler beim Aktualisieren des Passworts", {
          description: translateError(error.message || "Unbekannter Fehler"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (status !== "ready") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {status === "checking" ? "Überprüfung läuft..." : "Link nicht mehr gültig"}
              </CardTitle>
              <CardDescription>
                {status === "checking"
                  ? "Bitte warten Sie, während wir Ihren Zurücksetzungslink prüfen"
                  : linkError}
              </CardDescription>
            </CardHeader>
            {status === "invalid" && (
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/password-reset")}>
                  Neuen Link anfordern
                </Button>
              </CardContent>
            )}
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Passwort aktualisieren</CardTitle>
            <CardDescription>
              Geben Sie unten Ihr neues Passwort ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Neues Passwort eingeben"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Neues Passwort bestätigen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aktualisierung läuft..." : "Passwort aktualisieren"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
