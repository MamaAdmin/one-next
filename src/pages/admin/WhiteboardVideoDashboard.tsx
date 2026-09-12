import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Layers, Plus, Trash2, Video } from "lucide-react";
import type { WhiteboardVideoProject } from "@/features/whiteboard/types";
import {
  createSeries,
  fetchSeriesClipSummary,
  fetchSeriesList,
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
                  return (
                    <div
                      key={series.id}
                      className="flex items-center justify-between gap-4 overflow-hidden rounded-md border p-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
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
                      <Button variant="outline" size="sm" asChild className="shrink-0">
                        <Link to={`/admin/whiteboard-videos/serie/${series.id}`}>Öffnen</Link>
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <KieCreditsCard />
          <KieUsageStats />

          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Noch kein Video angelegt.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
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
      </DashboardPage>
      <Footer />
    </div>
  );
};

export default WhiteboardVideoDashboard;
