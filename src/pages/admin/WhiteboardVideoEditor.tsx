import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Player } from "@remotion/player";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Image as ImageIcon,
  Loader2,
  Mic,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { WhiteboardVideo } from "@/features/whiteboard/WhiteboardVideo";
import {
  FPS,
  createEmptyScene,
  totalDurationInFrames,
  type WhiteboardScene,
  type WhiteboardVideoProject,
} from "@/features/whiteboard/types";
import {
  checkVideo,
  estimateDuration,
  fetchCredits,
  generateImage,
  generateScript,
  generateVoice,
  startVideo,
} from "@/features/whiteboard/api";
import { WHITEBOARD_STYLES } from "@/features/whiteboard/styles";
import {
  CATEGORY_LABELS,
  IMAGE_MODEL as DEFAULT_IMAGE_MODEL,
  SCRIPT_MODEL,
  UNIT_LABELS,
  VIDEO_MODEL as DEFAULT_VIDEO_MODEL,
  VOICE_MODEL as DEFAULT_VOICE_MODEL,
  estimateCost,
  fetchKieModels,
  formatCredits,
  rateFor,
  type CostEstimate,
  type KieModel,
} from "@/features/whiteboard/pricing";
import { finishUsage, logJob, startUsage } from "@/features/whiteboard/usage";

const VOICES = ["Charlotte", "Rachel", "Aria", "Sarah", "George", "Liam", "Matilda"];
const VEO_SECONDS = 8;

const WhiteboardVideoEditor = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const [project, setProject] = useState<WhiteboardVideoProject | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [voice, setVoice] = useState("Charlotte");
  const [style, setStyle] = useState("strichzeichnung");
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [voiceModel, setVoiceModel] = useState(DEFAULT_VOICE_MODEL);
  const [videoModel, setVideoModel] = useState(DEFAULT_VIDEO_MODEL);
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState<WhiteboardScene[]>([]);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [kieVideoUrl, setKieVideoUrl] = useState<string | null>(null);
  const [models, setModels] = useState<KieModel[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<number | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const refreshCredits = useCallback(async (): Promise<number | null> => {
    try {
      const value = await fetchCredits();
      setCredits(value);
      setCreditsError(null);
      return value;
    } catch (error) {
      setCreditsError(error instanceof Error ? error.message : "Kontostand nicht abrufbar");
      return null;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!videoId) return;
      const { data, error } = await (supabase as any)
        .from("whiteboard_videos")
        .select("*")
        .eq("id", videoId)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Video nicht gefunden", variant: "destructive" });
        navigate("/admin/whiteboard-videos");
        return;
      }
      const loaded = data as WhiteboardVideoProject;
      setProject(loaded);
      setTitle(loaded.title);
      setTopic(loaded.topic);
      setVoice(VOICES.includes(loaded.voice) ? loaded.voice : "Charlotte");
      setStyle(loaded.style || "strichzeichnung");
      setImageModel(loaded.image_model || DEFAULT_IMAGE_MODEL);
      setVoiceModel(loaded.voice_model || DEFAULT_VOICE_MODEL);
      setVideoModel(loaded.video_model || DEFAULT_VIDEO_MODEL);
      setScenes(Array.isArray(loaded.scenes) ? loaded.scenes : []);
      setKieVideoUrl(loaded.video_url);
      setBriefingOpen(!(Array.isArray(loaded.scenes) && loaded.scenes.length > 0));

      try {
        setModels(await fetchKieModels());
      } catch {
        /* Preise optional */
      }
      void refreshCredits();
    };
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, videoId]);

  useEffect(() => () => {
    if (pollRef.current) window.clearInterval(pollRef.current);
  }, []);

  const save = useCallback(
    async (patch: Partial<WhiteboardVideoProject> = {}) => {
      if (!videoId) return;
      setSaving(true);
      const { error } = await (supabase as any)
        .from("whiteboard_videos")
        .update({ title, topic, voice, style, scenes, image_model: imageModel, voice_model: voiceModel, video_model: videoModel, ...patch })
        .eq("id", videoId);
      setSaving(false);
      if (error) {
        toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
      }
    },
    [videoId, title, topic, voice, style, scenes, imageModel, voiceModel, videoModel, toast],
  );

  const updateScene = (id: string, patch: Partial<WhiteboardScene>) =>
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const fullEstimate = useMemo<CostEstimate>(
    () =>
      estimateCost({
        models,
        sceneCount,
        scenes,
        includeScript: scenes.length === 0,
        includeImages: true,
        includeVoices: true,
        imageModel,
        voiceModel,
        videoModel,
      }),
    [models, sceneCount, scenes, imageModel, voiceModel, videoModel],
  );

  const ensureBudget = useCallback(
    async (estimate: CostEstimate): Promise<number | null> => {
      const before = await refreshCredits();
      if (before === null) {
        toast({
          title: "Kontostand nicht abrufbar",
          description: "Die Generierung wird ohne Guthabenprüfung gestartet.",
        });
        return null;
      }
      if (estimate.unknownModels.length > 0) {
        toast({
          title: "Preis unbekannt",
          description: `Für ${estimate.unknownModels.join(", ")} ist kein Creditpreis hinterlegt. Die Schätzung kann zu niedrig sein.`,
          variant: "destructive",
        });
      }
      if (estimate.total > 0 && before < estimate.total) {
        throw new Error(
          `Zu wenig Guthaben: benötigt ca. ${formatCredits(estimate.total)}, verfügbar ${formatCredits(before)} Credits.`,
        );
      }
      return before;
    },
    [refreshCredits, toast],
  );

  const runScript = async () => {
    if (!videoId) return;
    const estimate = estimateCost({
      models,
      sceneCount,
      scenes: [],
      includeScript: true,
      includeImages: false,
      includeVoices: false,
    });
    setWorking("script");
    let usageId: string | null = null;
    let before: number | null = null;
    try {
      before = await ensureBudget(estimate);
      usageId = await startUsage({
        videoId,
        creditsBefore: before,
        estimate,
        sections: sceneCount,
        images: 0,
        audioCharacters: 0,
        videoSeconds: 0,
        models: { script: SCRIPT_MODEL },
      });
      const script = await generateScript(topic, sceneCount, title);
      const next: WhiteboardScene[] = script.scenes.map((s, i) => ({
        ...createEmptyScene(i),
        heading: s.heading,
        narration: s.narration,
        bullets: s.bullets ?? [],
        imagePrompt: s.imagePrompt ?? "",
        durationInSeconds: s.durationInSeconds || 8,
      }));
      setScenes(next);
      setBriefingOpen(false);
      if (script.title && (!title || title === "Neues Whiteboard-Video")) setTitle(script.title);
      await save({ scenes: next, title: script.title || title });
      await logJob({
        usageId,
        videoId,
        kind: "script",
        model: SCRIPT_MODEL,
        units: 1,
        estimatedCredits: estimate.total,
        status: "done",
      });
      const after = await refreshCredits();
      await finishUsage({
        usageId,
        creditsAfter: after,
        actualCredits: estimate.total,
        status: "done",
      });
      setLastUsed(estimate.total);
      toast({ title: "Skript erstellt", description: `${next.length} Abschnitte` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      await logJob({
        usageId,
        videoId,
        kind: "script",
        model: SCRIPT_MODEL,
        units: 1,
        estimatedCredits: 0,
        status: "failed",
        errorMessage: message,
      });
      await finishUsage({
        usageId,
        creditsAfter: null,
        actualCredits: 0,
        status: "failed",
        errorMessage: message,
      });
      toast({ title: "Skript fehlgeschlagen", description: message, variant: "destructive" });
    } finally {
      setWorking(null);
    }
  };

  const runImages = async () => {
    if (!videoId) return;
    const estimate = estimateCost({
      models,
      sceneCount,
      scenes,
      includeScript: false,
      includeImages: true,
      includeVoices: false,
      imageModel,
    });
    setWorking("images");
    let usageId: string | null = null;
    const perImage = rateFor(models, imageModel);
    let actual = 0;
    try {
      const before = await ensureBudget(estimate);
      usageId = await startUsage({
        videoId,
        creditsBefore: before,
        estimate,
        sections: scenes.length,
        images: scenes.length,
        audioCharacters: 0,
        videoSeconds: 0,
        models: { image: imageModel },
      });
    } catch (error) {
      setWorking(null);
      toast({
        title: "Generierung nicht gestartet",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }

    const next = [...scenes];
    let created = 0;
    let failed = 0;
    for (let i = 0; i < next.length; i++) {
      const scene = next[i];
      const prompt = scene.imagePrompt || scene.heading;
      if (!prompt) continue;
      try {
        const result = await generateImage(prompt, style, imageModel);
        next[i] = { ...scene, imageUrl: result.url };
        created += 1;
        actual += perImage;
        setScenes([...next]);
        await logJob({
          usageId,
          videoId,
          kind: "image",
          model: imageModel,
          units: 1,
          estimatedCredits: perImage,
          status: "done",
          taskId: result.taskId ?? null,
        });
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        await logJob({
          usageId,
          videoId,
          kind: "image",
          model: imageModel,
          units: 1,
          estimatedCredits: 0,
          status: "failed",
          errorMessage: message,
        });
        toast({ title: `Zeichnung ${i + 1} fehlgeschlagen`, description: message, variant: "destructive" });
      }
    }
    setScenes(next);
    await save({ scenes: next });
    const after = await refreshCredits();
    await finishUsage({
      usageId,
      creditsAfter: after,
      actualCredits: actual,
      status: failed === 0 ? "done" : created > 0 ? "partial" : "failed",
      errorMessage: failed ? `${failed} Zeichnungen fehlgeschlagen` : null,
    });
    setLastUsed(actual);
    setWorking(null);
    toast({
      title: created ? "Zeichnungen erstellt" : "Keine Zeichnung erstellt",
      description: `${created} erzeugt${failed ? `, ${failed} fehlgeschlagen` : ""} · ${formatCredits(actual)} Credits`,
      variant: created ? undefined : "destructive",
    });
  };

  const runVoices = async () => {
    if (!videoId) return;
    const estimate = estimateCost({
      models,
      sceneCount,
      scenes,
      includeScript: false,
      includeImages: false,
      includeVoices: true,
      voiceModel,
    });
    const rate = rateFor(models, voiceModel);
    setWorking("voices");
    let usageId: string | null = null;
    let actual = 0;
    try {
      const before = await ensureBudget(estimate);
      usageId = await startUsage({
        videoId,
        creditsBefore: before,
        estimate,
        sections: scenes.length,
        images: 0,
        audioCharacters: scenes.reduce((sum, s) => sum + s.narration.length, 0),
        videoSeconds: 0,
        models: { voice: voiceModel },
      });
    } catch (error) {
      setWorking(null);
      toast({
        title: "Generierung nicht gestartet",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }

    const next = [...scenes];
    let failed = 0;
    for (let i = 0; i < next.length; i++) {
      const scene = next[i];
      if (!scene.narration.trim()) continue;
      try {
        const result = await generateVoice(scene.narration, voice, voiceModel);
        next[i] = {
          ...scene,
          audioUrl: result.url,
          durationInSeconds: estimateDuration(scene),
        };
        const cost = Math.round((scene.narration.length / 1000) * rate * 100) / 100;
        actual += cost;
        setScenes([...next]);
        await logJob({
          usageId,
          videoId,
          kind: "voice",
          model: voiceModel,
          units: Math.round((scene.narration.length / 1000) * 100) / 100,
          estimatedCredits: cost,
          status: "done",
          taskId: result.taskId ?? null,
        });
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Unbekannter Fehler";
        await logJob({
          usageId,
          videoId,
          kind: "voice",
          model: voiceModel,
          units: 0,
          estimatedCredits: 0,
          status: "failed",
          errorMessage: message,
        });
        toast({ title: `Vertonung ${i + 1} fehlgeschlagen`, description: message, variant: "destructive" });
      }
    }
    setScenes(next);
    await save({ scenes: next });
    const after = await refreshCredits();
    await finishUsage({
      usageId,
      creditsAfter: after,
      actualCredits: actual,
      status: failed === 0 ? "done" : "partial",
      errorMessage: failed ? `${failed} Vertonungen fehlgeschlagen` : null,
    });
    setLastUsed(actual);
    setWorking(null);
    if (!failed) {
      toast({
        title: "Sprecherstimme erstellt",
        description: `${formatCredits(actual)} Credits verbraucht`,
      });
    }
  };

  const runKieVideo = async () => {
    if (!videoId) return;
    const estimate = estimateCost({
      models,
      sceneCount,
      scenes,
      includeScript: false,
      includeImages: false,
      includeVoices: false,
      videoSeconds: VEO_SECONDS,
      videoModel,
    });
    setWorking("kie-video");
    let usageId: string | null = null;
    try {
      const before = await ensureBudget(estimate);
      usageId = await startUsage({
        videoId,
        creditsBefore: before,
        estimate,
        sections: scenes.length,
        images: 0,
        audioCharacters: 0,
        videoSeconds: VEO_SECONDS,
        models: { video: videoModel },
      });
      const taskId = await startVideo(topic || title, videoModel);
      toast({ title: "Videoclip wird erzeugt", description: "Das dauert einige Minuten." });
      pollRef.current = window.setInterval(async () => {
        try {
          const result = await checkVideo(taskId);
          if (result.status === "done" && result.url) {
            if (pollRef.current) window.clearInterval(pollRef.current);
            setKieVideoUrl(result.url);
            setWorking(null);
            await save({ video_url: result.url, status: "ready" });
            await logJob({
              usageId,
              videoId,
              kind: "video",
              model: videoModel,
              units: VEO_SECONDS,
              estimatedCredits: estimate.total,
              status: "done",
              taskId,
            });
            const after = await refreshCredits();
            await finishUsage({
              usageId,
              creditsAfter: after,
              actualCredits: estimate.total,
              status: "done",
            });
            setLastUsed(estimate.total);
            toast({ title: "Videoclip fertig" });
          } else if (result.status === "failed") {
            if (pollRef.current) window.clearInterval(pollRef.current);
            setWorking(null);
            await logJob({
              usageId,
              videoId,
              kind: "video",
              model: videoModel,
              units: 0,
              estimatedCredits: 0,
              status: "failed",
              taskId,
              errorMessage: result.error ?? null,
            });
            await finishUsage({
              usageId,
              creditsAfter: null,
              actualCredits: 0,
              status: "failed",
              errorMessage: result.error ?? null,
            });
            toast({ title: "Videoclip fehlgeschlagen", description: result.error, variant: "destructive" });
          }
        } catch {
          /* weiter versuchen */
        }
      }, 10000);
    } catch (error) {
      setWorking(null);
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      await finishUsage({
        usageId,
        creditsAfter: null,
        actualCredits: 0,
        status: "failed",
        errorMessage: message,
      });
      toast({ title: "Videoclip fehlgeschlagen", description: message, variant: "destructive" });
    }
  };

  const durationInFrames = useMemo(
    () => totalDurationInFrames(scenes) + (title ? Math.round(1.8 * FPS) : 0),
    [scenes, title],
  );

  const inputProps = useMemo(() => ({ title, scenes }), [title, scenes]);

  const renderMp4 = async () => {
    if (scenes.length === 0) {
      toast({ title: "Bitte zuerst ein Skript erstellen", variant: "destructive" });
      return;
    }
    setRenderProgress(0);
    try {
      const { renderMediaOnWeb } = await import("@remotion/web-renderer");
      const result = await renderMediaOnWeb({
        composition: {
          id: "whiteboard",
          component: WhiteboardVideo as never,
          width: 1920,
          height: 1080,
          fps: FPS,
          durationInFrames,
          defaultProps: inputProps as never,
        },
        inputProps: inputProps as never,
        container: "mp4",
        onProgress: (p) => setRenderProgress(Math.round(p.progress * 100)),
      });
      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(title || "whiteboard-video").replace(/[^\w-]+/g, "-").toLowerCase()}.mp4`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "MP4 erstellt", description: "Der Download wurde gestartet." });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setRenderProgress(null);
    }
  };

  if (loading || !isAdmin || !project) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/whiteboard-videos")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </Button>
            <div className="flex items-center gap-3">
              {saving && <span className="text-sm text-muted-foreground">Speichert…</span>}
              <Button variant="outline" onClick={() => save()}>
                Speichern
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Briefing</CardTitle>
                <CardDescription>
                  Thema, Stimme und Zeichenstil. Daraus entstehen Skript, Zeichnungen und Ton.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setBriefingOpen((o) => !o)}>
                {briefingOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" /> Einklappen
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" /> Ausklappen
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {briefingOpen && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titel</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Stimme</Label>
                      <Select value={voice} onValueChange={setVoice}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VOICES.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Zeichenstil</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WHITEBOARD_STYLES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bild-Modell</Label>
                      <Select value={imageModel} onValueChange={setImageModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models
                            .filter((m) => m.category === "image" && m.active)
                            .map((m) => (
                              <SelectItem key={m.id} value={m.name}>
                                {m.display_name ?? m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sprach-Modell</Label>
                      <Select value={voiceModel} onValueChange={setVoiceModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models
                            .filter((m) => m.category === "voice" && m.active)
                            .map((m) => (
                              <SelectItem key={m.id} value={m.name}>
                                {m.display_name ?? m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Video-Modell</Label>
                      <Select value={videoModel} onValueChange={setVideoModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models
                            .filter((m) => m.category === "video" && m.active)
                            .map((m) => (
                              <SelectItem key={m.id} value={m.name}>
                                {m.display_name ?? m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Thema / Briefing</Label>
                    <Textarea
                      id="topic"
                      rows={4}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Worum geht es? Zielgruppe, Kernaussagen, gewünschter Ton."
                    />
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 w-32">
                  <Label htmlFor="count">Abschnitte</Label>
                  <Input
                    id="count"
                    type="number"
                    min={2}
                    max={10}
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                  />
                </div>
                <Button onClick={runScript} disabled={working !== null}>
                  {working === "script" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Skript erzeugen
                </Button>
                <Button variant="outline" onClick={runImages} disabled={working !== null || !scenes.length}>
                  {working === "images" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  Zeichnungen erzeugen
                </Button>
                <Button variant="outline" onClick={runVoices} disabled={working !== null || !scenes.length}>
                  {working === "voices" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" />
                  )}
                  Sprecherstimme erzeugen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Kosten</CardTitle>
                <CardDescription>
                  Geschätzter Verbrauch: ca. {formatCredits(fullEstimate.total)} Credits ·{" "}
                  {creditsError ? creditsError : `Verfügbar: ${formatCredits(credits)} Credits`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => void refreshCredits()}>
                Credits aktualisieren
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {fullEstimate.lines.map((line) => (
                <div key={line.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {line.label} · {line.model} ({CATEGORY_LABELS[
                      line.unit === "image" ? "image" : line.unit === "1k_chars" ? "voice" : line.unit === "second" ? "video" : "text"
                    ]}) · {formatCredits(line.units)} × {formatCredits(line.rate)} {UNIT_LABELS[line.unit]}
                  </span>
                  <span>{line.priceKnown ? `${formatCredits(line.credits)} Credits` : "Preis unbekannt"}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Gesamt geschätzt</span>
                <span>{formatCredits(fullEstimate.total)} Credits</span>
              </div>
              {fullEstimate.unknownModels.length > 0 && (
                <p className="text-sm text-destructive">
                  Für {fullEstimate.unknownModels.join(", ")} ist kein Creditpreis hinterlegt – die Schätzung ist unvollständig.
                </p>
              )}

              {lastUsed !== null && (
                <p className="text-sm text-muted-foreground">
                  Dieses Lernvideo hat zuletzt {formatCredits(lastUsed)} Credits verbraucht.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vorschau</CardTitle>
              <CardDescription>
                {(durationInFrames / FPS).toFixed(1)} Sekunden · {scenes.length} Abschnitte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden border">
                <Player
                  component={WhiteboardVideo as never}
                  inputProps={inputProps as never}
                  durationInFrames={durationInFrames}
                  fps={FPS}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{ width: "100%" }}
                  controls
                  acknowledgeRemotionLicense
                />
              </div>
              {renderProgress !== null && (
                <div className="space-y-2">
                  <Progress value={renderProgress} />
                  <p className="text-sm text-muted-foreground">MP4 wird erstellt… {renderProgress}%</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={renderMp4} disabled={renderProgress !== null}>
                  <Download className="w-4 h-4 mr-2" /> Als MP4 herunterladen
                </Button>
                <Button variant="outline" onClick={runKieVideo} disabled={working !== null}>
                  {working === "kie-video" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Zusätzlichen KI-Videoclip erzeugen
                </Button>
              </div>
              {kieVideoUrl && (
                <video src={kieVideoUrl} controls className="w-full rounded-lg border" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Abschnitte</CardTitle>
                <CardDescription>Texte, Stichpunkte und Bilder frei bearbeiten.</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setScenes((prev) => [...prev, createEmptyScene(prev.length)])}
              >
                <Plus className="w-4 h-4 mr-2" /> Abschnitt
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {scenes.map((scene, index) => (
                <div key={scene.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">Abschnitt {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScenes((prev) => prev.filter((s) => s.id !== scene.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Überschrift</Label>
                      <Input
                        value={scene.heading}
                        onChange={(e) => updateScene(scene.id, { heading: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dauer (Sekunden)</Label>
                      <Input
                        type="number"
                        min={2}
                        max={30}
                        step={0.5}
                        value={scene.durationInSeconds}
                        onChange={(e) =>
                          updateScene(scene.id, { durationInSeconds: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sprechtext</Label>
                    <Textarea
                      rows={3}
                      value={scene.narration}
                      onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stichpunkte (eine Zeile pro Punkt)</Label>
                    <Textarea
                      rows={3}
                      value={scene.bullets.join("\n")}
                      onChange={(e) =>
                        updateScene(scene.id, {
                          bullets: e.target.value.split("\n").filter((b) => b.trim().length > 0),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bildbeschreibung</Label>
                    <Input
                      value={scene.imagePrompt}
                      onChange={(e) => updateScene(scene.id, { imagePrompt: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    {scene.imageUrl && (
                      <img
                        src={scene.imageUrl}
                        alt={`Zeichnung für ${scene.heading}`}
                        className="h-24 w-24 object-contain border rounded"
                      />
                    )}
                    {scene.audioUrl && <audio src={scene.audioUrl} controls className="h-10" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhiteboardVideoEditor;
