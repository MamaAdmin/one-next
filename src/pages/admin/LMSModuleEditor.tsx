import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { ToolSelector } from "@/components/lms/ToolSelector";
import { LessonManager } from "@/components/lms/LessonManager";

interface Tool {
  name: string;
  url: string;
}

interface Resource {
  title: string;
  url: string;
}

interface Module {
  id?: string;
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

const LMSModuleEditor = () => {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const courseId = searchParams.get('courseId');
  const isEditing = !!moduleId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<{id: string, title: string}[]>([]);
  const [formData, setFormData] = useState({
    phase_number: 1,
    module_type: "Theory",
    duration_minutes: 30,
    tags: [] as string[],
  });

  useEffect(() => {
    if (courseId) {
      loadCourseName(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (moduleId) {
      loadModule(moduleId);
    }
  }, [moduleId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadCourseName = async (id: string) => {
    const { data } = await supabase
      .from("lms_courses")
      .select("title")
      .eq("id", id)
      .single();

    if (data) {
      setCourseName(data.title);
    }
  };

  const loadModule = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lms_course_modules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Modul konnte nicht geladen werden",
        variant: "destructive",
      });
      navigate("/admin/lms/modules");
    } else if (data) {
      const moduleData = {
        ...data,
        tools: Array.isArray(data.tools) ? (data.tools as unknown as Tool[]) : [],
        resources: Array.isArray(data.resources) ? (data.resources as unknown as Resource[]) : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
      };
      setModule(moduleData);
      setFormData({
        phase_number: data.phase_number,
        module_type: data.module_type,
        duration_minutes: data.duration_minutes,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });

      // Load linked tools from lms_module_tools
      const { data: linkedTools, error: toolsError } = await supabase
        .from("lms_module_tools")
        .select("tool_id, lms_tools(id, title)")
        .eq("module_id", id)
        .order("sort_order");
      
      if (!toolsError && linkedTools) {
        const toolIds = linkedTools.map(t => t.tool_id);
        const tools = linkedTools
          .map(t => t.lms_tools)
          .filter(Boolean) as {id: string, title: string}[];
        
        setSelectedToolIds(toolIds);
        setSelectedTools(tools);
      }
    }
    setLoading(false);
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!confirm("Ungespeicherte Änderungen verwerfen?")) return;
    }
    navigate(`/admin/lms/modules${courseId ? `?course=${courseId}` : ''}`);
  };

  const handleToolChange = async (toolIds: string[]) => {
    setSelectedToolIds(toolIds);
    setHasUnsavedChanges(true);
    
    if (toolIds.length > 0) {
      const { data } = await supabase
        .from("lms_tools")
        .select("id, title")
        .in("id", toolIds);
      
      if (data) {
        setSelectedTools(data);
      }
    } else {
      setSelectedTools([]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !courseId) return;

    setSaving(true);
    const formData = new FormData(formRef.current);

    // Parse JSON fields
    let resources: Resource[] = [];

    try {
      const resourcesJson = formData.get("resources_json") as string;
      if (resourcesJson?.trim()) {
        resources = JSON.parse(resourcesJson);
      }
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Resources JSON ist ungültig",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Parse comma-separated arrays
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const prereqsString = formData.get("prerequisites") as string;
    const prerequisites = prereqsString ? prereqsString.split(',').map(p => p.trim()).filter(Boolean) : [];

    const moduleData = {
      course_id: courseId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      phase_number: parseInt(formData.get("phase_number") as string),
      module_type: formData.get("module_type") as string,
      duration_minutes: parseInt(formData.get("duration_minutes") as string),
      sort_order: parseInt(formData.get("sort_order") as string),
      content_text: formData.get("content_text") as string,
      content_video_url: formData.get("content_video_url") as string,
      resources: resources as any,
      tags: tags,
      author: formData.get("author") as string,
      prerequisites: prerequisites,
      tool_recommendation: formData.get("tool_recommendation") as string,
    };

    if (isEditing && moduleId) {
      const { error } = await supabase
        .from("lms_course_modules")
        .update(moduleData)
        .eq("id", moduleId);

      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      // Update tools in lms_module_tools
      await supabase
        .from("lms_module_tools")
        .delete()
        .eq("module_id", moduleId);

      if (selectedToolIds.length > 0) {
        const toolLinks = selectedToolIds.map((toolId, index) => ({
          module_id: moduleId,
          tool_id: toolId,
          sort_order: index + 1,
          is_required: false
        }));

        const { error: toolsError } = await supabase
          .from("lms_module_tools")
          .insert(toolLinks);

        if (toolsError) {
          console.error("Tools konnten nicht gespeichert werden:", toolsError);
        }
      }

      toast({ title: "Erfolg", description: "Modul aktualisiert" });
      setHasUnsavedChanges(false);
      navigate(`/admin/lms/modules${courseId ? `?course=${courseId}` : ''}`);
    } else {
      const { data: newModule, error } = await supabase
        .from("lms_course_modules")
        .insert([moduleData])
        .select()
        .single();

      if (error) {
        toast({ title: "Fehler", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      // Link tools for new module
      if (newModule && selectedToolIds.length > 0) {
        const toolLinks = selectedToolIds.map((toolId, index) => ({
          module_id: newModule.id,
          tool_id: toolId,
          sort_order: index + 1,
          is_required: false
        }));

        await supabase
          .from("lms_module_tools")
          .insert(toolLinks);
      }

      toast({ title: "Erfolg", description: "Modul erstellt" });
      setHasUnsavedChanges(false);
      navigate(`/admin/lms/modules${courseId ? `?course=${courseId}` : ''}`);
    }

    setSaving(false);
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "LMS Module", href: "/admin/lms/modules" },
    { label: isEditing ? "Bearbeiten" : "Neu" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />

      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        {/* Sticky Header */}
        <div className="sticky top-32 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">
                  {isEditing ? "Modul bearbeiten" : "Neues Modul erstellen"}
                </h1>
              </div>
              {courseName && (
                <p className="text-muted-foreground ml-10">
                  Für Kurs: {courseName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Aktualisieren" : "Erstellen"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="general">Allgemein</TabsTrigger>
                    <TabsTrigger value="content">Inhalte</TabsTrigger>
                    <TabsTrigger value="lessons">Lektionen</TabsTrigger>
                    <TabsTrigger value="tools">Tools & Ressourcen</TabsTrigger>
                    <TabsTrigger value="meta">Meta</TabsTrigger>
                  </TabsList>

                  <form ref={formRef} onSubmit={handleSave} onChange={handleFormChange}>
                    {/* Tab 1: Allgemein */}
                    <TabsContent value="general" className="space-y-6">
                      <div>
                        <Label htmlFor="title">Titel *</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={module?.title}
                          placeholder="Modultitel eingeben..."
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
                          defaultValue={module?.description}
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
                            defaultValue={module?.phase_number || 1}
                            onChange={(e) => setFormData(prev => ({ ...prev, phase_number: parseInt(e.target.value) || 1 }))}
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
                            defaultValue={module?.sort_order || 1}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="module_type">Typ *</Label>
                          <Select name="module_type" defaultValue={module?.module_type || "Theory"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
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
                            defaultValue={module?.duration_minutes || 30}
                            required
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 2: Inhalte */}
                    <TabsContent value="content" className="space-y-6">
                      <div>
                        <Label htmlFor="content_text">Content (Markdown)</Label>
                        <Textarea
                          id="content_text"
                          name="content_text"
                          rows={10}
                          placeholder="Modulinhalte mit Markdown oder strukturiertem Text eingeben..."
                          defaultValue={module?.content_text}
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
                          defaultValue={module?.content_video_url}
                        />
                      </div>
                    </TabsContent>

                    {/* Tab: Lektionen */}
                    <TabsContent value="lessons" className="space-y-6">
                      {moduleId && (
                        <LessonManager moduleId={moduleId} />
                      )}
                      {!moduleId && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Bitte speichere das Modul zuerst, um Lektionen hinzuzufügen.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab 3: Tools & Ressourcen */}
                    <TabsContent value="tools" className="space-y-6">
                      <div>
                        <ToolSelector
                          selectedTools={selectedToolIds}
                          onChange={handleToolChange}
                          filterByPhase={formData.phase_number}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Tipp: Tools werden automatisch nach Phase gefiltert. 
                          Ändern Sie die Phase im Allgemein-Tab, um andere Tools zu sehen.
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
                          defaultValue={module?.resources ? JSON.stringify(module.resources) : ''}
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
                          defaultValue={module?.tool_recommendation}
                        />
                      </div>
                    </TabsContent>

                    {/* Tab 4: Meta */}
                    <TabsContent value="meta" className="space-y-6">
                      <div>
                        <Label htmlFor="tags">Tags / Lernziele</Label>
                        <Input
                          id="tags"
                          name="tags"
                          placeholder="#AI, #DesignSprint, #Innovation"
                          defaultValue={module?.tags?.join(', ')}
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
                          defaultValue={module?.author}
                        />
                      </div>

                      <div>
                        <Label htmlFor="prerequisites">Voraussetzungen</Label>
                        <Input
                          id="prerequisites"
                          name="prerequisites"
                          placeholder="Modulname oder ID (komma-getrennt)"
                          defaultValue={module?.prerequisites?.join(', ')}
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
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-48">
              <CardHeader>
                <CardTitle>Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Phase:</span> {formData.phase_number}
                  </div>
                  <div>
                    <span className="font-medium">Typ:</span> {formData.module_type}
                  </div>
                  <div>
                    <span className="font-medium">Dauer:</span> {formData.duration_minutes} Min
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div>
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedTools.length > 0 && (
                    <div>
                      <span className="font-medium">Tools:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTools.map((tool) => (
                          <Badge key={tool.id} variant="outline" className="text-xs">
                            {tool.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer isEditMode={false} />
    </div>
  );
};

export default LMSModuleEditor;
