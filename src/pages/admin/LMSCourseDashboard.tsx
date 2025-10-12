import { useState, useMemo } from "react";
import { useLMSCourse } from "@/hooks/useLMSCourse";
import { Button } from "@/components/ui/button";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseEditor } from "@/components/lms/CourseEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { 
  BookIcon, 
  LessonIcon, 
  QuizIcon, 
  TaskIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  DotsIcon,
  SortIcon
} from "@/components/ui/custom-icons";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LMSCourseDashboard() {
  const { courses, loading, deleteCourse, reload } = useLMSCourse();
  
  const [activeView, setActiveView] = useState<"list" | "create" | "edit">("list");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

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

  const handleDelete = async (id: string) => {
    if (confirm("Kurs wirklich löschen?")) {
      await deleteCourse(id);
    }
  };

  // Show editor if in create or edit mode
  if (activeView === "create" || activeView === "edit") {
    return (
      <CourseEditor 
        courseId={editingCourseId || undefined}
        onSave={() => {
          setActiveView("list");
          setEditingCourseId(null);
          reload();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbItems = useMemo(() => {
    const items: Array<{label: string; href?: string; icon?: React.ReactNode; active?: boolean}> = [
      { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
      { label: "LMS", href: "/admin", icon: <BookIcon className="h-4 w-4" /> },
      { label: "Kurse", active: true }
    ];
    
    return items;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
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
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Button onClick={() => setActiveView("create")}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Neuer Kurs
                </Button>
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
                        <SortIcon className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Kategorien</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                      <div className="flex items-center gap-2">
                        Datum
                        <SortIcon className="h-4 w-4" />
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
                          <DotsIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingCourseId(course.id);
                              setActiveView("edit");
                            }}>
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
                            <DotsIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCourseId(course.id);
                            setActiveView("edit");
                          }}>
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