import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  CATEGORY_LABELS,
  UNIT_LABELS,
  fetchKieModels,
  type KieModel,
} from "@/features/whiteboard/pricing";

export const KieModelPricing = () => {
  const { toast } = useToast();
  const [models, setModels] = useState<KieModel[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchKieModels()
      .then(setModels)
      .catch((e) =>
        toast({ title: "Preise nicht geladen", description: e.message, variant: "destructive" }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (id: string, changes: Partial<KieModel>) =>
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));

  const save = async (model: KieModel) => {
    setSavingId(model.id);
    const { error } = await (supabase as any)
      .from("kie_models")
      .update({ credits_per_unit: model.credits_per_unit, active: model.active })
      .eq("id", model.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    patch(model.id, { updated_at: new Date().toISOString() });
    toast({ title: "Preis gespeichert" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kie.ai Modelle und Preise</CardTitle>
        <CardDescription>
          Creditwerte pro Berechnungseinheit. Anpassen, wenn Kie.ai die Preise ändert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {models.map((model) => (
          <div
            key={model.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{model.name}</p>
              <p className="text-muted-foreground">
                {CATEGORY_LABELS[model.category]} · {UNIT_LABELS[model.unit]} · zuletzt aktualisiert{" "}
                {new Date(model.updated_at).toLocaleDateString("de-CH")}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                {model.last_checked_at ? (
                  <span>
                    zuletzt geprüft: {new Date(model.last_checked_at).toLocaleDateString("de-CH")}
                  </span>
                ) : (
                  <Badge variant="outline">Preis nie abgeglichen</Badge>
                )}
              </div>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="w-28"
              value={model.credits_per_unit}
              onChange={(e) => patch(model.id, { credits_per_unit: Number(e.target.value) })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={model.active}
                onCheckedChange={(checked) => patch(model.id, { active: checked })}
              />
              <span className="text-muted-foreground">{model.active ? "aktiv" : "inaktiv"}</span>
            </div>
            <Button size="sm" onClick={() => save(model)} disabled={savingId === model.id}>
              Speichern
            </Button>
          </div>
        ))}
        {models.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Modelle hinterlegt.</p>
        )}
      </CardContent>
    </Card>
  );
};
