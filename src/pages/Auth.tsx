import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Der Name muss mindestens 2 Zeichen enthalten")
    .max(100, "Der Name darf höchstens 100 Zeichen enthalten")
    .regex(/^[a-zA-Z\s'-]+$/, "Der Name darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten"),
  email: z
    .string()
    .trim()
    .email("Bitte eine gültige E-Mail-Adresse eingeben")
    .max(255, "Die E-Mail-Adresse darf höchstens 255 Zeichen enthalten"),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
    .regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten")
    .regex(/[a-z]/, "Das Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .regex(/[0-9]/, "Das Passwort muss mindestens eine Zahl enthalten")
    .regex(/[^A-Za-z0-9]/, "Das Passwort muss mindestens ein Sonderzeichen enthalten"),
});

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Bitte eine gültige E-Mail-Adresse eingeben")
    .max(255, "Die E-Mail-Adresse darf höchstens 255 Zeichen enthalten"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = signUpSchema.parse({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Erfolg!",
        description: "Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validierungsfehler",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler",
          description: error.message || "Beim Registrieren ist ein Fehler aufgetreten",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Die Anmeldung mit Google ist fehlgeschlagen",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = signInSchema.parse({
        email: email.trim(),
        password,
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      toast({
        title: "Willkommen zurück!",
        description: "Sie haben sich erfolgreich angemeldet.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validierungsfehler",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler",
          description: error.message || "Ungültige Zugangsdaten",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.93c2.3-2.12 3.51-5.24 3.51-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-2.98c-1.09.73-2.48 1.16-4 1.16-3.07 0-5.67-2.07-6.6-4.86H1.34v3.06C3.32 21.3 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.4 14.41c-.24-.73-.38-1.5-.38-2.41s.14-1.68.38-2.41V6.53H1.34C.49 8.21 0 10.05 0 12s.49 3.79 1.34 5.47l4.06-3.06z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.35 0 3.32 2.7 1.34 6.53l4.06 3.06c.93-2.79 3.53-4.84 6.6-4.84z"
              />
            </svg>
            {googleLoading ? "Weiterleitung..." : "Mit Google anmelden"}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">oder mit E-Mail</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Anmelden</CardTitle>
                  <CardDescription>Geben Sie Ihre Zugangsdaten ein, um auf Ihr Konto zuzugreifen</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">E-Mail-Adresse</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Passwort</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Anmeldung läuft..." : "Anmelden"}
                    </Button>
                    <div className="text-center mt-4">
                      <Link
                        to="/password-reset"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Passwort vergessen?
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Registrieren</CardTitle>
                  <CardDescription>Erstellen Sie ein neues Konto, um loszulegen</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Vollständiger Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-Mail-Adresse</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Passwort</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mindestens 8 Zeichen mit Groß- und Kleinbuchstaben, Zahl und Sonderzeichen
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Konto wird erstellt..." : "Registrieren"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
