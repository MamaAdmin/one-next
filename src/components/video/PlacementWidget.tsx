import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Trash2, Video } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useVideoPlacements, type PlacementPosition } from "@/hooks/useVideoPlacements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const NONE = "__none__";
const POSITION_LABEL: Record<PlacementPosition, string> = {
  top: "Oben (unter dem Seitenkopf)",
  bottom: "Unten (vor der Fusszeile)",
};

/** Admin-only floating widget to create video placements on the current page. */
export function PlacementWidget() {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [position, setPosition] = useState<PlacementPosition>("bottom");
  const [videoId, setVideoId] = useState(NONE);
  const { placements, create, update, remove } = useVideoPlacements();
  const { videos, assignSlot } = useVideoLibrary();

  if (!isAdmin || pathname.startsWith("/admin")) return null;
  const here = placements.filter((p) => p.page_path === pathname);

  const fail = (e: unknown) =>
    toast({ title: "Speichern nicht möglich", description: (e as Error).message, variant: "destructive" });

  const add = async () => {
    if (!label.trim()) return;
    try {
      const slotKey = await create.mutateAsync({ label: label.trim(), page_path: pathname, position });
      if (videoId !== NONE) await assignSlot.mutateAsync({ slotKey, videoId });
      setLabel("");
      setVideoId(NONE);
      toast({ title: "Einsatzort angelegt" });
    } catch (e) {
      fail(e);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 bg-background shadow-md"
        onClick={() => setOpen(true)}
      >
        <Video className="mr-2 h-4 w-4" /> Video-Einsatzort
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Video-Einsatzorte auf dieser Seite</DialogTitle>
            <DialogDescription>Seite: {pathname}</DialogDescription>
          </DialogHeader>

          {here.length > 0 && (
            <div className="space-y-3">
              {here.map((p) => {
                const current = videos.find((v) => v.slot_key === p.slot_key);
                return (
                  <div key={p.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex gap-2">
                      <Input
                        defaultValue={p.label}
                        onBlur={(e) =>
                          e.target.value.trim() && e.target.value !== p.label &&
                          update.mutateAsync({ id: p.id, label: e.target.value.trim() }).catch(fail)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Einsatzort löschen"
                        onClick={() => window.confirm("Einsatzort löschen?") && remove.mutateAsync(p).catch(fail)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select
                        value={p.position}
                        onValueChange={(v) => update.mutateAsync({ id: p.id, position: v as PlacementPosition }).catch(fail)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["top", "bottom"] as const).map((k) => (
                            <SelectItem key={k} value={k}>{POSITION_LABEL[k]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={current?.id ?? NONE}
                        onValueChange={(v) =>
                          assignSlot.mutateAsync({ slotKey: p.slot_key, videoId: v === NONE ? null : v }).catch(fail)
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>Kein Video</SelectItem>
                          {videos.map((v) => <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <p className="font-medium">Neuen Einsatzort anlegen</p>
            <div className="space-y-1">
              <Label htmlFor="placement-label">Name</Label>
              <Input
                id="placement-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Startseite · unter dem Prozess"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as PlacementPosition)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["top", "bottom"] as const).map((k) => (
                      <SelectItem key={k} value={k}>{POSITION_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Video (optional)</Label>
                <Select value={videoId} onValueChange={setVideoId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Kein Video</SelectItem>
                    {videos.map((v) => <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={add} disabled={!label.trim() || create.isPending}>Einsatzort anlegen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
