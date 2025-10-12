import { HMWGenerator } from "@/components/lms/HMWGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LMSHMWGenerator() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-32">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How Might We (HMW)-Fragen Generator</CardTitle>
            <CardDescription>
              Interaktiver Generator für "Wie können wir...?"-Fragen. 
              Erstellen Sie systematisch kreative Fragestellungen mit unserem Satzbaukasten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HMWGenerator />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
