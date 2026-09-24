import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Loader2, Play, Plus, RefreshCw, Trash2, Upload, Volume2, Wand2 } from "lucide-react";
import { WHITEBOARD_STYLES, styleOption } from "@/features/whiteboard/styles";
import { previewVoice } from "@/features/whiteboard/api";
import {
  VOICES, applyPronunciation, audioDuration, buildImagePrompt, db, estimateSceneCredits, invokeKie,
  latestAsset, signedUrl, stepsForStyle, uploadProjectFile, waitForAsset,
  type AssetType, type LvAsset, type LvConfig, type LvProject, type LvScene,
} from "@/features/lernvideo/api";

type Pending = { sceneIds: string[]; credits: number } | null;

const STATUS_TEXT: Record<string, string> = {
  queued: "Wartet", running: "Läuft", done: "Fertig", failed: "Fehler",
};

const AssetPreview = ({ asset, onRetry, disabled }: { asset?: LvAsset; onRetry: () => void; disabled: boolean }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(null);
    if (asset?.status === "done" && asset.storage_path) void signedUrl(asset.storage_path, 3600).then(setUrl).catch(() => {});
  }, [asset?.id, asset?.status, asset?.storage_path]);

  if (!asset) return <p className="text-xs text-muted-foreground">Noch nicht erzeugt</p>;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={asset.status === "failed" ? "text-destructive" : "text-muted-foreground"}>
          {(asset.status === "running" || asset.status === "queued") && <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />}
          {STATUS_TEXT[asset.status]}
          {asset.cost_credits != null && ` · ${asset.cost_credits} Credits`}
        </span>
        {(asset.status === "done" || asset.status === "failed") && (
          <Button size="sm" variant="ghost" className="h-6 px-2" disabled={disabled} onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />Neu erzeugen
          </Button>
        )}
      </div>
      {asset.error_message && <p className="text-xs text-destructive">{asset.error_message}</p>}
      {url && asset.type === "audio" && <audio controls src={url} className="w-full h-8" />}
      {url && asset.type === "image" && <img src={url} alt="Szenenbild" className="rounded border border-border w-full" />}
      {url && (asset.type === "video" || asset.type === "avatar") && <video controls src={url} className="rounded border border-border w-full" />}
    </div>
  );
};

const SceneCard = ({
  scene, index, assets, steps, busy, onChange, onDelete, onRun, onRetry,
}: {
  scene: LvScene; index: number; assets: LvAsset[]; steps: ReturnType<typeof stepsForStyle>; busy: boolean;
  onChange: (patch: Partial<LvScene>) => void; onDelete: () => void; onRun: () => void; onRetry: (a: LvAsset) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: scene.id });
  const mainType: AssetType = steps.avatar ? "avatar" : "video";
  const cols: Array<{ type: AssetType; label: string; enabled: boolean }> = [
    { type: "audio", label: "Stimme", enabled: !!steps.audio },
    { type: "image", label: steps.avatar ? "Porträt" : "Bild", enabled: !!steps.image },
    { type: mainType, label: steps.avatar ? "Avatar" : "Video", enabled: !!(steps.avatar || steps.video) },
  ];
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <button type="button" className="cursor-grab text-muted-foreground" aria-label="Szene verschieben" {...attributes} {...listeners}>
              <GripVertical className="w-5 h-5" />
            </button>
            <span className="font-medium">Szene {index + 1}</span>
            <span className="text-sm text-muted-foreground">
              {scene.audio_seconds ? `${scene.audio_seconds.toFixed(1)} s (Audio)` : `ca. ${scene.duration_seconds} s`}
            </span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={onRun}>
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Nur diese Szene neu erzeugen
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete} aria-label="Szene löschen">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Sprechertext</Label>
              <Textarea rows={4} value={scene.narration} onChange={(e) => onChange({ narration: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Bildprompt</Label>
              <Textarea rows={4} value={scene.image_prompt} onChange={(e) => onChange({ image_prompt: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Overlay-Texte (eine Zeile pro Text)</Label>
              <Textarea rows={2} value={scene.overlay_texts.join("\n")}
                onChange={(e) => onChange({ overlay_texts: e.target.value.split("\n") })} />
            </div>
            <div className="space-y-1">
              <Label>Geschätzte Dauer (Sekunden)</Label>
              <Input type="number" min={1} max={60} value={scene.duration_seconds}
                onChange={(e) => onChange({ duration_seconds: Number(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {cols.map((c) => {
              const a = latestAsset(assets, scene.id, c.type);
              return (
                <div key={c.type} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={`h-2 w-2 rounded-full ${a?.status === "done" ? "bg-primary" : a?.status === "failed" ? "bg-destructive" : "bg-muted-foreground/40"}`} />
                    {c.label}
                  </div>
                  {c.enabled
                    ? <AssetPreview asset={a} disabled={busy} onRetry={() => a && onRetry(a)} />
                    : <p className="text-xs text-muted-foreground">Entsteht im Code, keine KI-Erzeugung</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LernvideoProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<LvProject | null>(null);
  const [scenes, setScenes] = useState<LvScene[]>([]);
  const [assets, setAssets] = useState<LvAsset[]>([]);
  const [configs, setConfigs] = useState<LvConfig[]>([]);
  const [refUrls, setRefUrls] = useState<Record<string, string>>({});
  const [scriptBusy, setScriptBusy] = useState(false);
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Pending>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const saveTimers = useRef<Record<string, number>>({});
  const cancel = useRef({ cancelled: false });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    if (!projectId) return;
    const [{ data: p }, { data: s }, { data: c }] = await Promise.all([
      db.from("projects").select("*").eq("id", projectId).single(),
      db.from("scenes").select("*").eq("project_id", projectId).order("position"),
      db.from("style_model_config").select("*"),
    ]);
    setProject(p);
    setScenes(s ?? []);
    setConfigs(c ?? []);
    const ids = (s ?? []).map((x: LvScene) => x.id);
    if (ids.length) {
      const { data: a } = await db.from("assets").select("*").in("scene_id", ids);
      setAssets(a ?? []);
    } else setAssets([]);
  }, [projectId]);

  useEffect(() => {
    if (isAdmin) void load();
    const c = cancel.current;
    return () => { c.cancelled = true; };
  }, [isAdmin, load]);

  useEffect(() => {
    project?.reference_paths.forEach((p) => {
      if (!refUrls[p]) void signedUrl(p, 3600).then((u) => setRefUrls((r) => ({ ...r, [p]: u })));
    });
  }, [project?.reference_paths, refUrls]);

  const style = project ? styleOption(project.style) : null;
  const steps = useMemo(() => stepsForStyle(configs, project?.style ?? ""), [configs, project?.style]);
  const spent = assets.reduce((s, a) => s + Number(a.cost_credits ?? 0), 0);
  const perScene = estimateSceneCredits(configs, project?.style ?? "");
  const configuredStyles = new Set(configs.map((c) => c.style));

  const patchProject = async (patch: Partial<LvProject>) => {
    if (!project) return;
    setProject({ ...project, ...patch });
    const { error } = await db.from("projects").update(patch).eq("id", project.id);
    if (error) toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
  };

  const patchScene = (id: string, patch: Partial<LvScene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    window.clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = window.setTimeout(() => {
      const clean = patch.overlay_texts ? { ...patch, overlay_texts: patch.overlay_texts.filter((t) => t.trim()) } : patch;
      void db.from("scenes").update(clean).eq("id", id);
    }, 600);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = scenes.findIndex((s) => s.id === e.active.id);
    const to = scenes.findIndex((s) => s.id === e.over!.id);
    const next = arrayMove(scenes, from, to).map((s, i) => ({ ...s, position: i }));
    setScenes(next);
    await Promise.all(next.map((s) => db.from("scenes").update({ position: s.position }).eq("id", s.id)));
  };

  const generateScript = async () => {
    if (!project || !style) return;
    if (scenes.length && !window.confirm("Bestehende Szenen werden ersetzt. Fortfahren?")) return;
    setScriptBusy(true);
    const { data, error } = await supabase.functions.invoke("lernvideo-script", {
      body: { projectId: project.id, styleLabel: style.label, scriptType: style.skriptart },
    });
    setScriptBusy(false);
    if (error || data?.error) {
      toast({ title: "Skript fehlgeschlagen", description: data?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: `${data.count} Szenen erstellt` });
    await load();
  };

  const addScene = async () => {
    if (!project) return;
    const { data } = await db.from("scenes").insert({ project_id: project.id, position: scenes.length }).select("*").single();
    if (data) setScenes((s) => [...s, data]);
  };

  const deleteScene = async (id: string) => {
    if (!window.confirm("Szene löschen?")) return;
    await db.from("scenes").delete().eq("id", id);
    setScenes((s) => s.filter((x) => x.id !== id));
  };

  const upsertAsset = (a: LvAsset) =>
    setAssets((prev) => [a, ...prev.filter((x) => x.id !== a.id)]);

  const runStep = async (body: Record<string, unknown>): Promise<LvAsset> => {
    const started = await invokeKie({ action: "create", projectId: project!.id, format: project!.format, ...body });
    const done = await waitForAsset(started, upsertAsset, cancel.current);
    if (done.status !== "done") throw new Error(done.error_message ?? "Fehlgeschlagen");
    return done;
  };

  const setAudioLength = async (scene: LvScene, a: LvAsset) => {
    if (!a.storage_path) return;
    const secs = await audioDuration(await signedUrl(a.storage_path, 600));
    const rounded = Math.round(secs * 10) / 10;
    setScenes((prev) => prev.map((s) => (s.id === scene.id ? { ...s, audio_seconds: rounded, duration_seconds: Math.ceil(rounded) } : s)));
    await db.from("scenes").update({ audio_seconds: rounded, duration_seconds: Math.ceil(rounded) }).eq("id", scene.id);
    return rounded;
  };

  /** Reihenfolge: Stimme → Bild → Video (bzw. Porträt + Audio → Avatar). */
  const runScene = async (scene: LvScene) => {
    if (!project || !style) return;
    const base = { style: project.style, sceneId: scene.id };
    setRunning((r) => new Set(r).add(scene.id));
    try {
      let audioSeconds = scene.audio_seconds ?? scene.duration_seconds;
      let audio: LvAsset | undefined;
      if (steps.audio) {
        audio = await runStep({ ...base, type: "audio", voice: project.voice, prompt: "",
          text: applyPronunciation(scene.narration, project.pronunciation) });
        audioSeconds = (await setAudioLength(scene, audio)) ?? audioSeconds;
      }
      let image: LvAsset | undefined;
      if (steps.image) {
        const referenceUrls = await Promise.all(project.reference_paths.map((p) => signedUrl(p)));
        image = await runStep({ ...base, type: "image", prompt: buildImagePrompt(scene, project, style.promptSuffix),
          referenceUrls: referenceUrls.length ? referenceUrls : undefined });
      }
      if (steps.avatar && audio?.storage_path) {
        const portraitPath = project.portrait_path ?? image?.storage_path;
        if (!portraitPath) throw new Error("Kein Porträt vorhanden");
        const args = { ...base, type: "avatar", prompt: scene.image_prompt,
          imageUrl: await signedUrl(portraitPath), audioUrl: await signedUrl(audio.storage_path) };
        try {
          await runStep({ ...args, step: "avatar" });
        } catch (e) {
          if (!steps.avatarFallback) throw e;
          toast({ title: "Avatar: Ausweichmodell wird verwendet" });
          await runStep({ ...args, step: "avatar_fallback" });
        }
      } else if (steps.video && image?.storage_path) {
        await runStep({ ...base, type: "video", prompt: scene.image_prompt,
          imageUrl: await signedUrl(image.storage_path), duration: audioSeconds });
      }
    } catch (e) {
      toast({ title: `Szene ${scenes.findIndex((s) => s.id === scene.id) + 1}`, description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      throw e;
    } finally {
      setRunning((r) => { const n = new Set(r); n.delete(scene.id); return n; });
    }
  };

  const askRun = (sceneIds: string[]) => {
    if (!project) return;
    const credits = perScene * sceneIds.length;
    if (spent + credits > Number(project.cost_limit_credits)) {
      toast({
        title: "Kostenlimit würde überschritten",
        description: `Verbraucht ${spent}, geschätzt ${credits}, Limit ${project.cost_limit_credits} Credits.`,
        variant: "destructive",
      });
      return;
    }
    setPending({ sceneIds, credits });
  };

  const confirmRun = async () => {
    if (!pending) return;
    const ids = pending.sceneIds;
    setPending(null);
    for (const id of ids) {
      const scene = scenes.find((s) => s.id === id);
      if (!scene) continue;
      try {
        await runScene(scene);
      } catch {
        if (ids.length > 1 && !window.confirm("Eine Szene ist fehlgeschlagen. Mit den nächsten Szenen weitermachen?")) break;
      }
    }
  };

  const retryAsset = async (a: LvAsset) => {
    const est = configs.find((c) => c.model_id === a.model)?.est_credits ?? 0;
    if (!window.confirm(`Neu erzeugen kostet ca. ${est} Credits. Fortfahren?`)) return;
    if (project && spent + est > Number(project.cost_limit_credits)) {
      toast({ title: "Kostenlimit erreicht", variant: "destructive" });
      return;
    }
    const started = await invokeKie({ action: "regenerate", assetId: a.id });
    const done = await waitForAsset(started, upsertAsset, cancel.current);
    const scene = scenes.find((s) => s.id === a.scene_id);
    if (done.status === "done" && done.type === "audio" && scene) await setAudioLength(scene, done);
  };

  const playPreview = async () => {
    if (!project) return;
    setPreviewBusy(true);
    try {
      await new Audio(await previewVoice(project.voice)).play();
    } catch (e) {
      toast({ title: "Hörprobe fehlgeschlagen", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setPreviewBusy(false);
    }
  };

  const addReference = async (file: File | undefined, kind: "ref" | "portrait") => {
    if (!file || !project) return;
    try {
      const path = await uploadProjectFile(project.id, file, kind === "ref" ? "references" : "portrait");
      if (kind === "ref") await patchProject({ reference_paths: [...project.reference_paths, path] });
      else await patchProject({ portrait_path: path });
    } catch (e) {
      toast({ title: "Upload fehlgeschlagen", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  if (loading || !isAdmin || !project || !style) return null;
  const anyRunning = running.size > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AdminBreadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Lernvideo-Projekte", href: "/admin/lernvideos" },
        { label: project.title, active: true },
      ]} />
      <main className="container mx-auto px-6 pt-36 pb-16 max-w-5xl space-y-6">
        <Input className="text-2xl font-semibold h-auto py-2" value={project.title}
          onChange={(e) => setProject({ ...project, title: e.target.value })}
          onBlur={(e) => void patchProject({ title: e.target.value })} />

        <Card>
          <CardHeader><CardTitle>Briefing</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label>Thema</Label>
              <Textarea rows={2} value={project.topic} onChange={(e) => setProject({ ...project, topic: e.target.value })}
                onBlur={(e) => void patchProject({ topic: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Zielgruppe</Label>
              <Input value={project.audience} onChange={(e) => setProject({ ...project, audience: e.target.value })}
                onBlur={(e) => void patchProject({ audience: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Lernziel</Label>
              <Input value={project.learning_goal} onChange={(e) => setProject({ ...project, learning_goal: e.target.value })}
                onBlur={(e) => void patchProject({ learning_goal: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Stil</Label>
              <Select value={project.style} onValueChange={(v) => void patchProject({ style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WHITEBOARD_STYLES.filter((s) => configuredStyles.has(s.value)).map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Skriptart: {style.skriptart}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Länge</Label>
                <Select value={String(project.target_seconds)} onValueChange={(v) => void patchProject({ target_seconds: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[60, 90, 120].map((n) => <SelectItem key={n} value={String(n)}>{n} Sekunden</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Format</Label>
                <Select value={project.format} onValueChange={(v) => void patchProject({ format: v as "16:9" | "9:16" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="9:16">9:16</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => void generateScript()} disabled={scriptBusy || !project.topic.trim()}>
                {scriptBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Skript und Szenen erzeugen
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stimme</CardTitle>
              <CardDescription>Die Aussprache-Regeln gelten nur für die Vertonung, der Text bleibt unverändert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={project.voice} onValueChange={(v) => void patchProject({ voice: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VOICES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" onClick={() => void playPreview()} disabled={previewBusy}>
                  {previewBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  Hörprobe
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="block">Aussprache-Wörterbuch</Label>
                {project.pronunciation.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Wort" value={p.from} onChange={(e) => {
                      const next = [...project.pronunciation]; next[i] = { ...p, from: e.target.value };
                      setProject({ ...project, pronunciation: next });
                    }} onBlur={() => void patchProject({ pronunciation: project.pronunciation })} />
                    <Input placeholder="Aussprache" value={p.to} onChange={(e) => {
                      const next = [...project.pronunciation]; next[i] = { ...p, to: e.target.value };
                      setProject({ ...project, pronunciation: next });
                    }} onBlur={() => void patchProject({ pronunciation: project.pronunciation })} />
                    <Button variant="ghost" size="icon" aria-label="Regel entfernen"
                      onClick={() => void patchProject({ pronunciation: project.pronunciation.filter((_, j) => j !== i) })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline"
                  onClick={() => void patchProject({ pronunciation: [...project.pronunciation, { from: "KI", to: "Ka-I" }] })}>
                  <Plus className="w-4 h-4 mr-2" />Regel hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konsistenz</CardTitle>
              <CardDescription>Referenzbilder gehen bei jedem Bild mit. Figurenbeschreibungen fliessen ein, sobald der Name vorkommt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {project.reference_paths.map((p) => (
                  <div key={p} className="relative">
                    {refUrls[p] && <img src={refUrls[p]} alt="Referenzbild" className="h-16 w-16 object-cover rounded border border-border" />}
                    <button type="button" aria-label="Referenzbild entfernen"
                      className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-0.5"
                      onClick={() => void patchProject({ reference_paths: project.reference_paths.filter((x) => x !== p) })}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="h-16 w-16 flex items-center justify-center rounded border border-dashed border-border cursor-pointer text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={(e) => void addReference(e.target.files?.[0], "ref")} />
                </label>
              </div>
              {steps.avatar && (
                <div className="space-y-1">
                  <Label>Porträt für den Avatar (optional, sonst wird das Szenenbild verwendet)</Label>
                  <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void addReference(e.target.files?.[0], "portrait")} />
                  {project.portrait_path && <p className="text-xs text-muted-foreground">Porträt hinterlegt</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label className="block">Figuren</Label>
                {project.characters.map((c, i) => (
                  <div key={i} className="space-y-1 rounded-md border border-border p-2">
                    <div className="flex gap-2">
                      <Input placeholder="Name" value={c.name} onChange={(e) => {
                        const next = [...project.characters]; next[i] = { ...c, name: e.target.value };
                        setProject({ ...project, characters: next });
                      }} onBlur={() => void patchProject({ characters: project.characters })} />
                      <Button variant="ghost" size="icon" aria-label="Figur entfernen"
                        onClick={() => void patchProject({ characters: project.characters.filter((_, j) => j !== i) })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea rows={2} placeholder="Feste Beschreibung, z.B. Frau um die 40, kurze graue Haare, schieferblauer Pullover"
                      value={c.description} onChange={(e) => {
                        const next = [...project.characters]; next[i] = { ...c, description: e.target.value };
                        setProject({ ...project, characters: next });
                      }} onBlur={() => void patchProject({ characters: project.characters })} />
                  </div>
                ))}
                <Button size="sm" variant="outline"
                  onClick={() => void patchProject({ characters: [...project.characters, { name: "", description: "" }] })}>
                  <Plus className="w-4 h-4 mr-2" />Figur hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-wrap items-center gap-4">
            <div className="text-sm">
              <div>Verbraucht: <strong>{spent}</strong> von {project.cost_limit_credits} Credits</div>
              <div className="text-muted-foreground">Geschätzt pro Szene: ca. {perScene} Credits</div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Kostenlimit</Label>
              <Input type="number" className="w-28" value={project.cost_limit_credits}
                onChange={(e) => setProject({ ...project, cost_limit_credits: Number(e.target.value) })}
                onBlur={(e) => void patchProject({ cost_limit_credits: Number(e.target.value) })} />
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => void addScene()}><Plus className="w-4 h-4 mr-2" />Szene</Button>
              <Button disabled={!scenes.length || anyRunning} onClick={() => askRun(scenes.map((s) => s.id))}>
                {anyRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Alle Szenen erzeugen
              </Button>
            </div>
          </CardContent>
        </Card>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onDragEnd(e)}>
          <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {scenes.map((s, i) => (
                <SceneCard key={s.id} scene={s} index={i} assets={assets} steps={steps}
                  busy={running.has(s.id)}
                  onChange={(patch) => patchScene(s.id, patch)}
                  onDelete={() => void deleteScene(s.id)}
                  onRun={() => askRun([s.id])}
                  onRetry={(a) => void retryAsset(a)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generierung starten?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.sceneIds.length} Szene(n), geschätzt ca. {pending?.credits} Kie.ai-Credits.
              Bisher verbraucht: {spent} von {project.cost_limit_credits} Credits.
              Reihenfolge je Szene: Stimme, dann Bild, dann {steps.avatar ? "Avatar" : "Video"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRun()}>Starten</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </div>
  );
};

export default LernvideoProjectEditor;
