import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePublicCourses, useCourseDates, useCourseRegistrations, PublicCourse } from "@/hooks/usePublicCourses";
import { usePublicCourseModules, PublicCourseModule } from "@/hooks/usePublicCourseModules";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Calendar, Users, Video, Edit, BookOpen, ArrowUp, ArrowDown } from "lucide-react";

export default function PublicCourseDashboard() {
  const { courses, loading, createCourse, updateCourse, deleteCourse } = usePublicCourses();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("course");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { dates, addDate, deleteDate } = useCourseDates(selectedCourseId);
  const { registrations } = useCourseRegistrations(selectedCourseId || undefined);
  const { modules, addModule, updateModule, deleteModule } = usePublicCourseModules(selectedCourseId);

  useEffect(() => {
    if (!preselected || courses.length === 0) return;
    const match = courses.find((c) => c.id === preselected || c.slug === preselected);
    if (match) setSelectedCourseId(match.id);
  }, [preselected, courses]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PublicCourse | null>(null);
  const [editingModule, setEditingModule] = useState<PublicCourseModule | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", price_chf: 0, youtube_url: "", max_participants: 20, is_active: true,
  });

  const [dateForm, setDateForm] = useState({
    event_date: "", start_time: "", end_time: "", location: "", notes: "",
  });

  const [moduleForm, setModuleForm] = useState({
    title: "", module_type: "content", content_html: "", youtube_url: "", icon: "", itemsJson: "[]",
  });

  const handleCreate = async () => {
    await createCourse({
      title: form.title, description: form.description || null, price_chf: form.price_chf,
      youtube_url: form.youtube_url || null, max_participants: form.max_participants, is_active: form.is_active,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingCourse) return;
    await updateCourse(editingCourse.id, {
      title: form.title, description: form.description || null, price_chf: form.price_chf,
      youtube_url: form.youtube_url || null, max_participants: form.max_participants, is_active: form.is_active,
    });
    setEditingCourse(null);
    resetForm();
  };

  const handleAddDate = async () => {
    await addDate({
      event_date: dateForm.event_date, start_time: dateForm.start_time,
      end_time: dateForm.end_time || null, location: dateForm.location || null, notes: dateForm.notes || null,
    });
    setIsDateOpen(false);
    setDateForm({ event_date: "", start_time: "", end_time: "", location: "", notes: "" });
  };

  const handleAddModule = async () => {
    let items: any[] = [];
    try { items = JSON.parse(moduleForm.itemsJson); } catch { items = []; }
    const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.sort_order)) + 1 : 0;
    await addModule({
      title: moduleForm.title, module_type: moduleForm.module_type,
      content_html: moduleForm.content_html || null, youtube_url: moduleForm.youtube_url || null,
      icon: moduleForm.icon || null, items, sort_order: nextOrder,
    });
    setIsModuleOpen(false);
    resetModuleForm();
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    let items: any[] = [];
    try { items = JSON.parse(moduleForm.itemsJson); } catch { items = []; }
    await updateModule(editingModule.id, {
      title: moduleForm.title, module_type: moduleForm.module_type,
      content_html: moduleForm.content_html || null, youtube_url: moduleForm.youtube_url || null,
      icon: moduleForm.icon || null, items,
    });
    setEditingModule(null);
    resetModuleForm();
  };

  const handleMoveModule = async (mod: PublicCourseModule, direction: "up" | "down") => {
    const idx = modules.findIndex(m => m.id === mod.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;
    const other = modules[swapIdx];
    await updateModule(mod.id, { sort_order: other.sort_order });
    await updateModule(other.id, { sort_order: mod.sort_order });
  };

  const openEditModule = (mod: PublicCourseModule) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod.title, module_type: mod.module_type,
      content_html: mod.content_html || "", youtube_url: mod.youtube_url || "",
      icon: mod.icon || "", itemsJson: JSON.stringify(mod.items || [], null, 2),
    });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", price_chf: 0, youtube_url: "", max_participants: 20, is_active: true });
  };

  const resetModuleForm = () => {
    setModuleForm({ title: "", module_type: "content", content_html: "", youtube_url: "", icon: "", itemsJson: "[]" });
  };

  const openEdit = (course: PublicCourse) => {
    setEditingCourse(course);
    setForm({
      title: course.title, description: course.description || "", price_chf: course.price_chf,
      youtube_url: course.youtube_url || "", max_participants: course.max_participants || 20, is_active: course.is_active,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "Kurse", active: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 py-8 mt-32 flex-1 space-y-8">
        <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Hinweis: Kurs-Grunddaten (Titel, Beschreibung, Preis, Sichtbarkeit) werden jetzt in der{" "}
          <a href="/admin/lms/courses" className="underline text-primary">LMS Kursverwaltung</a>{" "}
          gepflegt. Hier verwalten Sie ausschließlich Termine, Module und Anmeldungen für Public Kurse.
        </div>
        {/* Kurse */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kursangebot</CardTitle>
                <CardDescription>Klicken Sie auf einen Kurs, um Termine, Module und Anmeldungen zu sehen</CardDescription>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" />Neuer Kurs</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuer Kurs</DialogTitle>
                    <DialogDescription>Erstellen Sie einen neuen Kurs</DialogDescription>
                  </DialogHeader>
                  <CourseForm form={form} setForm={setForm} />
                  <DialogFooter><Button onClick={handleCreate}>Erstellen</Button></DialogFooter>
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
                    className={`cursor-pointer ${selectedCourseId === course.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                    onClick={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                  >
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>CHF {course.price_chf}</TableCell>
                    <TableCell>{course.max_participants || "–"}</TableCell>
                    <TableCell>{course.youtube_url ? <Video className="h-4 w-4 text-primary" /> : "–"}</TableCell>
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

        {/* Details when course selected */}
        {selectedCourseId && (
          <>
            {/* Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5" />Module
                    </CardTitle>
                    <CardDescription>{courses.find(c => c.id === selectedCourseId)?.title}</CardDescription>
                  </div>
                  <Dialog open={isModuleOpen} onOpenChange={setIsModuleOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={resetModuleForm}><Plus className="mr-2 h-4 w-4" />Modul</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Neues Modul</DialogTitle></DialogHeader>
                      <ModuleFormUI form={moduleForm} setForm={setModuleForm} />
                      <DialogFooter><Button onClick={handleAddModule}>Hinzufügen</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Keine Module vorhanden</p>
                ) : (
                  <div className="space-y-3">
                    {modules.map((mod, idx) => (
                      <div key={mod.id} className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-6 text-center">{idx + 1}</span>
                          <div>
                            <p className="font-medium">{mod.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{mod.module_type}</Badge>
                              {mod.youtube_url && <Badge variant="outline" className="text-xs">Video</Badge>}
                              {Array.isArray(mod.items) && mod.items.length > 0 && (
                                <Badge variant="outline" className="text-xs">{mod.items.length} Items</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => handleMoveModule(mod, "up")}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={idx === modules.length - 1} onClick={() => handleMoveModule(mod, "down")}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditModule(mod)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteModule(mod.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Termine */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5" />Termine</CardTitle>
                      <CardDescription>{courses.find(c => c.id === selectedCourseId)?.title}</CardDescription>
                    </div>
                    <Dialog open={isDateOpen} onOpenChange={setIsDateOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Termin</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Neuer Termin</DialogTitle></DialogHeader>
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
                        <DialogFooter><Button onClick={handleAddDate}>Hinzufügen</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {dates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine Termine vorhanden</p>
                  ) : (
                    <div className="space-y-3">
                      {dates.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-md border">
                          <div>
                            <p className="font-medium">{new Date(d.event_date).toLocaleDateString("de-CH")}</p>
                            <p className="text-sm text-muted-foreground">
                              {d.start_time}{d.end_time ? ` – ${d.end_time}` : ""} · {d.location || "Kein Ort"}
                            </p>
                            {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteDate(d.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anmeldungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />Anmeldungen ({registrations.length})
                  </CardTitle>
                  <CardDescription>{courses.find(c => c.id === selectedCourseId)?.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine Anmeldungen vorhanden</p>
                  ) : (
                    <div className="space-y-3">
                      {registrations.map((r) => (
                        <div key={r.id} className="p-3 rounded-md border space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{r.first_name} {r.last_name}</p>
                            <Badge variant={r.payment_status === "paid" ? "default" : "secondary"}>
                              {r.payment_status === "paid" ? "Bezahlt" : r.payment_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{r.email}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            {r.phone && <span>📱 {r.phone}</span>}
                            {r.company && <span>🏢 {r.company}</span>}
                            <span>{r.payment_method === "twint" ? "Twint" : "Karte"}</span>
                            <span>{new Date(r.registered_at).toLocaleDateString("de-CH")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Edit Course Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Kurs bearbeiten</DialogTitle></DialogHeader>
            <CourseForm form={form} setForm={setForm} />
            <DialogFooter><Button onClick={handleUpdate}>Speichern</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Modul bearbeiten</DialogTitle></DialogHeader>
            <ModuleFormUI form={moduleForm} setForm={setModuleForm} />
            <DialogFooter><Button onClick={handleUpdateModule}>Speichern</Button></DialogFooter>
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

function ModuleFormUI({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Titel</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Der KI-Werkzeugkasten" />
      </div>
      <div className="grid gap-2">
        <Label>Modultyp</Label>
        <Select value={form.module_type} onValueChange={(v) => setForm({ ...form, module_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="content">Inhalt</SelectItem>
            <SelectItem value="steps">Schritte</SelectItem>
            <SelectItem value="checklist">Checkliste</SelectItem>
            <SelectItem value="glossary">Glossar</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Inhalt (HTML)</Label>
        <Textarea value={form.content_html} onChange={(e) => setForm({ ...form, content_html: e.target.value })} rows={4} placeholder="<p>Beschreibungstext...</p>" />
      </div>
      <div className="grid gap-2">
        <Label>Items (JSON)</Label>
        <Textarea value={form.itemsJson} onChange={(e) => setForm({ ...form, itemsJson: e.target.value })} rows={6}
          placeholder={form.module_type === "steps"
            ? '[{"step": 1, "title": "Schritt 1", "description": "..."}]'
            : form.module_type === "glossary"
            ? '[{"term": "Token", "definition": "..."}]'
            : form.module_type === "checklist"
            ? '[{"label": "Punkt 1"}]'
            : '[{"title": "Abschnitt", "description": "..."}]'
          }
        />
        <p className="text-xs text-muted-foreground">
          {form.module_type === "steps" && "Format: [{step, title, description}]"}
          {form.module_type === "glossary" && "Format: [{term, definition}]"}
          {form.module_type === "checklist" && "Format: [{label}]"}
          {form.module_type === "content" && "Format: [{title, description}]"}
          {form.module_type === "faq" && "Format: [{question, answer}]"}
        </p>
      </div>
      <div className="grid gap-2">
        <Label>YouTube URL (optional)</Label>
        <Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
      </div>
    </div>
  );
}
