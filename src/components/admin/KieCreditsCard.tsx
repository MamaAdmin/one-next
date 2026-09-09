import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { fetchCredits } from "@/features/whiteboard/api";
import { formatCredits } from "@/features/whiteboard/pricing";

export const KieCreditsCard = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCredits(await fetchCredits());
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kontostand nicht abrufbar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Kie.ai Credits</CardTitle>
          <CardDescription>
            {updatedAt
              ? `Zuletzt aktualisiert: ${updatedAt.toLocaleString("de-CH")}`
              : "Noch nicht abgerufen"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Credits aktualisieren
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-semibold">{formatCredits(credits)}</p>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {credits !== null && credits < 100 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Kritisch: weniger als 100 Credits. Bitte Guthaben aufladen.
            </AlertDescription>
          </Alert>
        )}
        {credits !== null && credits >= 100 && credits < 500 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Achtung: weniger als 500 Credits verfügbar.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
