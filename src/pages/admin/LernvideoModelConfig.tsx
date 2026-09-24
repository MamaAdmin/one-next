import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Save } from "lucide-react";

type ConfigRow = {
  id: string;
  style: string;
  step: string;
  model_id: string | null;
  api: string;
  default_params: Record<string, unknown>;
  notes: string;
  active: boolean;
};

type AssetRow = {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  model: string | null;
  storage_path: string | null;
  error_message: string | null;
  error_kind: string | null;
  cost_credits: number | null;
};

const STYLE_LABELS: Record<string, string> = {
  flat_2d: "Flat 2D / Vektor",
  character_2d: "2D Character Animation",
  iso_3d: "3D / Isometrisch",
  whiteboard: "Whiteboard / Legetrick",
  motion_graphics: "Motion Graphics und Infografik",
  kinetic_typography: "Kinetic Typography",
  screencast: "Screencast plus Animation",
  avatar: "Avatar / Presenter",
};
const STEP_LABELS: Record<string, string> = {
  audio: "Stimme",
  image: "Bild",
  video: "Video",
  avatar: "Avatar",
  avatar_fallback: "Avatar (Ausweichmodell)",
};
const POLL_MS = 15_000;

const invoke = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("kie-create-task", { body });
  if (error) throw error;
  return data.asset as AssetRow;
};

const ConfigCard = ({ row, onSaved }: { row: ConfigRow; onSaved: () => void }) => {
  const { toast } = useToast();
  const [modelId, setModelId] = useState(row.model_id ?? "");
  const [api, setApi] = useState(row.api);
  const [params, setParams] = useState(JSON.stringify(row.default_params, null, 2));
  const [notes, setNotes] = useState(row.notes);
  const [active, setActive] = useState(row.active);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(params || "{}");
    } catch {
      toast({ title: "Standardparameter sind kein gültiges JSON", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("style_model_config")
      .update({ model_id: modelId.trim() || null, api, default_params: parsed as never, notes, active })
      .eq("id", row.id);
    setBusy(false);
    if (error) toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Gespeichert" });
      onSaved();
    }
  };

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{STEP_LABELS[row.step] ?? row.step}</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Aktiv <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div className="space-y-1">
          <Label>Modell-ID</Label>
          <Input value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="leer = im Code / kein Modell" />
        </div>
        <div className="space-y-1">
          <Label>Schnittstelle</Label>
          <Select value={api} onValueChange={setApi}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jobs">Jobs (Market)</SelectItem>
              <SelectItem value="veo">Veo</SelectItem>
              <SelectItem value="code">Im Code</SelectItem>
              <SelectItem value="upload">Upload</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Standardparameter (JSON)</Label>
        <Textarea rows={3} className="font-mono text-xs" value={params} onChange={(e) => setParams(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Notiz</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button size="sm" variant="outline" onClick={() => void save()} disabled={busy}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Speichern
      </Button>
    </div>
  );
};

const LernvideoModelConfig = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ConfigRow[]>([]);
  const [testStyle, setTestStyle] = useState("flat_2d");
  const [testFormat, setTestFormat] = useState<"16:9" | "9:16">("16:9");
  const [testPrompt, setTestPrompt] = useState("Eine Lehrerin erklärt an einer Tafel, wie Photosynthese funktioniert.");
  const [asset, setAsset] = useState<AssetRow | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const load = async () => {
    const { data } = await supabase.from("style_model_config").select("*").order("style").order("step");
    setRows((data ?? []) as ConfigRow[]);
  };
  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  const stopPolling = () => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
  };
  useEffect(() => stopPolling, []);

  const applyAsset = async (a: AssetRow) => {
    setAsset(a);
    if (a.status === "done" && a.storage_path) {
      stopPolling();
      const { data } = await supabase.storage.from("lernvideo-assets").createSignedUrl(a.storage_path, 3600);
      setImageUrl(data?.signedUrl ?? null);
    } else if (a.status === "failed") {
      stopPolling();
    }
  };

  const startPolling = (id: string) => {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      try {
        await applyAsset(await invoke({ action: "status", assetId: id }));
      } catch {
        /* nächster Versuch in 15 Sekunden */
      }
    }, POLL_MS);
  };

  const run = async (regenerate: boolean) => {
    setStarting(true);
    setImageUrl(null);
    try {
      const a = regenerate && asset
        ? await invoke({ action: "regenerate", assetId: asset.id })
        : await invoke({ action: "create", type: "image", style: testStyle, prompt: testPrompt, format: testFormat });
      await applyAsset(a);
      if (a.status === "running" || a.status === "queued") startPolling(a.id);
    } catch (e) {
      toast({ title: "Start fehlgeschlagen", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  if (loading || !isAdmin) return null;
  const styles = Array.from(new Set(rows.map((r) => r.style)));
  const imageStyles = rows.filter((r) => r.step === "image" && r.model_id && r.api === "jobs").map((r) => r.style);
  const working = asset?.status === "running" || asset?.status === "queued";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Lernvideo-Modelle", active: true }]} />
      <main className="container mx-auto px-6 pt-36 pb-16 max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Lernvideo-Modelle</h1>
          <p className="text-muted-foreground mt-2">
            Legt pro Stil und Schritt fest, welches Kie.ai-Modell verwendet wird. Änderungen gelten sofort für neue Aufträge.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testbild erzeugen</CardTitle>
            <CardDescription>Erzeugt ein einzelnes Bild mit dem Bildmodell des gewählten Stils.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Stil</Label>
                <Select value={testStyle} onValueChange={setTestStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((s) => (
                      <SelectItem key={s} value={s}>{STYLE_LABELS[s] ?? s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Format</Label>
                <Select value={testFormat} onValueChange={(v) => setTestFormat(v as "16:9" | "9:16")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Querformat)</SelectItem>
                    <SelectItem value="9:16">9:16 (Hochformat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Bildprompt</Label>
              <Textarea rows={3} value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void run(false)} disabled={starting || working || !testPrompt.trim()}>
                {starting || working ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Testbild erzeugen
              </Button>
              {asset && !working && (
                <Button variant="outline" onClick={() => void run(true)} disabled={starting}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Neu erzeugen
                </Button>
              )}
            </div>
            {asset && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant={asset.status === "failed" ? "destructive" : "secondary"}>{asset.status}</Badge>
                  {asset.model && <span className="text-muted-foreground">{asset.model}</span>}
                  {asset.cost_credits != null && <span className="text-muted-foreground">{asset.cost_credits} Credits</span>}
                  {working && <span className="text-muted-foreground">Status wird alle 15 Sekunden geprüft …</span>}
                </div>
                {asset.error_message && <p className="text-sm text-destructive">{asset.error_message}</p>}
                {imageUrl && (
                  <img src={imageUrl} alt="Erzeugtes Testbild" className="rounded-md border border-border max-h-[480px]" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {styles.map((style) => (
          <Card key={style}>
            <CardHeader>
              <CardTitle className="text-xl">{STYLE_LABELS[style] ?? style}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {rows.filter((r) => r.style === style).map((r) => (
                <ConfigCard key={r.id} row={r} onSaved={() => void load()} />
              ))}
            </CardContent>
          </Card>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default LernvideoModelConfig;
