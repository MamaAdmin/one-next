import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useVideoLibrary, type LibraryVideo } from "@/hooks/useVideoLibrary";
import {
  PROVIDER_LABEL,
  VIDEO_SLOTS,
  detectProvider,
  isPlayableVideoUrl,
} from "@/features/video/slots";

const NONE = "__none__";

export function VideoLibraryManager() {
  const { videos, isLoading, createVideo, updateVideo, deleteVideo, assignSlot } =
    useVideoLibrary();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LibraryVideo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [slotKey, setSlotKey] = useState<string>(NONE);
  const [deleteTarget, setDeleteTarget] = useState<LibraryVideo | null>(null);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setSlotKey(NONE);
    setShowForm(false);
  };

  const startEdit = (video: LibraryVideo) => {
    setEditing(video);
    setTitle(video.title);
    setDescription(video.description ?? "");
    setVideoUrl(video.video_url);
    setSlotKey(video.slot_key ?? NONE);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !videoUrl.trim()) {
      toast({
        title: "Angaben fehlen",
        description: "Bitte Titel und Video-Link eintragen.",
        variant: "destructive",
      });
      return;
    }
    if (!isPlayableVideoUrl(videoUrl)) {
      toast({
        title: "Link wird nicht erkannt",
        description:
          "Bitte einen YouTube- oder Vimeo-Link oder eine direkte Videodatei (.mp4, .webm) angeben.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editing) {
        await updateVideo.mutateAsync({
          id: editing.id,
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl.trim(),
        });
        if ((editing.slot_key ?? NONE) !== slotKey) {
          if (slotKey === NONE) {
            await assignSlot.mutateAsync({
              slotKey: editing.slot_key as string,
              videoId: null,
            });
          } else {
            await assignSlot.mutateAsync({ slotKey, videoId: editing.id });
          }
        }
        toast({ title: "Video aktualisiert" });
      } else {
        await createVideo.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl.trim(),
          slot_key: slotKey === NONE ? null : slotKey,
        });
        toast({ title: "Video hinzugefügt" });
      }
      resetForm();
    } catch {
      toast({
        title: "Fehler",
        description: "Das Video konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async (slot: string, value: string) => {
    try {
      await assignSlot.mutateAsync({ slotKey: slot, videoId: value === NONE ? null : value });
      toast({ title: "Einsatzort aktualisiert" });
    } catch {
      toast({
        title: "Fehler",
        description: "Die Zuweisung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVideo.mutateAsync(deleteTarget.id);
      toast({ title: "Video gelöscht" });
    } catch {
      toast({
        title: "Fehler",
        description: "Das Video konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Einsatzorte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einsatzorte</CardTitle>
          <CardDescription>
            Lege fest, welches Video an welcher Stelle erscheint. Änderungen wirken sofort.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {VIDEO_SLOTS.map((slot) => {
            const current = videos.find((v) => v.slot_key === slot.key);
            return (
              <div
                key={slot.key}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">{slot.label}</div>
                  <div className="text-sm text-muted-foreground">{slot.hint}</div>
                  <div className="mt-1 text-sm">
                    {current ? (
                      <span className="text-foreground">Aktuell: {current.title}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Kein Video zugewiesen – es erscheint der Platzhalter.
                      </span>
                    )}
                  </div>
                </div>
                <Select
                  value={current?.id ?? NONE}
                  onValueChange={(value) => handleAssign(slot.key, value)}
                >
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue placeholder="Video wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Kein Video</SelectItem>
                    {videos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Formular */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg">
              {editing ? "Video bearbeiten" : "Neues Video"}
            </CardTitle>
            <CardDescription>
              YouTube- oder Vimeo-Link oder direkte Videodatei (.mp4, .webm), 16:9, 1080p empfohlen.
            </CardDescription>
          </div>
          {showForm ? (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="mr-2 h-4 w-4" /> Abbrechen
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Video hinzufügen
            </Button>
          )}
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="video-title">Titel</Label>
                <Input
                  id="video-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Problem Framing – Einführung"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-slot">Einsatzort (optional)</Label>
                <Select value={slotKey} onValueChange={setSlotKey}>
                  <SelectTrigger id="video-slot">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Kein Einsatzort</SelectItem>
                    {VIDEO_SLOTS.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video-Link</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://vimeo.com/123456789"
              />
              {videoUrl.trim() && (
                <p className="text-xs text-muted-foreground">
                  Erkannt als: {PROVIDER_LABEL[detectProvider(videoUrl)]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-description">Notiz (optional)</Label>
              <Textarea
                id="video-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Worum geht es im Video?"
              />
            </div>
            {videoUrl.trim() && (
              <div className="max-w-md">
                <VideoPlayer url={videoUrl} title="Vorschau" placeholder="Vorschau nicht möglich" />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>{editing ? "Speichern" : "Hinzufügen"}</Button>
              <Button variant="outline" onClick={resetForm}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Galerie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alle Videos</CardTitle>
          <CardDescription>{videos.length} Video(s) in der Bibliothek</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Wird geladen...</p>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground">
              <Video className="h-8 w-8" />
              <p className="text-sm">Noch keine Videos hinterlegt.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => {
                const slot = VIDEO_SLOTS.find((s) => s.key === video.slot_key);
                return (
                  <div key={video.id} className="space-y-3 rounded-lg border p-4">
                    <VideoPlayer url={video.video_url} title={video.title} />
                    <div className="space-y-1">
                      <div className="font-medium leading-snug">{video.title}</div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground">{video.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="secondary">
                          {PROVIDER_LABEL[detectProvider(video.video_url)]}
                        </Badge>
                        {slot && <Badge variant="outline">{slot.label}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(video)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(video)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Löschen
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Video löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.title}" wird aus der Bibliothek entfernt. Ist es einem Einsatzort
              zugewiesen, erscheint dort wieder der Platzhalter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VideoLibraryManager;
