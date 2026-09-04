import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Video } from "lucide-react";
import type { WhiteboardVideoProject } from "@/features/whiteboard/types";

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
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">Whiteboard-Videos</CardTitle>
                <CardDescription>
                  Erklärvideos aus Text erzeugen: Skript, Zeichnungen und Sprecherstimme über kie.ai,
                  Animation und MP4-Export über Remotion.
                </CardDescription>
              </div>
              <Button onClick={createProject} disabled={busy}>
                <Plus className="w-4 h-4 mr-2" /> Neues Video
              </Button>
            </CardHeader>
          </Card>

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
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <Video className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <Link
                          to={`/admin/whiteboard-videos/${project.id}`}
                          className="font-medium hover:underline truncate block"
                        >
                          {project.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.topic || "Kein Briefing hinterlegt"}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhiteboardVideoDashboard;
