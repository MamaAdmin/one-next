import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Save, X, ExternalLink, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageTemplate {
  id: string;
  title: string;
  slug: string;
  layout_type: 'main-service' | 'sub-service';
  content: any;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_image?: string;
  canonical_url?: string;
  is_published: boolean;
  created_at: string;
}

export const PageTemplateManager = () => {
  const [pages, setPages] = useState<PageTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    layout_type: "main-service" as 'main-service' | 'sub-service',
    content: "{}",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
    is_published: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("page_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages((data || []) as PageTemplate[]);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast({
        title: "Fehler",
        description: "Seiten konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let contentObj;
      try {
        contentObj = JSON.parse(formData.content);
      } catch {
        toast({
          title: "Fehler",
          description: "Content muss gültiges JSON sein",
          variant: "destructive",
        });
        return;
      }

      const keywordsArray = formData.meta_keywords
        ? formData.meta_keywords.split(",").map(k => k.trim())
        : [];

      const pageData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        layout_type: formData.layout_type,
        content: contentObj,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description,
        meta_keywords: keywordsArray,
        og_image: formData.og_image,
        canonical_url: formData.canonical_url,
        is_published: formData.is_published,
      };

      if (editingId) {
        const { error } = await supabase
          .from("page_templates")
          .update(pageData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Erfolg", description: "Seite aktualisiert" });
      } else {
        const { error } = await supabase
          .from("page_templates")
          .insert([pageData]);

        if (error) throw error;
        toast({ title: "Erfolg", description: "Seite erstellt" });
      }

      resetForm();
      fetchPages();
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast({
        title: "Fehler",
        description: error.message || "Seite konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (page: PageTemplate) => {
    setEditingId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      layout_type: page.layout_type,
      content: JSON.stringify(page.content, null, 2),
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      meta_keywords: page.meta_keywords?.join(", ") || "",
      og_image: page.og_image || "",
      canonical_url: page.canonical_url || "",
      is_published: page.is_published,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diese Seite wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("page_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Erfolg", description: "Seite gelöscht" });
      fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
      toast({
        title: "Fehler",
        description: "Seite konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      layout_type: "main-service",
      content: "{}",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_image: "",
      canonical_url: "",
      is_published: false,
    });
  };

  const getExampleContent = (layoutType: 'main-service' | 'sub-service') => {
    if (layoutType === 'main-service') {
      return JSON.stringify({
        hero: {
          badge: "Neu",
          title: "Hauptseiten-Titel",
          subtitle: "Untertitel",
          description: "Beschreibung...",
          primaryCta: { text: "Jetzt starten", url: "/contact" },
          secondaryCta: { text: "Mehr erfahren", url: "/about" }
        },
        sections: [
          {
            type: "timeline",
            title: "Prozess",
            items: [
              { icon: "Clipboard", title: "Schritt 1", description: "Beschreibung..." }
            ]
          }
        ],
        cta: {
          title: "Bereit loszulegen?",
          primaryButton: { text: "Kontakt", url: "/contact" }
        }
      }, null, 2);
    } else {
      return JSON.stringify({
        hero: {
          badge: "Workshop",
          title: "Workshop-Titel",
          subtitle: "Untertitel",
          description: "Beschreibung...",
          image: "/assets/image.jpg",
          primaryCta: { text: "Anmelden", url: "/contact" }
        },
        sections: [
          {
            type: "purpose-outcome",
            items: [
              { icon: "Target", title: "Ziel", description: "..." }
            ]
          }
        ]
      }, null, 2);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {editingId ? "Seite bearbeiten" : "Neue Seite erstellen"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!editingId && !formData.slug) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">URL-Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="wird automatisch generiert"
                />
              </div>
            </div>

            <div>
              <Label>Layout-Typ *</Label>
              <RadioGroup
                value={formData.layout_type}
                onValueChange={(value: 'main-service' | 'sub-service') => {
                  setFormData({ ...formData, layout_type: value });
                  if (!formData.content || formData.content === "{}") {
                    setFormData(prev => ({ ...prev, content: getExampleContent(value) }));
                  }
                }}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main-service" id="main" />
                  <Label htmlFor="main">Hauptseite (wie /sprint-uebersicht)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sub-service" id="sub" />
                  <Label htmlFor="sub">Unterseite (wie /problem-framing-workshop)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="content">Content (JSON) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="font-mono text-sm h-64"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setFormData(prev => ({ ...prev, content: getExampleContent(prev.layout_type) }))}
              >
                Beispiel-Content laden
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">SEO-Einstellungen</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Wird aus Titel generiert"
                  />
                </div>
                <div>
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_keywords">Keywords (kommagetrennt)</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="og_image">OG Image URL</Label>
                  <Input
                    id="og_image"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Veröffentlicht</Label>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                )}
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Aktualisieren" : "Erstellen"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Seiten ({pages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {pages.map((page) => (
                <Card key={page.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{page.title}</h3>
                          <Badge variant={page.layout_type === 'main-service' ? 'default' : 'secondary'}>
                            {page.layout_type === 'main-service' ? 'Hauptseite' : 'Unterseite'}
                          </Badge>
                          {page.is_published ? (
                            <Badge variant="outline" className="bg-green-50">Veröffentlicht</Badge>
                          ) : (
                            <Badge variant="outline">Entwurf</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        {page.is_published && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
