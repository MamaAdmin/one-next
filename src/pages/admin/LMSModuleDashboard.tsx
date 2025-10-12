import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse JSON fields
    let tools = [];
    let resources = [];
    try {
      const toolsJson = formData.get("tools_json") as string;
      if (toolsJson?.trim()) {
        tools = JSON.parse(toolsJson);
      }
    } catch (e) {
      toast({ 
        title: "Fehler", 
        description: "Tools JSON ist ungültig", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const resourcesJson = formData.get("resources_json") as string;
      if (resourcesJson?.trim()) {
        resources = JSON.parse(resourcesJson);
      }
    } catch (e) {
      toast({ 
        title: "Fehler", 
        description: "Resources JSON ist ungültig", 
        variant: "destructive" 
      });
      return;
    }
    
    // Parse comma-separated arrays
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    const prereqsString = formData.get("prerequisites") as string;
    const prerequisites = prereqsString ? prereqsString.split(',').map(p => p.trim()).filter(Boolean) : [];
    
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
      tools: tools,
      resources: resources,
      tags: tags,
      author: formData.get("author") as string,
      prerequisites: prerequisites,
      tool_recommendation: formData.get("tool_recommendation") as string,
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingModule(null)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Neues Modul
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? "Modul bearbeiten" : "Neues Modul erstellen"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Allgemein</TabsTrigger>
                  <TabsTrigger value="content">Inhalte</TabsTrigger>
                  <TabsTrigger value="tools">Tools & Ressourcen</TabsTrigger>
                  <TabsTrigger value="meta">Meta</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSave} className="mt-6">
                  <TabsContent value="general" className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titel *</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="Modultitel eingeben..."
                        defaultValue={editingModule?.title} 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Beschreibung</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        rows={4}
                        placeholder="Kurs- oder Modulbeschreibung eingeben..."
                        defaultValue={editingModule?.description} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Unterstützt: **bold**, *italic*, [links](url)
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phase_number">Phase *</Label>
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
                        <Label htmlFor="sort_order">Reihenfolge *</Label>
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
                        <Label htmlFor="module_type">Typ *</Label>
                        <Select name="module_type" defaultValue={editingModule?.module_type || "Theory"}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Theory">Theory</SelectItem>
                            <SelectItem value="Practice">Practice</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Case Study">Case Study</SelectItem>
                            <SelectItem value="Reflection">Reflection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration_minutes">Dauer (Minuten) *</Label>
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
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="content_text">Content (Markdown)</Label>
                      <Textarea 
                        id="content_text" 
                        name="content_text" 
                        rows={10}
                        placeholder="Modulinhalte mit Markdown oder strukturiertem Text eingeben..."
                        defaultValue={editingModule?.content_text}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Markdown-Syntax wird unterstützt
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="content_video_url">Video URL</Label>
                      <Input 
                        id="content_video_url" 
                        name="content_video_url" 
                        type="url"
                        placeholder="https://youtube.com/..."
                        defaultValue={editingModule?.content_video_url}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tools" className="space-y-6">
                    <div>
                      <Label>Interaktive Tools</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Verknüpfte Tools wie Miro, Mural, Gamma etc.
                      </p>
                      <Input 
                        id="tools_json" 
                        name="tools_json"
                        placeholder='[{"name":"Miro","url":"https://miro.com/..."}]'
                        defaultValue={editingModule?.tools ? JSON.stringify(editingModule.tools) : ''}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JSON-Format: Array von Objekten mit "name" und "url"
                      </p>
                    </div>
                    
                    <div>
                      <Label>Ressourcen & Dateien</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Externe Links, PDFs oder Confluence-Seiten
                      </p>
                      <Input 
                        id="resources_json" 
                        name="resources_json"
                        placeholder='[{"title":"Guide","url":"https://..."}]'
                        defaultValue={editingModule?.resources ? JSON.stringify(editingModule.resources) : ''}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JSON-Format: Array von Objekten mit "title" und "url"
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="tool_recommendation">Empfohlenes Tool</Label>
                      <Input 
                        id="tool_recommendation" 
                        name="tool_recommendation"
                        placeholder="z. B. Miro für Ideation-Phase"
                        defaultValue={editingModule?.tool_recommendation}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="meta" className="space-y-4">
                    <div>
                      <Label htmlFor="tags">Tags / Lernziele</Label>
                      <Input 
                        id="tags" 
                        name="tags"
                        placeholder="#AI, #DesignSprint, #Innovation"
                        defaultValue={editingModule?.tags?.join(', ')}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Komma-getrennte Stichworte zur Kategorisierung
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="author">Autor / Trainer</Label>
                      <Input 
                        id="author" 
                        name="author"
                        placeholder="Name des Autors"
                        defaultValue={editingModule?.author}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prerequisites">Voraussetzungen</Label>
                      <Input 
                        id="prerequisites" 
                        name="prerequisites"
                        placeholder="Modulname oder ID (komma-getrennt)"
                        defaultValue={editingModule?.prerequisites?.join(', ')}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Andere Module, die vorher abgeschlossen sein sollten
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex gap-2">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            DSGVO-Hinweis
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Keine personenbezogenen Daten oder internen Unternehmensinformationen in dieses Modul einfügen.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type="submit">
                      {editingModule ? "Aktualisieren" : "Erstellen"}
                    </Button>
                  </div>
                </form>
              </Tabs>
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
                              <DropdownMenuItem onClick={() => {
                                setEditingModule(module);
                                setDialogOpen(true);
                              }}>
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
                          <DropdownMenuItem onClick={() => {
                            setEditingModule(module);
                            setDialogOpen(true);
                          }}>
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