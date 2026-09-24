import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { styleLabel } from "@/features/whiteboard/styles";
import { db, type LvProject } from "@/features/lernvideo/api";

const LernvideoProjects = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<LvProject[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void db.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }: { data: LvProject[] | null }) => setProjects(data ?? []));
  }, [isAdmin]);

  const create = async () => {
    const { data, error } = await db.from("projects")
      .insert({ title: title.trim() || "Neues Lernvideo", style: "flat_2d" })
      .select("id").single();
    if (error) return toast({ title: "Anlegen fehlgeschlagen", description: error.message, variant: "destructive" });
    navigate(`/admin/lernvideos/${data.id}`);
  };

  if (loading || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Lernvideo-Projekte", active: true }]} />
      <main className="container mx-auto px-6 pt-36 pb-16 max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Lernvideo-Projekte</h1>
            <p className="text-muted-foreground mt-2">Vom Skript über Szenen bis zu Stimme, Bild und Video.</p>
          </div>
          <Link to="/admin/lernvideo-modelle" className="text-sm underline text-muted-foreground">Modelle verwalten</Link>
        </div>
        <Card>
          <CardContent className="pt-6 flex gap-2">
            <Input placeholder="Titel des Lernvideos" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={() => void create()}><Plus className="w-4 h-4 mr-2" />Projekt anlegen</Button>
          </CardContent>
        </Card>
        {projects.map((p) => (
          <Link key={p.id} to={`/admin/lernvideos/${p.id}`} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{styleLabel(p.style)} · {p.format} · {p.target_seconds} s</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default LernvideoProjects;
