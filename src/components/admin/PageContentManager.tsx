import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Search } from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";
import { decodeHtmlEntitiesDeep } from "@/lib/html";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
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
      content: decodeHtmlEntitiesDeep(content.content),
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

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || content.content_type === filterType;

    return matchesSearch && matchesType;
  });

  const groupedContents = filteredContents.reduce((acc, content) => {
    if (!acc[content.page_name]) {
      acc[content.page_name] = [];
    }
    acc[content.page_name].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);

  const getBadgeVariant = (contentType: string) => {
    switch (contentType) {
      case "html":
        return "secondary";
      case "image":
        return "outline";
      case "json":
        return "destructive";
      default:
        return "default";
    }
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
              {(formData.content_type === 'text' || formData.content_type === 'html') ? (
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => {
                    setFormData({ ...formData, content: value });
                  }}
                  isEditMode={true}
                  placeholder="Seiteninhalt eingeben..."
                  className="min-h-[300px]"
                />
              ) : (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  required
                />
              )}
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
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Seiteninhalte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-[180px] rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="all">Alle Typen</option>
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="image">Bild-URL</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedContents).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine Seiteninhalte gefunden
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedContents).map(([pageName, pageContents]) => (
                <AccordionItem key={pageName} value={pageName}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{pageName}</span>
                      <Badge variant="secondary">{pageContents.length} Bereiche</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {pageContents.map((content) => (
                        <div
                          key={content.id}
                          className="flex items-start justify-between p-4 border rounded-lg bg-accent/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{content.section_name}</span>
                              <Badge variant={getBadgeVariant(content.content_type)}>
                                {contentTypeLabels[content.content_type]}
                              </Badge>
                            </div>
                      {content.content_type === 'html' || content.content_type === 'text' ? (
                        <div 
                          className="text-sm line-clamp-3 text-muted-foreground prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(decodeHtmlEntitiesDeep(content.content)) 
                          }}
                        />
                      ) : (
                        <p className="text-sm line-clamp-3 text-muted-foreground font-mono">
                          {content.content}
                        </p>
                      )}
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PageContentManager;
