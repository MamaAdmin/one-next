import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

interface PageContent {
  id: string;
  page_name: string;
  section_name: string;
  content_type: string;
  content: string;
}

const contentTypeLabels: Record<string, string> = {
  text: "Text",
  html: "HTML",
  image: "Bild-URL",
  json: "JSON",
};

const PageContentManager = () => {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    page_name: "",
    section_name: "",
    content_type: "text",
    content: "",
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .order("page_name", { ascending: true });

    if (error) {
      toast({
        title: "Fehler",
        description: "Seiteninhalte konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setContents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("page_content")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast({
          title: "Fehler",
          description: "Inhalt konnte nicht aktualisiert werden.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erfolg", description: "Inhalt wurde erfolgreich aktualisiert." });
        resetForm();
        fetchContents();
      }
    } else {
      const { error } = await supabase.from("page_content").insert([formData]);

      if (error) {
        toast({
          title: "Fehler",
          description: "Inhalt konnte nicht erstellt werden.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erfolg", description: "Inhalt wurde erfolgreich erstellt." });
        resetForm();
        fetchContents();
      }
    }
  };

  const handleEdit = (content: PageContent) => {
    setEditingId(content.id);
    setFormData({
      page_name: content.page_name,
      section_name: content.section_name,
      content_type: content.content_type,
      content: content.content,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Inhalt wirklich löschen?")) return;

    const { error } = await supabase.from("page_content").delete().eq("id", id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Inhalt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Erfolg", description: "Inhalt wurde erfolgreich gelöscht." });
      fetchContents();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      page_name: "",
      section_name: "",
      content_type: "text",
      content: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Seiteninhalt bearbeiten" : "Seiteninhalt erstellen"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page_name">Seitenname</Label>
                <Input
                  id="page_name"
                  value={formData.page_name}
                  onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                  placeholder="z. B. homepage, about"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section_name">Bereichsname</Label>
                <Input
                  id="section_name"
                  value={formData.section_name}
                  onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                  placeholder="z. B. hero_title, about_text"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">Inhaltstyp</Label>
              <select
                id="content_type"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="text">Text</option>
                <option value="html">HTML</option>
                <option value="image">Bild-URL</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                {editingId ? "Inhalt aktualisieren" : "Inhalt erstellen"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorhandene Seiteninhalte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contents.map((content) => (
              <div
                key={content.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{content.page_name}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">{content.section_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Typ: {contentTypeLabels[content.content_type] ?? content.content_type}
                  </p>
                  <p className="text-sm line-clamp-2">{content.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(content)}
                    aria-label="Seiteninhalt bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(content.id)}
                    aria-label="Seiteninhalt löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageContentManager;
