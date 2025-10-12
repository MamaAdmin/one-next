import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { 
  BookIcon, 
  LessonIcon, 
  QuizIcon, 
  TaskIcon,
  PlusIcon,
  DotsIcon
} from "@/components/ui/custom-icons";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Tool {
  name: string;
  url: string;
}

interface Resource {
  title: string;
  url: string;
}

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
  tools?: Tool[];
  resources?: Resource[];
  tags?: string[];
  author?: string;
  prerequisites?: string[];
  tool_recommendation?: string;
}

export default function LMSModuleDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

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
    const courseParam = searchParams.get('course');
    if (courseParam) {
      setSelectedCourse(courseParam);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
      setSearchParams({ course: selectedCourse });
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
    
    // Transform data to match Module interface
    const transformedData = (data || []).map(module => ({
      ...module,
      tools: Array.isArray(module.tools) ? (module.tools as unknown as Tool[]) : [],
      resources: Array.isArray(module.resources) ? (module.resources as unknown as Resource[]) : [],
      tags: Array.isArray(module.tags) ? module.tags : [],
      prerequisites: Array.isArray(module.prerequisites) ? module.prerequisites : [],
    }));
    
    setModules(transformedData);
    setLoading(false);
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

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Module", active: true }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Module Management</h1>
            <Button onClick={() => navigate(`/admin/lms/modules/new?courseId=${selectedCourse}`)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Neues Modul
            </Button>
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
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Dauer</TableHead>
                    <TableHead>Reihenfolge</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src="/placeholder.svg" 
                            alt={module.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <BookIcon className="h-3 w-3" />
                                Thema: 1
                              </span>
                              <span className="flex items-center gap-1">
                                <LessonIcon className="h-3 w-3" />
                                Lektion: {module.content_text ? 1 : 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <QuizIcon className="h-3 w-3" />
                                Test: 0
                              </span>
                              <span className="flex items-center gap-1">
                                <TaskIcon className="h-3 w-3" />
                                Aufgabe: 0
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Phase {module.phase_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{module.module_type}</Badge>
                      </TableCell>
                      <TableCell>{module.duration_minutes} Min</TableCell>
                      <TableCell>{module.sort_order}</TableCell>
                      <TableCell>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <DotsIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/lms/modules/${module.id}/edit?courseId=${selectedCourse}`)}
                              >
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(module.id)}
                              >
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img 
                        src="/placeholder.svg"
                        alt={module.title}
                        className="w-20 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{module.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          Phase {module.phase_number} • {module.module_type}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{module.duration_minutes} Min</Badge>
                          <Badge variant="outline">#{module.sort_order}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <DotsIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/lms/modules/${module.id}/edit?courseId=${selectedCourse}`)}
                          >
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(module.id)}
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