import { useEffect, useMemo, useState, type ReactNode, type DragEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Plus, X, PenLine, Search, ArrowRight, Info, HelpCircle, Lightbulb, AlertTriangle, Coffee } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FRAMING_STEPS, type FramingStepDef } from "@/features/framing/steps";
import { getStepWarnings } from "@/features/framing/validation";
import type {
  FramingStepData,
  FramingStepRow,
} from "@/features/framing/types";

import { useFramingSuggest, useFramingRatingSuggest } from "@/hooks/useFraming";
import type { NufRatingSuggestion } from "@/hooks/useFraming";
import { Slider } from "@/components/ui/slider";
import { CanvasSection } from "./CanvasSection";
import { StakeholderMap } from "./StakeholderMap";
import { SailboatIllustration } from "@/components/lms/SailboatIllustration";
import { ExternalLlmBar } from "./ExternalLlmBar";
import { EXTERNAL_LLMS, useExternalLlms } from "@/features/framing/externalLlms";

interface Props {
  sessionId: string;
  step: FramingStepDef;
  stepRow: FramingStepRow | undefined;
  allSteps: FramingStepRow[];
  onSave: (data: FramingStepData, opts?: { completed?: boolean }) => Promise<void>;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function FramingStepCard({
  sessionId,
  step,
  stepRow,
  allSteps,
  onSave,
  onPrev,
  onNext,
}: Props) {
  const initial = (stepRow?.data ?? {}) as FramingStepData;
  const [data, setData] = useState<FramingStepData>(initial);
  const [saving, setSaving] = useState(false);
  const suggest = useFramingSuggest();
  const [vorschlaege, setVorschlaege] = useState<string[]>(initial.vorschlaege ?? []);
  const [pendingBucket, setPendingBucket] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const d = (stepRow?.data ?? {}) as FramingStepData;
    setData(d);
    setVorschlaege([]);
    setWarnings([]);
  }, [stepRow?.id]);




  function patch(p: Partial<FramingStepData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  async function loadSuggestions(field?: string) {
    setPendingBucket(field ?? "__all__");
    try {
      const res = await suggest.mutateAsync({
        session_id: sessionId,
        step_key: step.key,
        field,
      });
      const incoming = res.vorschlaege ?? [];
      if (
        (step.variant === "two-fields" ||
          step.variant === "stakeholder" ||
          step.variant === "context-list" ||
          step.variant === "sailboat" ||
          step.variant === "five-whys" ||
         
          step.variant === "assumptions" ||
          step.variant === "success-constraints" ||
          step.variant === "scope-questions") &&
        field
      ) {
        // Replace only this bucket's suggestions, keep others
        const bucket = field.toLowerCase();
        setVorschlaege((prev) => [
          ...prev.filter((v) => bucketOfSuggestion(v) !== bucket),
          ...incoming,
        ]);
      } else {
        setVorschlaege(incoming);
      }
    } catch (e) {
      toast({
        title: "KI-Vorschläge fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setPendingBucket(null);
    }
  }

  async function handleSave(opts?: { completed?: boolean; next?: boolean; force?: boolean }) {
    if (opts?.completed) {
      const w = getStepWarnings(step.key, data);
      setWarnings(w);
      // Bei offenen Angaben speichern wir als abgeschlossen, bleiben aber
      // stehen, damit der gelbe Hinweis sichtbar ist. Erst ein weiterer Klick
      // ("Trotzdem weiter") navigiert weiter.
      if (w.length > 0 && !opts?.force) {
        setSaving(true);
        try {
          const { vorschlaege: _discard, ...cleanData } = data as Record<string, unknown>;
          await onSave(cleanData as FramingStepData, { completed: true });
        } finally {
          setSaving(false);
        }
        return;
      }
    } else {
      setWarnings([]);
    }
    setSaving(true);
    try {
      const { vorschlaege: _discard, ...cleanData } = data as Record<string, unknown>;
      await onSave(cleanData as FramingStepData, { completed: opts?.completed });
      if (opts?.next && onNext) onNext();
    } finally {
      setSaving(false);
    }
  }

  if (step.variant === "intro") {
    return <IntroSlide onNext={onNext} />;
  }

  // In Schritt 9 werden [Erfolg]-Vorschläge direkt im Erfolgsblock angezeigt.
  const listSuggestions =
    step.variant === "nuf"
      ? vorschlaege.filter((v) => bucketOfSuggestion(v) !== "erfolg")
      : vorschlaege;

  const realStepCount = FRAMING_STEPS.filter((s) => s.variant !== "intro").length;

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
        {step.pausenHinweis ? (
          <div className="flex items-start gap-2 rounded-lg border border-border-accent bg-accent-soft p-3 text-sm">
            <Coffee className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span className="text-foreground/80">{step.pausenHinweis}</span>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              Timebox {step.timeboxMin} Min · Schritt {step.index} von {realStepCount}
            </Badge>

            <h2 className="text-xl sm:text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground mt-1 inline-flex items-center gap-1.5 flex-wrap">
              <span>{step.frage}</span>
              {step.variant === "nuf" ? (
                <a
                  href="https://gamma.app/docs/Die-NUF-Methode-yxs1qsjnjyii9uu?mode=doc"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Erklärung zur NUF-Methode"
                  title="Erklärung zur NUF-Methode"
                  className="inline-flex items-center justify-center rounded-full text-primary hover:text-primary/80"
                >
                  <HelpCircle className="w-4 h-4" />
                </a>
              ) : null}

            </p>
            <p className="text-sm text-muted-foreground mt-2">{step.arbeit}</p>

            {step.nutzen ? (
              <div className="mt-3 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Lightbulb className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-primary">Warum jetzt? </span>
                  <span className="text-foreground/80">{step.nutzen}</span>
                </div>
              </div>
            ) : null}

          </div>
        </div>

        <ExternalLlmBar />

        <StepVariant
          step={step}
          sessionId={sessionId}
          allSteps={allSteps}
          data={data}
          patch={patch}
          suggestions={vorschlaege}
          onLoadSuggestions={(field) => loadSuggestions(field)}
          suggestPending={suggest.isPending}
          pendingBucket={pendingBucket}
          onAcceptSuggestion={(i) => {
            const v = vorschlaege[i];
            if (v == null) return;
            const next = { ...data };
            applySuggestion(step.variant, v, next);
            setData(next);
            setVorschlaege((prev) => prev.filter((_, j) => j !== i));
          }}
          onDismissSuggestion={(i) =>
            setVorschlaege((prev) => prev.filter((_, j) => j !== i))
          }
        />

        {listSuggestions.length > 0 && step.variant !== "two-fields" && step.variant !== "stakeholder" && step.variant !== "context-list" && step.variant !== "sailboat" && step.variant !== "five-whys" && step.variant !== "assumptions" && step.variant !== "success-constraints" && step.variant !== "scope-questions" ? (
          <div className="rounded-lg border border-accent/60 bg-accent-soft p-4 text-foreground">
            <div className="text-sm font-semibold mb-2 flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> KI-Vorschläge
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const next = { ...data };
                    listSuggestions.forEach((v) => applySuggestion(step.variant, v, next));
                    setData(next);
                    setVorschlaege((prev) => prev.filter((v) => !listSuggestions.includes(v)));
                    toast({ title: "Alle Vorschläge übernommen" });
                  }}
                >
                  Alle übernehmen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVorschlaege([])}
                >
                  Verwerfen
                </Button>
              </div>
            </div>
            <ul className="space-y-1.5">
              {listSuggestions.map((v) => (
                <li
                  key={v}
                  className="flex items-start gap-2 rounded-md border border-accent/60 bg-accent-soft px-3 py-2 text-sm text-foreground"
                >
                  <span className="flex-1">{v}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      const next = { ...data };
                      applySuggestion(step.variant, v, next);
                      setData(next);
                      setVorschlaege((prev) => prev.filter((x) => x !== v));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Übernehmen
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setVorschlaege((prev) => prev.filter((x) => x !== v))}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="rounded-lg border-l-4 border-l-amber-500 border border-amber-500/30 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
            <div className="flex items-center gap-2 font-medium mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Noch offen in diesem Schritt
            </div>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <p className="mt-2 text-muted-foreground">
              Du kannst trotzdem weiter und später zurückkommen.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          {step.variant !== "two-fields" && step.variant !== "stakeholder" && step.variant !== "context-list" && step.variant !== "sailboat" && step.variant !== "five-whys" && step.variant !== "assumptions" && step.variant !== "success-constraints" && step.variant !== "nuf" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!border-accent !bg-accent-soft !text-foreground hover:!bg-accent hover:!text-foreground"
              onClick={() => loadSuggestions()}
              disabled={suggest.isPending}
            >
              {suggest.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              KI-Vorschläge
            </Button>
          ) : null}

          <div className="flex-1" />

          {onPrev ? (
            <Button variant="ghost" onClick={onPrev} disabled={saving}>
              Zurück
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
            {saving ? "Speichert …" : "Speichern"}
          </Button>
          <Button
            className=""
            onClick={() =>
              handleSave({ completed: true, next: true, force: warnings.length > 0 })
            }
            disabled={saving}
          >
            {saving
              ? "Speichert …"
              : warnings.length > 0
                ? "Trotzdem weiter"
                : onNext
                  ? "Abschließen & weiter"
                  : "Abschließen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepVariant({
  step,
  sessionId,
  allSteps,
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  suggestPending,
  pendingBucket,
}: {
  step: FramingStepDef;
  sessionId: string;
  allSteps: FramingStepRow[];
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  suggestPending: boolean;
  pendingBucket: string | null;
}) {
  switch (step.variant) {
    case "context-list":
      return (
        <VariantContextList
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "two-fields":
      return (
        <VariantTwoFields
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "stakeholder":
      return (
        <VariantStakeholder
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "sailboat":
      return (
        <VariantSailboat
          allSteps={allSteps}
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "five-whys":
      return (
        <VariantFiveWhys
          allSteps={allSteps}
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "assumptions":
      return (
        <VariantAssumptions
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "success-constraints":
      return (
        <VariantSuccess
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "scope-questions":
      return (
        <VariantScope
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "nuf":
      return (
        <VariantNuf
          sessionId={sessionId}
          allSteps={allSteps}
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          pendingBucket={pendingBucket}
        />
      );
    case "next-steps":
      return <VariantNextSteps data={data} patch={patch} />;
  }
}

/* ---------- suggestion adoption ---------- */

function applySuggestion(
  variant: FramingStepDef["variant"],
  raw: string,
  data: FramingStepData,
): void {
  const text = raw.trim();
  if (!text) return;
  const pushUnique = (arr: string[] | undefined, v: string): string[] => {
    const list = arr ?? [];
    return list.includes(v) ? list : [...list, v];
  };

  switch (variant) {
    case "context-list": {
      const b = bucketOfSuggestion(text);
      const value = b ? stripBucketTag(text) : text;
      if (b === "ziel") {
        data.kiLangfristziel = pushUnique(data.kiLangfristziel, value);
      } else if (b === "kontext") {
        data.kiKontext = pushUnique(data.kiKontext, value);
      } else {
        data.kiNichtZiele = pushUnique(data.kiNichtZiele, value);
      }
      return;
    }
    case "two-fields": {
      const m = text.match(/^\[(Gegenwart|Present|Vergangenheit|Past|Zukunft|Future|Standard-Zukunft|Default Future|Wettbewerb|Trends|Chancen)\]\s*(.+)$/i);
      const bucket = m ? m[1].toLowerCase() : "future";
      const value = m ? m[2].trim() : text;
      if (bucket === "present" || bucket === "gegenwart") {
        data.kiWarumJetzt = pushUnique(data.kiWarumJetzt, value);
      } else if (bucket === "past" || bucket === "vergangenheit") {
        // Vergangenheit hat keine KI-Übernahme (User-only)
        return;
      } else if (bucket === "wettbewerb") {
        data.kiWettbewerber = pushUnique(data.kiWettbewerber, value);
      } else if (bucket === "trends") {
        data.kiTrends = pushUnique(data.kiTrends, value);
      } else if (bucket === "chancen") {
        data.kiChancen = pushUnique(data.kiChancen, value);
      } else {
        // future / default future
        data.kiDefaultFuture = pushUnique(data.kiDefaultFuture, value);
      }
      return;
    }
    case "stakeholder": {
      const b = bucketOfSuggestion(text);
      const value = b ? stripBucketTag(text) : text;
      if (b === "geparkt") {
        data.kiSekundaerGeparkt = pushUnique(data.kiSekundaerGeparkt, value);
      } else if (b === "heute") {
        data.kiKundeHeuteLoesung = pushUnique(data.kiKundeHeuteLoesung, value);
      } else if (b === "paingain") {
        data.kiKundePainGain = pushUnique(data.kiKundePainGain, value);
      } else {
        data.kiStakeholder = pushUnique(data.kiStakeholder, value);
      }
      return;
    }
    case "sailboat": {
      const m = text.match(/^\[(Wind|Anker|Hafen|Eisberg)\]\s*(.+)$/i);
      const bucket = m ? m[1].toLowerCase() : "wind";
      const value = m ? m[2].trim() : text;
      if (bucket === "wind") data.kiWind = pushUnique(data.kiWind, value);
      else if (bucket === "anker") data.kiAnker = pushUnique(data.kiAnker, value);
      else if (bucket === "hafen") data.kiHafen = pushUnique(data.kiHafen, value);
      else if (bucket === "eisberg") data.kiEisberg = pushUnique(data.kiEisberg, value);
      return;
    }
    case "five-whys": {
      const sym = text.match(/^\[(Symptom)\]\s*(.+)$/i);
      if (sym) {
        data.kiSymptom = pushUnique(data.kiSymptom, sym[2].trim());
        return;
      }
      const m = text.match(/^\[(Why|Warum|Ursache|Cause)\]\s*(.+)$/i);
      const bucket = m ? m[1].toLowerCase() : "why";
      const value = m ? m[2].trim() : text;
      if (bucket === "ursache" || bucket === "cause") {
        data.kiUrsachen = pushUnique(data.kiUrsachen, value);
      } else {
        const total = (data.fiveWhys?.length ?? 0) + (data.kiFiveWhys?.length ?? 0);
        if (total >= 5) return;
        data.kiFiveWhys = pushUnique(data.kiFiveWhys, value);
      }
      return;
    }
    case "assumptions": {
      const m = text.match(/^\[(Kritisch|Unsicher|Einflussreich|Gering)\]\s*(.+)$/i);
      const tag = m ? m[1].toLowerCase() : "";
      const value = m ? m[2].trim() : text;
      let unsicherheit = 3;
      let einfluss = 3;
      if (tag === "kritisch") { unsicherheit = 5; einfluss = 5; }
      else if (tag === "unsicher") { unsicherheit = 5; einfluss = 2; }
      else if (tag === "einflussreich") { unsicherheit = 2; einfluss = 5; }
      else if (tag === "gering") { unsicherheit = 2; einfluss = 2; }
      data.annahmen = [
        ...(data.annahmen ?? []),
        { text: value, unsicherheit, einfluss },
      ];
      return;
    }
    case "success-constraints": {
      const b = bucketOfSuggestion(text);
      const value = b ? stripBucketTag(text) : text;
      if (b === "erfolg") {
        data.kiErfolgsmessung = pushUnique(data.kiErfolgsmessung, value);
      } else {
        data.kiConstraints = pushUnique(data.kiConstraints, value);
      }
      return;
    }
    case "scope-questions": {
      const b = bucketOfSuggestion(text);
      const value = b ? stripBucketTag(text) : text;
      if (b === "inscope") {
        data.kiInScope = pushUnique(data.kiInScope, value);
      } else if (b === "outscope") {
        data.kiOutOfScope = pushUnique(data.kiOutOfScope, value);
      } else {
        data.kiSprintFragen = pushUnique(data.kiSprintFragen, value);
      }
      return;
    }
    case "nuf": {
      const erf = text.match(/^\[(Erfolg|Success|KPI|Metrik)\]\s*(.+)$/i);
      if (erf) {
        const wert = erf[2].trim();
        data.kiErfolgsmessung = pushUnique(data.kiErfolgsmessung, wert);
        if (!(data.erfolgsmessung ?? "").trim()) data.erfolgsmessung = wert;
      }
      // In Schritt 9 wird priorisiert, nicht gesammelt: Vorschläge ohne
      // [Erfolg]-Tag erzeugen bewusst keine neue Bewertungszeile.
      return;
    }
    case "next-steps":
      data.preSprintTodos = [
        ...(data.preSprintTodos ?? []),
        { text, wer: "", wann: "" },
      ];
      return;
  }
}

/* ---------- shared list editor ---------- */


function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  maxItems,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxItems?: number;
}) {
  const [input, setInput] = useState("");
  const isFull = typeof maxItems === "number" && items.length >= maxItems;
  const commit = () => {
    if (isFull) return;
    if (input.trim()) {
      onChange([...items, input.trim()]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isFull ? null : (
        <div className={multiline ? "flex flex-col gap-2" : "flex gap-2"}>
          {multiline ? (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && input.trim()) {
                  e.preventDefault();
                  commit();
                }
              }}
            />
          ) : (
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  e.preventDefault();
                  commit();
                }
              }}
            />
          )}
          <Button
            type="button"
            variant="outline"
            size={multiline ? "sm" : "icon"}
            className={multiline ? "self-end" : ""}
            onClick={commit}
          >
            <Plus className="w-4 h-4" />
            {multiline ? <span className="ml-1">Hinzufügen</span> : null}
          </Button>
        </div>
      )}
      {typeof maxItems === "number" ? (
        <p className="text-xs text-muted-foreground">
          {items.length} / {maxItems}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li
              key={i}
              className={`flex ${multiline ? "items-start" : "items-center"} justify-between gap-2 rounded-md border bg-background px-3 py-1.5 text-sm`}
            >
              <span className="flex-1 whitespace-pre-wrap">{it}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- canvas helpers ---------- */


function PastAttemptsEditor({
  label = "Frühere Versuche",
  items,
  onChange,
  placeholder,
}: {
  label?: string;
  items: Array<{ text: string; ergebnis: "worked" | "didnt-work" }>;
  onChange: (next: Array<{ text: string; ergebnis: "worked" | "didnt-work" }>) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = (ergebnis: "worked" | "didnt-work") => {
    if (!input.trim()) return;
    onChange([...items, { text: input.trim(), ergebnis }]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-[200px]"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => add("worked")}>
          + Hat funktioniert
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("didnt-work")}>
          + Hat nicht funktioniert
        </Button>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              <span className="flex-1">{it.text}</span>
              <Badge variant={it.ergebnis === "worked" ? "default" : "secondary"}>
                {it.ergebnis === "worked" ? "worked" : "didn't work"}
              </Badge>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- variants ---------- */

function VariantContextList({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const inline = (bucket: SuggestionBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (key: "kiKontext" | "kiNichtZiele" | "kiLangfristziel", index: number) => {
    const cur = (data[key] as string[] | undefined) ?? [];
    patch({ [key]: cur.filter((_, j) => j !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <CanvasSection title="Langfristziel – wo wollt ihr in zwei Jahren stehen?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={2}
            value={data.langfristziel ?? ""}
            onChange={(e) => patch({ langfristziel: e.target.value })}
            placeholder="In zwei Jahren wird …"
          />
        </div>
        <div className="space-y-1.5 mt-3">
          <Label className="text-xs">Zeithorizont</Label>
          <Input
            value={data.langfristzielHorizont ?? ""}
            onChange={(e) => patch({ langfristzielHorizont: e.target.value })}
            placeholder="z. B. 2 Jahre oder Ende 2027"
            className="max-w-xs"
          />
        </div>
        <AcceptedKiList
          items={data.kiLangfristziel ?? []}
          onRemove={(i) => removeKi("kiLangfristziel", i)}
        />
        {inline("ziel")}
      </CanvasSection>

      <CanvasSection title="Kontext / Ausgangslage">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={4}
            value={data.kontext ?? ""}
            onChange={(e) => patch({ kontext: e.target.value })}
            placeholder="Kurz beschreiben, worum es geht …"
          />
        </div>
        <AcceptedKiList
          items={data.kiKontext ?? []}
          onRemove={(i) => removeKi("kiKontext", i)}
        />
        {inline("kontext")}
      </CanvasSection>

      <CanvasSection title="Kein Sprint-Ziel – Abgrenzung">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.nichtZiele ?? []}
          onChange={(v) => patch({ nichtZiele: v })}
          placeholder="z. B. Neues CI/CD-System aufsetzen"
        />
        <AcceptedKiList
          items={data.kiNichtZiele ?? []}
          onRemove={(i) => removeKi("kiNichtZiele", i)}
        />
        {inline("nichtziel")}
      </CanvasSection>

      <CanvasSection title="Geschäftliche Vergangenheit (optional) – Was wurde früher schon versucht?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <PastAttemptsEditor
            items={data.frueherVersucht ?? []}
            onChange={(v) => patch({ frueherVersucht: v })}
            placeholder="z. B. Interne Schulung im Q2/2024"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Hier zählen eure eigenen Erfahrungen – bitte selbst eintragen.
        </p>
      </CanvasSection>
    </div>
  );
}

type TwoFieldsBucket =
  | "gegenwart"
  | "vergangenheit"
  | "zukunft"
  | "wettbewerb"
  | "trends"
  | "chancen";

type StakeholderBucket = "stakeholder" | "geparkt" | "heute" | "paingain";

type KickoffBucket = "ziel" | "kontext" | "nichtziel";

type SailboatBucket = "wind" | "anker" | "hafen" | "eisberg";

type FiveWhysBucket = "symptom" | "why" | "ursache";

type AssumptionBucket = "kritisch" | "unsicher" | "einflussreich" | "gering";
type SuccessBucket = "erfolg" | "constraint";
type ScopeBucket = "inscope" | "outscope" | "sprintfrage";

type SuggestionBucket = TwoFieldsBucket | StakeholderBucket | KickoffBucket | SailboatBucket | FiveWhysBucket | AssumptionBucket | SuccessBucket | ScopeBucket;


function bucketOfSuggestion(raw: string): SuggestionBucket | null {
  const m = raw.match(/^\[([^\]]+)\]/);
  if (!m) return null;
  const tag = m[1].toLowerCase().trim();
  if (tag === "gegenwart" || tag === "present") return "gegenwart";
  if (tag === "vergangenheit" || tag === "past") return "vergangenheit";
  if (
    tag === "zukunft" ||
    tag === "future" ||
    tag === "standard-zukunft" ||
    tag === "default future"
  )
    return "zukunft";
  if (tag === "wettbewerb") return "wettbewerb";
  if (tag === "trends") return "trends";
  if (tag === "chancen") return "chancen";
  if (tag === "stakeholder") return "stakeholder";
  if (tag === "geparkt") return "geparkt";
  if (tag === "heute") return "heute";
  if (tag === "paingain" || tag === "pain-gain" || tag === "pain/gain")
    return "paingain";
  if (tag === "ziel" || tag === "goal" || tag === "langfristziel") return "ziel";
  if (tag === "kontext" || tag === "context") return "kontext";
  if (tag === "nichtziel" || tag === "nicht-ziel" || tag === "nichtziele")
    return "nichtziel";
  if (tag === "wind") return "wind";
  if (tag === "anker" || tag === "anchor") return "anker";
  if (tag === "hafen" || tag === "harbor" || tag === "harbour") return "hafen";
  if (tag === "eisberg" || tag === "iceberg") return "eisberg";
  if (tag === "symptom") return "symptom";
  if (tag === "why" || tag === "warum") return "why";
  if (tag === "ursache" || tag === "cause") return "ursache";
  if (tag === "kritisch" || tag === "critical") return "kritisch";
  if (tag === "unsicher" || tag === "uncertain") return "unsicher";
  if (tag === "einflussreich" || tag === "impactful" || tag === "high-impact") return "einflussreich";
  if (tag === "gering" || tag === "low") return "gering";
  if (tag === "erfolg" || tag === "success" || tag === "kpi" || tag === "metrik") return "erfolg";
  if (tag === "constraint" || tag === "constraints" || tag === "rahmen") return "constraint";
  if (tag === "inscope" || tag === "in-scope" || tag === "scope") return "inscope";
  if (tag === "outscope" || tag === "out-of-scope" || tag === "out" || tag === "notscope") return "outscope";
  if (tag === "sprintfrage" || tag === "sprint-frage" || tag === "sprintfragen" || tag === "question" || tag === "decision") return "sprintfrage";
  return null;
}

function stripBucketTag(raw: string): string {
  return raw.replace(/^\[[^\]]+\]\s*/, "").trim();
}

function InlineSuggestions({
  bucket,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pending,
  label,
}: {
  bucket: SuggestionBucket;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: () => void;
  pending: boolean;
  label?: string;
}) {
  const matches = suggestions
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => bucketOfSuggestion(v) === bucket)
    .slice(0, 3);
  return (
    <div className="mt-2 space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 !border-accent !bg-accent-soft !text-foreground hover:!bg-accent hover:!text-foreground"
        onClick={onLoadSuggestions}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        )}
        {label ?? "KI-Vorschläge"}
      </Button>
      {matches.length > 0 ? (
        <ul className="space-y-1.5">
          {matches.map(({ v, i }) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border border-accent/60 bg-accent-soft px-2.5 py-1.5 text-sm text-foreground"
            >
              <span className="flex-1">{stripBucketTag(v)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => onAcceptSuggestion(i)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Übernehmen
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDismissSuggestion(i)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AcceptedKiList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (i: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
        <Sparkles className="w-3.5 h-3.5" /> Übernommene KI-Vorschläge
      </div>
      <ul className="space-y-1.5">
        {items.map((v, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-md border border-accent/60 bg-accent-soft px-2.5 py-1.5 text-sm text-foreground"
          >
            <span className="flex-1 whitespace-pre-wrap">{v}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRemove(i)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VariantTwoFields({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const inline = (bucket: SuggestionBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (
    key: "kiWarumJetzt" | "kiDefaultFuture" | "kiWettbewerber" | "kiTrends" | "kiChancen",
    index: number,
  ) => {
    const cur = (data[key] as string[] | undefined) ?? [];
    patch({ [key]: cur.filter((_, j) => j !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <CanvasSection title="Gegenwart – Warum jetzt?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={4}
            value={data.warumJetzt ?? ""}
            onChange={(e) => patch({ warumJetzt: e.target.value })}
            placeholder="Was macht das Thema gerade jetzt dringlich?"
          />
        </div>
        <AcceptedKiList
          items={data.kiWarumJetzt ?? []}
          onRemove={(i) => removeKi("kiWarumJetzt", i)}
        />
        {inline("gegenwart")}
      </CanvasSection>

      <CanvasSection title="Vergangenheit – Was wurde bisher versucht?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <PastAttemptsEditor
            items={data.frueherVersucht ?? []}
            onChange={(v) => patch({ frueherVersucht: v })}
            placeholder="z. B. Interne Schulung im Q2/2024"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Hier zählen deine eigenen Erfahrungen – bitte selbst eintragen.
        </p>
      </CanvasSection>

      <CanvasSection title="Zukunft – Standard-Zukunft (was passiert ohne Handeln?)">
        <ListEditor
          label="Eigene Anmerkungen"
          items={
            Array.isArray(data.defaultFuture)
              ? data.defaultFuture
              : data.defaultFuture
                ? [data.defaultFuture]
                : []
          }
          onChange={(v) => patch({ defaultFuture: v })}
          multiline
          rows={3}
          placeholder="z. B. Marktanteil sinkt weiter, Team verliert Motivation …"
        />
        <AcceptedKiList
          items={data.kiDefaultFuture ?? []}
          onRemove={(i) => removeKi("kiDefaultFuture", i)}
        />
        {inline("zukunft")}
      </CanvasSection>

      <CanvasSection title="Geschäftliche Zukunft – Wettbewerb, Trends, Chancen">
        <div className="space-y-4">
          <div>
            <ListEditor
              label="Eigene Anmerkungen – Wettbewerb"
              items={data.wettbewerber ?? []}
              onChange={(v) => patch({ wettbewerber: v })}
              multiline
              rows={3}
              placeholder="z. B. Anbieter X setzt seit 2024 auf …"
            />
            <AcceptedKiList
              items={data.kiWettbewerber ?? []}
              onRemove={(i) => removeKi("kiWettbewerber", i)}
            />
            {inline("wettbewerb")}
          </div>
          <div>
            <ListEditor
              label="Eigene Anmerkungen – Trends"
              items={data.trends ?? []}
              onChange={(v) => patch({ trends: v })}
              multiline
              rows={3}
              placeholder="z. B. Regulatorik, Marktbewegung, Technologie …"
            />
            <AcceptedKiList
              items={data.kiTrends ?? []}
              onRemove={(i) => removeKi("kiTrends", i)}
            />
            {inline("trends")}
          </div>
          <div>
            <ListEditor
              label="Eigene Anmerkungen – Chancen"
              items={data.chancen ?? []}
              onChange={(v) => patch({ chancen: v })}
              multiline
              rows={3}
              placeholder="z. B. Neue Zielgruppe, Partnerschaft, Kanal …"
            />
            <AcceptedKiList
              items={data.kiChancen ?? []}
              onRemove={(i) => removeKi("kiChancen", i)}
            />
            {inline("chancen")}
          </div>
        </div>
      </CanvasSection>
    </div>
  );
}

function VariantStakeholder({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const stakeholder = data.stakeholder ?? [];
  const inline = (bucket: SuggestionBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (
    key: "kiStakeholder" | "kiSekundaerGeparkt" | "kiKundeHeuteLoesung" | "kiKundePainGain",
    index: number,
  ) => {
    const cur = (data[key] as string[] | undefined) ?? [];
    patch({ [key]: cur.filter((_, j) => j !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <CanvasSection title="Stakeholder & Zielgruppe">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ListEditor
              label="Eigene Anmerkungen – Stakeholder / potenzielle Zielgruppen"
              items={stakeholder}
              onChange={(v) => {
                const kept = new Set([...(v ?? []), ...(data.kiStakeholder ?? [])].map((n) => n.trim()));
                const nextPositions: Record<string, { x: number; y: number }> = {};
                Object.entries(data.stakeholderPositions ?? {}).forEach(([k, val]) => {
                  if (kept.has(k)) nextPositions[k] = val;
                });
                patch({ stakeholder: v, stakeholderPositions: nextPositions });
              }}
            />
            <AcceptedKiList
              items={data.kiStakeholder ?? []}
              onRemove={(i) => {
                const arr = data.kiStakeholder ?? [];
                const removed = arr[i];
                const nextArr = arr.filter((_, j) => j !== i);
                const nextPositions = { ...(data.stakeholderPositions ?? {}) };
                if (removed) delete nextPositions[removed.trim()];
                patch({ kiStakeholder: nextArr, stakeholderPositions: nextPositions });
              }}
            />
            {inline("stakeholder")}
            <div className="space-y-2 mt-4">
              <Label>Primäre Zielgruppe</Label>
              <Select
                value={data.primaereZielgruppe ?? ""}
                onValueChange={(v) => patch({ primaereZielgruppe: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aus Stakeholdern wählen …" />
                </SelectTrigger>
                <SelectContent>
                  {[...stakeholder, ...(data.kiStakeholder ?? [])].map((s, i) => (
                    <SelectItem key={`${s}-${i}`} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <StakeholderMap
            stakeholder={stakeholder}
            kiStakeholder={data.kiStakeholder ?? []}
            primary={data.primaereZielgruppe}
            positions={data.stakeholderPositions ?? {}}
            onPositionsChange={(next) => patch({ stakeholderPositions: next })}
            onAddStakeholder={(name) => {
              const trimmed = name.trim();
              if (!trimmed) return;
              const exists = [...stakeholder, ...(data.kiStakeholder ?? [])]
                .map((s) => s.trim().toLowerCase())
                .includes(trimmed.toLowerCase());
              if (exists) return;
              patch({ stakeholder: [...stakeholder, trimmed] });
            }}
            onRemoveStakeholder={(name, isKi) => {
              const nextPositions = { ...(data.stakeholderPositions ?? {}) };
              delete nextPositions[name];
              if (isKi) {
                patch({
                  kiStakeholder: (data.kiStakeholder ?? []).filter((s) => s.trim() !== name),
                  stakeholderPositions: nextPositions,
                });
              } else {
                patch({
                  stakeholder: stakeholder.filter((s) => s.trim() !== name),
                  stakeholderPositions: nextPositions,
                });
              }
            }}
          />
        </div>
      </CanvasSection>


      <CanvasSection title="Sekundäre Gruppen – bewusst geparkt">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.sekundaerGeparkt ?? []}
          onChange={(v) => patch({ sekundaerGeparkt: v })}
          placeholder="z. B. Rechtsabteilung, interne Admins …"
        />
        <AcceptedKiList
          items={data.kiSekundaerGeparkt ?? []}
          onRemove={(i) => removeKi("kiSekundaerGeparkt", i)}
        />
        {inline("geparkt")}
      </CanvasSection>

      <CanvasSection title="Heute – Wie löst die Zielgruppe das Problem aktuell?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={3}
            value={data.kundeHeuteLoesung ?? ""}
            onChange={(e) => patch({ kundeHeuteLoesung: e.target.value })}
            placeholder="Aktuelles Verhalten, Workarounds, Tools …"
          />
        </div>
        <AcceptedKiList
          items={data.kiKundeHeuteLoesung ?? []}
          onRemove={(i) => removeKi("kiKundeHeuteLoesung", i)}
        />
        {inline("heute")}
      </CanvasSection>

      <CanvasSection title="Vergangenheit – Was hat die Zielgruppe früher versucht?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <PastAttemptsEditor
            items={data.kundeVersuchePast ?? []}
            onChange={(v) => patch({ kundeVersuchePast: v })}
            placeholder="z. B. Nutzung eines Wettbewerber-Tools"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Hier zählen echte Erfahrungen der Zielgruppe – bitte selbst eintragen.
        </p>
      </CanvasSection>

      <CanvasSection title="Pain / Gain – Welchen Pain lindern wir, welchen Gain schaffen wir?">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={3}
            value={data.kundePainGain ?? ""}
            onChange={(e) => patch({ kundePainGain: e.target.value })}
            placeholder="Konkreter Nutzen aus Sicht der Zielgruppe"
          />
        </div>
        <AcceptedKiList
          items={data.kiKundePainGain ?? []}
          onRemove={(i) => removeKi("kiKundePainGain", i)}
        />
        {inline("paingain")}
      </CanvasSection>
    </div>
  );
}


function VariantSailboat({
  allSteps,
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  allSteps: FramingStepRow[];
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const sb = data.sailboat ?? { wind: [], anker: [], hafen: "", eisberg: [] };
  const set = (upd: Partial<typeof sb>) => patch({ sailboat: { ...sb, ...upd } });

  // Einmalige Vorbefüllung aus den Schritten 1 bis 3 (Verdichtung statt Neuerhebung).
  useEffect(() => {
    if (data.sailboatVorbefuellt) return;
    const s1 = (allSteps.find((s) => s.step_key === "1")?.data ?? {}) as FramingStepData;
    const s2 = (allSteps.find((s) => s.step_key === "2")?.data ?? {}) as FramingStepData;
    const s3 = (allSteps.find((s) => s.step_key === "3")?.data ?? {}) as FramingStepData;

    const clean = (list: (string | undefined)[]) =>
      Array.from(
        new Set(list.map((t) => (t ?? "").trim()).filter((t) => t.length > 0)),
      );

    const wind = clean([...(s2.chancen ?? []), ...(s2.trends ?? [])]);
    const anker = clean([
      ...(s1.frueherVersucht ?? [])
        .filter((v) => v.ergebnis === "didnt-work")
        .map((v) => v.text),
      ...(s3.kundeVersuchePast ?? [])
        .filter((v) => v.ergebnis === "didnt-work")
        .map((v) => v.text),
      s3.kundePainGain,
    ]);
    const eisberg = clean(
      Array.isArray(s2.defaultFuture) ? s2.defaultFuture : [s2.defaultFuture],
    );
    const hafen = (s1.langfristziel ?? "").trim();

    const nextWind = clean([...sb.wind, ...wind]);
    const nextAnker = clean([...sb.anker, ...anker]);
    const nextEisberg = clean([...sb.eisberg, ...eisberg]);
    const nextHafen = sb.hafen?.trim() ? sb.hafen : hafen;

    patch({
      sailboat: { wind: nextWind, anker: nextAnker, hafen: nextHafen, eisberg: nextEisberg },
      sailboatVorbefuellt: { wind, anker, eisberg },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pre = data.sailboatVorbefuellt;
  const preNote = (items: string[] | undefined) =>
    items && items.length ? (
      <p className="mt-1 text-xs text-muted-foreground">
        Aus den Schritten 1–3 übernommen: {items.join(" · ")}
      </p>
    ) : null;
  const hafenItems = sb.hafen ? sb.hafen.split("\n").filter((l) => l.trim().length > 0) : [];
  const inline = (bucket: SailboatBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (
    key: "kiWind" | "kiAnker" | "kiHafen" | "kiEisberg",
    index: number,
  ) => {
    const cur = (data[key] as string[] | undefined) ?? [];
    patch({ [key]: cur.filter((_, j) => j !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <SailboatIllustration className="w-full max-w-2xl h-auto rounded-2xl border bg-gradient-hero shadow-card" />
      </div>
      <CanvasSection title="Wind – Treiber">
        <ListEditor
          label="Eigene Anmerkungen"
          items={sb.wind}
          onChange={(v) => set({ wind: v })}
        />
        {preNote(pre?.wind)}
        <AcceptedKiList
          items={data.kiWind ?? []}
          onRemove={(i) => removeKi("kiWind", i)}
        />
        {inline("wind")}
      </CanvasSection>
      <CanvasSection title="Anker – Hindernisse">
        <ListEditor
          label="Eigene Anmerkungen"
          items={sb.anker}
          onChange={(v) => set({ anker: v })}
        />
        {preNote(pre?.anker)}
        <AcceptedKiList
          items={data.kiAnker ?? []}
          onRemove={(i) => removeKi("kiAnker", i)}
        />
        {inline("anker")}
      </CanvasSection>
      <CanvasSection title="Hafen – Ziel">
        <ListEditor
          label="Eigene Anmerkungen"
          items={hafenItems}
          onChange={(v) => set({ hafen: v.join("\n") })}
          placeholder="Wohin wollen wir?"
        />
        <AcceptedKiList
          items={data.kiHafen ?? []}
          onRemove={(i) => removeKi("kiHafen", i)}
        />
        {inline("hafen")}
      </CanvasSection>
      <CanvasSection title="Eisberg – Risiken">
        <ListEditor
          label="Eigene Anmerkungen"
          items={sb.eisberg}
          onChange={(v) => set({ eisberg: v })}
        />
        {preNote(pre?.eisberg)}
        <AcceptedKiList
          items={data.kiEisberg ?? []}
          onRemove={(i) => removeKi("kiEisberg", i)}
        />
        {inline("eisberg")}
      </CanvasSection>
    </div>
  );
}


function VariantFiveWhys({
  allSteps,
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  allSteps: FramingStepRow[];
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const whys = data.fiveWhys ?? [];
  const ursachen = data.ursachen ?? [];
  const inline = (bucket: SuggestionBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (
    key: "kiFiveWhys" | "kiUrsachen" | "kiSymptom",
    index: number,
  ) => {
    const cur = (data[key] as string[] | undefined) ?? [];
    patch({ [key]: cur.filter((_, j) => j !== index) } as Partial<FramingStepData>);
  };
  const addUrsache = (text: string) => {
    if (!text.trim()) return;
    patch({
      ursachen: [...ursachen, { text: text.trim(), adressierbar: true }],
    });
  };
  const [ursacheInput, setUrsacheInput] = useState("");

  // Startsymptom einmalig aus dem ersten Anker in Schritt 4 vorschlagen.
  useEffect(() => {
    if (data.symptom !== undefined) return;
    const s4 = (allSteps.find((s) => s.step_key === "4")?.data ?? {}) as FramingStepData;
    const ersterAnker = (s4.sailboat?.anker ?? []).map((a) => a.trim()).find((a) => a.length > 0);
    patch({ symptom: ersterAnker ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <CanvasSection title="Beobachtetes Symptom">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          <Textarea
            rows={2}
            value={data.symptom ?? ""}
            onChange={(e) => patch({ symptom: e.target.value })}
            placeholder="z. B. Nur 12 Prozent der Testkunden schliessen die Anmeldung ab"
          />
        </div>
        <AcceptedKiList
          items={data.kiSymptom ?? []}
          onRemove={(i) => removeKi("kiSymptom", i)}
        />
        {inline("symptom")}
      </CanvasSection>

      <CanvasSection title="5 Whys – Warum-Kette">
        <p className="text-xs text-muted-foreground">Warum passiert das?</p>
        <ListEditor
          label="Eigene Anmerkungen"
          items={whys}
          onChange={(v) => patch({ fiveWhys: v.slice(0, Math.max(0, 5 - (data.kiFiveWhys ?? []).length)) })}
          multiline
          rows={2}
          placeholder="z. B. Warum …? Weil …"
          maxItems={Math.max(0, 5 - (data.kiFiveWhys ?? []).length)}
        />
        <AcceptedKiList
          items={data.kiFiveWhys ?? []}
          onRemove={(i) => removeKi("kiFiveWhys", i)}
        />
        {whys.length + (data.kiFiveWhys ?? []).length < 5 ? inline("why") : null}
      </CanvasSection>

      <CanvasSection title="Adressierbare Ursachen">
        <p className="text-xs text-muted-foreground">
          Ursachen als kurze Nominalphrasen erfassen.
        </p>
        <div className="flex gap-2 mt-2">
          <Input
            value={ursacheInput}
            onChange={(e) => setUrsacheInput(e.target.value)}
            placeholder="Ursache …"
            onKeyDown={(e) => {
              if (e.key === "Enter" && ursacheInput.trim()) {
                e.preventDefault();
                addUrsache(ursacheInput);
                setUrsacheInput("");
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              addUrsache(ursacheInput);
              setUrsacheInput("");
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {ursachen.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={u.text}
                onChange={(e) => {
                  const next = [...ursachen];
                  next[i] = { ...u, text: e.target.value };
                  patch({ ursachen: next });
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => patch({ ursachen: ursachen.filter((_, j) => j !== i) })}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <AcceptedKiList
          items={data.kiUrsachen ?? []}
          onRemove={(i) => removeKi("kiUrsachen", i)}
        />
        {inline("ursache")}
      </CanvasSection>
    </div>
  );
}

function QuadrantAddInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [val, setVal] = useState("");
  const commit = () => {
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal("");
  };
  return (
    <div className="mt-3 flex gap-1.5">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Eigene Ursache …"
        className="h-8 text-xs bg-background/80"
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) {
            e.preventDefault();
            commit();
          }
        }}
      />
      <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={commit}>
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}





function VariantAssumptions({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const annahmen = data.annahmen ?? [];
  const [inputs, setInputs] = useState<Record<AssumptionBucket, string>>({
    kritisch: "",
    einflussreich: "",
    unsicher: "",
    gering: "",
  });

  const bucketOf = (u: number, e: number): AssumptionBucket => {
    if (u >= 4 && e >= 4) return "kritisch";
    if (u <= 3 && e >= 4) return "einflussreich";
    if (u >= 4 && e <= 3) return "unsicher";
    return "gering";
  };
  const defaults: Record<AssumptionBucket, { unsicherheit: number; einfluss: number }> = {
    kritisch: { unsicherheit: 5, einfluss: 5 },
    einflussreich: { unsicherheit: 2, einfluss: 5 },
    unsicher: { unsicherheit: 5, einfluss: 2 },
    gering: { unsicherheit: 2, einfluss: 2 },
  };
  const addToBucket = (bucket: AssumptionBucket) => {
    const text = inputs[bucket].trim();
    if (!text) return;
    patch({ annahmen: [...annahmen, { text, ...defaults[bucket] }] });
    setInputs((s) => ({ ...s, [bucket]: "" }));
  };

  const inline = (bucket: AssumptionBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );

  const quadrants: Array<{
    key: AssumptionBucket;
    title: string;
    subtitle: string;
    bg: string;
    border: string;
  }> = [
    {
      key: "kritisch",
      title: "Kritisch",
      subtitle: "Hohe Unsicherheit · Hoher Einfluss – jetzt testen",
      bg: "bg-primary/5",
      border: "border-primary/60",
    },
    {
      key: "einflussreich",
      title: "Einflussreich, aber sicher",
      subtitle: "Niedrige Unsicherheit · Hoher Einfluss – im Blick behalten",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-300 dark:border-emerald-800/60",
    },
    {
      key: "unsicher",
      title: "Nur unsicher",
      subtitle: "Hohe Unsicherheit · Niedriger Einfluss – später klären",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-300 dark:border-amber-800/60",
    },
    {
      key: "gering",
      title: "Gering",
      subtitle: "Niedrige Unsicherheit · Niedriger Einfluss – ignorieren",
      bg: "bg-muted/40",
      border: "border-muted",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        {quadrants.map((q) => {
          const items = annahmen
            .map((a, i) => ({ a, i }))
            .filter(({ a }) => bucketOf(a.unsicherheit, a.einfluss) === q.key);
          return (
            <div key={q.key} className={`rounded-md border p-3 ${q.bg} ${q.border} space-y-2`}>
              <div className="text-sm font-semibold">{q.title}</div>
              <div className="text-xs text-muted-foreground">{q.subtitle}</div>
              {items.length ? (
                <ul className="space-y-1">
                  {items.map(({ a, i }) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 rounded-md border bg-background/60 px-2 py-1 text-sm"
                    >
                      <span className="flex-1">{a.text}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => patch({ annahmen: annahmen.filter((_, j) => j !== i) })}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex gap-2">
                <Input
                  value={inputs[q.key]}
                  onChange={(e) => setInputs((s) => ({ ...s, [q.key]: e.target.value }))}
                  placeholder="Eigene Annahme …"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addToBucket(q.key);
                    }
                  }}
                />
                <Button variant="outline" size="icon" onClick={() => addToBucket(q.key)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {inline(q.key)}
            </div>
          );
        })}
      </div>

      <CanvasSection title="Feineinstellung (Unsicherheit / Einfluss je 1–5)">
        <div className="space-y-3">

          <p className="text-xs text-muted-foreground">
            Werte präzisieren – die Annahme wandert automatisch in den passenden Quadranten.
          </p>

          {annahmen.map((a, i) => {
            const critical = a.unsicherheit >= 4 && a.einfluss >= 4;
            return (
              <div
                key={i}
                className={`grid grid-cols-[1fr_140px_140px_auto] gap-2 items-center rounded-md border p-2 ${
                  critical ? "border-primary bg-primary/5" : ""
                }`}
              >
                <Input
                  value={a.text}
                  onChange={(e) => {
                    const next = [...annahmen];
                    next[i] = { ...a, text: e.target.value };
                    patch({ annahmen: next });
                  }}
                />
                <div>
                  <Label className="text-xs">Unsicherheit</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={a.unsicherheit}
                    onChange={(e) => {
                      const next = [...annahmen];
                      next[i] = { ...a, unsicherheit: clamp(+e.target.value) };
                      patch({ annahmen: next });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Einfluss</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={a.einfluss}
                    onChange={(e) => {
                      const next = [...annahmen];
                      next[i] = { ...a, einfluss: clamp(+e.target.value) };
                      patch({ annahmen: next });
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => patch({ annahmen: annahmen.filter((_, j) => j !== i) })}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Kritische Annahmen (Unsicherheit ≥4 UND Einfluss ≥4) werden hervorgehoben.
          </p>
        </div>
      </CanvasSection>
    </div>
  );
}

function clamp(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function clamp10(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(10, Math.round(n)));
}


function VariantSuccess({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const inline = (bucket: "constraint") => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (key: "kiConstraints", index: number) => {
    const current = (data[key] ?? []) as string[];
    patch({ [key]: current.filter((_, i) => i !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <CanvasSection title="Constraints – was ist gesetzt?">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.constraints ?? []}
          onChange={(v) => patch({ constraints: v })}
        />
        <AcceptedKiList
          items={data.kiConstraints ?? []}
          onRemove={(i) => removeKi("kiConstraints", i)}
        />
        {inline("constraint")}
      </CanvasSection>
    </div>
  );
}

function VariantScope({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const inline = (bucket: ScopeBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={pendingBucket === bucket}
    />
  );
  const removeKi = (
    key: "kiInScope" | "kiOutOfScope" | "kiSprintFragen",
    index: number,
  ) => {
    const current = (data[key] ?? []) as string[];
    patch({ [key]: current.filter((_, i) => i !== index) } as Partial<FramingStepData>);
  };
  return (
    <div className="space-y-6">
      <CanvasSection title="In Scope">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.inScope ?? []}
          onChange={(v) => patch({ inScope: v })}
        />
        <AcceptedKiList
          items={data.kiInScope ?? []}
          onRemove={(i) => removeKi("kiInScope", i)}
        />
        {inline("inscope")}
      </CanvasSection>
      <CanvasSection title="Out of Scope">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.outOfScope ?? []}
          onChange={(v) => patch({ outOfScope: v })}
        />
        <AcceptedKiList
          items={data.kiOutOfScope ?? []}
          onRemove={(i) => removeKi("kiOutOfScope", i)}
        />
        {inline("outscope")}
      </CanvasSection>
      <CanvasSection title="Sprint-Fragen (Decision Questions)">
        <ListEditor
          label="Eigene Anmerkungen"
          items={data.sprintFragen ?? []}
          onChange={(v) => patch({ sprintFragen: v })}
          placeholder="z. B. Können wir X in 5 Tagen mit Y validieren?"
        />
        <AcceptedKiList
          items={data.kiSprintFragen ?? []}
          onRemove={(i) => removeKi("kiSprintFragen", i)}
        />
        {inline("sprintfrage")}
      </CanvasSection>
    </div>
  );
}

type NufRow = NonNullable<FramingStepData["nufBewertungen"]>[number];

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `nuf-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}

function composeErfolgssatz(d: FramingStepData): string {
  const metrik = (d.erfolgsMetrik ?? "").trim();
  const ziel = (d.erfolgsZielwert ?? "").trim();
  const methode = (d.erfolgsMethode ?? "").trim();
  if (!metrik && !ziel && !methode) return "";
  const kern = [ziel, metrik].filter(Boolean).join(" ");
  return methode ? `${kern}, gemessen durch ${methode}`.trim() : kern;
}

function VariantNuf({
  sessionId,
  allSteps,
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  pendingBucket,
}: {
  sessionId: string;
  allSteps: FramingStepRow[];
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  pendingBucket: string | null;
}) {
  const bew = data.nufBewertungen ?? [];
  const ratingSuggest = useFramingRatingSuggest();
  const [ratingVorschlaege, setRatingVorschlaege] = useState<NufRatingSuggestion[]>([]);

  const step8 = allSteps.find((s) => s.step_key === "8")?.data as FramingStepData | undefined;
  const step8Fragen = useMemo(() => {
    const eigene = (step8?.sprintFragen ?? []).map((t) => t.trim());
    const ki = (step8?.kiSprintFragen ?? []).map((t) => t.trim());
    return [...eigene, ...ki].filter((t) => t.length > 0);
  }, [step8]);
  const step8Ki = useMemo(
    () => new Set((step8?.kiSprintFragen ?? []).map((t) => t.trim())),
    [step8],
  );

  // Erstbefüllung + Migration bestehender Sessions (ids, top1Id).
  useEffect(() => {
    const vorhanden = data.nufBewertungen ?? [];
    let next: NufRow[] = vorhanden.map((r) => (r.id ? r : { ...r, id: newId() }));
    let changed = next.some((r, i) => r !== vorhanden[i]);

    if (vorhanden.length === 0 && step8Fragen.length > 0) {
      next = step8Fragen.map((t) => ({
        id: newId(),
        text: t,
        sourceText: t,
        neuheit: 5,
        nutzen: 5,
        machbarkeit: 5,
        bewertet: false,
        isKi: step8Ki.has(t),
      }));
      changed = true;
    }

    const p: Partial<FramingStepData> = {};
    if (changed) p.nufBewertungen = next;
    if (!data.top1Id && data.top1Challenge?.trim()) {
      const hit = next.find((r) => r.text.trim() === data.top1Challenge?.trim());
      if (hit?.id) p.top1Id = hit.id;
    }
    if (Object.keys(p).length) patch(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Abgleich mit Schritt 8 ---- */
  const bekannt = useMemo(() => {
    const set = new Set<string>();
    bew.forEach((r) => {
      if (r.text.trim()) set.add(r.text.trim());
      if (r.sourceText?.trim()) set.add(r.sourceText.trim());
    });
    return set;
  }, [bew]);
  const neueFragen = useMemo(
    () => step8Fragen.filter((t) => !bekannt.has(t)),
    [step8Fragen, bekannt],
  );
  const step8Set = useMemo(() => new Set(step8Fragen), [step8Fragen]);
  const verschwundene = useMemo(
    () => bew.filter((r) => r.sourceText?.trim() && !step8Set.has(r.sourceText.trim())),
    [bew, step8Set],
  );
  const hatDrift = neueFragen.length > 0 || verschwundene.length > 0;

  function abgleichen() {
    const next: NufRow[] = bew.map((r) =>
      r.sourceText?.trim() && !step8Set.has(r.sourceText.trim())
        ? { ...r, missing: true }
        : { ...r, missing: false },
    );
    neueFragen.forEach((t) =>
      next.push({
        id: newId(),
        text: t,
        sourceText: t,
        neuheit: 5,
        nutzen: 5,
        machbarkeit: 5,
        bewertet: false,
        isKi: step8Ki.has(t),
      }),
    );
    patch({ nufBewertungen: next });
    toast({
      title: "Liste abgeglichen",
      description:
        neueFragen.length > 0
          ? `${neueFragen.length} Frage(n) ergänzt. Bewertungen blieben unverändert.`
          : "Nicht mehr vorhandene Fragen sind markiert.",
    });
  }

  /* ---- Ableitungen ---- */
  const sumOf = (r: NufRow) => r.neuheit + r.nutzen + r.machbarkeit;
  const bewertetCount = bew.filter((r) => r.bewertet).length;
  const anyBewertet = bewertetCount > 0;
  const rangById = useMemo(() => {
    const sorted = [...bew].sort((a, b) => sumOf(b) - sumOf(a));
    const map = new Map<string, number>();
    sorted.forEach((r, i) => map.set(r.id ?? r.text, i + 1));
    return map;
  }, [bew]);

  const alleBewertet = bew.length > 0 && bewertetCount === bew.length;
  const spitze = useMemo(() => {
    if (!alleBewertet) return null;
    const sorted = [...bew].sort((a, b) => sumOf(b) - sumOf(a));
    const top = sorted[0];
    const gleichstand = sorted.length > 1 && sumOf(sorted[1]) === sumOf(top);
    return { top, gleichstand };
  }, [bew, alleBewertet]);

  const top1 = bew.find((r) => r.id && r.id === data.top1Id);

  function setRow(i: number, patchRow: Partial<NufRow>) {
    const next = [...bew];
    const merged = { ...next[i], ...patchRow };
    next[i] = merged;
    const p: Partial<FramingStepData> = { nufBewertungen: next };
    if (merged.id && merged.id === data.top1Id && patchRow.text !== undefined) {
      p.top1Challenge = merged.text;
    }
    patch(p);
  }

  function chooseTop1(r: NufRow) {
    let id = r.id;
    const p: Partial<FramingStepData> = {};
    if (!id) {
      id = newId();
      p.nufBewertungen = bew.map((x) => (x === r ? { ...x, id } : x));
    }
    p.top1Id = id;
    p.top1Challenge = r.text;
    patch(p);
  }

  function removeRow(i: number) {
    const r = bew[i];
    const next = bew.filter((_, j) => j !== i);
    const p: Partial<FramingStepData> = { nufBewertungen: next };
    if (r.id && r.id === data.top1Id) {
      p.top1Id = "";
      p.top1Challenge = "";
    }
    patch(p);
  }

  async function ladeBewertungsvorschlaege() {
    const fragen = bew.map((r) => r.text.trim()).filter(Boolean);
    if (!fragen.length) {
      toast({ title: "Keine Fragen vorhanden", description: "Ergänze zuerst Sprint-Fragen." });
      return;
    }
    try {
      const res = await ratingSuggest.mutateAsync({ session_id: sessionId, fragen });
      setRatingVorschlaege(res.bewertungen);
      if (!res.bewertungen.length) toast({ title: "Keine Einschätzung erhalten" });
    } catch (e) {
      toast({
        title: "KI-Einschätzung fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }

  function uebernehmeBewertung(v: NufRatingSuggestion) {
    const i = bew.findIndex((r) => r.text.trim() === v.frage.trim());
    if (i < 0) {
      setRatingVorschlaege((prev) => prev.filter((x) => x !== v));
      return;
    }
    setRow(i, {
      neuheit: clamp10(v.neuheit),
      nutzen: clamp10(v.nutzen),
      machbarkeit: clamp10(v.machbarkeit),
      bewertet: true,
    });
    setRatingVorschlaege((prev) => prev.filter((x) => x !== v));
  }

  /* ---- Erfolgsmessung ---- */
  const neueFelderLeer =
    !(data.erfolgsMetrik ?? "").trim() &&
    !(data.erfolgsZielwert ?? "").trim() &&
    !(data.erfolgsMethode ?? "").trim();
  const legacyFreitext = neueFelderLeer && !!(data.erfolgsmessung ?? "").trim();

  function patchErfolg(p: Partial<FramingStepData>) {
    const merged = { ...data, ...p };
    const satz = composeErfolgssatz(merged);
    patch({ ...p, ...(satz ? { erfolgsmessung: satz } : {}) });
  }
  const vorschau = composeErfolgssatz(data);

  const gedimmt = "opacity-50 pointer-events-none select-none";

  return (
    <div className="space-y-6">
      {/* ---------- 1. Fragen bewerten ---------- */}
      <CanvasSection defaultOpen title="1. Fragen bewerten – Neu / Nützlich / Machbar je 1–10">
        <div className="rounded-lg border-l-4 border-l-primary bg-accent-soft p-3 text-sm text-foreground/80 space-y-1.5">
          <p>NUF steht für New, Useful, Feasible – im Deutschen Neu, Nützlich, Machbar. Ihr bewertet hier Fragen, keine Lösungen.</p>
          <p><strong>New (Neu)</strong>: Wurde die Idee so schon einmal ausprobiert? Hebt sie sich von bestehenden Ansätzen oder Mitbewerbern ab?&nbsp;</p>
          <p><strong>Useful (Nützlich)</strong>: Löst die Idee das eigentliche Kernproblem? Erfüllt sie ein echtes Bedürfnis oder hilft sie dabei, die gesetzten Ziele direkt zu erreichen?&nbsp;</p>
          <p><strong>Feasible (Machbar)</strong>: Lässt sich die Idee mit den vorhandenen Ressourcen in die Praxis umsetzen? Hierbei werden Budget, technisches Know-how und der zeitliche Rahmen berücksichtigt.&nbsp;</p>
        </div>

        {hatDrift ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-border-accent bg-accent-soft px-3 py-2 text-sm">
            <span className="text-foreground/80">
              Schritt 8 hat sich geändert:{" "}
              {neueFragen.length > 0
                ? `${neueFragen.length} neue ${neueFragen.length === 1 ? "Frage" : "Fragen"}`
                : null}
              {neueFragen.length > 0 && verschwundene.length > 0 ? ", " : null}
              {verschwundene.length > 0 ? `${verschwundene.length} nicht mehr vorhanden` : null}
            </span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={abgleichen}>
              Liste abgleichen
            </Button>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">
            {bewertetCount} von {bew.length} {bew.length === 1 ? "Frage" : "Fragen"} bewertet
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={ladeBewertungsvorschlaege}
              disabled={ratingSuggest.isPending}
            >
              {ratingSuggest.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Bewertung vorschlagen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={bew.length < 2}
              onClick={() =>
                patch({ nufBewertungen: [...bew].sort((a, b) => sumOf(b) - sumOf(a)) })
              }
            >
              Nach Punkten sortieren
            </Button>
          </div>
        </div>

        {ratingVorschlaege.length > 0 ? (
          <div className="mt-3 space-y-2 rounded-lg border border-accent/60 bg-accent-soft p-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> KI-Einschätzung je Frage
            </p>
            {ratingVorschlaege.map((v, i) => (
              <div key={i} className="rounded-md border border-accent/60 bg-background/60 p-2 text-sm">
                <p className="font-medium">{v.frage}</p>
                <p className="text-muted-foreground">
                  Neu {v.neuheit} · Nützlich {v.nutzen} · Machbar {v.machbarkeit}
                  {v.begruendung ? ` – ${v.begruendung}` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7" onClick={() => uebernehmeBewertung(v)}>
                    Übernehmen
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    onClick={() => setRatingVorschlaege((prev) => prev.filter((x) => x !== v))}
                  >
                    Verwerfen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-3 mt-3">
          {bew.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Sprint-Fragen aus Schritt 8 übernommen. Ergänze sie dort oder füge hier eigene hinzu.
            </p>
          ) : null}
          {bew.map((r, i) => {
            const sum = sumOf(r);
            const rid = r.id ?? r.text;
            const isTop = !!r.id && r.id === data.top1Id;
            const isKi = r.isKi === true;
            const base = isKi ? "border-accent/60 bg-accent-soft" : "";
            return (
              <div
                key={rid}
                className={`rounded-md border p-3 space-y-2 ${
                  isTop ? "border-primary bg-primary/5" : base
                } ${r.missing ? "border-dashed" : ""}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{rangById.get(rid)}.</Badge>
                  {r.missing ? (
                    <span className="text-xs text-muted-foreground">
                      In Schritt 8 nicht mehr vorhanden
                    </span>
                  ) : null}
                  {isTop ? <Badge>Top-1</Badge> : null}
                </div>
                <Textarea
                  rows={2}
                  value={r.text}
                  className={isKi ? "bg-background/60" : ""}
                  onChange={(e) => setRow(i, { text: e.target.value })}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {([
                    { k: "neuheit", label: "Neu – noch unbeantwortet" },
                    { k: "nutzen", label: "Nützlich – verändert Entscheidungen" },
                    { k: "machbarkeit", label: "Machbar – in 5 Tagen prüfbar" },
                  ] as const).map(({ k, label }) => (
                    <div key={k} className={r.bewertet ? "" : "opacity-60"}>
                      <Label className="text-xs">{label}</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Slider
                          className="flex-1"
                          min={1}
                          max={10}
                          step={1}
                          value={[r[k]]}
                          onValueChange={(v) =>
                            setRow(i, { [k]: clamp10(v[0]), bewertet: true } as Partial<NufRow>)
                          }
                        />
                        <span className="w-6 text-right text-sm font-medium tabular-nums">
                          {r[k]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-sm">
                    Summe:{" "}
                    <span className="font-semibold">{r.bewertet ? sum : "–"}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sprint-Frage entfernen"
                    title="Entfernen"
                    onClick={() => removeRow(i)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                nufBewertungen: [
                  ...bew,
                  {
                    id: newId(),
                    text: "",
                    neuheit: 5,
                    nutzen: 5,
                    machbarkeit: 5,
                    bewertet: false,
                    isKi: false,
                  },
                ],
              })
            }
          >
            <Plus className="w-4 h-4 mr-1" /> Eigene Sprint-Frage hinzufügen
          </Button>

          {spitze ? (
            <p className="text-sm text-muted-foreground">
              {spitze.gleichstand
                ? "Zwei Fragen liegen gleichauf. Entscheidet bewusst, die Punkte nehmen euch das nicht ab."
                : `Höchste Punktzahl: ${spitze.top.text} (${sumOf(spitze.top)} von 30).`}
            </p>
          ) : null}
        </div>
      </CanvasSection>

      {/* ---------- 2. Top-1 wählen ---------- */}
      <CanvasSection defaultOpen title="2. Top-1 wählen">
        {!anyBewertet ? (
          <p className="text-sm text-muted-foreground mb-2">
            Bewertet die Fragen zuerst – ihr könnt die Top-1-Frage aber auch jetzt schon wählen.
          </p>
        ) : null}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Die Punkte sind Orientierung. Die Entscheidung trifft der Decider.
          </p>
          <div className="space-y-2">
            {bew.map((r) => {
              const rid = r.id ?? r.text;
              return (
                <label
                  key={rid}
                  className={`flex items-start gap-3 rounded-md border p-3 text-sm cursor-pointer ${
                    r.id && r.id === data.top1Id ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="nuf-top1"
                    className="mt-1"
                    checked={!!r.id && r.id === data.top1Id}
                    onChange={() => chooseTop1(r)}
                  />
                  <span className="flex-1">{r.text || "(ohne Text)"}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {r.bewertet ? `${sumOf(r)} / 30` : "–"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </CanvasSection>

      {/* ---------- 3. Messbar machen ---------- */}
      <CanvasSection defaultOpen title="3. Messbar machen">
        {!top1 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Sobald die Top-1-Frage steht, legt ihr hier fest, was ihr messt, welchen Zielwert ihr
            erreichen wollt und wie gemessen wird.
          </p>
        ) : (
          <p className="rounded-md border border-border-accent bg-accent-soft px-3 py-2 text-sm">
            Gewählte Top-1-Frage: {data.top1Challenge}
          </p>
        )}
        <div className={top1 ? "" : gedimmt} aria-disabled={!top1}>
          <div className="grid gap-3 sm:grid-cols-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Was messt ihr?</Label>
              <Input
                value={data.erfolgsMetrik ?? ""}
                disabled={!top1}
                placeholder="z. B. Testpersonen, die die Anmeldung ohne Hilfe abschliessen"
                onChange={(e) => patchErfolg({ erfolgsMetrik: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Zielwert</Label>
              <Input
                value={data.erfolgsZielwert ?? ""}
                disabled={!top1}
                placeholder="z. B. 4 von 5"
                onChange={(e) => patchErfolg({ erfolgsZielwert: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Wie gemessen?</Label>
              <Input
                value={data.erfolgsMethode ?? ""}
                disabled={!top1}
                placeholder="z. B. 5 Nutzertests am Sprint-Tag 5"
                onChange={(e) => patchErfolg({ erfolgsMethode: e.target.value })}
              />
            </div>
          </div>

          {vorschau ? (
            <p className="mt-3 rounded-md border border-border-accent bg-accent-soft px-3 py-2 text-sm">
              Vorschau: {vorschau}
            </p>
          ) : null}

          {legacyFreitext ? (
            <div className="mt-3 space-y-1.5">
              <Label className="text-xs">
                Bisherige Erfolgsmessung (Freitext) – du kannst die Angabe oben in die drei Felder
                aufteilen
              </Label>
              <Textarea
                rows={3}
                value={data.erfolgsmessung ?? ""}
                disabled={!top1}
                onChange={(e) => patch({ erfolgsmessung: e.target.value })}
              />
            </div>
          ) : null}

          <AcceptedKiList
            items={data.kiErfolgsmessung ?? []}
            onRemove={(i) =>
              patch({
                kiErfolgsmessung: (data.kiErfolgsmessung ?? []).filter((_, j) => j !== i),
              })
            }
          />
          <InlineSuggestions
            bucket="erfolg"
            suggestions={suggestions}
            onAcceptSuggestion={onAcceptSuggestion}
            onDismissSuggestion={onDismissSuggestion}
            onLoadSuggestions={() => onLoadSuggestions("erfolg")}
            pending={pendingBucket === "erfolg"}
            label="Erfolgsmessung vorschlagen"
          />
        </div>
      </CanvasSection>
    </div>
  );
}

function VariantNextSteps({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const todos = data.preSprintTodos ?? [];
  return (
    <div className="space-y-6">
      <CanvasSection title="Pre-Sprint-To-dos">
        <div className="space-y-2">
          <p className="text-sm font-medium">Eigene Anmerkungen</p>
          {todos.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_160px_140px_auto] gap-2">
              <Input
                value={t.text}
                placeholder="To-do"
                onChange={(e) => {
                  const next = [...todos];
                  next[i] = { ...t, text: e.target.value };
                  patch({ preSprintTodos: next });
                }}
              />
              <Input
                value={t.wer}
                placeholder="Wer?"
                onChange={(e) => {
                  const next = [...todos];
                  next[i] = { ...t, wer: e.target.value };
                  patch({ preSprintTodos: next });
                }}
              />
              <Input
                type="date"
                value={t.wann}
                placeholder="Wann?"
                onChange={(e) => {
                  const next = [...todos];
                  next[i] = { ...t, wann: e.target.value };
                  patch({ preSprintTodos: next });
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => patch({ preSprintTodos: todos.filter((_, j) => j !== i) })}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              patch({ preSprintTodos: [...todos, { text: "", wer: "", wann: "" }] })
            }
          >
            <Plus className="w-4 h-4 mr-1" /> To-do hinzufügen
          </Button>
        </div>
      </CanvasSection>
    </div>
  );
}

/* ---------- Intro / How-To slide ---------- */

function IntroSlide({ onNext }: { onNext?: () => void }) {
  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-6 lg:p-8 space-y-6">
        <div>
          <Badge variant="secondary" className="mb-2 gap-1">
            <Info className="w-3.5 h-3.5" /> Einführung
          </Badge>
          <h2 className="text-2xl font-bold">So arbeitest du im Problem-Framing-Workshop</h2>
          <p className="text-muted-foreground mt-2">
            Jeder Schritt trennt sauber zwischen deinen eigenen Gedanken und Vorschlägen der KI.
            Du entscheidest, was übernommen wird.
          </p>
        </div>

        {/* Block 1 – Eigene Anmerkungen */}
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <PenLine className="w-4 h-4" /> Eigene Anmerkungen
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Textfeld bzw. Liste mit dem Label „Eigene Anmerkungen".</li>
            <li>Alles, was du hier einträgst, bleibt unverändert dein Text.</li>
            <li>Wird nie automatisch mit KI-Inhalten überschrieben.</li>
          </ul>
        </div>

        {/* Block 2 – KI-Vorschläge */}
        <div className="rounded-lg border border-accent/60 bg-accent-soft p-4 text-foreground">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <Sparkles className="w-4 h-4" /> KI-Vorschläge (im Pink-Akzent)
          </div>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              Der Button <strong>KI-Vorschläge</strong> erzeugt kontextbezogene Ideen aus deinen
              bisherigen Eingaben.
            </li>
            <li>
              Vorschlagskarten erscheinen im Akzent-Farbton – identisch zur Button-Farbe – klar
              unterscheidbar von eigenen Anmerkungen.
            </li>
            <li>
              Pro Karte: <strong>Übernehmen</strong> verschiebt den Text in die Liste
              „Übernommene KI-Vorschläge", <strong>Verwerfen</strong> entfernt ihn.
            </li>
            <li>Übernommene Vorschläge behalten den Akzent-Farbton, um die Herkunft sichtbar zu halten.</li>
            <li>Übernommene Punkte kannst du jederzeit per X wieder entfernen.</li>
          </ul>
        </div>

        {/* Block 3 – Externe KI-Tools */}
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <Search className="w-4 h-4" /> Recherche mit externen KI-Tools (Claude, Gemini, ChatGPT)
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Du kannst parallel in Claude, Gemini oder ChatGPT recherchieren.</li>
            <li>
              Empfohlener Prompt-Rahmen: Kontext deines Sprints + konkrete Frage des aktuellen
              Schritts + „Gib mir 3–5 kurze Stichpunkte".
            </li>
            <li>
              Ergebnisse einzeln als eigene Zeile in „Eigene Anmerkungen" einfügen – oder nur die
              Kernpunkte übernehmen.
            </li>
            <li>
              Externe KI-Antworten sind nicht mit dem Akzent-Farbton markiert, weil sie außerhalb
              des Tools entstanden sind – du kuratierst sie bewusst.
            </li>
          </ul>

          <ExternalLlmPicker />
        </div>

        {/* Block 4 – Farbcode */}
        <div className="rounded-lg border bg-background p-4">
          <div className="font-semibold mb-2">Farbcode auf einen Blick</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border bg-background p-3">
              <div className="font-medium mb-1">Neutrale Farbe</div>
              <div className="text-muted-foreground">Eigene Anmerkungen und User-Eingaben.</div>
            </div>
            <div className="rounded-md border border-accent/60 bg-accent-soft p-3 text-foreground">
              <div className="font-medium mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> One-Next-Akzent
              </div>
              <div>KI-Button, Vorschlagskarten und übernommene KI-Vorschläge.</div>
            </div>
          </div>
        </div>

        {/* Block 5 – How-To */}
        <div className="rounded-lg border bg-background p-4">
          <div className="font-semibold mb-2">How-To in 5 Schritten</div>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5">
            <li>Frage des Schritts lesen und mit eigenen Worten in „Eigene Anmerkungen" antworten.</li>
            <li>Optional: Recherche in Claude, Gemini oder ChatGPT – Kernpunkte in Eigene Anmerkungen ergänzen.</li>
            <li><strong>KI-Vorschläge</strong> klicken für ergänzende Ideen aus deinem Kontext.</li>
            <li>Passende Karten <strong>Übernehmen</strong>, unpassende <strong>Verwerfen</strong>.</li>
            <li>Ergebnis prüfen, <strong>Weiter</strong> klicken.</li>
          </ol>
        </div>

        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          Die Timebox pro Schritt ist eine Orientierung, kein Zwang. Alles wird automatisch beim
          Weiterklicken gespeichert.
        </div>

        <div className="flex justify-end pt-2 border-t">
          {onNext ? (
            <Button className="" onClick={onNext}>
              Los geht's <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ExternalLlmPicker() {
  const { isSelected, toggle } = useExternalLlms();
  return (
    <div className="mt-4 pt-3 border-t">
      <div className="text-xs font-medium mb-2 text-foreground">
        Deine bevorzugten externen KI-Tools (öffnen sich pro Schritt in neuem Tab):
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {EXTERNAL_LLMS.map((llm) => (
          <label
            key={llm.id}
            className="inline-flex items-center gap-2 text-sm cursor-pointer select-none"
          >
            <Checkbox
              checked={isSelected(llm.id)}
              onCheckedChange={() => toggle(llm.id)}
            />
            <span>{llm.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}


