import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain } from "lucide-react";

const BMADLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has bmad_user or admin role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .in("role", ["bmad_user", "admin"]);

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Sie haben keinen Zugang zum BMAD-Bereich.");
      }

      toast({
        title: "Willkommen!",
        description: "Sie wurden erfolgreich eingeloggt.",
      });

      navigate("/bmad");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Fehler beim Login",
        description: error.message || "Bitte überprüfen Sie Ihre Anmeldedaten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">BMAD Login</CardTitle>
          <CardDescription>
            Melden Sie sich an, um auf Ihre BMAD-Sessions zuzugreifen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
            <div className="text-center mt-4">
              <a
                href="/password-reset"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Passwort vergessen?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BMADLogin;
