import { useState, useMemo } from "react";
import { useLMSCourse } from "@/hooks/useLMSCourse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Plus, Search, Filter, Download, MoreVertical, ArrowUpDown } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LMSCourseDashboard() {
  const { courses, loading, createCourse, updateCourse, deleteCourse } = useLMSCourse();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_type: "5-day-sprint",
    price_chf: 2990,
    thumbnail_url: "",
    skill_level: "Alle Schwierigkeitsgrade",
    total_lessons: 0,
    total_quizzes: 0,
    completion_deadline_days: 30,
    includes_certificate: true,
    language: "Deutsch",
    prerequisites: "",
  });

  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || course.course_type === filterCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [courses, searchQuery, filterCategory, sortBy, sortOrder]);

  const toggleSort = (column: "title" | "date") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCourses.size === filteredAndSortedCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredAndSortedCourses.map(c => c.id)));
    }
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateCourse(editingId, formData);
    } else {
      await createCourse(formData);
    }
    setIsCreateOpen(false);
    setEditingId(null);
    setFormData({ 
      title: "", 
      description: "", 
      course_type: "5-day-sprint", 
      price_chf: 2990,
      thumbnail_url: "",
      skill_level: "Alle Schwierigkeitsgrade",
      total_lessons: 0,
      total_quizzes: 0,
      completion_deadline_days: 30,
      includes_certificate: true,
      language: "Deutsch",
      prerequisites: "",
    });
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      course_type: course.course_type,
      price_chf: course.price_chf,
      thumbnail_url: course.thumbnail_url || "",
      skill_level: course.skill_level || "Alle Schwierigkeitsgrade",
      total_lessons: course.total_lessons || 0,
      total_quizzes: course.total_quizzes || 0,
      completion_deadline_days: course.completion_deadline_days || 30,
      includes_certificate: course.includes_certificate ?? true,
      language: course.language || "Deutsch",
      prerequisites: course.prerequisites || "",
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Kurs-Verwaltung</CardTitle>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      <SelectItem value="5-day-sprint">5-Day Sprint</SelectItem>
                      <SelectItem value="problem-framing">Problem Framing</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingId(null);
                      setFormData({ 
                        title: "", 
                        description: "", 
                        course_type: "5-day-sprint", 
                        price_chf: 2990,
                        thumbnail_url: "",
                        skill_level: "Alle Schwierigkeitsgrade",
                        total_lessons: 0,
                        total_quizzes: 0,
                        completion_deadline_days: 30,
                        includes_certificate: true,
                        language: "Deutsch",
                        prerequisites: "",
                      });
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Neuer Kurs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                      <div className="grid gap-2">
                        <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                        <Input
                          id="thumbnail_url"
                          value={formData.thumbnail_url}
                          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="skill_level">Skill Level</Label>
                        <Select
                          value={formData.skill_level}
                          onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Alle Schwierigkeitsgrade">Alle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="total_lessons">Anzahl Lessons</Label>
                        <Input
                          id="total_lessons"
                          type="number"
                          value={formData.total_lessons}
                          onChange={(e) => setFormData({ ...formData, total_lessons: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="total_quizzes">Anzahl Quizzes</Label>
                        <Input
                          id="total_quizzes"
                          type="number"
                          value={formData.total_quizzes}
                          onChange={(e) => setFormData({ ...formData, total_quizzes: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="completion_deadline_days">Abschlussfrist (Tage)</Label>
                        <Input
                          id="completion_deadline_days"
                          type="number"
                          value={formData.completion_deadline_days}
                          onChange={(e) => setFormData({ ...formData, completion_deadline_days: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="language">Sprache</Label>
                        <Input
                          id="language"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prerequisites">Voraussetzungen</Label>
                        <Textarea
                          id="prerequisites"
                          value={formData.prerequisites}
                          onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="includes_certificate"
                          checked={formData.includes_certificate}
                          onCheckedChange={(checked) => setFormData({ ...formData, includes_certificate: !!checked })}
                        />
                        <Label htmlFor="includes_certificate">Zertifikat bei Abschluss</Label>
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
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCourses.size === filteredAndSortedCourses.length && filteredAndSortedCourses.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
                      <div className="flex items-center gap-2">
                        Titel
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Kategorien</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                      <div className="flex items-center gap-2">
                        Datum
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCourses.has(course.id)}
                          onCheckedChange={() => toggleCourseSelection(course.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={course.thumbnail_url || "/placeholder.svg"} 
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-xs text-muted-foreground">
                              📚 Thema: {course.module_count || 0} | 
                              📖 Lektion: {course.total_lessons || 0} | 
                              📝 Test: {course.total_quizzes || 0} | 
                              📋 Aufgabe: 0
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.course_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {course.price_chf === 0 ? (
                          <Badge variant="secondary">Kostenlos</Badge>
                        ) : (
                          <span className="font-medium">CHF {course.price_chf}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={course.author_avatar || "/placeholder.svg"} />
                            <AvatarFallback>MA</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{course.author_name || "Admin"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(course.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                          <div className="text-xs text-muted-foreground">
                            {new Date(course.created_at).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={course.is_active ? "default" : "secondary"}
                          className={course.is_active ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {course.is_active ? "Veröffentlicht" : "Entwurf"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(course)}>
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(course.id)}
                            >
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredAndSortedCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img 
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-20 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {course.course_type}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={course.is_active ? "default" : "secondary"}>
                            {course.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                          <span className="text-sm font-medium">
                            CHF {course.price_chf}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(course)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}