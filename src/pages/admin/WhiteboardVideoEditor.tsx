import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Player } from "@remotion/player";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { SceneMediaEditor } from "@/components/admin/SceneMediaEditor";
import { MusicPicker } from "@/components/admin/MusicPicker";
import { withFreshClipUrls } from "@/features/whiteboard/clips";
import { signedMusicUrl } from "@/features/whiteboard/music";

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
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Image as ImageIcon,
  Loader2,
  Mic,
  Play,
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
  previewVoice,
  startVideo,
} from "@/features/whiteboard/api";
import { WHITEBOARD_STYLES, normalizeStyle, styleOption } from "@/features/whiteboard/styles";
import { SCRIPT_TYPES, scriptTypeOption } from "@/features/whiteboard/scriptTypes";
import { TITLE_FRAMES, compositionFrames } from "@/features/whiteboard/WhiteboardVideo";
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
import {
  fetchSeries,
  fetchSeriesClips,
  type WhiteboardVideoSeries,
} from "@/features/whiteboard/series";

const VOICES = ["Rachel", "Aria", "Bella", "Emma", "Hope", "Liam", "Brian", "Felix"];
const DEFAULT_CLIP_SECONDS = 4;
const MIN_CLIP_SECONDS = 2;
const MAX_CLIP_SECONDS = 10;

const WhiteboardVideoEditor = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const [project, setProject] = useState<WhiteboardVideoProject | null>(null);
  const [series, setSeries] = useState<WhiteboardVideoSeries | null>(null);
  const [siblings, setSiblings] = useState<WhiteboardVideoProject[]>([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("de");
  const [voice, setVoice] = useState("Rachel");
  const [style, setStyle] = useState("whiteboard");
  const [scriptType, setScriptType] = useState("problem_loesung");
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
  const [clipSeconds, setClipSeconds] = useState(DEFAULT_CLIP_SECONDS);
  const [clipDialogOpen, setClipDialogOpen] = useState(false);
  const [aiClipBusy, setAiClipBusy] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
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
      setLanguage(loaded.language || "de");
      setVoice(VOICES.includes(loaded.voice) ? loaded.voice : "Rachel");
      setStyle(normalizeStyle(loaded.style));
      setScriptType(loaded.script_type || "problem_loesung");
      setImageModel(loaded.image_model || DEFAULT_IMAGE_MODEL);
      setVoiceModel(loaded.voice_model || DEFAULT_VOICE_MODEL);
      setVideoModel(loaded.video_model || DEFAULT_VIDEO_MODEL);
      const loadedScenes = Array.isArray(loaded.scenes) ? loaded.scenes : [];
      setScenes(loadedScenes);
      // Signierte Adressen laufen ab, darum je Aufnahme eine frische holen.
      if (loadedScenes.some((s) => s.mediaType === "clip" && s.clipPath)) {
        void withFreshClipUrls(loadedScenes).then(setScenes);
      }
      // Auch die hochgeladene Musik braucht eine frische Adresse.
      if (loaded.music_path) {
        void signedMusicUrl(loaded.music_path).then((url) => {
          if (url) setProject((prev) => (prev ? { ...prev, music_url: url } : prev));
        });
      }
      setKieVideoUrl(loaded.video_url);

      setBriefingOpen(!(Array.isArray(loaded.scenes) && loaded.scenes.length > 0));

      if (loaded.series_id) {
        try {
          const [loadedSeries, clips] = await Promise.all([
            fetchSeries(loaded.series_id),
            fetchSeriesClips(loaded.series_id),
          ]);
          setSeries(loadedSeries);
          setSiblings(clips);
        } catch {
          /* Serie optional */
        }
      } else {
        setSeries(null);
        setSiblings([]);
      }

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
        .update({
          title,
          topic,
          language,
          voice,
          style,
          script_type: scriptType,
          scenes,
          image_model: imageModel,
          voice_model: voiceModel,
          video_model: videoModel,
          ...patch,
        })
        .eq("id", videoId);
      setSaving(false);
      if (error) {
        toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
      }
    },
    [videoId, title, topic, language, voice, style, scriptType, scenes, imageModel, voiceModel, videoModel, toast],
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
        videoSeconds: clipSeconds,
      }),
    [models, sceneCount, scenes, imageModel, voiceModel, videoModel, clipSeconds],
  );

  const clipRate = useMemo(() => rateFor(models, videoModel), [models, videoModel]);
  const clipCost = useMemo(
    () => Math.round(clipRate * clipSeconds * 100) / 100,
    [clipRate, clipSeconds],
  );
  const clipAffordable = credits === null || clipCost <= credits;
  const clipMissing = credits === null ? 0 : Math.round((clipCost - credits) * 100) / 100;

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

  const playVoicePreview = async () => {
    setPreviewLoading(true);
    try {
      const url = await previewVoice(voice, voiceModel);
      previewAudioRef.current?.pause();
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      toast({ title: "Hörprobe fehlgeschlagen", description: message, variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const runScript = async () => {
    if (!videoId) return;
    setWorking("script");
    const usageId: string | null = null;

    try {
      const script = await generateScript(topic, sceneCount, title, {
        scriptType: scriptTypeOption(scriptType).label,
        scriptHint: scriptTypeOption(scriptType).promptHinweis,
        styleLabel: styleOption(style).label,
        language,
      });
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
        estimatedCredits: 0,
        status: "done",
      });
      toast({
        title: "Skript erstellt",
        description: `${next.length} Abschnitte · über Lovable KI, keine Kie.ai-Credits`,
      });
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
      // Abschnitte mit eigener Aufnahme brauchen keine Zeichnung.
      if (scene.mediaType === "clip") continue;
      const prompt = scene.imagePrompt || scene.heading;
      if (!prompt) continue;
      try {
        // Startwert und das erste Bild als Referenz halten den Look zusammen.
        const styleRefUrl = next.find((s) => s.imageUrl)?.imageUrl ?? null;
        const result = await generateImage(prompt, style, {
          model: imageModel,
          seed: project?.seed ?? null,
          styleRefUrl,
        });
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
      videoSeconds: clipSeconds,
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
        videoSeconds: clipSeconds,
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
              units: clipSeconds,
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

  // Übergänge überlappen, deshalb ist das Video kürzer als die Summe der Abschnitte.
  const durationInFrames = useMemo(() => compositionFrames(title, scenes), [scenes, title]);

  const inputProps = useMemo(
    () => ({
      title,
      scenes,
      style,
      musicUrl: project?.music_url ?? null,
      musicVolume: project?.music_volume ?? 0.18,
      subtitles,
    }),
    [title, scenes, style, project?.music_url, project?.music_volume, subtitles],
  );

  /** Aus der fertigen Zeichnung einen bewegten Clip machen (Bild zu Video). */
  const runAiClip = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene?.imageUrl) {
      toast({ title: "Zuerst die Zeichnung erzeugen", variant: "destructive" });
      return;
    }
    const seconds = Math.min(10, Math.max(2, scene.aiClipSeconds ?? 5));
    const rate = rateFor(models, videoModel);
    const cost = seconds * rate;
    if (credits !== null && cost > credits) {
      toast({
        title: "Guthaben reicht nicht",
        description: `Der Clip kostet ${formatCredits(cost)} Credits, verfügbar sind ${formatCredits(credits)}.`,
        variant: "destructive",
      });
      return;
    }
    setAiClipBusy(sceneId);
    try {
      const taskId = await startVideo(scene.motionPrompt || scene.imagePrompt || scene.heading, {
        model: videoModel,
        imageUrl: scene.imageUrl,
        seconds,
        seed: project?.seed ?? null,
      });
      let url: string | null = null;
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const result = await checkVideo(taskId);
        if (result.status === "done" && result.url) {
          url = result.url;
          break;
        }
        if (result.status === "failed") throw new Error(result.error ?? "Clip fehlgeschlagen");
      }
      if (!url) throw new Error("Zeitüberschreitung bei der Clip-Erzeugung");
      const next = scenes.map((s) =>
        s.id === sceneId ? { ...s, mediaType: "ai_clip" as const, aiClipUrl: url, aiClipTaskId: taskId } : s,
      );
      setScenes(next);
      await save({ scenes: next });
      toast({ title: "Bewegter Clip erstellt" });
      void refreshCredits();
    } catch (error) {
      toast({
        title: "Clip fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setAiClipBusy(null);
    }
  };

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

  const clipIndex = siblings.findIndex((clip) => clip.id === videoId);
  const previousClip = clipIndex > 0 ? siblings[clipIndex - 1] : null;
  const nextClip =
    clipIndex >= 0 && clipIndex < siblings.length - 1 ? siblings[clipIndex + 1] : null;

  if (loading || !isAdmin || !project) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Lernvideos", href: "/admin/whiteboard-videos" },
          ...(series
            ? [{ label: series.title, href: `/admin/whiteboard-videos/serie/${series.id}` }]
            : []),
          { label: title || project.title || "Video", active: true },
        ]}
      />
      <main className="container mx-auto px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/whiteboard-videos")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              {series && clipIndex >= 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    Clip {clipIndex + 1} von {siblings.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!previousClip}
                    onClick={() => previousClip && navigate(`/admin/whiteboard-videos/${previousClip.id}`)}
                  >
                    Vorheriger Clip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextClip}
                    onClick={() => nextClip && navigate(`/admin/whiteboard-videos/${nextClip.id}`)}
                  >
                    Nächster Clip
                  </Button>
                </>
              )}
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
                  Thema, Stimme, Videostil und Skriptart. Daraus entstehen Skript, Bilder und Ton.
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
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titel</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sprache</Label>
                      <Select
                        value={language}
                        onValueChange={(v) => {
                          setLanguage(v);
                          void save({ language: v });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="en">Englisch</SelectItem>
                          <SelectItem value="fr">Französisch</SelectItem>
                          <SelectItem value="it">Italienisch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stimme</Label>
                      <div className="flex gap-2">
                        <Select value={voice} onValueChange={setVoice}>
                          <SelectTrigger className="flex-1">
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
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Stimme anhören"
                          aria-label="Stimme anhören"
                          disabled={previewLoading}
                          onClick={() => void playVoicePreview()}
                        >
                          {previewLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kurze Hörprobe; jede Stimme wird nur einmal erzeugt.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Videostil</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WHITEBOARD_STYLES.filter((s) => s.generierbar).map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {styleOption(style).eignung} ·{" "}
                        <Link to="/admin/stilbibliothek" className="underline">
                          Stilbibliothek
                        </Link>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Skriptart</Label>
                      <Select value={scriptType} onValueChange={setScriptType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCRIPT_TYPES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {scriptTypeOption(scriptType).ablauf}
                      </p>
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
                    {line.label === "Skript" ? (
                      <>Skript · {line.model} · keine Kie.ai-Credits</>
                    ) : (
                      <>
                        {line.label} · {line.model} ({CATEGORY_LABELS[
                          line.unit === "image"
                            ? "image"
                            : line.unit === "1k_chars"
                              ? "voice"
                              : line.unit === "second"
                                ? "video"
                                : "text"
                        ]}) · {formatCredits(line.units)} × {formatCredits(line.rate)}{" "}
                        {UNIT_LABELS[line.unit]}
                      </>
                    )}
                  </span>
                  <span>
                    {line.label === "Skript"
                      ? "über Lovable KI"
                      : line.priceKnown
                        ? `${formatCredits(line.credits)} Credits`
                        : "Preis unbekannt"}
                  </span>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <MusicPicker
                  videoId={videoId ?? ""}
                  url={project?.music_url ?? null}
                  path={project?.music_path ?? null}
                  volume={project?.music_volume ?? 0.18}
                  onChange={(patch) => {
                    setProject((prev) => (prev ? { ...prev, ...patch } : prev));
                    void save(patch);
                  }}
                  onVolumeChange={(next) => {
                    setProject((prev) => (prev ? { ...prev, music_volume: next } : prev));
                    void save({ music_volume: next });
                  }}
                />

                <div className="space-y-2">
                  <Label>Mitlaufende Untertitel</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={subtitles ? "default" : "outline"}
                      onClick={() => setSubtitles(true)}
                    >
                      An
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={subtitles ? "outline" : "default"}
                      onClick={() => setSubtitles(false)}
                    >
                      Aus
                    </Button>
                  </div>
                </div>
              </div>
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
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="clip-seconds" className="text-xs">
                      Cliplänge in Sekunden
                    </Label>
                    <Input
                      id="clip-seconds"
                      type="number"
                      min={MIN_CLIP_SECONDS}
                      max={MAX_CLIP_SECONDS}
                      step={1}
                      className="w-28"
                      value={clipSeconds}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        if (Number.isNaN(raw)) return;
                        setClipSeconds(
                          Math.min(MAX_CLIP_SECONDS, Math.max(MIN_CLIP_SECONDS, Math.round(raw))),
                        );
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setClipDialogOpen(true)}
                    disabled={working !== null}
                  >
                    {working === "kie-video" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Zusätzlichen KI-Videoclip erzeugen
                  </Button>
                </div>
              </div>

              <AlertDialog open={clipDialogOpen} onOpenChange={setClipDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>KI-Videoclip erzeugen?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-1 text-sm">
                        <div>Modell: {videoModel}</div>
                        <div>Länge: {clipSeconds} Sekunden</div>
                        <div>
                          Preis: {clipRate > 0 ? `${formatCredits(clipRate)} Credits pro Sekunde` : "kein Creditpreis hinterlegt"}
                        </div>
                        <div>Gesamtkosten: ca. {formatCredits(clipCost)} Credits</div>
                        <div>
                          Verfügbares Guthaben:{" "}
                          {credits === null ? "nicht abrufbar" : `${formatCredits(credits)} Credits`}
                        </div>
                        {!clipAffordable && (
                          <div className="text-destructive">
                            Es fehlen {formatCredits(clipMissing)} Credits.
                          </div>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={!clipAffordable}
                      onClick={() => {
                        setClipDialogOpen(false);
                        void runKieVideo();
                      }}
                    >
                      Clip erzeugen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                  <SceneMediaEditor
                    scene={scene}
                    videoId={videoId ?? ""}
                    onChange={(patch) => updateScene(scene.id, patch)}
                    onGenerateAiClip={() => void runAiClip(scene.id)}
                    aiClipBusy={aiClipBusy === scene.id}
                  />
                  <div className="flex items-center gap-4">
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
