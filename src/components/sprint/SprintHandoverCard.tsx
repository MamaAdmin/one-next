import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUpdateSprint } from "@/hooks/useSprint";
import { useFramingBySprint } from "@/hooks/useFraming";
import type { SprintRow } from "@/features/sprint/types";

interface Props {
  sprint: SprintRow;
  onEdit: () => void;
}

const STORAGE_PREFIX = "sprint-handover-confirmed-";

interface Draft {
  challenge_statement: string;
  zielgruppe: string;
  erfolgsmessung: string;
  decider: string;
  sprint_leader: string;
  sprint_fragen: string[];
  risiken: string[];
}

function draftFromSprint(sprint: SprintRow): Draft {
  return {
    challenge_statement: sprint.challenge_statement ?? "",
    zielgruppe: sprint.zielgruppe ?? "",
    erfolgsmessung: sprint.erfolgsmessung ?? "",
    decider: sprint.decider ?? "",
    sprint_leader: sprint.sprint_leader ?? "",
    sprint_fragen: sprint.sprint_fragen ?? [],
    risiken: sprint.risiken ?? [],
  };
}

/**
 * Zeigt beim ersten Öffnen eines Sprints die Übernahme aus dem Problem-Framing:
 * Titel/Problemstellung (über den Basics-Dialog) plus alle darunter liegenden
 * Felder inline editierbar (Challenge Statement, Zielgruppe, Erfolgsmessung,
 * Decider, Sprint Leader, Sprint-Fragen, Risiken).
 */
export default function SprintHandoverCard({ sprint, onEdit }: Props) {
  const storageKey = `${STORAGE_PREFIX}${sprint.id}`;
  const update = useUpdateSprint(sprint.id);
  const framingQ = useFramingBySprint(sprint.id);
  const fromFraming = !!framingQ.data;
  

  const [confirmed, setConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFromSprint(sprint));

  useEffect(() => {
    setDraft(draftFromSprint(sprint));
  }, [sprint]);

  useEffect(() => {
    if (confirmed) {
      try {
        localStorage.setItem(storageKey, "1");
      } catch {
        // ignore
      }
    }
  }, [confirmed, storageKey]);

  const dirty = useMemo(() => {
    const s = draftFromSprint(sprint);
    return (
      s.challenge_statement !== draft.challenge_statement ||
      s.zielgruppe !== draft.zielgruppe ||
      s.erfolgsmessung !== draft.erfolgsmessung ||
      s.decider !== draft.decider ||
      s.sprint_leader !== draft.sprint_leader ||
      JSON.stringify(s.sprint_fragen) !== JSON.stringify(draft.sprint_fragen) ||
      JSON.stringify(s.risiken) !== JSON.stringify(draft.risiken)
    );
  }, [sprint, draft]);

  const hasBasicsData =
    !!sprint.challenge_statement?.trim() ||
    !!sprint.zielgruppe?.trim() ||
    !!sprint.erfolgsmessung?.trim() ||
    (sprint.sprint_fragen?.length ?? 0) > 0 ||
    (sprint.risiken?.length ?? 0) > 0;

  // Karte nur bei Sprints anzeigen, die aus dem Problem-Framing entstanden sind
  // und tatsächlich Daten übernommen haben.
  if (framingQ.isLoading) return null;
  if (!fromFraming) return null;
  if (!hasBasicsData) return null;

  const title = "Handover aus dem Problem Framing";
  const subtitle =
    "Nichts ist in Stein gemeißelt: Alle Ergebnisse aus dem Framing kannst du hier noch schärfen, anpassen und ergänzen – bevor der Sprint startet.";


  async function handleSave() {
    try {
      await update.mutateAsync({
        challenge_statement: draft.challenge_statement.trim(),
        zielgruppe: draft.zielgruppe.trim(),
        erfolgsmessung: draft.erfolgsmessung.trim(),
        decider: draft.decider.trim(),
        sprint_leader: draft.sprint_leader.trim(),
        sprint_fragen: draft.sprint_fragen.map((v) => v.trim()).filter(Boolean),
        risiken: draft.risiken.map((v) => v.trim()).filter(Boolean),
      });
      toast({ title: "Handover aktualisiert" });
    } catch (e) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }

  async function handleConfirm() {
    if (dirty) await handleSave();
    setConfirmed(true);
    setOpen(false);
  }

  const isConfirmed = confirmed && !dirty;

  return (
    <Card className={isConfirmed ? "border-border bg-card" : "border-destructive/40 bg-destructive/5"}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className={`w-5 h-5 mt-0.5 shrink-0 ${isConfirmed ? "text-primary" : "text-destructive"}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">{title}</h3>
                {confirmed && !dirty ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bestätigt
                  </Badge>
                ) : (
                  <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Bitte prüfen
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Zuklappen" : "Aufklappen"}
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {open ? (
          <div className="space-y-4">



            {/* Titel & Problemstellung → Basics-Dialog */}
            <div className="rounded-md border bg-background/60 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Titel
                  </div>
                  <div className="text-sm font-medium">{sprint.titel}</div>
                  {sprint.problemstellung?.trim() &&
                  sprint.problemstellung.trim() !== sprint.challenge_statement?.trim() ? (
                    <>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                        Problemstellung
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{sprint.problemstellung}</p>
                    </>
                  ) : null}
                </div>
                {!isConfirmed ? (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    Bearbeiten
                  </Button>
                ) : null}
              </div>
            </div>


            <EditField
              label="Challenge Statement"
              value={draft.challenge_statement}
              onChange={(v) => setDraft({ ...draft, challenge_statement: v })}
              rows={4}
              readOnly={isConfirmed}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <EditField
                label="Primäre Zielgruppe"
                value={draft.zielgruppe}
                onChange={(v) => setDraft({ ...draft, zielgruppe: v })}
                rows={2}
                readOnly={isConfirmed}
              />
              <EditField
                label="Erfolgsmessung"
                value={draft.erfolgsmessung}
                onChange={(v) => setDraft({ ...draft, erfolgsmessung: v })}
                rows={2}
                readOnly={isConfirmed}
              />
            </div>


            <EditList
              label="Sprint-Fragen"
              items={draft.sprint_fragen}
              onChange={(items) => setDraft({ ...draft, sprint_fragen: items })}
              addLabel="+ Frage hinzufügen"
              placeholder="Können wir …?"
              readOnly={isConfirmed}
            />

            <EditList
              label="Identifizierte Risiken"
              items={draft.risiken}
              onChange={(items) => setDraft({ ...draft, risiken: items })}
              addLabel="+ Risiko hinzufügen"
              placeholder="Risiko …"
              readOnly={isConfirmed}
            />

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              {isConfirmed ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmed(false)}
                >
                  Erneut bearbeiten
                </Button>
              ) : (
                <>
                  {dirty ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDraft(draftFromSprint(sprint))}
                      disabled={update.isPending}
                    >
                      Zurücksetzen
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={!dirty || update.isPending}
                  >
                    {update.isPending ? "Speichert …" : "Änderungen speichern"}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={handleConfirm}
                    disabled={update.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    {dirty ? "Speichern & bestätigen" : "Übernahme bestätigen"}
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EditField({
  label,
  value,
  onChange,
  rows = 3,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <Textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`bg-background ${readOnly ? "cursor-default opacity-80" : ""}`}
      />
    </div>
  );
}

function EditFieldInput({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`bg-background ${readOnly ? "cursor-default opacity-80" : ""}`}
      />
    </div>
  );
}

function EditList({
  label,
  items,
  onChange,
  addLabel,
  placeholder,
  readOnly = false,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((v, i) => (
            <li key={i} className="flex items-start gap-2">
              <Input
                value={v}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`bg-background ${readOnly ? "cursor-default opacity-80" : ""}`}
              />
              {!readOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">— nicht gesetzt —</p>
      )}
      {!readOnly ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...items, ""])}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {addLabel.replace(/^\+\s*/, "")}

      </Button>
      ) : null}
    </div>
  );
}
