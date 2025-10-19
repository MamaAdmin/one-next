import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { WorkflowPanel } from "./WorkflowPanel";
import { VersionHistory } from "./VersionHistory";
import { SEOPanel } from "./SEOPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: string;
  workflow_status: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  og_image?: string;
  canonical_url?: string;
}

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  published: "Veröffentlicht",
};

const ArticleManagerEnhanced = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
    seo_keywords: [] as string[],
    og_image: "",
    canonical_url: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Artikel konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("articles")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast({
          title: "Fehler",
          description: "Artikel konnte nicht aktualisiert werden.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erfolg", description: "Artikel wurde erfolgreich aktualisiert." });
        resetForm();
        fetchArticles();
      }
    } else {
      const { error } = await supabase.from("articles").insert([formData]);

      if (error) {
        toast({
          title: "Fehler",
          description: "Artikel konnte nicht erstellt werden.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erfolg", description: "Artikel wurde erfolgreich erstellt." });
        resetForm();
        fetchArticles();
      }
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      status: article.status,
      seo_title: article.seo_title || "",
      seo_description: article.seo_description || "",
      seo_keywords: article.seo_keywords || [],
      og_image: article.og_image || "",
      canonical_url: article.canonical_url || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Artikel wirklich löschen?")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Artikel konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Erfolg", description: "Artikel wurde erfolgreich gelöscht." });
      fetchArticles();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      status: "draft",
      seo_title: "",
      seo_description: "",
      seo_keywords: [],
      og_image: "",
      canonical_url: "",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Artikel bearbeiten" : "Neuen Artikel erstellen"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Inhalt</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titel</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Kurzfassung</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Inhalt</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      isEditMode={true}
                      placeholder="Artikelinhalt eingeben..."
                      className="min-h-[400px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Autor</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="draft">Entwurf</option>
                        <option value="published">Veröffentlicht</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">
                      {editingId ? "Artikel aktualisieren" : "Artikel erstellen"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Abbrechen
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="seo">
                <SEOPanel
                  data={{
                    seo_title: formData.seo_title,
                    seo_description: formData.seo_description,
                    seo_keywords: formData.seo_keywords,
                    og_image: formData.og_image,
                    canonical_url: formData.canonical_url,
                  }}
                  onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vorhandene Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">{article.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {statusLabels[article.status] ?? article.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                      aria-label="Artikel bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                      aria-label="Artikel löschen"
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

      {editingId && (
        <div className="space-y-6">
          <WorkflowPanel
            contentType="articles"
            contentId={editingId}
            currentStatus={articles.find((a) => a.id === editingId)?.workflow_status || "draft"}
            onStatusChange={fetchArticles}
          />
          <VersionHistory
            contentType="articles"
            contentId={editingId}
            onRestore={fetchArticles}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleManagerEnhanced;
