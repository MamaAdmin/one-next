import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { 
  PlusIcon,
  DotsIcon
} from "@/components/ui/custom-icons";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CourseCategory, categoryLabels, categoryColors, categoryOrder } from "@/lib/categoryMappings";

interface Resource {
  title: string;
  url: string;
}

interface Module {
  id: string;
  course_id: string;
  category: CourseCategory;
  title: string;
  description: string;
  module_type: string;
  duration_minutes: number;
  sort_order: number;
  content_text?: string;
  content_video_url?: string;
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
    const initializeCourses = async () => {
      const { data } = await supabase
        .from("lms_courses")
        .select("*")
        .order("title");
      setCourses(data || []);
      
      const courseParam = searchParams.get('course');
      if (courseParam) {
        setSelectedCourse(courseParam);
      } else if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    };
    initializeCourses();
  }, [searchParams]);

  useEffect(() => {
    if (selectedCourse) {
      loadModules();
      setSearchParams({ course: selectedCourse });
    }
  }, [selectedCourse]);

  const loadModules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lms_course_modules")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("sort_order");
    
    if (data) {
      // Sort by category order
      const transformedModules = data.map((module: any) => ({
        ...module,
        resources: module.resources || [],
        tags: module.tags || [],
        prerequisites: module.prerequisites || [],
        category: module.category as CourseCategory,
      }));
      
      transformedModules.sort((a, b) => {
        const orderA = categoryOrder.indexOf(a.category);
        const orderB = categoryOrder.indexOf(b.category);
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.sort_order - b.sort_order;
      });
      
      setModules(transformedModules);
    }
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
    const currentIndex = modules.findIndex((m) => m.id === module.id);
    if (currentIndex === -1) return;

    const sameCategoryModules = modules.filter(
      (m) => m.category === module.category
    );
    const moduleIndexInCategory = sameCategoryModules.findIndex(
      (m) => m.id === module.id
    );

    if (
      (direction === "up" && moduleIndexInCategory === 0) ||
      (direction === "down" &&
        moduleIndexInCategory === sameCategoryModules.length - 1)
    ) {
      return;
    }

    const newSortOrder =
      direction === "up"
        ? sameCategoryModules[moduleIndexInCategory - 1].sort_order
        : sameCategoryModules[moduleIndexInCategory + 1].sort_order;
    
    await supabase
      .from("lms_course_modules")
      .update({ sort_order: newSortOrder })
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
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Dauer</TableHead>
                    <TableHead>Sortierung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="font-medium">{module.title}</div>
                        {module.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {module.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[module.category]}>
                          {categoryLabels[module.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{module.module_type}</Badge>
                      </TableCell>
                      <TableCell>{module.duration_minutes} Min</TableCell>
                      <TableCell>{module.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
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
                                onClick={() => navigate(`/admin/lms/modules/${module.id}/preview?courseId=${selectedCourse}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vorschau
                              </DropdownMenuItem>
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
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.title}</span>
                      <Badge className={categoryColors[module.category]}>
                        {categoryLabels[module.category]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {module.module_type} • {module.duration_minutes} Min • #{module.sort_order}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/lms/modules/${module.id}/preview?courseId=${selectedCourse}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Vorschau
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/lms/modules/${module.id}/edit?courseId=${selectedCourse}`)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(module.id)}
                      >
                        Löschen
                      </Button>
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
