import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Player, type PlayerRef } from "@remotion/player";
import { renderStillOnWeb } from "@remotion/web-renderer";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  TITLE_FRAMES,
  TRANSITION_FRAMES,
  WhiteboardVideo,
  compositionFrames,
} from "@/features/whiteboard/WhiteboardVideo";
import { FPS, type WhiteboardScene, type WhiteboardVideoProject } from "@/features/whiteboard/types";
import { withFreshClipUrls } from "@/features/whiteboard/clips";
import { signedMusicUrl } from "@/features/whiteboard/music";

const SPEEDS = [0.5, 1, 1.5, 2];

/** Startbild jedes Abschnitts – Übergänge überlappen, deshalb der Abzug. */
const sceneStarts = (title: string, scenes: WhiteboardScene[]): number[] => {
  const blocks = (title ? [TITLE_FRAMES] : []).concat(
    scenes.map((s) => Math.max(FPS, Math.round((s.durationInSeconds || 6) * FPS))),
  );
  const offset = title ? 1 : 0;
  const starts: number[] = [];
  let cursor = 0;
  blocks.forEach((length, i) => {
    if (i >= offset) starts.push(Math.max(0, cursor - i * TRANSITION_FRAMES));
    cursor += length;
  });
  return starts;
};

const WhiteboardStudio = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const playerRef = useRef<PlayerRef>(null);

  const [project, setProject] = useState<WhiteboardVideoProject | null>(null);
  const [scenes, setScenes] = useState<WhiteboardScene[]>([]);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [subtitles, setSubtitles] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.18);
  const [loopScene, setLoopScene] = useState<number | null>(null);
  const [still, setStill] = useState(false);

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
      // Abgelaufene Musikadresse aus der Datenbank nicht verwenden.
      setProject(loaded.music_path ? { ...loaded, music_url: null } : loaded);
      setMusicVolume(loaded.music_volume ?? 0.18);
      const loadedScenes = Array.isArray(loaded.scenes) ? loaded.scenes : [];
      setScenes(loadedScenes);
      if (loadedScenes.some((s) => s.mediaType === "clip" && s.clipPath)) {
        void withFreshClipUrls(loadedScenes).then(setScenes);
      }
      if (loaded.music_path) {
        void signedMusicUrl(loaded.music_path).then((url) => {
          if (url) setProject((prev) => (prev ? { ...prev, music_url: url } : prev));
        });
      }
    };
    void load();
  }, [videoId, navigate]);

  const title = project?.title ?? "";
  const durationInFrames = useMemo(() => compositionFrames(title, scenes), [title, scenes]);
  const starts = useMemo(() => sceneStarts(title, scenes), [title, scenes]);

  const inputProps = useMemo(
    () => ({
      title,
      scenes,
      style: project?.style,
      musicUrl: project?.music_url ?? null,
      musicVolume,
      subtitles,
    }),
    [title, scenes, project?.style, project?.music_url, musicVolume, subtitles],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = () => setFrame(player.getCurrentFrame());
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [project]);

  const seek = useCallback((target: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.pause();
    player.seekTo(Math.max(0, target));
  }, []);

  const loopRange = useMemo(() => {
    if (loopScene === null) return null;
    const from = starts[loopScene] ?? 0;
    const to = starts[loopScene + 1] ?? durationInFrames;
    return { from, to: Math.max(from + 1, to) };
  }, [loopScene, starts, durationInFrames]);

  const saveStill = async () => {
    setStill(true);
    try {
      const result = await renderStillOnWeb({
        frame,
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
      });
      const blob = await result.blob({ format: "png" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(title || "einzelbild").replace(/[^\w-]+/g, "-").toLowerCase()}-${frame}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Einzelbild nicht gespeichert",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setStill(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 pt-40 pb-20">
          <p className="text-muted-foreground">Wird geladen…</p>
        </main>
      </div>
    );
  }

  const currentScene = starts.reduce((acc, start, i) => (frame >= start ? i : acc), -1);

  return (
    <div className="min-h-screen">
      <Navigation />
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Lernvideos", href: "/admin/whiteboard-videos" },
          { label: title || "Video", href: `/admin/whiteboard-videos/${project.id}` },
          { label: "Studio", active: true },
        ]}
      />
      <main className="container mx-auto px-6 pt-40 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/admin/whiteboard-videos/${project.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zum Editor
            </Button>
            <span className="text-sm text-muted-foreground">
              Bild {frame} von {durationInFrames} · {(frame / FPS).toFixed(1)} s
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border bg-muted">
            <Player
              ref={playerRef}
              component={WhiteboardVideo as never}
              inputProps={inputProps as never}
              durationInFrames={durationInFrames}
              fps={FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{ width: "100%" }}
              playbackRate={speed}
              inFrame={loopRange?.from}
              outFrame={loopRange?.to}
              loop={loopRange !== null}
              controls
              acknowledgeRemotionLicense
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feinsteuerung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => seek(frame - 10)}>
                  <ChevronLeft className="w-4 h-4" /> 10 Bilder
                </Button>
                <Button variant="outline" size="sm" onClick={() => seek(frame - 1)}>
                  <ChevronLeft className="w-4 h-4" /> 1 Bild
                </Button>
                <Button
                  size="sm"
                  onClick={() => (playing ? playerRef.current?.pause() : playerRef.current?.play())}
                >
                  {playing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {playing ? "Pause" : "Abspielen"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => seek(frame + 1)}>
                  1 Bild <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => seek(frame + 10)}>
                  10 Bilder <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={still} onClick={saveStill}>
                  <Camera className="w-4 h-4 mr-2" />
                  {still ? "Wird gespeichert…" : "Einzelbild sichern"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Abspielgeschwindigkeit</Label>
                <div className="flex gap-2">
                  {SPEEDS.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={speed === value ? "default" : "outline"}
                      onClick={() => setSpeed(value)}
                    >
                      {value}×
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Musiklautstärke: {Math.round(musicVolume * 100)} %</Label>
                  <Slider
                    value={[Math.round(musicVolume * 100)]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={([v]) => setMusicVolume(v / 100)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nur für die Vorschau – gespeichert wird im Editor.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Untertitel</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={subtitles ? "default" : "outline"}
                      onClick={() => setSubtitles(true)}
                    >
                      An
                    </Button>
                    <Button
                      size="sm"
                      variant={subtitles ? "outline" : "default"}
                      onClick={() => setSubtitles(false)}
                    >
                      Aus
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zeitleiste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenes.length === 0 && (
                <p className="text-sm text-muted-foreground">Noch keine Abschnitte vorhanden.</p>
              )}
              {scenes.map((scene, i) => (
                <div
                  key={scene.id}
                  className={`flex items-center justify-between gap-4 rounded-md border p-3 ${
                    currentScene === i ? "border-primary bg-accent/40" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => seek(starts[i] ?? 0)}
                  >
                    <span className="text-sm font-medium">
                      {String(i + 1).padStart(2, "0")} · {scene.heading || "Ohne Überschrift"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      ab {((starts[i] ?? 0) / FPS).toFixed(1)} s ·{" "}
                      {(scene.durationInSeconds || 6).toFixed(1)} s lang
                    </span>
                  </button>
                  <Button
                    size="sm"
                    variant={loopScene === i ? "default" : "outline"}
                    onClick={() => setLoopScene(loopScene === i ? null : i)}
                  >
                    <Repeat className="w-4 h-4 mr-2" />
                    {loopScene === i ? "Schleife aus" : "Schleife"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WhiteboardStudio;
