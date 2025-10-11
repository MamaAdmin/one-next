import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Module {
  id: string;
  course_id: string;
  phase_number: number;
  title: string;
  description: string;
  module_type: string;
  duration_minutes: number;
  sort_order: number;
  content_text?: string;
  content_video_url?: string;
}

export default function LMSModuleDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("lms_courses")
      .select("*")
      .order("title");
    setCourses(data || []);
    if (data && data.length > 0) {
      setSelectedCourse(data[0].id);
    }
  };

  const loadModules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lms_course_modules")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("phase_number")
      .order("sort_order");
    setModules(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const moduleData = {
      course_id: selectedCourse,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      phase_number: parseInt(formData.get("phase_number") as string),
      module_type: formData.get("module_type") as string,
      duration_minutes: parseInt(formData.get("duration_minutes") as string),
      sort_order: parseInt(formData.get("sort_order") as string),
      content_text: formData.get("content_text") as string,
      content_video_url: formData.get("content_video_url") as string,
    };

    if (editingModule) {
      const { error } = await supabase
        .from("lms_course_modules")
        .update(moduleData)
        .eq("id", editingModule.id);
      
      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Erfolg", description: "Modul aktualisiert" });
      }
    } else {
      const { error } = await supabase
        .from("lms_course_modules")
        .insert([moduleData]);
      
      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Erfolg", description: "Modul erstellt" });
      }
    }

    setDialogOpen(false);
    setEditingModule(null);
    loadModules();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Modul wirklich löschen?")) return;
    
    const { error } = await supabase
      .from("lms_course_modules")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolg", description: "Modul gelöscht" });
      loadModules();
    }
  };

  const moveModule = async (module: Module, direction: "up" | "down") => {
    const newOrder = direction === "up" ? module.sort_order - 1 : module.sort_order + 1;
    
    await supabase
      .from("lms_course_modules")
      .update({ sort_order: newOrder })
      .eq("id", module.id);
    
    loadModules();
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Module Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingModule(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Neues Modul
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? "Modul bearbeiten" : "Neues Modul erstellen"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingModule?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingModule?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phase_number">Phase</Label>
                    <Input
                      id="phase_number"
                      name="phase_number"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue={editingModule?.phase_number || 1}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sort_order">Reihenfolge</Label>
                    <Input
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      min="1"
                      defaultValue={editingModule?.sort_order || 1}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="module_type">Typ</Label>
                    <Select name="module_type" defaultValue={editingModule?.module_type || "theory"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theory">Theory</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="artifact_upload">Artifact Upload</SelectItem>
                        <SelectItem value="voting">Voting</SelectItem>
                        <SelectItem value="user_testing">User Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Dauer (Min)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="1"
                      defaultValue={editingModule?.duration_minutes || 30}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content_text">Content (Markdown)</Label>
                  <Textarea
                    id="content_text"
                    name="content_text"
                    rows={6}
                    defaultValue={editingModule?.content_text}
                  />
                </div>
                <div>
                  <Label htmlFor="content_video_url">Video URL</Label>
                  <Input
                    id="content_video_url"
                    name="content_video_url"
                    type="url"
                    defaultValue={editingModule?.content_video_url}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingModule ? "Aktualisieren" : "Erstellen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Label>Kurs</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module für {courses.find(c => c.id === selectedCourse)?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{module.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Phase {module.phase_number} • {module.module_type} • {module.duration_minutes} Min
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModule(module, "up")}
                      disabled={module.sort_order === 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveModule(module, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingModule(module);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}