import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  duration_phases: number;
  is_active: boolean;
  created_at: string;
}

export const CourseManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_phases: 6,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Fehler",
        description: "Kurse konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update(formData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Erfolg", description: "Kurs aktualisiert" });
      } else {
        // Create new course
        const { error } = await supabase.from("courses").insert([formData]);

        if (error) throw error;
        toast({ title: "Erfolg", description: "Kurs erstellt" });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({ title: "", description: "", duration_phases: 6, is_active: true });
      loadCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Kurs wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Kurs gelöscht" });
      loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Fehler",
        description: "Kurs konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (course: Course) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_active: !course.is_active })
        .eq("id", course.id);

      if (error) throw error;
      loadCourses();
    } catch (error) {
      console.error("Error toggling course:", error);
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kursverwaltung</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Kurs
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Kurs bearbeiten" : "Neuer Kurs"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="duration">Anzahl Phasen</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_phases}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_phases: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="active">Kurs aktiv</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingCourse ? "Speichern" : "Erstellen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </div>
                <Badge variant={course.is_active ? "default" : "secondary"}>
                  {course.is_active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
              <div className="text-sm text-muted-foreground">
                {course.duration_phases} Phasen
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCourse(course);
                    setFormData({
                      title: course.title,
                      description: course.description,
                      duration_phases: course.duration_phases,
                      is_active: course.is_active,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Link to={`/admin/courses/${course.id}/modules`}>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Module
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(course)}
                >
                  <Switch checked={course.is_active} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
