import { useState } from "react";
import { usePublicCourses, useCourseDates, useCourseRegistrations, PublicCourse } from "@/hooks/usePublicCourses";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Calendar, Users, Video, Edit } from "lucide-react";

export default function PublicCourseDashboard() {
  const { courses, loading, createCourse, updateCourse, deleteCourse } = usePublicCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { dates, addDate, deleteDate } = useCourseDates(selectedCourseId);
  const { registrations } = useCourseRegistrations(selectedCourseId || undefined);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PublicCourse | null>(null);
  
  const [form, setForm] = useState({
    title: "", description: "", price_chf: 0, youtube_url: "", max_participants: 20, is_active: true,
  });

  const [dateForm, setDateForm] = useState({
    event_date: "", start_time: "", end_time: "", location: "", notes: "",
  });

  const handleCreate = async () => {
    await createCourse({
      title: form.title,
      description: form.description || null,
      price_chf: form.price_chf,
      youtube_url: form.youtube_url || null,
      max_participants: form.max_participants,
      is_active: form.is_active,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingCourse) return;
    await updateCourse(editingCourse.id, {
      title: form.title,
      description: form.description || null,
      price_chf: form.price_chf,
      youtube_url: form.youtube_url || null,
      max_participants: form.max_participants,
      is_active: form.is_active,
    });
    setEditingCourse(null);
    resetForm();
  };

  const handleAddDate = async () => {
    await addDate({
      event_date: dateForm.event_date,
      start_time: dateForm.start_time,
      end_time: dateForm.end_time || null,
      location: dateForm.location || null,
      notes: dateForm.notes || null,
    });
    setIsDateOpen(false);
    setDateForm({ event_date: "", start_time: "", end_time: "", location: "", notes: "" });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", price_chf: 0, youtube_url: "", max_participants: 20, is_active: true });
  };

  const openEdit = (course: PublicCourse) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description || "",
      price_chf: course.price_chf,
      youtube_url: course.youtube_url || "",
      max_participants: course.max_participants || 20,
      is_active: course.is_active,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "Kurse", active: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 py-8 mt-32 flex-1">
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">Kurse</TabsTrigger>
            <TabsTrigger value="dates" disabled={!selectedCourseId}>Termine</TabsTrigger>
            <TabsTrigger value="registrations" disabled={!selectedCourseId}>Anmeldungen</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kursangebot</CardTitle>
                    <CardDescription>Verwalten Sie Ihre öffentlichen Kurse</CardDescription>
                  </div>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Neuer Kurs
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Neuer Kurs</DialogTitle>
                        <DialogDescription>Erstellen Sie einen neuen Kurs</DialogDescription>
                      </DialogHeader>
                      <CourseForm form={form} setForm={setForm} />
                      <DialogFooter>
                        <Button onClick={handleCreate}>Erstellen</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kurs</TableHead>
                      <TableHead>Preis</TableHead>
                      <TableHead>Max. TN</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow
                        key={course.id}
                        className={selectedCourseId === course.id ? "bg-muted/50" : "cursor-pointer hover:bg-muted/30"}
                        onClick={() => setSelectedCourseId(course.id)}
                      >
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>CHF {course.price_chf}</TableCell>
                        <TableCell>{course.max_participants || "–"}</TableCell>
                        <TableCell>
                          {course.youtube_url ? (
                            <Video className="h-4 w-4 text-primary" />
                          ) : (
                            "–"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.is_active ? "default" : "secondary"}>
                            {course.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(course); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Kurstermine
                    </CardTitle>
                    <CardDescription>
                      Termine für: {courses.find((c) => c.id === selectedCourseId)?.title}
                    </CardDescription>
                  </div>
                  <Dialog open={isDateOpen} onOpenChange={setIsDateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Termin hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Neuer Termin</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Datum</Label>
                          <Input type="date" value={dateForm.event_date} onChange={(e) => setDateForm({ ...dateForm, event_date: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Startzeit</Label>
                            <Input type="time" value={dateForm.start_time} onChange={(e) => setDateForm({ ...dateForm, start_time: e.target.value })} />
                          </div>
                          <div className="grid gap-2">
                            <Label>Endzeit</Label>
                            <Input type="time" value={dateForm.end_time} onChange={(e) => setDateForm({ ...dateForm, end_time: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Ort</Label>
                          <Input value={dateForm.location} onChange={(e) => setDateForm({ ...dateForm, location: e.target.value })} placeholder="z.B. Zürich, Online" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Notizen</Label>
                          <Input value={dateForm.notes} onChange={(e) => setDateForm({ ...dateForm, notes: e.target.value })} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddDate}>Hinzufügen</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Zeit</TableHead>
                      <TableHead>Ort</TableHead>
                      <TableHead>Notizen</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dates.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{new Date(d.event_date).toLocaleDateString("de-CH")}</TableCell>
                        <TableCell>{d.start_time}{d.end_time ? ` – ${d.end_time}` : ""}</TableCell>
                        <TableCell>{d.location || "–"}</TableCell>
                        <TableCell>{d.notes || "–"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => deleteDate(d.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dates.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Keine Termine vorhanden
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Anmeldungen
                </CardTitle>
                <CardDescription>
                  Anmeldungen für: {courses.find((c) => c.id === selectedCourseId)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Zahlung</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.first_name} {r.last_name}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.phone || "–"}</TableCell>
                        <TableCell>{r.company || "–"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.payment_method === "twint" ? "Twint" : "Karte"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.payment_status === "paid" ? "default" : "secondary"}>
                            {r.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(r.registered_at).toLocaleDateString("de-CH")}</TableCell>
                      </TableRow>
                    ))}
                    {registrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Keine Anmeldungen vorhanden
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kurs bearbeiten</DialogTitle>
            </DialogHeader>
            <CourseForm form={form} setForm={setForm} />
            <DialogFooter>
              <Button onClick={handleUpdate}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}

function CourseForm({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Titel</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Beschreibung</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Preis (CHF)</Label>
          <Input type="number" value={form.price_chf} onChange={(e) => setForm({ ...form, price_chf: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="grid gap-2">
          <Label>Max. Teilnehmer</Label>
          <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>YouTube Video URL</Label>
        <Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
        <Label>Aktiv</Label>
      </div>
    </div>
  );
}
