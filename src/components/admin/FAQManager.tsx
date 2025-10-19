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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";

const FAQManager = () => {
  const { faqs, loading, refetch } = useFAQ();
  const { categories } = useFAQCategories();
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

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQ Verwaltung</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neue FAQ
        </Button>
      </div>

      {/* FAQ Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle FAQs</CardTitle>
          <CardDescription>Verwalten Sie Ihre häufig gestellten Fragen</CardDescription>
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
    </div>
  );
};

export default FAQManager;
