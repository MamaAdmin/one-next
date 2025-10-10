import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Mail, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Enrollment {
  id: string;
  course_id: string;
  user_id: string | null;
  email: string;
  status: string;
  role: string;
  enrolled_at: string;
  courses: { title: string } | null;
}

interface Course {
  id: string;
  title: string;
}

export const EnrollmentManager = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    email: "",
    role: "participant",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select("*, courses(title)")
          .order("enrolled_at", { ascending: false }),
        supabase.from("courses").select("id, title").eq("is_active", true),
      ]);

      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (coursesRes.error) throw coursesRes.error;

      setEnrollments(enrollmentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert([formData]);

      if (error) throw error;

      toast({ title: "Erfolg", description: "Teilnehmer hinzugefügt" });
      setIsDialogOpen(false);
      setFormData({ course_id: "", email: "", role: "participant" });
      loadData();
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      toast({
        title: "Fehler",
        description: error.message || "Teilnehmer konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Teilnehmer wirklich entfernen?")) return;

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Teilnehmer entfernt" });
      loadData();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      toast({
        title: "Fehler",
        description: "Teilnehmer konnte nicht entfernt werden",
        variant: "destructive",
      });
    }
  };

  const sendInvitation = async (enrollment: Enrollment) => {
    toast({
      title: "Einladung versendet",
      description: `E-Mail an ${enrollment.email} wird versendet`,
    });
    // TODO: Implement email sending via edge function
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Teilnehmer-Verwaltung</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Teilnehmer hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Teilnehmer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="course">Kurs</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, course_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs auswählen" />
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
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="facilitator">Facilitator</SelectItem>
                    <SelectItem value="observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Hinzufügen
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{enrollment.email}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.courses?.title || "Unbekannter Kurs"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{enrollment.role}</Badge>
                  <Badge
                    variant={
                      enrollment.status === "active"
                        ? "default"
                        : enrollment.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendInvitation(enrollment)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Einladung
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(enrollment.id)}
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
