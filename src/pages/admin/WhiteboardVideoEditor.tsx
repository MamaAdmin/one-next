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
import { ArrowLeft, Download, Image as ImageIcon, Loader2, Mic, Plus, Sparkles, Trash2 } from "lucide-react";
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
  generateImage,
  generateScript,
  generateVoice,
  startVideo,
} from "@/features/whiteboard/api";

const VOICES = ["Charlotte", "Rachel", "Aria", "Sarah", "George", "Liam", "Matilda"];

const WhiteboardVideoEditor = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const [project, setProject] = useState<WhiteboardVideoProject | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [voice, setVoice] = useState("Charlotte");
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState<WhiteboardScene[]>([]);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [kieVideoUrl, setKieVideoUrl] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

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
      setVoice(loaded.voice || "Charlotte");
      setScenes(Array.isArray(loaded.scenes) ? loaded.scenes : []);
      setKieVideoUrl(loaded.video_url);
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
        .update({ title, topic, voice, scenes, ...patch })
        .eq("id", videoId);
      setSaving(false);
      if (error) {
        toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
      }
    },
    [videoId, title, topic, voice, scenes, toast],
  );

  const updateScene = (id: string, patch: Partial<WhiteboardScene>) =>
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const runScript = async () => {
    setWorking("script");
    try {
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
      if (script.title && (!title || title === "Neues Whiteboard-Video")) setTitle(script.title);
      await save({ scenes: next, title: script.title || title });
      toast({ title: "Skript erstellt", description: `${next.length} Abschnitte` });
    } catch (error) {
      toast({
        title: "Skript fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setWorking(null);
    }
  };

  const runImages = async () => {
    setWorking("images");
    try {
      const next = [...scenes];
      for (let i = 0; i < next.length; i++) {
        const prompt = next[i].imagePrompt || next[i].heading;
        if (!prompt) continue;
        next[i] = { ...next[i], imageUrl: await generateImage(prompt) };
        setScenes([...next]);
      }
      await save({ scenes: next });
      toast({ title: "Zeichnungen erstellt" });
    } catch (error) {
      toast({
        title: "Zeichnungen fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setWorking(null);
    }
  };

  const runVoices = async () => {
    setWorking("voices");
    try {
      const next = [...scenes];
      for (let i = 0; i < next.length; i++) {
        if (!next[i].narration.trim()) continue;
        const url = await generateVoice(next[i].narration, voice);
        next[i] = { ...next[i], audioUrl: url, durationInSeconds: estimateDuration(next[i]) };
        setScenes([...next]);
      }
      await save({ scenes: next });
      toast({ title: "Sprecherstimme erstellt" });
    } catch (error) {
      toast({
        title: "Vertonung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setWorking(null);
    }
  };

  const runKieVideo = async () => {
    setWorking("kie-video");
    try {
      const taskId = await startVideo(topic || title);
      toast({ title: "Videoclip wird erzeugt", description: "Das dauert einige Minuten." });
      pollRef.current = window.setInterval(async () => {
        try {
          const result = await checkVideo(taskId);
          if (result.status === "done" && result.url) {
            if (pollRef.current) window.clearInterval(pollRef.current);
            setKieVideoUrl(result.url);
            setWorking(null);
            await save({ video_url: result.url, status: "ready" });
            toast({ title: "Videoclip fertig" });
          } else if (result.status === "failed") {
            if (pollRef.current) window.clearInterval(pollRef.current);
            setWorking(null);
            toast({ title: "Videoclip fehlgeschlagen", description: result.error, variant: "destructive" });
          }
        } catch {
          /* weiter versuchen */
        }
      }, 10000);
    } catch (error) {
      setWorking(null);
      toast({
        title: "Videoclip fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
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
            <CardHeader>
              <CardTitle>Briefing</CardTitle>
              <CardDescription>
                Beschreiben Sie Thema und Kernbotschaft. Daraus entstehen Skript, Zeichnungen und Stimme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Thema / Briefing</Label>
                <Textarea
                  id="topic"
                  rows={5}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Worum geht es? Zielgruppe, Kernaussagen, gewünschter Ton."
                />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 w-40">
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
                    <Label>Bildbeschreibung (Englisch)</Label>
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
