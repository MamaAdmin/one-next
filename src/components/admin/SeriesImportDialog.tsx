import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseSeriesMarkdown, type ParsedClip } from "@/features/whiteboard/series";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (clips: ParsedClip[]) => Promise<void> | void;
}

export const SeriesImportDialog = ({ open, onOpenChange, onImport }: Props) => {
  const [markdown, setMarkdown] = useState("");
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState(false);

  const parsed = useMemo<ParsedClip[]>(() => parseSeriesMarkdown(markdown), [markdown]);
  const selected = parsed.filter((_, index) => !skipped[index]);

  const handleImport = async () => {
    setBusy(true);
    try {
      await onImport(selected);
      setMarkdown("");
      setSkipped({});
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Clips aus Skript importieren</DialogTitle>
          <DialogDescription>
            Jede Überschrift mit „## “ wird ein Clip. Der Absatz nach „Sprechtext“ wird das Briefing,
            „Bildregie“, „Beispiel-Eingaben“ und „Merksatz“ werden als Notizen angehängt.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={markdown}
          onChange={(event) => {
            setMarkdown(event.target.value);
            setSkipped({});
          }}
          rows={10}
          placeholder={"## Titel des Clips\nSprechtext\nHier steht der gesprochene Text …"}
        />

        {parsed.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
            <p className="text-sm text-muted-foreground">{parsed.length} Clips erkannt</p>
            {parsed.map((clip, index) => (
              <label key={index} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                <Checkbox
                  checked={!skipped[index]}
                  onCheckedChange={(checked) =>
                    setSkipped((prev) => ({ ...prev, [index]: checked !== true }))
                  }
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{clip.title}</span>
                  <span className="block text-sm text-muted-foreground line-clamp-2">
                    {clip.topic ? clip.topic.slice(0, 160) : "Kein Briefing erkannt"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={busy || selected.length === 0}>
            {selected.length} Clips anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
