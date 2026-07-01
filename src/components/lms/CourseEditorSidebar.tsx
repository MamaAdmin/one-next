import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { PlusIcon } from "@/components/ui/custom-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CourseFormData } from "./CourseEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseEditorSidebarProps {
  formData: CourseFormData;
  onChange: (field: keyof CourseFormData, value: any) => void;
}

export const CourseEditorSidebar = ({ formData, onChange }: CourseEditorSidebarProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [newTag, setNewTag] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch {
      toast({
        title: "Fehler",
        description: "Kategorien konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsAddingCategory(true);
    try {
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: newCategoryName.trim(),
          slug,
          description: "",
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, { id: data.id, name: data.name }]);
      setNewCategoryName("");
      toast({ title: "Erfolg", description: "Kategorie erstellt" });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Kategorie "${categoryName}" wirklich löschen?`)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);

      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== categoryId));

      if (formData.categories.includes(categoryName)) {
        onChange("categories", formData.categories.filter((c) => c !== categoryName));
      }

      toast({ title: "Erfolg", description: "Kategorie gelöscht" });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fehler", description: "Bild darf maximal 5 MB groß sein", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(`courses/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("blog-images").getPublicUrl(`courses/${fileName}`);
      onChange("featured_image", data.publicUrl);
      
      toast({ title: "Erfolg", description: "Bild hochgeladen" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 384 * 1024 * 1024) {
      toast({ title: "Fehler", description: "Video darf maximal 384 MB groß sein", variant: "destructive" });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["mp4", "webm"].includes(ext || "")) {
      toast({ title: "Fehler", description: "Nur MP4 und WebM Videos erlaubt", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(`courses/videos/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("blog-images").getPublicUrl(`courses/videos/${fileName}`);
      onChange("intro_video", { source: "upload", file: data.publicUrl, url: null });
      
      toast({ title: "Erfolg", description: "Video hochgeladen" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUrlAdd = () => {
    if (!videoUrlInput.trim()) return;
    
    if (!videoUrlInput.startsWith("http://") && !videoUrlInput.startsWith("https://")) {
      toast({ title: "Fehler", description: "URL muss mit http:// oder https:// beginnen", variant: "destructive" });
      return;
    }

    onChange("intro_video", { source: "url", file: null, url: videoUrlInput });
    setVideoUrlInput("");
    toast({ title: "Erfolg", description: "Video-URL hinzugefügt" });
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags.length >= 20) return;
    if (formData.tags.includes(newTag.trim())) {
      toast({ title: "Hinweis", description: "Tag bereits vorhanden", variant: "default" });
      return;
    }
    onChange("tags", [...formData.tags, newTag.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    onChange("tags", formData.tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4">
      {/* Visibility & Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-primary">+</span> Sichtbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={formData.visibility} onValueChange={(value: any) => onChange("visibility", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Öffentlich</SelectItem>
              <SelectItem value="private">Privat</SelectItem>
              <SelectItem value="draft">Entwurf</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Zuletzt aktualisiert am {new Date().toLocaleDateString("de-DE")}
          </p>
        </CardContent>
      </Card>

      {/* Timed Release */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-primary">+</span> Zeitlicher Ablauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="timed-release">Aktivieren</Label>
            <Switch
              id="timed-release"
              checked={formData.timed_release_enabled}
              onCheckedChange={(value) => onChange("timed_release_enabled", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Beitragsbild
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.featured_image ? (
            <div className="relative">
              <img src={formData.featured_image} alt="Featured" className="w-full h-32 object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onChange("featured_image", null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Bild hochladen</span>
              <span className="text-xs text-muted-foreground mt-1">Max. 5 MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Intro Video */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Video className="h-4 w-4" />
            Intro-Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.intro_video.file || formData.intro_video.url ? (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm mb-2">
                {formData.intro_video.source === "upload" ? "📹 Video hochgeladen" : "🔗 Video von URL"}
              </p>
              <Button variant="outline" size="sm" onClick={() => onChange("intro_video", { source: null, file: null, url: null })}>
                <X className="mr-2 h-3 w-3" />
                Entfernen
              </Button>
            </div>
          ) : (
            <>
              <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Video hochladen (max. 384 MB)</span>
                <span className="text-xs text-muted-foreground">MP4, WebM</span>
                <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
              </label>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">oder</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Video-URL eingeben"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={handleVideoUrlAdd}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-primary">+</span> Preismodell
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup
            value={formData.pricing.type}
            onValueChange={(value: "free" | "paid") =>
              onChange("pricing", { ...formData.pricing, type: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free">Kostenlos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="paid" />
              <Label htmlFor="paid">Kostenpflichtig</Label>
            </div>
          </RadioGroup>
          {formData.pricing.type === "paid" && (
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Preis"
                value={formData.pricing.price_chf || ""}
                onChange={(e) =>
                  onChange("pricing", { ...formData.pricing, price_chf: parseFloat(e.target.value) || null })
                }
              />
              <span className="text-sm text-muted-foreground">CHF</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-primary">+</span> Kategorien
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Kategorie erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="category-name">Kategorie-Name</Label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="z.B. Design Thinking"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategoryName.trim()}
                  >
                    {isAddingCategory ? "Erstelle..." : "Erstellen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Keine Kategorien vorhanden
            </p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={cat.id}
                    checked={formData.categories.includes(cat.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange("categories", [...formData.categories, cat.name]);
                      } else {
                        onChange("categories", formData.categories.filter((c) => c !== cat.name));
                      }
                    }}
                  />
                  <Label htmlFor={cat.id} className="text-sm font-normal cursor-pointer flex-1">
                    {cat.name}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-primary">+</span> Schlagwörter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Tag hinzufügen..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            />
            <Button variant="outline" size="icon" onClick={handleAddTag} disabled={formData.tags.length >= 20}>
              <span className="text-primary">+</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag} <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
          {formData.tags.length > 0 && (
            <p className="text-xs text-muted-foreground">{formData.tags.length} / 20 Tags</p>
          )}
        </CardContent>
      </Card>

      {/* Options Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Einstellungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="enroll">Einschreiben</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-3 mt-3">
              <Select value={formData.difficulty} onValueChange={(value) => onChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Schwierigkeit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Schwierigkeitsgrade</SelectItem>
                  <SelectItem value="beginner">Anfänger</SelectItem>
                  <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                  <SelectItem value="advanced">Experte</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Öffentlicher Kurs (Public)</Label>
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={(value) => onChange("is_public", value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Als "Public" markiert erscheint der Kurs im öffentlichen Kursangebot (Termine &amp; Anmeldungen).
              </p>
            </TabsContent>
            <TabsContent value="enroll" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="manual">Manuelles Einschreiben</Label>
                <Switch
                  id="manual"
                  checked={formData.options.manual_enrollment}
                  onCheckedChange={(value) => onChange("options", { ...formData.options, manual_enrollment: value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Aktivieren Sie diese Option, um Teilnehmer manuell einzuschreiben.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
