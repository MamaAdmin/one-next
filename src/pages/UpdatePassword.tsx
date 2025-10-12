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
  .regex(/[0-9]/, "Das Passwort muss mindestens eine Zahl enthalten");

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidToken(true);
      } else {
        toast.error("Ungültiger oder abgelaufener Reset-Link", {
          description: "Bitte fordern Sie einen neuen Link zum Zurücksetzen an",
        });
        navigate("/password-reset");
      }
    };

    checkSession();
  }, [navigate]);

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
        description: "Sie können sich nun mit Ihrem neuen Passwort anmelden",
      });

      navigate("/auth");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error("Ungültiges Passwort", {
          description: error.errors[0].message,
        });
      } else {
        toast.error("Fehler beim Aktualisieren des Passworts", {
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidToken) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Überprüfung läuft...</CardTitle>
              <CardDescription>Bitte warten Sie, während wir Ihren Zurücksetzungslink prüfen</CardDescription>
            </CardHeader>
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
                <p className="text-xs text-muted-foreground">
                  Mindestens 8 Zeichen mit Groß- und Kleinbuchstaben sowie einer Zahl
                </p>
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
