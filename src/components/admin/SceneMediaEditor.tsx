import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadClip, validateClipFile } from "@/features/whiteboard/clips";
import { MAX_CAPTIONS, type SceneCaption, type WhiteboardScene } from "@/features/whiteboard/types";

interface Props {
  scene: WhiteboardScene;
  videoId: string;
  onChange: (patch: Partial<WhiteboardScene>) => void;
  /** Erzeugt aus der Zeichnung einen bewegten Clip (Bild zu Video). */
  onGenerateAiClip?: () => void;
  aiClipBusy?: boolean;
}

export const SceneMediaEditor: React.FC<Props> = ({
  scene,
  videoId,
  onChange,
  onGenerateAiClip,
  aiClipBusy,
}) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [rawLength, setRawLength] = useState<number | null>(null);
  const media = scene.mediaType ?? "image";
  const isClip = media === "clip";
  const isAiClip = media === "ai_clip";
  const captions = scene.captions ?? [];

  const start = scene.clipStartInSeconds ?? 0;
  const end = scene.clipEndInSeconds;
  const trimmed = end && end > start ? end - start : rawLength ? rawLength - start : null;
  const target = scene.durationInSeconds || 0;

  const handleFile = async (file: File) => {
    const problem = validateClipFile(file);
    if (problem) {
      toast({ title: "Aufnahme nicht möglich", description: problem, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { path, url } = await uploadClip(videoId, scene.id, file);
      onChange({ mediaType: "clip", clipPath: path, clipUrl: url, clipStartInSeconds: 0, clipEndInSeconds: undefined });
      toast({ title: "Aufnahme hochgeladen" });
    } catch (error) {
      toast({
        title: "Hochladen fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const setCaption = (index: number, patch: Partial<SceneCaption>) =>
    onChange({ captions: captions.map((c, i) => (i === index ? { ...c, ...patch } : c)) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={media === "image" ? "default" : "outline"}
          onClick={() => onChange({ mediaType: "image" })}
        >
          Zeichnung
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAiClip ? "default" : "outline"}
          onClick={() => onChange({ mediaType: "ai_clip" })}
        >
          Bewegter KI-Clip
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isClip ? "default" : "outline"}
          onClick={() => onChange({ mediaType: "clip" })}
        >
          Eigene Aufnahme
        </Button>
      </div>

      {!isClip ? (
        <div className="space-y-2">
          <Label>Bildbeschreibung</Label>
          <Input
            value={scene.imagePrompt}
            onChange={(e) => onChange({ imagePrompt: e.target.value })}
          />
          {scene.imageUrl && (
            <img
              src={scene.imageUrl}
              alt={`Zeichnung für ${scene.heading}`}
              className="h-24 w-24 object-contain border rounded"
            />
          )}

          {isAiClip && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-2">
                <Label>Was bewegt sich?</Label>
                <Input
                  placeholder="z. B. Die Kamera fährt langsam auf die Figur zu, die Notizzettel flattern."
                  value={scene.motionPrompt ?? ""}
                  onChange={(e) => onChange({ motionPrompt: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Länge (Sekunden)</Label>
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    step={1}
                    className="w-28"
                    value={scene.aiClipSeconds ?? 5}
                    onChange={(e) =>
                      onChange({
                        aiClipSeconds: Math.min(10, Math.max(2, Number(e.target.value) || 5)),
                      })
                    }
                  />
                </div>
                {onGenerateAiClip && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={aiClipBusy || !scene.imageUrl}
                    onClick={onGenerateAiClip}
                  >
                    {aiClipBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {scene.aiClipUrl ? "Clip neu erzeugen" : "Clip erzeugen"}
                  </Button>
                )}
              </div>
              {!scene.imageUrl && (
                <p className="text-xs text-muted-foreground">
                  Zuerst die Zeichnung erzeugen – daraus entsteht die Bewegung.
                </p>
              )}
              {scene.aiClipUrl && (
                <video src={scene.aiClipUrl} controls className="w-full max-w-md rounded border" />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {scene.clipPath ? "Aufnahme ersetzen" : "Aufnahme hochladen"}
            </Button>
            <span className="text-xs text-muted-foreground">MP4 oder WEBM, höchstens 200 MB</span>
          </div>

          {scene.clipUrl && (
            <video
              src={scene.clipUrl}
              controls
              className="w-full max-w-md rounded border"
              onLoadedMetadata={(e) => setRawLength(e.currentTarget.duration)}
            />
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start (Sekunden)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={start}
                onChange={(e) => onChange({ clipStartInSeconds: Math.max(0, Number(e.target.value)) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ende (Sekunden)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                placeholder="bis zum Schluss"
                value={end ?? ""}
                onChange={(e) =>
                  onChange({
                    clipEndInSeconds: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {end !== undefined && end !== null && end <= start && (
            <p className="text-xs text-destructive">Das Ende muss grösser sein als der Start.</p>
          )}

          {trimmed !== null && target > 0 && (
            <p className="text-xs text-muted-foreground">
              {trimmed < target - 0.2
                ? `Die Aufnahme ist kürzer als die Sprecherstimme (${trimmed.toFixed(1)} s zu ${target.toFixed(1)} s). Das letzte Bild wird eingefroren.`
                : trimmed > target + 0.2
                  ? `Die Aufnahme ist länger als die Sprecherstimme (${trimmed.toFixed(1)} s zu ${target.toFixed(1)} s). Sie wird nach der Sprecherstimme abgeschnitten.`
                  : "Aufnahme und Sprecherstimme passen zusammen."}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Einblendungen</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {captions.length} von {MAX_CAPTIONS}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={captions.length >= MAX_CAPTIONS}
              onClick={() =>
                onChange({
                  captions: [...captions, { text: "", atSecond: 0, durationInSeconds: 3 }],
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Einblendung
            </Button>
          </div>
        </div>
        {captions.map((caption, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Text</Label>
              <Input value={caption.text} onChange={(e) => setCaption(i, { text: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ab Sekunde</Label>
              <Input
                type="number"
                min={0}
                step={0.5}
                className="w-28"
                value={caption.atSecond}
                onChange={(e) => setCaption(i, { atSecond: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dauer</Label>
              <Input
                type="number"
                min={1}
                step={0.5}
                className="w-24"
                value={caption.durationInSeconds}
                onChange={(e) => setCaption(i, { durationInSeconds: Number(e.target.value) })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange({ captions: captions.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneMediaEditor;
