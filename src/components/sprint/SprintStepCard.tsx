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
import { Sparkles, Plus, Loader2, X, ExternalLink, Trophy } from "lucide-react";
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
  const [rankLoading, setRankLoading] = useState(false);
  const [aiRank, setAiRank] = useState<SprintStepData["aiRank"]>(initial.aiRank);
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

  // Seed für die Map-Variante (1.8): pro Lane Vorschläge aus früheren Schritten.
  const mapSeed = useMemo<Record<string, string[]> | null>(() => {
    if (step.variant !== "map") return null;
    const byKey = new Map(allSteps.map((s) => [s.step_key, s.data as SprintStepData]));
    const pick = (k: string): string[] => {
      const d = byKey.get(k);
      if (!d) return [];
      const chosen = d.auswahl && d.auswahl.length > 0 ? d.auswahl : null;
      if (chosen) return chosen;
      return toAntwortenArray(d);
    };
    return {
      customers: pick("1.5"),
      discovery: pick("1.6"),
      core: pick("1.7"),
      outcome: pick("1.1"),
      target_risk: pick("1.3"),
      other_actors: [],
    };
  }, [step.variant, allSteps]);

  function applyMapSeed() {
    if (!mapSeed) return 0;
    let added = 0;
    setEigene((prevEigene) => {
      const nextEigene = [...prevEigene];
      setMapZuordnung((prevZ) => {
        const nextZ = { ...prevZ };
        for (const [lane, list] of Object.entries(mapSeed)) {
          for (const raw of list) {
            const item = String(raw).trim();
            if (!item) continue;
            if (
              !nextEigene.includes(item) &&
              !vorschlaege.includes(item) &&
              !antworten.includes(item)
            ) {
              nextEigene.push(item);
            }
            if (!nextZ[item]) {
              nextZ[item] = lane;
              added++;
            }
          }
        }
        return nextZ;
      });
      return nextEigene;
    });
    return added;
  }

  // Auto-Generierung beim ersten Öffnen des Map-Schritts, wenn noch nichts zugeordnet ist.
  useEffect(() => {
    if (step.variant !== "map") return;
    if (Object.keys(mapZuordnung).length > 0) return;
    if (!mapSeed) return;
    const hasSeedItems = Object.values(mapSeed).some((arr) => arr.length > 0);
    if (!hasSeedItems) return;
    applyMapSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.variant, stepRow?.id]);

  function addItemToLane(text: string, lane: string) {
    const v = text.trim();
    if (!v) return;
    if (
      !eigene.includes(v) &&
      !vorschlaege.includes(v) &&
      !antworten.includes(v)
    ) {
      setEigene((prev) => [...prev, v]);
    }
    setMapZuordnung((prev) => ({ ...prev, [v]: lane }));
  }

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
        <div className="space-y-4 rounded-lg border-2 border-accent/40 bg-accent-soft p-5">
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
                  className="relative rounded-md border border-accent/50 bg-accent/30 p-3 shadow-sm"
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

        {/* Notes-Variante: bewusst KEIN Recap, KEINE KI — der User soll aus dem
            Gedächtnis aufschreiben, was hängen geblieben ist. */}


        {/* 3. KI-Vorschläge */}
        {step.variant !== "notes" ? (
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
                    {!checked ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          setVorschlaege((prev) => prev.filter((x) => x !== opt));
                          setEigene((prev) => prev.filter((x) => x !== opt));
                        }}
                        aria-label="Vorschlag entfernen"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        ) : null}

        {/* 4. Eigene Antwort */}
        {step.variant !== "notes" ? (
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
        ) : null}

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
            onAddToLane={addItemToLane}
            onRegenerate={() => {
              const n = applyMapSeed();
              toast({
                title: "Gesamtkarte aktualisiert",
                description:
                  n > 0
                    ? `${n} neue Einträge aus früheren Schritten ergänzt.`
                    : "Es gab nichts Neues aus den vorherigen Schritten zu ergänzen.",
              });
            }}
            hasSeed={!!mapSeed && Object.values(mapSeed).some((a) => a.length > 0)}
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
        {contextEntries.length > 0 && step.variant !== "notes" ? (
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

/* ------------------------- One-Pager Recap (Tag 1) ------------------------ */

interface OnePagerRecapProps {
  entries: ContextEntry[];
  allSteps: SprintStepRow[];
}

const RECAP_LABELS: Record<string, string> = {
  "1.1": "Ziel",
  "1.2": "Metriken",
  "1.3": "Risiken",
  "1.4": "HMW-Fragen",
  "1.5": "Kunden",
  "1.6": "Discovery",
  "1.7": "Core",
  "1.8": "Map · Zielrisiko & Kernteile",
  "2.1": "Lightning Demos",
};

function OnePagerRecap({ entries, allSteps }: OnePagerRecapProps) {
  const byKey = new Map(allSteps.map((s) => [s.step_key, s.data as SprintStepData] as const));

  const items = entries
    .filter((e) => !e.key.startsWith("sprint."))
    .map((e) => {
      const d = byKey.get(e.key);
      const chosen = d?.auswahl && d.auswahl.length > 0 ? d.auswahl : [];
      const ans = d ? toAntwortenArray(d) : [];
      const list = chosen.length > 0 ? chosen : ans;
      const mapZ =
        e.key === "1.8" && d?.mapZuordnung && typeof d.mapZuordnung === "object"
          ? (d.mapZuordnung as Record<string, string>)
          : null;
      return {
        key: e.key,
        label: RECAP_LABELS[e.key] ?? `Schritt ${e.key}`,
        list,
        mapZ,
      };
    });

  const hasAny = items.some((i) => i.list.length > 0 || (i.mapZ && Object.keys(i.mapZ).length > 0));

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-muted/20 p-5">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">Tag 1 · One Pager</h3>
        <p className="text-sm text-muted-foreground">
          Frische dein Gedächtnis auf: Ziel, Metrik, Zielrisiko, Lieblings-HMWs, Lightning Demos und Kernteile der Map.
        </p>
      </div>

      {!hasAny ? (
        <p className="text-sm italic text-muted-foreground">
          Noch keine Ergebnisse aus Tag 1 vorhanden.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.key} className="rounded-lg border bg-background p-3">
              <h4 className="font-semibold text-xs uppercase tracking-wide text-primary mb-2">
                {it.label}
              </h4>
              {it.list.length === 0 && !it.mapZ ? (
                <p className="text-xs italic text-muted-foreground/60">—</p>
              ) : (
                <>
                  {it.list.length > 0 ? (
                    <ul className="space-y-1 text-sm list-disc pl-4">
                      {it.list.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  ) : null}
                  {it.mapZ ? (
                    <ul className="mt-2 space-y-1 text-xs">
                      {MAP_LANES.map((lane) => {
                        const laneItems = Object.entries(it.mapZ!)
                          .filter(([, l]) => l === lane.id)
                          .map(([item]) => item);
                        if (laneItems.length === 0) return null;
                        return (
                          <li key={lane.id}>
                            <span className="font-semibold">{lane.label}:</span>{" "}
                            <span className="text-muted-foreground">
                              {laneItems.join(" · ")}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- MapBoard -------------------------------- */


interface MapBoardProps {
  items: string[];
  assignments: Record<string, string>;
  onAssign: (item: string, lane: string | null) => void;
  onAddToLane: (text: string, lane: string) => void;
  onRegenerate: () => void;
  hasSeed: boolean;
}

function MapBoard({
  items,
  assignments,
  onAssign,
  onAddToLane,
  onRegenerate,
  hasSeed,
}: MapBoardProps) {
  const [laneInput, setLaneInput] = useState<Record<string, string>>({});
  const unassigned = items.filter((it) => !assignments[it]);
  const byLane = (laneId: string) => items.filter((it) => assignments[it] === laneId);

  function submitLane(laneId: string) {
    const v = (laneInput[laneId] ?? "").trim();
    if (!v) return;
    onAddToLane(v, laneId);
    setLaneInput((prev) => ({ ...prev, [laneId]: "" }));
  }

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-muted/20 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Map – Gesamtkarte</h3>
          <p className="text-sm text-muted-foreground">
            Wir haben deine Gesamtkarte automatisch aus den vorherigen Schritten aufgebaut.
            Fehlt etwas? Ergänze pro Bereich beliebig viele Einträge.
          </p>
        </div>
        {hasSeed ? (
          <Button type="button" variant="outline" size="sm" onClick={onRegenerate}>
            <Sparkles className="w-4 h-4 mr-1" />
            Aus Schritten neu erstellen
          </Button>
        ) : null}
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
              className="rounded-lg border bg-background p-3 min-h-[160px] flex flex-col"
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
                      className="rounded-md border border-accent/50 bg-accent/40 p-2 text-xs shadow-sm"
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

              {/* Per-lane Hinzufügen */}
              <div className="mt-2 flex gap-1">
                <Input
                  value={laneInput[lane.id] ?? ""}
                  onChange={(e) =>
                    setLaneInput((prev) => ({ ...prev, [lane.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitLane(lane.id);
                    }
                  }}
                  placeholder="Fehlt etwas? +"
                  className="h-7 text-xs"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => submitLane(lane.id)}
                  aria-label={`Eintrag zu ${lane.label} hinzufügen`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

