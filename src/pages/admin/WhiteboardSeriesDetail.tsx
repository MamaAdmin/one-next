import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { DashboardHeader, DashboardPage } from "@/components/admin/DashboardPage";
import { SeriesImportDialog } from "@/components/admin/SeriesImportDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  applySeriesSettingsToClips,
  createClipsFromParsed,
  deleteSeries,
  fetchSeries,
  fetchSeriesClips,
  savePositions,
  updateSeries,
  type ParsedClip,
  type WhiteboardVideoSeries,
} from "@/features/whiteboard/series";
import {
  createEmptyScene,
  type WhiteboardScene,
  type WhiteboardVideoProject,
} from "@/features/whiteboard/types";
import { fetchCredits, generateImage, generateScript } from "@/features/whiteboard/api";
import { WHITEBOARD_STYLES, normalizeStyle, styleOption } from "@/features/whiteboard/styles";
import { SCRIPT_TYPES, scriptTypeOption } from "@/features/whiteboard/scriptTypes";
import {
  estimateCost,
  fetchKieModels,
  formatCredits,
  rateFor,
  type KieModel,
} from "@/features/whiteboard/pricing";
import { logJob } from "@/features/whiteboard/usage";

const VOICES = ["Rachel", "Aria", "Bella", "Emma", "Hope", "Liam", "Brian", "Felix"];
const SCENES_PER_CLIP = 5;

const statusLabel: Record<string, string> = {
  draft: "Entwurf",
  generating: "In Arbeit",
  ready: "Fertig",
  error: "Fehler",
};

type BulkKind = "script" | "images";

const WhiteboardSeriesDetail = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const [series, setSeries] = useState<WhiteboardVideoSeries | null>(null);
  const [clips, setClips] = useState<WhiteboardVideoProject[]>([]);
  const [models, setModels] = useState<KieModel[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [bulk, setBulk] = useState<BulkKind | null>(null);
  const [running, setRunning] = useState<BulkKind | null>(null);
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [failures, setFailures] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("whiteboard");
  const [scriptType, setScriptType] = useState("problem_loesung");
  const [voice, setVoice] = useState("Charlotte");
  const [imageModel, setImageModel] = useState("");
  const [voiceModel, setVoiceModel] = useState("");
  const [videoModel, setVideoModel] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const applyToState = (loaded: WhiteboardVideoSeries) => {
    setSeries(loaded);
    setTitle(loaded.title);
    setDescription(loaded.description ?? "");
    setStyle(normalizeStyle(loaded.style));
    setScriptType(loaded.script_type || "problem_loesung");
    setVoice(VOICES.includes(loaded.voice) ? loaded.voice : "Charlotte");
    setImageModel(loaded.image_model);
    setVoiceModel(loaded.voice_model);
    setVideoModel(loaded.video_model);
  };

  const loadClips = useCallback(async () => {
    if (!seriesId) return;
    try {
      setClips(await fetchSeriesClips(seriesId));
    } catch (error) {
      toast({
        title: "Clips konnten nicht geladen werden",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }, [seriesId, toast]);

  useEffect(() => {
    const load = async () => {
      if (!seriesId) return;
      try {
        const loaded = await fetchSeries(seriesId);
        if (!loaded) {
          toast({ title: "Serie nicht gefunden", variant: "destructive" });
          navigate("/admin/whiteboard-videos");
          return;
        }
        applyToState(loaded);
        await loadClips();
      } catch (error) {
        toast({
          title: "Laden fehlgeschlagen",
          description: error instanceof Error ? error.message : "Unbekannter Fehler",
          variant: "destructive",
        });
      }
      try {
        setModels(await fetchKieModels());
      } catch {
        /* Preise optional */
      }
      try {
        setCredits(await fetchCredits());
      } catch {
        setCredits(null);
      }
    };
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, seriesId]);

  const settings = useMemo(
    () => ({
      style,
      script_type: scriptType,
      voice,
      image_model: imageModel,
      voice_model: voiceModel,
      video_model: videoModel,
    }),
    [style, scriptType, voice, imageModel, voiceModel, videoModel],
  );

  const settingsChanged = useMemo(() => {
    if (!series) return false;
    return (
      series.style !== style ||
      series.script_type !== scriptType ||
      series.voice !== voice ||
      series.image_model !== imageModel ||
      series.voice_model !== voiceModel ||
      series.video_model !== videoModel
    );
  }, [series, style, scriptType, voice, imageModel, voiceModel, videoModel]);

  const persistSeries = async (applyToAll: boolean) => {
    if (!seriesId) return;
    try {
      await updateSeries(seriesId, { title, description, ...settings });
      if (applyToAll) {
        await applySeriesSettingsToClips(seriesId, settings);
        await loadClips();
      }
      const updated = await fetchSeries(seriesId);
      if (updated) applyToState(updated);
      toast({
        title: "Serie gespeichert",
        description: applyToAll
          ? "Die Einstellungen gelten jetzt auch für alle bestehenden Clips."
          : "Die Einstellungen gelten für neue Clips.",
      });
    } catch (error) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (settingsChanged && clips.length > 0) {
      setApplyOpen(true);
      return;
    }
    void persistSeries(false);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= clips.length) return;
    const next = [...clips];
    [next[index], next[target]] = [next[target], next[index]];
    setClips(next.map((clip, i) => ({ ...clip, position: i + 1 })));
    await savePositions(next);
  };

  const removeClip = async (id: string) => {
    const { error } = await (supabase as any).from("whiteboard_videos").delete().eq("id", id);
    if (error) {
      toast({ title: "Löschen fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };

  const handleImport = async (parsed: ParsedClip[]) => {
    if (!series) return;
    try {
      await createClipsFromParsed(series, parsed, clips.length + 1);
      await loadClips();
      toast({ title: "Clips angelegt", description: `${parsed.length} Clips hinzugefügt.` });
    } catch (error) {
      toast({
        title: "Import fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  const bulkEstimate = useMemo(() => {
    if (!bulk) return null;
    const relevant =
      bulk === "script" ? clips : clips.filter((clip) => (clip.scenes ?? []).length > 0);
    const total = relevant.reduce((sum, clip) => {
      const scenes = (clip.scenes ?? []) as WhiteboardScene[];
      const estimate = estimateCost({
        models,
        sceneCount: SCENES_PER_CLIP,
        scenes,
        includeScript: bulk === "script",
        includeImages: bulk === "images",
        includeVoices: false,
        imageModel,
        voiceModel,
        videoModel,
      });
      return sum + estimate.total;
    }, 0);
    return { count: relevant.length, total: Math.round(total * 100) / 100 };
  }, [bulk, clips, models, imageModel, voiceModel, videoModel]);

  const affordable =
    credits === null || bulkEstimate === null || bulkEstimate.total <= credits;

  const runBulk = async (kind: BulkKind) => {
    const targets =
      kind === "script" ? clips : clips.filter((clip) => (clip.scenes ?? []).length > 0);
    cancelRef.current = false;
    setRunning(kind);
    setFailures([]);
    setProgress({ index: 0, total: targets.length });
    const failed: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      if (cancelRef.current) break;
      const clip = targets[i];
      setProgress({ index: i + 1, total: targets.length });
      try {
        if (kind === "script") {
          const script = await generateScript(clip.topic, SCENES_PER_CLIP, clip.title, {
            scriptType: scriptTypeOption(scriptType).label,
            scriptHint: scriptTypeOption(scriptType).promptHinweis,
            styleLabel: styleOption(style).label,
          });
          const scenes: WhiteboardScene[] = script.scenes.map((s, index) => ({
            ...createEmptyScene(index),
            heading: s.heading,
            narration: s.narration,
            bullets: s.bullets ?? [],
            imagePrompt: s.imagePrompt ?? "",
            durationInSeconds: s.durationInSeconds || 8,
          }));
          const { error } = await (supabase as any)
            .from("whiteboard_videos")
            .update({ scenes })
            .eq("id", clip.id);
          if (error) throw new Error(error.message);
        } else {
          const scenes = [...((clip.scenes ?? []) as WhiteboardScene[])];
          const perImage = rateFor(models, imageModel);
          for (let s = 0; s < scenes.length; s++) {
            if (cancelRef.current) break;
            const prompt = scenes[s].imagePrompt || scenes[s].heading;
            if (!prompt) continue;
            const result = await generateImage(prompt, style, imageModel);
            scenes[s] = { ...scenes[s], imageUrl: result.url };
            await logJob({
              usageId: null,
              videoId: clip.id,
              kind: "image",
              model: imageModel,
              units: 1,
              estimatedCredits: perImage,
              status: "done",
              taskId: result.taskId ?? null,
            });
          }
          const { error } = await (supabase as any)
            .from("whiteboard_videos")
            .update({ scenes })
            .eq("id", clip.id);
          if (error) throw new Error(error.message);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        failed.push(`${clip.title}: ${message}`);
      }
    }

    setRunning(null);
    setFailures(failed);
    await loadClips();
    try {
      setCredits(await fetchCredits());
    } catch {
      /* Guthaben optional */
    }
    toast({
      title: cancelRef.current ? "Abgebrochen" : "Fertig",
      description: `${targets.length - failed.length} von ${targets.length} Clips verarbeitet.`,
      variant: failed.length === targets.length && targets.length > 0 ? "destructive" : undefined,
    });
  };

  if (loading || !isAdmin || !series) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Lernvideos", href: "/admin/whiteboard-videos" },
          { label: series.title || "Serie", active: true },
        ]}
      />
      <DashboardPage contentClassName="max-w-5xl">
        <DashboardHeader
          title={series.title || "Serie"}
          description="Gemeinsame Einstellungen für alle Clips dieser Serie."
          action={
            <>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Clips aus Skript importieren
              </Button>
              <Button onClick={handleSave}>Speichern</Button>
            </>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Gemeinsame Einstellungen</CardTitle>
            <CardDescription>
              Gelten für neue Clips. Auf Wunsch auch für alle bestehenden Clips der Serie.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Stimme</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VOICES.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Stil</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WHITEBOARD_STYLES.filter((option) => option.generierbar).map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skriptart</Label>
              <Select value={scriptType} onValueChange={setScriptType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCRIPT_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bildmodell</Label>
              <Input value={imageModel} onChange={(event) => setImageModel(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sprachmodell</Label>
              <Input value={voiceModel} onChange={(event) => setVoiceModel(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Videomodell</Label>
              <Input value={videoModel} onChange={(event) => setVideoModel(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Clips ({clips.length})</CardTitle>
              <CardDescription>
                Guthaben: {formatCredits(credits)} Credits
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={running !== null || clips.length === 0}
                onClick={() => setBulk("script")}
              >
                <FileText className="mr-2 h-4 w-4" /> Alle Skripte erzeugen
              </Button>
              <Button
                variant="outline"
                disabled={running !== null || clips.length === 0}
                onClick={() => setBulk("images")}
              >
                <ImagePlus className="mr-2 h-4 w-4" /> Alle Zeichnungen erzeugen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {running && (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Clip {progress.index} von {progress.total}
                </span>
                <Button variant="outline" size="sm" onClick={() => { cancelRef.current = true; }}>
                  Abbrechen
                </Button>
              </div>
            )}

            {failures.length > 0 && (
              <div className="rounded-md border border-destructive/40 p-3 text-sm">
                <p className="mb-1 font-medium">Fehlgeschlagene Clips</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {failures.map((entry, index) => <li key={index}>{entry}</li>)}
                </ul>
              </div>
            )}

            {clips.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Noch keine Clips. Importiere sie aus deinem Skript.
              </p>
            ) : (
              clips.map((clip, index) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-3 overflow-hidden rounded-md border p-3"
                >
                  <span className="w-8 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/whiteboard-videos/${clip.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {clip.title}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      {(clip.scenes ?? []).length} Abschnitte
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {statusLabel[clip.status] ?? clip.status}
                  </Badge>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === clips.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeClip(clip.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
            <p className="text-sm text-muted-foreground">
              Serie löschen. Die Clips bleiben als Einzelvideos erhalten.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                if (!seriesId) return;
                await deleteSeries(seriesId);
                navigate("/admin/whiteboard-videos");
              }}
            >
              Serie löschen
            </Button>
          </CardContent>
        </Card>
      </DashboardPage>
      <Footer />

      <SeriesImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />

      <AlertDialog open={applyOpen} onOpenChange={setApplyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Einstellungen übernehmen</AlertDialogTitle>
            <AlertDialogDescription>
              Sollen die geänderten Einstellungen nur für neue Clips gelten oder auch auf alle
              {` ${clips.length} `}bestehenden Clips dieser Serie angewendet werden?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <Button variant="outline" onClick={() => { setApplyOpen(false); void persistSeries(false); }}>
              Nur neue Clips
            </Button>
            <AlertDialogAction onClick={() => void persistSeries(true)}>
              Auf alle Clips anwenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulk !== null} onOpenChange={(open) => !open && setBulk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulk === "script" ? "Alle Skripte erzeugen" : "Alle Zeichnungen erzeugen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkEstimate?.count ?? 0} Clips · geschätzte Kosten{" "}
              {formatCredits(bulkEstimate?.total ?? 0)} Credits · verfügbar {formatCredits(credits)}{" "}
              Credits.
              {!affordable && bulkEstimate && credits !== null && (
                <> Es fehlen {formatCredits(Math.round((bulkEstimate.total - credits) * 100) / 100)} Credits.</>
              )}
              {bulk === "images" && " Clips ohne Skript werden übersprungen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              disabled={!affordable || (bulkEstimate?.count ?? 0) === 0}
              onClick={() => {
                const kind = bulk;
                setBulk(null);
                if (kind) void runBulk(kind);
              }}
            >
              Starten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhiteboardSeriesDetail;
