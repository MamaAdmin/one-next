import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Layers, Pencil, Plus, Trash2, Video } from "lucide-react";
import type { WhiteboardVideoProject } from "@/features/whiteboard/types";
import {
  createSeries,
  deleteSeries,
  deleteSeriesWithClips,
  fetchSeriesClipSummary,
  fetchSeriesList,
  updateSeries,
  type WhiteboardVideoSeries,
} from "@/features/whiteboard/series";
import { IMAGE_MODEL, VIDEO_MODEL, VOICE_MODEL } from "@/features/whiteboard/pricing";
import { KieCreditsCard } from "@/components/admin/KieCreditsCard";
import { KieUsageStats } from "@/components/admin/KieUsageStats";
import { DashboardHeader, DashboardPage } from "@/components/admin/DashboardPage";

const statusLabel: Record<string, string> = {
  draft: "Entwurf",
  generating: "In Arbeit",
  ready: "Fertig",
  error: "Fehler",
};

const WhiteboardVideoDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();
  const [projects, setProjects] = useState<WhiteboardVideoProject[]>([]);
  const [busy, setBusy] = useState(false);
  const [seriesList, setSeriesList] = useState<WhiteboardVideoSeries[]>([]);
  const [seriesSummary, setSeriesSummary] = useState<
    Record<string, { total: number; ready: number; draft: number; error: number }>
  >({});
  const [openSeries, setOpenSeries] = useState<Record<string, boolean>>({});
  const [editSeries, setEditSeries] = useState<WhiteboardVideoSeries | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WhiteboardVideoSeries | null>(null);

  /** Clips je Serie, nach Position sortiert. */
  const clipsBySeries = useMemo(() => {
    const map: Record<string, WhiteboardVideoProject[]> = {};
    for (const project of projects) {
      const seriesId = (project as { series_id?: string | null }).series_id;
      if (!seriesId) continue;
      (map[seriesId] ??= []).push(project);
    }
    for (const list of Object.values(map)) {
      list.sort(
        (a, b) =>
          ((a as { position?: number | null }).position ?? 0) -
          ((b as { position?: number | null }).position ?? 0),
      );
    }
    return map;
  }, [projects]);

  const singleProjects = useMemo(
    () => projects.filter((p) => !(p as { series_id?: string | null }).series_id),
    [projects],
  );

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  const load = async () => {
    const { data, error } = await (supabase as any)
      .from("whiteboard_videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Laden fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    setProjects((data ?? []) as WhiteboardVideoProject[]);
  };

  const loadSeries = async () => {
    try {
      const [list, summary] = await Promise.all([fetchSeriesList(), fetchSeriesClipSummary()]);
      setSeriesList(list);
      setSeriesSummary(summary);
    } catch (error) {
      toast({
        title: "Serien konnten nicht geladen werden",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  const createNewSeries = async () => {
    setBusy(true);
    try {
      const series = await createSeries({
        title: "Neue Serie",
        image_model: IMAGE_MODEL,
        voice_model: VOICE_MODEL,
        video_model: VIDEO_MODEL,
      });
      navigate(`/admin/whiteboard-videos/serie/${series.id}`);
    } catch (error) {
      toast({
        title: "Serie konnte nicht angelegt werden",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void loadSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const createProject = async () => {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any)
      .from("whiteboard_videos")
      .insert({ user_id: userData.user?.id, title: "Neues Whiteboard-Video" })
      .select()
      .single();
    setBusy(false);
    if (error) {
      toast({ title: "Anlegen fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    navigate(`/admin/whiteboard-videos/${data.id}`);
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("whiteboard_videos").delete().eq("id", id);
    if (error) {
      toast({ title: "Löschen fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const openEdit = (series: WhiteboardVideoSeries) => {
    setEditSeries(series);
    setEditTitle(series.title ?? "");
    setEditDescription(series.description ?? "");
  };

  const saveEdit = async () => {
    if (!editSeries) return;
    setBusy(true);
    try {
      await updateSeries(editSeries.id, { title: editTitle, description: editDescription });
      setEditSeries(null);
      await loadSeries();
      toast({ title: "Serie gespeichert" });
    } catch (error) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const removeSeries = async (withClips: boolean) => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (withClips) await deleteSeriesWithClips(deleteTarget.id);
      else await deleteSeries(deleteTarget.id);
      setDeleteTarget(null);
      await Promise.all([loadSeries(), load()]);
      toast({
        title: "Serie gelöscht",
        description: withClips ? "Serie und Clips wurden entfernt." : "Die Clips bleiben als Einzelvideos erhalten.",
      });
    } catch (error) {
      toast({
        title: "Löschen fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Lernvideos", href: "/admin/whiteboard-videos", active: true }]} />
      <DashboardPage contentClassName="max-w-5xl">
          <DashboardHeader
            title="Lernvideos"
            description="Erklärvideos mit passenden Stilen, Stimmen und KI-Modellen erstellen."
            action={<>
                <Button variant="outline" asChild>
                  <Link to="/admin/stilbibliothek">Stilbibliothek</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/ki-modelle">KI-Modelle</Link>
                </Button>
                <Button variant="outline" onClick={createNewSeries} disabled={busy}>
                  <Layers className="w-4 h-4 mr-2" /> Neue Serie
                </Button>
                <Button onClick={createProject} disabled={busy}>
                  <Plus className="w-4 h-4 mr-2" /> Neues Video
                </Button>
              </>}
          />

          {seriesList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Serien</CardTitle>
                <CardDescription>Mehrere Clips mit gemeinsamen Einstellungen.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {seriesList.map((series) => {
                  const summary = seriesSummary[series.id] ?? { total: 0, ready: 0, draft: 0, error: 0 };
                  const clips = clipsBySeries[series.id] ?? [];
                  const expanded = openSeries[series.id] ?? false;
                  return (
                    <div key={series.id} className="overflow-hidden rounded-md border">
                      <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            aria-label={expanded ? "Clips ausblenden" : "Clips anzeigen"}
                            onClick={() =>
                              setOpenSeries((prev) => ({ ...prev, [series.id]: !expanded }))
                            }
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <Layers className="h-5 w-5 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/whiteboard-videos/serie/${series.id}`}
                              className="block truncate font-medium hover:underline"
                            >
                              {series.title}
                            </Link>
                            <p className="truncate text-sm text-muted-foreground">
                              {summary.total} Clips · {summary.ready} fertig · {summary.draft} offen
                              {summary.error ? ` · ${summary.error} Fehler` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/whiteboard-videos/serie/${series.id}`}>Öffnen</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Serie bearbeiten"
                            onClick={() => openEdit(series)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Serie löschen"
                            onClick={() => setDeleteTarget(series)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="border-t bg-muted/30 px-4 py-3">
                          {clips.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Noch keine Clips in dieser Serie.
                            </p>
                          ) : (
                            <ul className="grid gap-2">
                              {clips.map((clip, index) => (
                                <li
                                  key={clip.id}
                                  className="flex items-center justify-between gap-3 overflow-hidden"
                                >
                                  <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="w-6 shrink-0 text-sm text-muted-foreground">
                                      {index + 1}.
                                    </span>
                                    <Link
                                      to={`/admin/whiteboard-videos/${clip.id}`}
                                      className="truncate text-sm hover:underline"
                                    >
                                      {clip.title}
                                    </Link>
                                  </div>
                                  <Badge variant="secondary" className="shrink-0">
                                    {statusLabel[clip.status] ?? clip.status}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <KieCreditsCard />
          <KieUsageStats />

          {singleProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {seriesList.length > 0
                  ? "Alle Videos gehören zu einer Serie."
                  : "Noch kein Video angelegt."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {singleProjects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-5 overflow-hidden">
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                      <Video className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/admin/whiteboard-videos/${project.id}`}
                          className="font-medium hover:underline truncate block"
                        >
                          {project.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {(project.scenes ?? []).length} Abschnitte
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary">{statusLabel[project.status] ?? project.status}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => remove(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={editSeries !== null} onOpenChange={(open) => !open && setEditSeries(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Serie bearbeiten</DialogTitle>
                <DialogDescription>
                  Titel und Beschreibung ändern. Stil, Stimme und Modelle bearbeitest du auf der Serienseite.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titel</Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditSeries(null)}>
                  Abbrechen
                </Button>
                <Button onClick={() => void saveEdit()} disabled={busy || !editTitle.trim()}>
                  Speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Serie „{deleteTarget?.title}“ löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  {(clipsBySeries[deleteTarget?.id ?? ""] ?? []).length} Clips gehören dazu. Du kannst
                  sie behalten – sie erscheinen dann als Einzelvideos – oder mit der Serie löschen.
                  Das Löschen lässt sich nicht rückgängig machen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <Button variant="outline" disabled={busy} onClick={() => void removeSeries(false)}>
                  Nur Serie löschen
                </Button>
                <Button variant="destructive" disabled={busy} onClick={() => void removeSeries(true)}>
                  Serie und Clips löschen
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </DashboardPage>
      <Footer />
    </div>
  );
};

export default WhiteboardVideoDashboard;
