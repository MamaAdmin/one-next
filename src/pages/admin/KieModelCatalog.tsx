import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { KieCreditsCard } from "@/components/admin/KieCreditsCard";
import {
  CATEGORY_LABELS,
  UNIT_LABELS,
  fetchKieModels,
  formatCredits,
  type KieCategory,
  type KieModel,
} from "@/features/whiteboard/pricing";
import {
  askAdvisor,
  syncCatalog,
  type AdviceResult,
  type CatalogSuggestion,
} from "@/features/whiteboard/catalog";

interface VideoOption {
  id: string;
  title: string;
}

const KieModelCatalog = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const [models, setModels] = useState<KieModel[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("alle");
  const [quality, setQuality] = useState<string>("alle");
  const [maxCredits, setMaxCredits] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [advising, setAdvising] = useState(false);

  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const [videos, setVideos] = useState<VideoOption[]>([]);
  const [targetVideo, setTargetVideo] = useState<string>("");

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const reload = async () => {
    try {
      setModels(await fetchKieModels());
    } catch (e) {
      toast({
        title: "Katalog nicht geladen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void reload();
    void (async () => {
      const { data } = await (supabase as any)
        .from("whiteboard_videos")
        .select("id, title")
        .order("created_at", { ascending: false })
        .limit(50);
      setVideos((data ?? []) as VideoOption[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const useCaseList = useMemo(
    () => [...new Set(models.flatMap((m) => m.use_cases ?? []))].sort(),
    [models],
  );

  const filtered = useMemo(() => {
    const limit = Number(maxCredits);
    return models.filter((m) => {
      if (category !== "alle" && m.category !== category) return false;
      if (quality !== "alle" && m.quality_tier !== quality) return false;
      if (maxCredits && Number.isFinite(limit) && Number(m.credits_per_unit) > limit) return false;
      if (search) {
        const haystack = [m.name, m.display_name, m.provider, m.description_de, ...(m.use_cases ?? [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [models, category, quality, maxCredits, search]);

  const patch = (id: string, changes: Partial<KieModel>) =>
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));

  const saveModel = async (model: KieModel) => {
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
    toast({ title: "Gespeichert" });
  };

  const runAdvice = async () => {
    if (!prompt.trim()) return;
    setAdvising(true);
    try {
      const { result } = await askAdvisor(prompt.trim());
      setAdvice(result);
    } catch (e) {
      toast({
        title: "Beratung fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setAdvising(false);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const result = await syncCatalog();
      setSuggestions(result.suggestions ?? []);
      setSyncedAt(result.createdAt);
      toast({
        title: "Abgleich abgeschlossen",
        description: `${result.suggestions?.length ?? 0} Vorschläge gefunden`,
      });
    } catch (e) {
      toast({
        title: "Abgleich fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const acceptSuggestion = async (suggestion: CatalogSuggestion) => {
    if (suggestion.art === "entfernt") {
      const model = models.find((m) => m.name === suggestion.name);
      if (model) {
        await (supabase as any).from("kie_models").update({ active: false }).eq("id", model.id);
      }
    } else {
      const { error } = await (supabase as any).from("kie_models").upsert(
        {
          name: suggestion.name,
          display_name: suggestion.display_name ?? suggestion.name,
          provider: suggestion.provider ?? null,
          category: suggestion.category ?? "image",
          unit: suggestion.unit ?? "job",
          credits_per_unit: 0,
          description_de: suggestion.description_de ?? null,
          use_cases: suggestion.use_cases ?? [],
          docs_url: suggestion.docs_url ?? null,
          source: "abgleich",
          last_checked_at: new Date().toISOString(),
        },
        { onConflict: "name" },
      );
      if (error) {
        toast({ title: "Übernahme fehlgeschlagen", description: error.message, variant: "destructive" });
        return;
      }
    }
    setSuggestions((prev) => prev.filter((s) => s.name !== suggestion.name));
    await reload();
    toast({ title: "Vorschlag übernommen", description: "Bitte Credits pro Einheit prüfen." });
  };

  const applyAdvice = async () => {
    if (!advice || !targetVideo) return;
    const columnFor: Record<string, string> = {
      Bild: "image_model",
      Sprache: "voice_model",
      Video: "video_model",
    };
    const update: Record<string, string> = {};
    advice.empfehlungen.forEach((item) => {
      const column = columnFor[item.rolle];
      if (column && models.some((m) => m.name === item.modell)) update[column] = item.modell;
    });
    if (Object.keys(update).length === 0) {
      toast({ title: "Keine übernehmbaren Modelle", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any)
      .from("whiteboard_videos")
      .update(update)
      .eq("id", targetVideo);
    if (error) {
      toast({ title: "Übernahme fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Modelle übernommen", description: "Das Video nutzt jetzt die Empfehlung." });
    navigate(`/admin/whiteboard-videos/${targetVideo}`);
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">KI-Modelle</CardTitle>
              <CardDescription>
                Alle bei Kie.ai nutzbaren Modelle mit Beschreibung, Stärken und Kosten. Der Berater
                schlägt dir für dein Vorhaben die passenden Modelle vor.
              </CardDescription>
            </CardHeader>
          </Card>

          <KieCreditsCard />

          <Card>
            <CardHeader>
              <CardTitle>Was möchtest du erstellen?</CardTitle>
              <CardDescription>
                Beschreibe dein Vorhaben in eigenen Worten, zum Beispiel: „Ein 60-Sekunden-Erklärvideo
                für Führungskräfte mit ruhiger Stimme, möglichst günstig.“
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Dein Vorhaben…"
              />
              <Button onClick={runAdvice} disabled={advising || !prompt.trim()}>
                {advising ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Modelle vorschlagen
              </Button>

              {advice && (
                <div className="space-y-4 rounded-lg border p-4">
                  <p className="text-sm">{advice.zusammenfassung}</p>
                  <div className="space-y-2">
                    {advice.empfehlungen.map((item) => (
                      <div key={`${item.rolle}-${item.modell}`} className="text-sm">
                        <span className="font-medium">
                          {item.rolle}: {item.modell}
                        </span>
                        {item.credits !== undefined && (
                          <span className="text-muted-foreground">
                            {" "}
                            · ca. {formatCredits(item.credits)} Credits
                          </span>
                        )}
                        <p className="text-muted-foreground">{item.begruendung}</p>
                      </div>
                    ))}
                  </div>
                  {advice.gesamt_credits !== undefined && (
                    <p className="text-sm font-medium">
                      Gesamt geschätzt: {formatCredits(advice.gesamt_credits)} Credits
                    </p>
                  )}
                  {advice.guenstigere_alternative?.modell && (
                    <p className="text-sm text-muted-foreground">
                      Günstigere Alternative: {advice.guenstigere_alternative.modell} –{" "}
                      {advice.guenstigere_alternative.begruendung}
                    </p>
                  )}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-2 min-w-56">
                      <Label>Für dieses Video übernehmen</Label>
                      <Select value={targetVideo} onValueChange={setTargetVideo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Video wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {videos.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={applyAdvice} disabled={!targetVideo}>
                      Übernehmen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Abgleich mit Kie.ai</CardTitle>
                <CardDescription>
                  {syncedAt
                    ? `Letzter Abgleich: ${new Date(syncedAt).toLocaleString("de-CH")}`
                    : "Noch kein Abgleich in dieser Sitzung"}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={runSync} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Mit Kie.ai abgleichen
              </Button>
            </CardHeader>
            {suggestions.length > 0 && (
              <CardContent className="space-y-2">
                {suggestions.map((s) => (
                  <div
                    key={`${s.art}-${s.name}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {s.display_name ?? s.name}{" "}
                        <Badge variant="secondary">
                          {s.art === "neu" ? "neu" : s.art === "entfernt" ? "entfällt" : "geändert"}
                        </Badge>
                      </p>
                      <p className="text-muted-foreground">{s.hinweis ?? s.description_de}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptSuggestion(s)}>
                        Übernehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSuggestions((prev) => prev.filter((x) => x.name !== s.name))}
                      >
                        Verwerfen
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alle Modelle</CardTitle>
              <CardDescription>
                {filtered.length} von {models.length} Modellen · Credits jederzeit anpassbar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  placeholder="Suche nach Name oder Zweck"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Kategorien</SelectItem>
                    {(Object.keys(CATEGORY_LABELS) as KieCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Qualitätsstufen</SelectItem>
                    <SelectItem value="entwurf">Entwurf</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Max. Credits pro Einheit"
                  value={maxCredits}
                  onChange={(e) => setMaxCredits(e.target.value)}
                />
              </div>

              {useCaseList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {useCaseList.map((useCase) => (
                    <Badge
                      key={useCase}
                      variant={search === useCase ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSearch(search === useCase ? "" : useCase)}
                    >
                      {useCase}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((model) => (
                  <div key={model.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{model.display_name ?? model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {model.provider ? `${model.provider} · ` : ""}
                          {model.name}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Badge variant="secondary">{CATEGORY_LABELS[model.category]}</Badge>
                        {model.recommended && <Badge>Empfohlen</Badge>}
                      </div>
                    </div>
                    {model.description_de && <p className="text-sm">{model.description_de}</p>}
                    {model.strengths && (
                      <p className="text-sm text-muted-foreground">{model.strengths}</p>
                    )}
                    {model.use_cases?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {model.use_cases.map((u) => (
                          <Badge key={u} variant="outline">
                            {u}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24"
                        value={model.credits_per_unit}
                        onChange={(e) =>
                          patch(model.id, { credits_per_unit: Number(e.target.value) })
                        }
                      />
                      <span className="text-muted-foreground">{UNIT_LABELS[model.unit]}</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={model.active}
                          onCheckedChange={(checked) => patch(model.id, { active: checked })}
                        />
                        <span className="text-muted-foreground">
                          {model.active ? "aktiv" : "inaktiv"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveModel(model)}
                        disabled={savingId === model.id}
                      >
                        Speichern
                      </Button>
                      {model.docs_url && (
                        <a
                          href={model.docs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">Keine Modelle gefunden.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KieModelCatalog;
