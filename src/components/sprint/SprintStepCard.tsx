import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Plus, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SprintStepDef } from "@/features/sprint/steps";
import type { SprintRow, SprintStepData, SprintStepRow } from "@/features/sprint/types";
import { MAP_LANES } from "@/features/sprint/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SprintStepCardProps {
  sprint: SprintRow;
  step: SprintStepDef;
  stepRow: SprintStepRow | undefined;
  allSteps: SprintStepRow[];
  totalIndex: number;
  totalCount: number;
  onSave: (data: SprintStepData, opts?: { completed?: boolean }) => Promise<void>;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function SprintStepCard({
  sprint,
  step,
  stepRow,
  allSteps,
  totalIndex,
  totalCount,
  onSave,
  onNext,
  onPrev,
}: SprintStepCardProps) {
  const initial = (stepRow?.data ?? {}) as SprintStepData;
  const [antworten, setAntworten] = useState<string[]>(toAntwortenArray(initial));
  const [antwortInput, setAntwortInput] = useState("");
  const [vorschlaege, setVorschlaege] = useState<string[]>(initial.vorschlaege ?? []);
  const [eigene, setEigene] = useState<string[]>(initial.eigene ?? []);
  const [auswahl, setAuswahl] = useState<string[]>(initial.auswahl ?? []);
  const [eigenInput, setEigenInput] = useState("");
  const [notes, setNotes] = useState<string>(initial.notes ?? "");
  const [mapZuordnung, setMapZuordnung] = useState<Record<string, string>>(
    initial.mapZuordnung ?? {},
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = (stepRow?.data ?? {}) as SprintStepData;
    setAntworten(toAntwortenArray(d));
    setAntwortInput("");
    setVorschlaege(d.vorschlaege ?? []);
    setEigene(d.eigene ?? []);
    setAuswahl(d.auswahl ?? []);
    setNotes(d.notes ?? "");
    setMapZuordnung(d.mapZuordnung ?? {});
  }, [stepRow?.id]);


  const isSolo = sprint.modus === "solo";
  // Im Solo-Modus gibt es keine Abstimmung — Auswahl ist unbegrenzt.
  // Im Team-Modus greift weiterhin das Stimmen-Limit (perspektivisch pro User).
  const limit = isSolo ? undefined : step.stimmenLimit;
  const limitReached = !!limit && auswahl.length >= limit;


  const contextEntries = useMemo(
    () => buildContextEntries(step.nutztDatenAus, sprint, allSteps),
    [step.nutztDatenAus, sprint, allSteps],
  );

  function toggleAuswahl(option: string) {
    setAuswahl((prev) => {
      if (prev.includes(option)) return prev.filter((x) => x !== option);
      if (limit && prev.length >= limit) return prev;
      return [...prev, option];
    });
  }

  function addEigen() {
    const v = eigenInput.trim();
    if (!v) return;
    if (eigene.includes(v) || vorschlaege.includes(v)) {
      setEigenInput("");
      return;
    }
    setEigene([...eigene, v]);
    setEigenInput("");
  }

  async function handleGenerate() {
    setAiLoading(true);
    try {
      const ctx = contextEntries.reduce<Record<string, unknown>>((acc, e) => {
        acc[e.key] = e.value;
        return acc;
      }, {});
      const cleaned = antworten.map((a) => a.trim()).filter(Boolean);
      if (cleaned.length > 0) {
        ctx["eigene_antworten_in_diesem_schritt"] = cleaned;
      }

      const { data, error } = await supabase.functions.invoke("sprint-ai-suggest", {
        body: {
          sprint_id: sprint.id,
          step_key: step.key,
          context: ctx,
          step_frage: step.frage,
          step_arbeit: step.arbeit,
        },
      });

      if (error) throw error;
      const arr = Array.isArray((data as any)?.vorschlaege)
        ? ((data as any).vorschlaege as string[])
        : [];
      if (arr.length === 0) {
        toast({
          title: "Keine Vorschläge",
          description: "Die KI hat keine Vorschläge geliefert. Versuche es erneut.",
        });
      }
      // merge: keep existing + add new (unique)
      const set = new Set(vorschlaege);
      arr.forEach((v) => set.add(v));
      setVorschlaege(Array.from(set));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      toast({ title: "Vorschläge fehlgeschlagen", description: msg, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  async function persist(completed: boolean) {
    setSaving(true);
    try {
      await onSave(
        { antworten, vorschlaege, eigene, auswahl, notes, mapZuordnung },
        { completed },
      );
      if (completed && onNext) onNext();
    } finally {
      setSaving(false);
    }
  }

  function addAntwort() {
    const v = antwortInput.trim();
    if (!v) return;
    setAntworten((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setAntwortInput("");
  }

  function removeAntwort(idx: number) {
    setAntworten((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateAntwort(idx: number, value: string) {
    setAntworten((prev) => prev.map((a, i) => (i === idx ? value : a)));
  }

  const allOptions = [...vorschlaege, ...eigene];

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-8 lg:p-12 space-y-8">
        {/* Progress + Day */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="outline" className="text-sm">
            {step.dayLabel} · Schritt {totalIndex + 1} von {totalCount}
          </Badge>
          {limit ? (
            <span className="text-sm text-muted-foreground">
              {auswahl.length} / {limit} Stimmen
            </span>
          ) : isSolo ? (
            <span className="text-sm text-muted-foreground">
              {auswahl.length} ausgewählt
            </span>
          ) : null}

        </div>

        {/* 1. Frage */}
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-bold">{step.title}</h2>
          <p className="text-xl text-muted-foreground">{step.frage}</p>
        </div>

        {/* 2. Anweisungsblock */}
        <div className="rounded-lg bg-muted/40 p-5 space-y-3 text-sm">
          <p>
            <span className="font-semibold">
              {sprint.modus === "solo" ? "Allein arbeiten" : "Zusammen arbeiten"}:
            </span>{" "}
            {step.arbeit}
          </p>
          {step.abstimmung && !isSolo ? (
            <p>
              <span className="font-semibold">Wie wird abgestimmt:</span> {step.abstimmung}
            </p>
          ) : null}

          {step.entscheidung ? (
            <p>
              <span className="font-semibold">Wer entscheidet:</span> {step.entscheidung}
            </p>
          ) : null}
        </div>

        {/* 2b. Deine Antworten auf die Frage */}
        <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-5">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Deine Antworten</h3>
            <p className="text-sm text-muted-foreground">{step.frage}</p>
            <p className="text-xs text-muted-foreground">
              Erfasse mehrere kurze Antworten — eine pro Sticky-Note.
            </p>
          </div>

          {antworten.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {antworten.map((a, idx) => (
                <li
                  key={idx}
                  className="relative rounded-md border border-primary/30 bg-background p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {idx + 1}
                    </Badge>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => removeAntwort(idx)}
                      aria-label="Antwort entfernen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Textarea
                    value={a}
                    onChange={(e) => updateAntwort(idx, e.target.value)}
                    rows={3}
                    className="bg-background resize-none text-sm"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex gap-2">
            <Input
              value={antwortInput}
              onChange={(e) => setAntwortInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAntwort();
                }
              }}
              placeholder="Antwort eingeben und Enter drücken …"
              className="bg-background"
            />
            <Button type="button" onClick={addAntwort} variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              Hinzufügen
            </Button>
          </div>
        </div>


        {/* 3. KI-Vorschläge */}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">KI-Vorschläge</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {vorschlaege.length === 0 ? "Vorschläge generieren" : "Mehr Vorschläge"}
            </Button>
          </div>

          {allOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Noch keine Einträge. Klicke „Vorschläge generieren" oder ergänze eigene Antworten unten.
            </p>
          ) : (
            <ul className="space-y-2">
              {allOptions.map((opt) => {
                const checked = auswahl.includes(opt);
                const disabled = !checked && limitReached;
                return (
                  <li
                    key={opt}
                    className="flex items-start gap-3 p-3 rounded-md border bg-background hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      id={`${step.key}-${opt}`}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggleAuswahl(opt)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`${step.key}-${opt}`}
                      className={`text-sm leading-relaxed cursor-pointer flex-1 ${
                        disabled ? "opacity-50" : ""
                      }`}
                    >
                      {opt}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 4. Eigene Antwort */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Eigene Antwort hinzufügen</h3>
          <div className="flex gap-2">
            <Input
              value={eigenInput}
              onChange={(e) => setEigenInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEigen();
                }
              }}
              placeholder="Eigene Antwort eingeben …"
            />
            <Button type="button" onClick={addEigen} variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              Hinzufügen
            </Button>
          </div>
        </div>

        {/* 4b. Map-Board (nur für Variante "map") */}
        {step.variant === "map" ? (
          <MapBoard
            items={Array.from(new Set([...antworten, ...vorschlaege, ...eigene])).filter(
              (x) => x.trim().length > 0,
            )}
            assignments={mapZuordnung}
            onAssign={(item, lane) =>
              setMapZuordnung((prev) => {
                const next = { ...prev };
                if (!lane) delete next[item];
                else next[item] = lane;
                return next;
              })
            }
          />
        ) : null}

        {/* Notizen */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Notizen (optional)</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Begründung, Diskussionsergebnisse …"
            rows={3}
          />
        </div>

        {/* 5. Kontext-Panel */}
        {contextEntries.length > 0 ? (
          <Accordion type="single" collapsible className="border rounded-lg">
            <AccordionItem value="ctx" className="border-none">
              <AccordionTrigger className="px-4">
                Nutzt Daten aus früheren Schritten ({contextEntries.length})
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-3 text-sm">
                  {contextEntries.map((e) => (
                    <li key={e.key}>
                      <div className="font-semibold">{e.label}</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {formatContextValue(e.value)}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        {/* 6. Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onPrev} disabled={!onPrev || saving}>
            Zurück
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => persist(false)} disabled={saving}>
              {saving ? "Speichert …" : "Zwischenspeichern"}
            </Button>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => persist(true)}
              disabled={saving}
            >
              {saving ? "Speichert …" : onNext ? "Weiter" : "Sprint abschließen"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ context helpers ----------------------------- */

interface ContextEntry {
  key: string;
  label: string;
  value: unknown;
}

function buildContextEntries(
  refs: string[],
  sprint: SprintRow,
  steps: SprintStepRow[],
): ContextEntry[] {
  const byKey = new Map(steps.map((s) => [s.step_key, s] as const));
  const entries: ContextEntry[] = [];
  for (const ref of refs) {
    if (ref === "sprint.titel") {
      entries.push({ key: ref, label: "Sprint-Titel", value: sprint.titel });
      continue;
    }
    if (ref === "sprint.problemstellung") {
      entries.push({
        key: ref,
        label: "Problemstellung",
        value: sprint.problemstellung || "—",
      });
      continue;
    }
    const row = byKey.get(ref);
    if (!row) {
      entries.push({ key: ref, label: `Schritt ${ref}`, value: "(noch nicht ausgefüllt)" });
      continue;
    }
    const d = row.data as SprintStepData;
    const chosen = d.auswahl && d.auswahl.length > 0 ? d.auswahl : null;
    const antworten = toAntwortenArray(d);
    const value: Record<string, unknown> = {};
    if (antworten.length > 0) value.antworten = antworten;
    if (chosen) value.auswahl = chosen;
    entries.push({
      key: ref,
      label: `Schritt ${ref}`,
      value: Object.keys(value).length > 0 ? value : "(noch keine Eingaben)",
    });
  }

  return entries;
}

function formatContextValue(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => `• ${String(x)}`).join("\n");
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    const parts: string[] = [];
    if (Array.isArray(obj.antworten))
      parts.push("Antworten:\n" + obj.antworten.map((x) => `• ${String(x)}`).join("\n"));
    else if (typeof obj.antwort === "string")
      parts.push(`Antwort: ${obj.antwort}`);
    if (Array.isArray(obj.auswahl))
      parts.push("Auswahl:\n" + obj.auswahl.map((x) => `• ${String(x)}`).join("\n"));
    return parts.length ? parts.join("\n") : JSON.stringify(v);
  }
  if (v == null) return "—";
  return String(v);
}

/** Normalisiert altes `antwort`-Feld und neues `antworten`-Array auf string[]. */
function toAntwortenArray(d: SprintStepData): string[] {
  if (Array.isArray(d.antworten)) {
    return d.antworten.filter((x): x is string => typeof x === "string");
  }
  if (typeof d.antwort === "string" && d.antwort.trim()) {
    return [d.antwort];
  }
  return [];
}

/* --------------------------------- MapBoard -------------------------------- */

interface MapBoardProps {
  items: string[];
  assignments: Record<string, string>;
  onAssign: (item: string, lane: string | null) => void;
}

function MapBoard({ items, assignments, onAssign }: MapBoardProps) {
  const unassigned = items.filter((it) => !assignments[it]);
  const byLane = (laneId: string) => items.filter((it) => assignments[it] === laneId);

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-muted/20 p-5">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">Map – Gesamtkarte</h3>
        <p className="text-sm text-muted-foreground">
          Ordne deine Antworten und KI-Vorschläge den Bereichen der Customer-Journey-Map zu.
        </p>
      </div>

      {/* Pool */}
      {unassigned.length > 0 ? (
        <div className="rounded-md border bg-background p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Noch zuzuordnen ({unassigned.length})
          </p>
          <ul className="space-y-2">
            {unassigned.map((it) => (
              <li
                key={it}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/40 text-sm"
              >
                <span className="flex-1">{it}</span>
                <Select value="" onValueChange={(v) => onAssign(it, v)}>
                  <SelectTrigger className="w-44 h-8">
                    <SelectValue placeholder="Bereich wählen …" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_LANES.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Lanes */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MAP_LANES.map((lane) => {
          const laneItems = byLane(lane.id);
          return (
            <div
              key={lane.id}
              className="rounded-lg border bg-background p-3 min-h-[140px] flex flex-col"
            >
              <div className="mb-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {lane.label}
                </h4>
                {lane.hint ? (
                  <p className="text-[11px] text-muted-foreground/70">{lane.hint}</p>
                ) : null}
              </div>
              <ul className="space-y-2 flex-1">
                {laneItems.length === 0 ? (
                  <li className="text-xs italic text-muted-foreground/60">
                    Noch keine Einträge
                  </li>
                ) : (
                  laneItems.map((it) => (
                    <li
                      key={it}
                      className="rounded-md border border-yellow-300/60 bg-yellow-100/70 dark:bg-yellow-200/20 p-2 text-xs shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-1 leading-snug">{it}</span>
                        <button
                          type="button"
                          onClick={() => onAssign(it, null)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Aus Bereich entfernen"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="mt-1">
                        <Select
                          value={lane.id}
                          onValueChange={(v) => onAssign(it, v)}
                        >
                          <SelectTrigger className="h-6 w-full text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAP_LANES.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

