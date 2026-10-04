import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { deletePromptTemplate, listPromptTemplates, savePromptTemplate, type PromptTemplate } from "@/services/PromptLibrary";

interface Props {
  /** When set, each template gets a «Übernehmen» button. */
  onPick?: (t: PromptTemplate) => void;
  /** Prefills the new-template form, e.g. with the current Bildvorgabe. */
  initialPrompt?: string;
}

/** Manage reusable Bildvorgaben (image direction prompts). */
export function PromptLibraryManager({ onPick, initialPrompt = "" }: Props) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["prompt-library"], queryFn: listPromptTemplates });
  const [editId, setEditId] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [q, setQ] = useState("");

  const reset = () => { setEditId(undefined); setTitle(""); setPrompt(""); };
  const refresh = () => qc.invalidateQueries({ queryKey: ["prompt-library"] });

  const save = async () => {
    if (!title.trim() || !prompt.trim()) {
      toast({ title: "Titel und Bildvorgabe ausfüllen", variant: "destructive" });
      return;
    }
    try {
      await savePromptTemplate({ id: editId, title: title.trim(), prompt: prompt.trim() });
      toast({ title: editId ? "Vorlage aktualisiert" : "Vorlage gespeichert" });
      reset();
      void refresh();
    } catch {
      toast({ title: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  };

  const remove = async (t: PromptTemplate) => {
    if (!window.confirm(`Vorlage «${t.title}» löschen?`)) return;
    try { await deletePromptTemplate(t.id); void refresh(); }
    catch { toast({ title: "Löschen fehlgeschlagen", variant: "destructive" }); }
  };

  const filtered = data.filter((t) => !q.trim() || `${t.title} ${t.prompt}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <p className="font-semibold">{editId ? "Vorlage bearbeiten" : "Neue Vorlage"}</p>
        <div className="space-y-1">
          <Label htmlFor="pl-title">Titel</Label>
          <Input id="pl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Zum Beispiel: Büro, freundliche Hauptfigur" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pl-prompt">Bildvorgabe</Label>
          <Textarea id="pl-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void save()}><Plus className="mr-2 h-4 w-4" />{editId ? "Speichern" : "Vorlage speichern"}</Button>
          {editId && <Button size="sm" variant="ghost" onClick={reset}>Abbrechen</Button>}
        </div>
      </div>
      <Input placeholder="Vorlagen durchsuchen …" value={q} onChange={(e) => setQ(e.target.value)} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Wird geladen …</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <div key={t.id} className="space-y-2 rounded-lg border bg-card p-4 text-sm">
              <p className="font-semibold">{t.title}</p>
              <p className="whitespace-pre-line text-muted-foreground">{t.prompt}</p>
              <div className="flex flex-wrap gap-1">
                {onPick && <Button size="sm" onClick={() => onPick(t)}>Übernehmen</Button>}
                <Button size="sm" variant="ghost" onClick={() => { setEditId(t.id); setTitle(t.title); setPrompt(t.prompt); }}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />Bearbeiten
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void remove(t)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />Löschen
                </Button>
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-sm text-muted-foreground">Noch keine Vorlagen vorhanden.</p>}
        </div>
      )}
    </div>
  );
}
