import { useState } from "react";
import { useLMSCourse } from "@/hooks/useLMSCourse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function LMSCourseDashboard() {
  const { courses, loading, createCourse, updateCourse, deleteCourse } = useLMSCourse();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_type: "5-day-sprint",
    price_chf: 2990,
  });

  const handleSubmit = async () => {
    if (editingId) {
      await updateCourse(editingId, formData);
    } else {
      await createCourse(formData);
    }
    setIsCreateOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", course_type: "5-day-sprint", price_chf: 2990 });
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      course_type: course.course_type,
      price_chf: course.price_chf,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Kurs wirklich löschen?")) {
      await deleteCourse(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kurs-Verwaltung</CardTitle>
              <CardDescription>Verwalten Sie alle verfügbaren Kurse</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingId(null);
                  setFormData({ title: "", description: "", course_type: "5-day-sprint", price_chf: 2990 });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Kurs
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Kurs bearbeiten" : "Neuer Kurs"}
                  </DialogTitle>
                  <DialogDescription>
                    Geben Sie die Kurs-Daten ein
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="course_type">Kurstyp</Label>
                    <Select
                      value={formData.course_type}
                      onValueChange={(value) => setFormData({ ...formData, course_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-day-sprint">5-Day Sprint</SelectItem>
                        <SelectItem value="problem-framing">Problem Framing</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price_chf">Preis (CHF)</Label>
                    <Input
                      id="price_chf"
                      type="number"
                      value={formData.price_chf}
                      onChange={(e) => setFormData({ ...formData, price_chf: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>
                    {editingId ? "Aktualisieren" : "Erstellen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.course_type}</TableCell>
                  <TableCell>{course.module_count || 0} Module</TableCell>
                  <TableCell>CHF {course.price_chf}</TableCell>
                  <TableCell>{course.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
