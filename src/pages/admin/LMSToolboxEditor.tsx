import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToolbox } from "@/hooks/useToolbox";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Save, X } from "lucide-react";

export default function LMSToolboxEditor() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { createTool, updateTool } = useToolbox();
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "understand",
    phase_number: 1,
    tool_type: "external",
    external_url: "",
    embed_code: "",
    template_data: "",
    thumbnail_url: "",
    tags: "",
    is_active: true,
  });

  useEffect(() => {
    if (toolId && toolId !== "new") {
      loadTool();
    }
  }, [toolId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadTool = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lms_tools")
        .select("*")
        .eq("id", toolId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          category: data.category || "understand",
          phase_number: data.phase_number || 1,
          tool_type: data.tool_type || "external",
          external_url: data.external_url || "",
          embed_code: data.embed_code || "",
          template_data: data.template_data ? JSON.stringify(data.template_data, null, 2) : "",
          thumbnail_url: data.thumbnail_url || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading tool:", error);
      toast({
        title: "Fehler",
        description: "Tool konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: !toolId || toolId === "new" ? generateSlug(value) : prev.slug,
    }));
    handleFormChange();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Sie haben ungespeicherte Änderungen. Möchten Sie wirklich fortfahren?"
      );
      if (!confirmed) return;
    }
    navigate("/admin/lms/toolbox");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const toolData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || undefined,
        category: formData.category,
        phase_number: formData.phase_number || undefined,
        tool_type: formData.tool_type,
        external_url: formData.external_url || undefined,
        embed_code: formData.embed_code || undefined,
        template_data: formData.template_data
          ? JSON.parse(formData.template_data)
          : undefined,
        thumbnail_url: formData.thumbnail_url || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : undefined,
        is_active: formData.is_active,
      };

      if (toolId && toolId !== "new") {
        await updateTool(toolId, toolData);
      } else {
        await createTool(toolData);
      }

      setHasUnsavedChanges(false);
      navigate("/admin/lms/toolbox");
    } catch (error) {
      console.error("Error saving tool:", error);
      toast({
        title: "Fehler",
        description: "Tool konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Toolbox", href: "/admin/lms/toolbox" },
    {
      label: toolId === "new" ? "Neues Tool" : "Tool bearbeiten",
      active: true,
    },
  ];

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <LMSBreadcrumb items={breadcrumbItems} />

        <div className="max-w-7xl mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 mb-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                <h1 className="text-2xl font-bold">
                  {toolId === "new" ? "Neues Tool erstellen" : "Tool bearbeiten"}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Speichert..." : "Speichern"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form ref={formRef} onSubmit={handleSave}>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">Allgemein</TabsTrigger>
                    <TabsTrigger value="config">Konfiguration</TabsTrigger>
                    <TabsTrigger value="media">Medien</TabsTrigger>
                    <TabsTrigger value="meta">Meta</TabsTrigger>
                  </TabsList>

                  {/* Tab: Allgemein */}
                  <TabsContent value="general" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Grundinformationen</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="title">Titel *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="z.B. Problem Framing Canvas"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="slug">Slug *</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => {
                              setFormData({ ...formData, slug: e.target.value });
                              handleFormChange();
                            }}
                            placeholder="z.B. problem-framing-canvas"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            URL-freundlicher Name (automatisch generiert)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="description">Beschreibung</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => {
                              setFormData({ ...formData, description: e.target.value });
                              handleFormChange();
                            }}
                            placeholder="Kurze Beschreibung des Tools..."
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Kategorie *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => {
                                setFormData({ ...formData, category: value });
                                handleFormChange();
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="understand">Verstehen</SelectItem>
                                <SelectItem value="ideate">Ideen entwickeln</SelectItem>
                                <SelectItem value="decide">Entscheiden</SelectItem>
                                <SelectItem value="prototype">Prototyp</SelectItem>
                                <SelectItem value="validate">Validieren</SelectItem>
                                <SelectItem value="retrospect">Retrospektive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="phase">Phase</Label>
                            <Select
                              value={formData.phase_number.toString()}
                              onValueChange={(value) => {
                                setFormData({ ...formData, phase_number: parseInt(value) });
                                handleFormChange();
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Phase 1</SelectItem>
                                <SelectItem value="2">Phase 2</SelectItem>
                                <SelectItem value="3">Phase 3</SelectItem>
                                <SelectItem value="4">Phase 4</SelectItem>
                                <SelectItem value="5">Phase 5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Konfiguration */}
                  <TabsContent value="config" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tool-Konfiguration</CardTitle>
                        <CardDescription>
                          Wählen Sie den Typ und konfigurieren Sie das Tool
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Tool-Typ *</Label>
                          <Select
                            value={formData.tool_type}
                            onValueChange={(value) => {
                              setFormData({ ...formData, tool_type: value });
                              handleFormChange();
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="external">Externer Link</SelectItem>
                              <SelectItem value="embedded">Eingebetteter Code</SelectItem>
                              <SelectItem value="template">Template</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.tool_type === "external" && (
                          <div>
                            <Label htmlFor="external_url">URL *</Label>
                            <Input
                              id="external_url"
                              type="url"
                              value={formData.external_url}
                              onChange={(e) => {
                                setFormData({ ...formData, external_url: e.target.value });
                                handleFormChange();
                              }}
                              placeholder="https://miro.com/app/board/..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Link zu Miro, Mural oder anderem Tool
                            </p>
                          </div>
                        )}

                        {formData.tool_type === "embedded" && (
                          <div>
                            <Label htmlFor="embed_code">Code / Iframe</Label>
                            <Textarea
                              id="embed_code"
                              value={formData.embed_code}
                              onChange={(e) => {
                                setFormData({ ...formData, embed_code: e.target.value });
                                handleFormChange();
                              }}
                              placeholder="<iframe src='...'></iframe>"
                              rows={8}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              HTML, JavaScript oder CSS Code
                            </p>
                          </div>
                        )}

                        {formData.tool_type === "template" && (
                          <div>
                            <Label htmlFor="template_data">Template-Daten (JSON)</Label>
                            <Textarea
                              id="template_data"
                              value={formData.template_data}
                              onChange={(e) => {
                                setFormData({ ...formData, template_data: e.target.value });
                                handleFormChange();
                              }}
                              placeholder='{"fields": [...], "sections": [...]}'
                              rows={12}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Strukturierte Daten im JSON-Format
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Medien */}
                  <TabsContent value="media" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Medien</CardTitle>
                        <CardDescription>Thumbnail und andere Medien</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                          <Input
                            id="thumbnail_url"
                            type="url"
                            value={formData.thumbnail_url}
                            onChange={(e) => {
                              setFormData({ ...formData, thumbnail_url: e.target.value });
                              handleFormChange();
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Empfohlene Größe: 400x300 px
                          </p>
                        </div>

                        {formData.thumbnail_url && (
                          <div>
                            <Label>Vorschau</Label>
                            <img
                              src={formData.thumbnail_url}
                              alt="Thumbnail Vorschau"
                              className="w-full max-w-md rounded-lg border"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Meta */}
                  <TabsContent value="meta" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Meta-Informationen</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => {
                              setFormData({ ...formData, tags: e.target.value });
                              handleFormChange();
                            }}
                            placeholder="design-sprint, problem-framing, canvas"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Komma-getrennte Tags
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="is_active">Aktiv</Label>
                            <p className="text-xs text-muted-foreground">
                              Tool für Nutzer sichtbar machen
                            </p>
                          </div>
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => {
                              setFormData({ ...formData, is_active: checked });
                              handleFormChange();
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </form>
            </div>

            {/* Sidebar Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-36">
                <CardHeader>
                  <CardTitle className="text-lg">Vorschau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.thumbnail_url && (
                    <img
                      src={formData.thumbnail_url}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{formData.title || "Tool Titel"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description || "Beschreibung..."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {formData.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      Phase {formData.phase_number}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {formData.tool_type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
