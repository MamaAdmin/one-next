import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CheckCircle, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const registrationId = searchParams.get("registration_id");
  const type = searchParams.get("type"); // "sprint" or "kurs"

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Zahlung bestätigt | one-next" description="Ihre Zahlung wurde erfolgreich verarbeitet." />
      <Navigation />
      <main className="flex-1 mt-24 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Zahlung erfolgreich!
              </h1>
              <p className="text-muted-foreground">
                Vielen Dank für Ihre Buchung. Ihre Zahlung wurde erfolgreich verarbeitet.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Eine Bestätigungs-E-Mail wurde an Ihre Adresse gesendet.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {type === "sprint" ? (
                <Button asChild>
                  <Link to="/sprint-uebersicht/online">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Sprint-Übersicht
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/kurse">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zu den Kursen
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">Zur Startseite</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
