import { useState } from "react";
import { useFAQ, useFAQCategories } from "@/hooks/useFAQ";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Eye, ThumbsUp, ThumbsDown, HelpCircle, Rocket, DollarSign, Code, Play, Settings, Users, Book } from "lucide-react";
import * as Icons from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";

const FAQManager = () => {
  const { faqs, loading, refetch } = useFAQ();
  const { categories, refetch: refetchCategories } = useFAQCategories();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category_id: "",
    is_published: true,
    sort_order: 0,
  });
  const [editorContent, setEditorContent] = useState("");
  
  // Category management state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "HelpCircle",
    sort_order: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that answer is not empty (after stripping HTML tags)
    const strippedAnswer = editorContent.replace(/<[^>]*>/g, '').trim();
    if (!strippedAnswer) {
      toast({
        title: "Fehler",
        description: "Die Antwort darf nicht leer sein",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const dataToSubmit = {
        ...formData,
        answer: editorContent,
      };
      
      if (editingFAQ) {
        const { error } = await supabase
          .from("faq_items")
          .update(dataToSubmit)
          .eq("id", editingFAQ.id);
        if (error) throw error;
        toast({ title: "FAQ aktualisiert" });
      } else {
        const { error } = await supabase.from("faq_items").insert(dataToSubmit);
        if (error) throw error;
        toast({ title: "FAQ erstellt" });
      }
      setIsDialogOpen(false);
      setEditingFAQ(null);
      setFormData({
        question: "",
        answer: "",
        category_id: "",
        is_published: true,
        sort_order: 0,
      });
      setEditorContent("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("FAQ wirklich löschen?")) return;
    try {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "FAQ gelöscht" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("faq_items")
        .update({ is_published: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: currentStatus ? "FAQ versteckt" : "FAQ veröffentlicht" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (faq: any) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category_id: faq.category_id,
      is_published: faq.is_published,
      sort_order: faq.sort_order,
    });
    setEditorContent(faq.answer);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingFAQ(null);
    setFormData({
      question: "",
      answer: "",
      category_id: categories[0]?.id || "",
      is_published: true,
      sort_order: faqs.length,
    });
    setEditorContent("");
    setIsDialogOpen(true);
  };

  // Category CRUD functions
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("faq_categories")
          .update(categoryFormData)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Kategorie aktualisiert" });
      } else {
        const { error } = await supabase
          .from("faq_categories")
          .insert(categoryFormData);
        if (error) throw error;
        toast({ title: "Kategorie erstellt" });
      }
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        slug: "",
        description: "",
        icon: "HelpCircle",
        sort_order: 0,
        is_active: true,
      });
      refetchCategories();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { data: linkedFAQs } = await supabase
      .from("faq_items")
      .select("id")
      .eq("category_id", id);
    
    if (linkedFAQs && linkedFAQs.length > 0) {
      toast({
        title: "Fehler",
        description: `Kategorie kann nicht gelöscht werden. ${linkedFAQs.length} FAQ(s) verwenden diese Kategorie.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Kategorie wirklich löschen?")) return;
    try {
      const { error } = await supabase
        .from("faq_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Kategorie gelöscht" });
      refetchCategories();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleCategoryActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("faq_categories")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ 
        title: currentStatus ? "Kategorie deaktiviert" : "Kategorie aktiviert" 
      });
      refetchCategories();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditCategoryDialog = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "HelpCircle",
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setIsCategoryDialogOpen(true);
  };

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      slug: "",
      description: "",
      icon: "HelpCircle",
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsCategoryDialogOpen(true);
  };

  // Statistics
  const totalViews = faqs.reduce((sum, faq) => sum + (faq.view_count || 0), 0);
  const totalHelpful = faqs.reduce((sum, faq) => sum + (faq.helpful_count || 0), 0);
  const totalUnhelpful = faqs.reduce((sum, faq) => sum + (faq.not_helpful_count || 0), 0);
  const helpfulRate = totalHelpful + totalUnhelpful > 0 
    ? ((totalHelpful / (totalHelpful + totalUnhelpful)) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt Aufrufe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hilfreich Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{helpfulRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs System */}
      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="faqs">FAQ Items ({faqs.length})</TabsTrigger>
          <TabsTrigger value="categories">Kategorien ({categories.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: FAQ Items */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>FAQ Verwaltung</CardTitle>
                  <CardDescription>
                    Verwalten Sie häufig gestellte Fragen
                  </CardDescription>
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Lädt...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frage</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">
                        <Eye className="h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-center">
                        <ThumbsUp className="h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-center">
                        <ThumbsDown className="h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => {
                      const category = categories.find((c) => c.id === faq.category_id);
                      return (
                        <TableRow key={faq.id}>
                          <TableCell className="font-medium max-w-md">
                            {faq.question}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{category?.name || "N/A"}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={faq.is_published}
                              onCheckedChange={() =>
                                handleTogglePublish(faq.id, faq.is_published)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">{faq.view_count}</TableCell>
                          <TableCell className="text-center text-green-600">
                            {faq.helpful_count}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {faq.not_helpful_count}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(faq)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(faq.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Kategorien */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Kategorien Verwaltung</CardTitle>
                  <CardDescription>
                    Verwalten Sie die FAQ-Kategorien für bessere Organisation
                  </CardDescription>
                </div>
                <Button onClick={openCreateCategoryDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Kategorie
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead className="text-center">FAQs</TableHead>
                    <TableHead className="text-center">Sortierung</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const Icon = Icons[category.icon as keyof typeof Icons] as any;
                    const faqCount = faqs.filter(
                      (f) => f.category_id === category.id
                    ).length;
                    
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          {Icon && <Icon className="h-5 w-5" />}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{faqCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {category.sort_order}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={category.is_active}
                            onCheckedChange={() =>
                              handleToggleCategoryActive(
                                category.id,
                                category.is_active
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditCategoryDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={faqCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? "FAQ bearbeiten" : "Neue FAQ erstellen"}
            </DialogTitle>
            <DialogDescription>
              Füllen Sie die Felder aus und speichern Sie die FAQ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Frage</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="answer">Antwort (Rich Text)</Label>
              <RichTextEditor
                value={editorContent}
                onSave={async (content) => {
                  setEditorContent(content);
                  setFormData({ ...formData, answer: content });
                }}
                isEditMode={true}
                className="min-h-[300px]"
                placeholder="Schreiben Sie hier die Antwort mit Formatierungen..."
              />
            </div>
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
              <Label htmlFor="published">Veröffentlicht</Label>
            </div>
            <div>
              <Label htmlFor="sort_order">Sortierung</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">{editingFAQ ? "Speichern" : "Erstellen"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Create/Edit Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
            </DialogTitle>
            <DialogDescription>
              Kategorien helfen bei der Organisation Ihrer FAQs
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={categoryFormData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryFormData({ 
                    ...categoryFormData, 
                    name,
                    slug: generateSlug(name)
                  });
                }}
                required
                placeholder="z.B. AI Design Sprint"
              />
            </div>
            
            <div>
              <Label htmlFor="cat-slug">Slug (URL-freundlich) *</Label>
              <Input
                id="cat-slug"
                value={categoryFormData.slug}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, slug: e.target.value })
                }
                required
                placeholder="ai-design-sprint"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wird automatisch aus dem Namen generiert
              </p>
            </div>

            <div>
              <Label htmlFor="cat-description">Beschreibung</Label>
              <Textarea
                id="cat-description"
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({ 
                    ...categoryFormData, 
                    description: e.target.value 
                  })
                }
                placeholder="Kurze Beschreibung der Kategorie"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cat-icon">Icon (Lucide Icon Name)</Label>
              <Select
                value={categoryFormData.icon}
                onValueChange={(value) =>
                  setCategoryFormData({ ...categoryFormData, icon: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HelpCircle">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      HelpCircle
                    </div>
                  </SelectItem>
                  <SelectItem value="Rocket">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      Rocket
                    </div>
                  </SelectItem>
                  <SelectItem value="DollarSign">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      DollarSign
                    </div>
                  </SelectItem>
                  <SelectItem value="Code">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Code
                    </div>
                  </SelectItem>
                  <SelectItem value="Play">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Play
                    </div>
                  </SelectItem>
                  <SelectItem value="Settings">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </div>
                  </SelectItem>
                  <SelectItem value="Users">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </div>
                  </SelectItem>
                  <SelectItem value="Book">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Book
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cat-sort">Sortierung</Label>
              <Input
                id="cat-sort"
                type="number"
                value={categoryFormData.sort_order}
                onChange={(e) =>
                  setCategoryFormData({ 
                    ...categoryFormData, 
                    sort_order: parseInt(e.target.value) 
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="cat-active"
                checked={categoryFormData.is_active}
                onCheckedChange={(checked) =>
                  setCategoryFormData({ ...categoryFormData, is_active: checked })
                }
              />
              <Label htmlFor="cat-active">Kategorie aktiviert</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                {editingCategory ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManager;
