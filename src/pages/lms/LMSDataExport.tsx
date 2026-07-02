import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

export default function LMSDataExport() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // Call edge function to generate export
      const { data, error } = await supabase.functions.invoke("generate-data-export", {
        body: { user_id: user.id },
      });

      if (error) throw error;

      // Download the export file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lms-data-export-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: "Ihre Daten wurden exportiert",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Fehler",
        description: error.message || "Export fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Daten-Export (GDPR)</CardTitle>
          <CardDescription>
            Exportieren Sie alle Ihre gespeicherten Daten gemäß DSGVO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Der Export enthält:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Profildaten</li>
            <li>Kurs-Enrollments</li>
            <li>Hochgeladene Artifacts</li>
            <li>Votes und Kommentare</li>
            <li>Collaboration-Daten</li>
          </ul>
          <Button onClick={handleExport} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Daten exportieren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
