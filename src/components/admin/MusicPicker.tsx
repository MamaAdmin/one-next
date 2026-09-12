import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, Trash2, Upload } from "lucide-react";
import { removeMusic, uploadMusic, validateMusicFile } from "@/features/whiteboard/music";

interface MusicPickerProps {
  videoId: string;
  url: string | null;
  path: string | null;
  volume: number;
  onChange: (patch: { music_url: string | null; music_path: string | null }) => void;
  onVolumeChange: (volume: number) => void;
}

export const MusicPicker = ({
  videoId,
  url,
  path,
  volume,
  onChange,
  onVolumeChange,
}: MusicPickerProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(path ? "" : (url ?? ""));

  const handleFile = async (file: File) => {
    const problem = validateMusicFile(file);
    if (problem) {
      toast({ title: "Datei nicht möglich", description: problem, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const result = await uploadMusic(videoId, file);
      setDraft("");
      onChange({ music_url: result.url, music_path: result.path });
      toast({ title: "Musik hochgeladen" });
    } catch (error) {
      toast({
        title: "Hochladen fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (path) {
      try {
        await removeMusic(path);
      } catch {
        /* Datei ggf. bereits entfernt */
      }
    }
    setDraft("");
    onChange({ music_url: null, music_path: null });
  };

  return (
    <div className="space-y-3">
      <Label>Hintergrundmusik</Label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Musik hochladen
        </Button>
        {url && (
          <Button type="button" size="sm" variant="ghost" onClick={() => void handleRemove()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Entfernen
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-normal text-muted-foreground">
          Oder eine direkte Musik-Adresse
        </Label>
        <Input
          placeholder="https://…/musik.mp3"
          value={path ? "" : draft}
          disabled={Boolean(path)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange({ music_url: draft.trim() || null, music_path: null })}
        />
      </div>

      {url && (
        <div className="flex items-center gap-2 rounded-md border p-2">
          <Music className="h-4 w-4 shrink-0 text-muted-foreground" />
          <audio src={url} controls className="h-8 w-full" />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-normal text-muted-foreground">
          Lautstärke: {Math.round(volume * 100)} %
        </Label>
        <Slider
          value={[Math.round(volume * 100)]}
          min={0}
          max={60}
          step={1}
          onValueChange={([next]) => onVolumeChange(next / 100)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Läuft leise unter der Sprecherstimme. Pixabay-Links sind Webseiten: dort zuerst die
        MP3 herunterladen und hier hochladen.
      </p>
    </div>
  );
};
