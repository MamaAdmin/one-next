import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BMADSessionCreator = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_context: "",
    ai_model: "google/gemini-2.5-flash",
    auto_progress: false,
    require_approval: true
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }
    if (!formData.project_context.trim()) {
      toast.error("Bitte geben Sie einen Projekt-Kontext ein");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bmad-create-session', {
        body: {
          title: formData.title,
          description: formData.description,
          project_context: formData.project_context,
          settings: {
            ai_model: formData.ai_model,
            auto_progress: formData.auto_progress,
            require_approval: formData.require_approval
          }
        }
      });

      if (error) throw error;

      toast.success("BMAD Session erfolgreich erstellt");
      setOpen(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        project_context: "",
        ai_model: "google/gemini-2.5-flash",
        auto_progress: false,
        require_approval: true
      });

      // Navigate to the session detail page
      navigate(`/admin/bmad/session/${data.session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Fehler beim Erstellen der Session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue BMAD Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue BMAD Session erstellen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Projekt-Titel *</Label>
            <Input
              id="title"
              placeholder="z.B. E-Commerce Platform Modernisierung"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kurzbeschreibung</Label>
            <Textarea
              id="description"
              placeholder="Eine kurze Beschreibung des Projekts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_context">Projekt-Kontext *</Label>
            <Textarea
              id="project_context"
              placeholder="Detaillierter Projekt-Kontext: Aktueller Stand, Ziele, Herausforderungen, technische Details..."
              value={formData.project_context}
              onChange={(e) => setFormData({ ...formData, project_context: e.target.value })}
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Je detaillierter, desto bessere Ergebnisse liefert die AI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_model">AI Modell</Label>
            <Select
              value={formData.ai_model}
              onValueChange={(value) => setFormData({ ...formData, ai_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.5-flash">
                  Gemini 2.5 Flash (Empfohlen)
                </SelectItem>
                <SelectItem value="google/gemini-2.5-pro">
                  Gemini 2.5 Pro (Höchste Qualität)
                </SelectItem>
                <SelectItem value="google/gemini-2.5-flash-lite">
                  Gemini 2.5 Flash Lite (Schnellstes)
                </SelectItem>
                <SelectItem value="openai/gpt-5">
                  GPT-5 (Premium)
                </SelectItem>
                <SelectItem value="openai/gpt-5-mini">
                  GPT-5 Mini (Balanced)
                </SelectItem>
                <SelectItem value="openai/gpt-5-nano">
                  GPT-5 Nano (Effizient)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatischer Fortschritt</Label>
              <p className="text-sm text-muted-foreground">
                Automatisch zur nächsten Phase fortschreiten
              </p>
            </div>
            <Switch
              checked={formData.auto_progress}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_progress: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Approval erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Artifacts müssen genehmigt werden
              </p>
            </div>
            <Switch
              checked={formData.require_approval}
              onCheckedChange={(checked) => setFormData({ ...formData, require_approval: checked })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Erstelle..." : "Session erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
