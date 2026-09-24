import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ExternalLink, Loader2, Youtube } from "lucide-react";
import { VIDEO_SLOTS } from "@/features/video/slots";

const NONE = "__none__";

async function callYoutube<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("youtube", { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = (await error.context.json()).error ?? msg; } catch { /* ignore */ }
    }
    throw new Error(typeof msg === "string" ? msg : "Unbekannter Fehler");
  }
  return data as T;
}

interface YtStatus {
  configured: boolean; connected: boolean; redirectUri: string;
  channel_id?: string; channel_title?: string; expectedChannel: string;
}

/** Card in the video library: connect / disconnect the YouTube channel. */
export function YouTubeConnectionCard() {
  const [status, setStatus] = useState<YtStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => callYoutube<YtStatus>({ action: "status" }).then(setStatus).catch(() => setStatus(null));
  useEffect(() => {
    void load();
    const q = new URLSearchParams(window.location.search).get("youtube");
    if (q) {
      const msgs: Record<string, string> = {
        connected: "YouTube-Kanal verbunden.",
        otherchannel: "Verbunden – aber mit einem anderen Kanal als erwartet. Bitte mit dem one-next-Konto neu verbinden.",
        nochannel: "Dieses Google-Konto hat keinen YouTube-Kanal.",
        error: "Verbindung mit YouTube fehlgeschlagen.",
      };
      toast({ title: msgs[q] ?? "YouTube", variant: q === "connected" ? "default" : "destructive" });
      const url = new URL(window.location.href); url.searchParams.delete("youtube");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const { url } = await callYoutube<{ url: string }>({ action: "connect", returnUrl: window.location.href });
      window.location.href = url;
    } catch (e) {
      toast({ title: "Verbinden nicht möglich", description: (e as Error).message, variant: "destructive" });
      setBusy(false);
    }
  };
  const disconnect = async () => {
    setBusy(true);
    await callYoutube({ action: "disconnect" }).catch(() => null);
    await load(); setBusy(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Youtube className="w-5 h-5" /> YouTube-Kanal</CardTitle>
        <CardDescription>Fertige Videos können direkt auf eurem Kanal veröffentlicht und einem Einsatzort zugeordnet werden.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!status ? <p className="text-muted-foreground">Status wird geladen …</p>
          : !status.configured ? (
            <p className="text-muted-foreground">Die Google-Zugangsdaten fehlen noch. Weiterleitungsadresse für Google: <code className="break-all">{status.redirectUri}</code></p>
          ) : status.connected ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>Verbunden mit <strong>{status.channel_title ?? status.channel_id}</strong></span>
              {status.channel_id !== status.expectedChannel && <span className="text-destructive">Achtung: nicht der erwartete one-next-Kanal</span>}
              <Button variant="outline" size="sm" onClick={disconnect} disabled={busy}>Trennen</Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={busy}>YouTube-Kanal verbinden</Button>
          )}
      </CardContent>
    </Card>
  );
}

/** Slot choice + publish button, shown next to a finished server export. */
export function YouTubePublishPanel({ target, id, hasExport, defaultTitle, defaultDescription, slotKey, youtubeVideoId, youtubeStatus, youtubeError, onSlotChange, onPublished }: {
  target: "whiteboard" | "lernvideo"; id: string; hasExport: boolean;
  defaultTitle: string; defaultDescription?: string;
  slotKey: string | null; youtubeVideoId: string | null; youtubeStatus: string | null; youtubeError: string | null;
  onSlotChange: (slot: string | null) => void;
  onPublished?: (videoId: string) => void;
}) {
  const [title, setTitle] = useState(defaultTitle.slice(0, 100));
  const [description, setDescription] = useState(defaultDescription ?? "");
  const [busy, setBusy] = useState(false);
  const [ytId, setYtId] = useState(youtubeVideoId);
  const [err, setErr] = useState(youtubeStatus === "failed" ? youtubeError : null);

  const publish = async () => {
    if (!window.confirm("Video jetzt öffentlich auf YouTube veröffentlichen?")) return;
    setBusy(true); setErr(null);
    try {
      const r = await callYoutube<{ videoId: string; url: string; privacy?: string }>({
        action: "publish", target, id, title: title.trim(), description, slotKey,
      });
      setYtId(r.videoId); onPublished?.(r.videoId);
      toast({
        title: "Auf YouTube veröffentlicht",
        description: r.privacy && r.privacy !== "public"
          ? "YouTube hat das Video vorerst auf privat gesetzt (App noch nicht von Google geprüft)."
          : slotKey ? "Das Video erscheint jetzt am gewählten Einsatzort." : undefined,
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="font-medium flex items-center gap-2"><Youtube className="w-4 h-4" /> Auf YouTube veröffentlichen</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Einsatzort im Workshop</Label>
          <Select value={slotKey ?? NONE} onValueChange={(v) => onSlotChange(v === NONE ? null : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Kein Einsatzort</SelectItem>
              {VIDEO_SLOTS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Titel auf YouTube</Label>
          <Input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Beschreibung</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={publish} disabled={busy || !hasExport || !title.trim()}>
          {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wird hochgeladen …</> : ytId ? "Erneut veröffentlichen" : "Auf YouTube veröffentlichen"}
        </Button>
        {!hasExport && <span className="text-xs text-muted-foreground">Zuerst auf dem Server exportieren.</span>}
        {ytId && (
          <a href={`https://youtu.be/${ytId}`} target="_blank" rel="noreferrer" className="text-sm underline inline-flex items-center gap-1">
            Veröffentlicht – auf YouTube ansehen <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
