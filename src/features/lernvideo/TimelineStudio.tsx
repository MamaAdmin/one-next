import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Download, FileText, Film, Loader2, Music, Plus, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { YouTubePublishPanel } from "@/features/video/YouTube";
import { latestAsset, signedUrl, uploadProjectFile, type LvAsset, type LvProject, type LvScene } from "./api";
import {
  OVERLAY_LABELS, POSITION_LABELS, defaultOverlays, newOverlayId, subtitleCues, toSrt,
  type Overlay, type OverlayPosition, type OverlayType, type Timeline, type TimelineScene,
} from "./timeline";
import { TimelinePlayer } from "./TimelinePlayer";

const VIDEO_STYLES_WITHOUT_CLIP = new Set(["whiteboard", "kinetic_typo", "kinetic_typography", "motion_graphics", "infografik", "screencast", "screencast_plus"]);

async function buildTimeline(project: LvProject, scenes: LvScene[], assets: LvAsset[]): Promise<Timeline> {
  const portrait = project.format === "9:16";
  let t = 0;
  const out: TimelineScene[] = [];
  for (const [index, s] of scenes.entries()) {
    const audio = latestAsset(assets, s.id, "audio");
    const image = latestAsset(assets, s.id, "image");
    const video = [latestAsset(assets, s.id, "avatar"), latestAsset(assets, s.id, "video")].find((a) => a?.status === "done" && a.storage_path);
    const audioSec = s.audio_seconds ?? 0;
    const duration = Math.max(1, audioSec || s.duration_seconds || 5);
    const imageUrl = image?.status === "done" && image.storage_path ? await signedUrl(image.storage_path) : undefined;
    let kind: TimelineScene["visual"]["kind"];
    if (project.style === "whiteboard") kind = imageUrl ? "whiteboard" : "none";
    else if (project.style.startsWith("kinetic")) kind = "kinetic";
    else if (video) kind = "video";
    else if (imageUrl) kind = VIDEO_STYLES_WITHOUT_CLIP.has(project.style) ? "image" : "fallback";
    else kind = "none";
    out.push({
      id: s.id, index, start: t, duration, narration: s.narration,
      visual: {
        kind, imageUrl,
        videoUrl: kind === "video" && video?.storage_path ? await signedUrl(video.storage_path) : undefined,
        clipSeconds: Number(video?.input_params?._clip_seconds) || undefined,
      },
      audio: audio?.status === "done" && audio.storage_path ? { url: await signedUrl(audio.storage_path), duration: audioSec || duration } : undefined,
      overlays: (s.overlays ?? []).filter((o) => o.type !== "subtitle" || o.text.trim()),
    });
    t += duration;
  }
  const subtitles = out.flatMap((s) => s.audio ? subtitleCues(s.narration, s.start, s.audio.duration) : []);
  return {
    version: 1, title: project.title, format: project.format,
    width: portrait ? 1080 : 1920, height: portrait ? 1920 : 1080, duration: t,
    music: project.music_path ? { url: await signedUrl(project.music_path), volume: Number(project.music_volume), duckFactor: 0.35 } : undefined,
    scenes: out, subtitles,
  };
}

const OverlayEditor = ({ o, onChange, onDelete }: { o: Overlay; onChange: (p: Partial<Overlay>) => void; onDelete: () => void }) => (
  <div className="rounded-md border border-border p-3 space-y-2">
    <div className="grid gap-2 md:grid-cols-5 items-end">
      <div className="space-y-1 md:col-span-2">
        <Label>Typ</Label>
        <Select value={o.type} onValueChange={(v) => onChange({ type: v as OverlayType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(OVERLAY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Position</Label>
        <Select value={o.position} onValueChange={(v) => onChange({ position: v as OverlayPosition })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(POSITION_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label>Ab Sek.</Label>
        <Input type="number" step={0.1} min={0} value={o.start} onChange={(e) => onChange({ start: Number(e.target.value) })} /></div>
      <div className="space-y-1"><Label>Dauer Sek.</Label>
        <Input type="number" step={0.1} min={0.5} value={o.duration} onChange={(e) => onChange({ duration: Number(e.target.value) })} /></div>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      <div className="space-y-1"><Label>{o.type === "term" ? "Begriff" : o.type === "number" ? "Beschriftung" : o.type === "list" || o.type === "bar" || o.type === "pie" ? "Überschrift" : "Text"}</Label>
        <Input value={o.text} onChange={(e) => onChange({ text: e.target.value })} /></div>
      {o.type === "term" && <div className="space-y-1"><Label>Erklärung</Label>
        <Input value={o.detail ?? ""} onChange={(e) => onChange({ detail: e.target.value })} /></div>}
      {o.type === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1"><Label>Zahl</Label><Input type="number" value={o.value ?? 0} onChange={(e) => onChange({ value: Number(e.target.value) })} /></div>
          <div className="space-y-1"><Label>Einheit</Label><Input value={o.suffix ?? ""} placeholder=" %" onChange={(e) => onChange({ suffix: e.target.value })} /></div>
        </div>
      )}
      {o.type === "list" && <div className="space-y-1"><Label>Punkte (eine Zeile pro Punkt)</Label>
        <Textarea rows={3} value={(o.items ?? []).join("\n")} onChange={(e) => onChange({ items: e.target.value.split("\n") })} /></div>}
      {(o.type === "bar" || o.type === "pie") && <div className="space-y-1"><Label>Werte (je Zeile „Bezeichnung: Zahl“)</Label>
        <Textarea rows={3} value={(o.data ?? []).map((d) => `${d.label}: ${d.value}`).join("\n")}
          onChange={(e) => onChange({ data: e.target.value.split("\n").map((l) => {
            const [label, v] = l.split(":");
            return { label: (label ?? "").trim(), value: Number((v ?? "").replace(",", ".").trim()) || 0 };
          }).filter((d) => d.label) })} /></div>}
    </div>
    <div className="flex justify-end">
      <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" />Entfernen</Button>
    </div>
  </div>
);

export const TimelineStudio = ({ project, scenes, assets, onPatchScene, onPatchProject }: {
  project: LvProject; scenes: LvScene[]; assets: LvAsset[];
  onPatchScene: (id: string, patch: Partial<LvScene>) => void;
  onPatchProject: (patch: Partial<LvProject>) => Promise<void> | void;
}) => {
  const { toast } = useToast();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [building, setBuilding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(project.render_status);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const musicInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setBuilding(true);
    try { setTimeline(await buildTimeline(project, scenes, assets)); }
    catch (e) { toast({ title: "Vorschau fehlgeschlagen", description: String(e), variant: "destructive" }); }
    finally { setBuilding(false); }
  }, [project, scenes, assets, toast]);

  useEffect(() => { if (scenes.length && !timeline) void refresh(); }, [scenes.length, timeline, refresh]);

  useEffect(() => {
    if (project.export_path) void signedUrl(project.export_path, 3600).then(setDownloadUrl);
  }, [project.export_path]);

  const pollRef = useRef<number | null>(null);
  const poll = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("render-video", { body: { action: "status", projectId: project.id } });
    if (error || data?.error) setStatus("failed");
    setStatus(data?.status ?? null);
    if (data?.status === "succeeded") {
      await onPatchProject({ export_path: data.exportPath, render_status: "succeeded" });
      setExporting(false);
      toast({ title: "Video fertig", description: "Das MP4 liegt im Speicher und kann heruntergeladen werden." });
      return;
    }
    if (data?.status === "failed") {
      setExporting(false);
      toast({ title: "Export fehlgeschlagen", description: data?.error ?? "Unbekannter Fehler", variant: "destructive" });
      return;
    }
    pollRef.current = window.setTimeout(() => void poll(), 10_000);
  }, [project.id, onPatchProject, toast]);

  useEffect(() => {
    if (project.render_id && project.render_status && !["succeeded", "failed"].includes(project.render_status)) { setExporting(true); void poll(); }
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startExport = async () => {
    setExporting(true);
    try {
      const tl = await buildTimeline(project, scenes, assets);
      setTimeline(tl);
      const { data, error } = await supabase.functions.invoke("render-video", {
        body: { action: "start", projectId: project.id, timeline: tl, subtitles: project.subtitles_enabled },
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      setStatus(data.status); setDownloadUrl(null);
      pollRef.current = window.setTimeout(() => void poll(), 10_000);
    } catch (e) {
      setExporting(false);
      toast({ title: "Export nicht gestartet", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  const downloadSrt = () => {
    if (!timeline) return;
    const url = URL.createObjectURL(new Blob([toSrt(timeline.subtitles)], { type: "application/x-subrip;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${project.title || "lernvideo"}.srt`; a.click();
    URL.revokeObjectURL(url);
  };

  const onMusic = async (file?: File) => {
    if (!file) return;
    const path = await uploadProjectFile(project.id, file, "music");
    await onPatchProject({ music_path: path });
    setTimeline(null);
  };

  const fallbacks = timeline?.scenes.filter((s) => s.visual.kind === "fallback" || s.visual.kind === "none") ?? [];
  const setOverlays = (s: LvScene, overlays: Overlay[]) => onPatchScene(s.id, { overlays });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Einblendungen</CardTitle>
          <CardDescription>Liegen als eigene Ebene über dem Bild, nie im KI-Bild. Position, Start und Dauer pro Einblendung.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple">
            {scenes.map((s, i) => (
              <AccordionItem key={s.id} value={s.id}>
                <AccordionTrigger>Szene {i + 1} · {(s.overlays ?? []).length} Einblendung(en)</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {(s.overlays ?? []).map((o) => (
                    <OverlayEditor key={o.id} o={o}
                      onChange={(p) => setOverlays(s, s.overlays.map((x) => x.id === o.id ? { ...x, ...p } : x))}
                      onDelete={() => setOverlays(s, s.overlays.filter((x) => x.id !== o.id))} />
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setOverlays(s, [...(s.overlays ?? []),
                      { id: newOverlayId(), type: "title", text: "", position: "top", start: 0, duration: 3 }])}>
                      <Plus className="w-4 h-4 mr-1" />Einblendung
                    </Button>
                    {!(s.overlays ?? []).length && s.overlay_texts.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setOverlays(s, defaultOverlays(s.overlay_texts, s.audio_seconds ?? s.duration_seconds))}>
                        <Wand2 className="w-4 h-4 mr-1" />Aus Skript übernehmen
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
          <CardDescription>Spielt alle Szenen nacheinander ab, synchron zur Sprecherspur.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 items-center">
            <div className="flex items-center gap-2">
              <Switch id="subs" checked={project.subtitles_enabled} onCheckedChange={(v) => void onPatchProject({ subtitles_enabled: v })} />
              <Label htmlFor="subs">Untertitel</Label>
            </div>
            <div className="flex items-center gap-2">
              <input ref={musicInput} type="file" accept="audio/*" className="hidden" onChange={(e) => void onMusic(e.target.files?.[0])} />
              <Button variant="outline" size="sm" onClick={() => musicInput.current?.click()}>
                <Music className="w-4 h-4 mr-1" />{project.music_path ? "Musik ersetzen" : "Hintergrundmusik"}
              </Button>
              {project.music_path && <Button variant="ghost" size="sm" onClick={() => { void onPatchProject({ music_path: null }); setTimeline(null); }}>Entfernen</Button>}
            </div>
            {project.music_path && (
              <div className="space-y-1">
                <Label>Musiklautstärke {Math.round(Number(project.music_volume) * 100)} % (beim Sprechen abgesenkt)</Label>
                <Slider min={0} max={1} step={0.05} value={[Number(project.music_volume)]}
                  onValueChange={([v]) => void onPatchProject({ music_volume: v })} onValueCommit={() => setTimeline(null)} />
              </div>
            )}
          </div>
          {fallbacks.length > 0 && (
            <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span>Ohne Video: Szene {fallbacks.map((s) => s.index + 1).join(", ")}. Diese Szenen zeigen ein Standbild mit leichtem Zoom{fallbacks.some((s) => s.visual.kind === "none") ? " oder gar kein Bild" : ""}.</span>
            </div>
          )}
          {timeline ? <TimelinePlayer timeline={timeline} showSubtitles={project.subtitles_enabled} />
            : <div className="text-sm text-muted-foreground">Vorschau wird vorbereitet …</div>}
          <Button variant="outline" size="sm" disabled={building} onClick={() => void refresh()}>
            {building ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}Vorschau aktualisieren
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Rendert das fertige MP4 über Creatomate und legt es im eigenen Speicher ab.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button disabled={exporting || !scenes.length} onClick={() => void startExport()}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Film className="w-4 h-4 mr-2" />}
            {exporting ? `Wird gerendert … (${status ?? "gestartet"})` : "Video exportieren"}
          </Button>
          {downloadUrl && !exporting && (
            <Button asChild variant="outline">
              <a href={downloadUrl} download target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-2" />MP4 herunterladen</a>
            </Button>
          )}
          <Button variant="outline" disabled={!timeline?.subtitles.length} onClick={downloadSrt}>
            <FileText className="w-4 h-4 mr-2" />Untertitel als SRT
          </Button>
          {status === "failed" && project.render_error && <span className="text-sm text-destructive">{project.render_error}</span>}
          <div className="w-full">
            <YouTubePublishPanel
              target="lernvideo"
              id={project.id}
              hasExport={!!project.export_path && status === "succeeded"}
              defaultTitle={project.title}
              slotKey={(project as any).target_slot_key ?? null}
              youtubeVideoId={(project as any).youtube_video_id ?? null}
              youtubeStatus={(project as any).youtube_status ?? null}
              youtubeError={(project as any).youtube_error ?? null}
              onSlotChange={(slot) => void onPatchProject({ target_slot_key: slot } as Partial<LvProject>)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
