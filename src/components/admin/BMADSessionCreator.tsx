import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAllSprints, useAdminAllFramingSessions } from "@/hooks/useAdminSprints";

type Mode = "sprint" | "standalone";

const defaultForm = {
  title: "",
  description: "",
  project_context: "",
  ai_model: "google/gemini-2.5-flash",
  auto_progress: false,
  require_approval: true,
};

interface BMADSessionCreatorProps {
  /** Sprint that should be preselected when the dialog opens. */
  initialSprintId?: string | null;
  /** Open the dialog immediately (used when coming from the sprint list). */
  autoOpen?: boolean;
  onOpenChangeExternal?: (open: boolean) => void;
}

function buildContext(sprint: Record<string, unknown>, framingChallenge?: string | null) {
  const parts: string[] = [];
  const push = (label: string, value: unknown) => {
    if (typeof value === "string" && value.trim()) parts.push(`${label}:\n${value.trim()}`);
  };
  const pushList = (label: string, value: unknown) => {
    if (Array.isArray(value) && value.length > 0) {
      const lines = value
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object") {
            const obj = entry as Record<string, unknown>;
            const text = obj.text ?? obj.frage ?? obj.titel ?? obj.beschreibung;
            return typeof text === "string" ? text : JSON.stringify(entry);
          }
          return String(entry);
        })
        .filter(Boolean)
        .map((line) => `- ${line}`);
      if (lines.length) parts.push(`${label}:\n${lines.join("\n")}`);
    }
  };

  push("Challenge Statement", sprint.challenge_statement ?? framingChallenge);
  push("Problemstellung", sprint.problemstellung);
  push("Zielgruppe", sprint.zielgruppe);
  push("Erfolgsmessung", sprint.erfolgsmessung);
  pushList("Sprint-Fragen", sprint.sprint_fragen);
  pushList("Risiken", sprint.risiken);

  return parts.join("\n\n");
}

export const BMADSessionCreator = ({
  initialSprintId = null,
  autoOpen = false,
  onOpenChangeExternal,
}: BMADSessionCreatorProps = {}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(autoOpen);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(initialSprintId ? "sprint" : "sprint");
  const [selectedSprintId, setSelectedSprintId] = useState<string>(initialSprintId ?? "");
  const [formData, setFormData] = useState(defaultForm);

  const { data: sprints = [] } = useAdminAllSprints();
  const { data: framings = [] } = useAdminAllFramingSessions();

  /** Sprints that are finished and whose problem framing is finished too. */
  const eligibleSprints = useMemo(() => {
    const doneFramingBySprint = new Map<string, { id: string; challenge_statement: string | null }>();
    framings.forEach((f) => {
      if (f.resulting_sprint_id && f.status === "done") {
        doneFramingBySprint.set(f.resulting_sprint_id, {
          id: f.id,
          challenge_statement: f.challenge_statement ?? null,
        });
      }
    });
    return sprints
      .filter((s) => s.status === "done" && doneFramingBySprint.has(s.id))
      .map((s) => ({ sprint: s, framing: doneFramingBySprint.get(s.id)! }));
  }, [sprints, framings]);

  const selected = eligibleSprints.find((e) => e.sprint.id === selectedSprintId) ?? null;

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  useEffect(() => {
    if (initialSprintId) {
      setMode("sprint");
      setSelectedSprintId(initialSprintId);
    }
  }, [initialSprintId]);

  // Prefill title and context from the selected sprint.
  useEffect(() => {
    if (mode !== "sprint" || !selected) return;
    const sprint = selected.sprint as unknown as Record<string, unknown>;
    setFormData((prev) => ({
      ...prev,
      title: String(sprint.titel ?? ""),
      project_context: buildContext(sprint, selected.framing.challenge_statement),
    }));
  }, [mode, selectedSprintId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChangeExternal?.(next);
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }
    if (!formData.project_context.trim()) {
      toast.error("Bitte geben Sie einen Projekt-Kontext ein");
      return;
    }
    if (mode === "sprint" && !selected) {
      toast.error("Bitte wählen Sie einen abgeschlossenen Sprint aus");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bmad-create-session", {
        body: {
          title: formData.title,
          description: formData.description,
          project_context: formData.project_context,
          sprint_id: mode === "sprint" ? selected?.sprint.id ?? null : null,
          framing_session_id: mode === "sprint" ? selected?.framing.id ?? null : null,
          settings: {
            ai_model: formData.ai_model,
            auto_progress: formData.auto_progress,
            require_approval: formData.require_approval,
          },
        },
      });

      if (error) throw error;

      toast.success("BMAD Session erfolgreich erstellt");
      handleOpenChange(false);
      setFormData(defaultForm);
      setSelectedSprintId("");

      navigate(`/admin/bmad/session/${data.session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Fehler beim Erstellen der Session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <Label>Grundlage</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sprint">Aus abgeschlossenem Sprint (empfohlen)</SelectItem>
                <SelectItem value="standalone">Eigenständig</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              BMAD baut auf den Ergebnissen aus Problem Framing und Design Sprint auf.
            </p>
          </div>

          {mode === "sprint" ? (
            <div className="space-y-2">
              <Label htmlFor="sprint">Abgeschlossener Sprint *</Label>
              <Select
                value={selectedSprintId}
                onValueChange={setSelectedSprintId}
                disabled={eligibleSprints.length === 0}
              >
                <SelectTrigger id="sprint">
                  <SelectValue
                    placeholder={
                      eligibleSprints.length === 0
                        ? "Noch kein abgeschlossener Sprint vorhanden"
                        : "Sprint auswählen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {eligibleSprints.map(({ sprint }) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.titel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {eligibleSprints.length === 0
                  ? "Erst wenn Problem Framing und Design Sprint abgeschlossen sind, kann eine Session daraus entstehen."
                  : "Titel und Projekt-Kontext werden aus dem Sprint übernommen und bleiben bearbeitbar."}
              </p>
            </div>
          ) : (
            <p className="rounded-none border-l-2 border-primary bg-accent-soft p-3 text-sm text-muted-foreground">
              Ohne vorangegangenes Problem Framing und ohne Design Sprint fliesst weniger Vorwissen in die Session ein.
            </p>
          )}

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
              Je detaillierter, desto bessere Ergebnisse liefert die KI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_model">KI-Modell</Label>
            <Select
              value={formData.ai_model}
              onValueChange={(value) => setFormData({ ...formData, ai_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>OpenAI Direct (Keine Lovable Credits)</SelectLabel>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="o1">O1</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Anthropic Direct (Keine Lovable Credits)</SelectLabel>
                  <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5 (Empfohlen)</SelectItem>
                  <SelectItem value="claude-opus-4-1-20250805">Claude Opus 4.1</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Lovable AI Gateway (Lovable Credits)</SelectLabel>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5 (via Gateway)</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (via Gateway)</SelectItem>
                  <SelectItem value="openai/gpt-5-nano">GPT-5 Nano (via Gateway)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              OpenAI/Anthropic Direct nutzt Ihre API Keys, Lovable Gateway nutzt Lovable Credits
            </p>
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || (mode === "sprint" && !selected)}
          >
            {loading ? "Erstelle..." : "Session erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BMADSessionCreator;
