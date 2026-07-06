import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type UnsubscribeState = "loading" | "valid" | "success" | "invalid" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<UnsubscribeState>("loading");

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setState("invalid");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } },
        );

        if (!response.ok) {
          setState("invalid");
          return;
        }

        const result = await response.json();
        setState(result.valid ? "valid" : "success");
      } catch {
        setState("error");
      }
    }

    validateToken();
  }, [token]);

  async function confirmUnsubscribe() {
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      setState(error ? "error" : "success");
    } catch {
      setState("error");
    }
  }

  const copy = {
    loading: {
      title: "Abmeldung wird geprüft",
      description: "Einen Moment bitte.",
    },
    valid: {
      title: "E-Mail-Abmeldung bestätigen",
      description: "Nach der Bestätigung erhält diese Adresse keine App-E-Mails mehr von one-next.",
    },
    success: {
      title: "Abmeldung bestätigt",
      description: "Diese E-Mail-Adresse wurde aus den App-E-Mails ausgetragen.",
    },
    invalid: {
      title: "Link ungültig",
      description: "Dieser Abmeldelink ist nicht mehr gültig oder wurde bereits verwendet.",
    },
    error: {
      title: "Abmeldung nicht möglich",
      description: "Bitte versuchen Sie es später erneut oder schreiben Sie an info@one-next.com.",
    },
  }[state];

  return (
    <>
      <SEO
        title="E-Mail-Abmeldung | one-next"
        description="E-Mail-Abmeldung für one-next App-E-Mails."
        canonical="https://one-next.com/unsubscribe"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-32">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{copy.title}</CardTitle>
              <CardDescription>{copy.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {state === "valid" && <Button onClick={confirmUnsubscribe}>Abmeldung bestätigen</Button>}
              <Button asChild variant="outline">
                <Link to="/">Zur Startseite</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Unsubscribe;