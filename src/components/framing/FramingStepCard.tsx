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
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FRAMING_STEPS, type FramingStepDef } from "@/features/framing/steps";
import type {
  FramingStepData,
  FramingStepRow,
  Cynefin,
} from "@/features/framing/types";
import { useFramingSuggest } from "@/hooks/useFraming";
import { CanvasSection } from "./CanvasSection";

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

  useEffect(() => {
    const d = (stepRow?.data ?? {}) as FramingStepData;
    setData(d);
    setVorschlaege(d.vorschlaege ?? []);
  }, [stepRow?.id]);

  // Auto-Seed für Cynefin-Schritt: übernimmt Ursachen aus Schritt 5 (Root Cause),
  // falls hier noch keine erfasst sind. So entsteht die Cynefin-Klassifikation
  // automatisch aus dem vorherigen Schritt.
  useEffect(() => {
    if (step.variant !== "cynefin") return;
    const own = (stepRow?.data ?? {}) as FramingStepData;
    if ((own.ursachen ?? []).length > 0) return;
    const rootStep = allSteps.find((s) => s.step_key === "5");
    const rootData = (rootStep?.data ?? {}) as FramingStepData;
    const seeded: FramingStepData["ursachen"] = [];
    for (const u of rootData.ursachen ?? []) {
      if (u?.text?.trim()) {
        seeded.push({
          text: u.text,
          cynefin: u.cynefin ?? "kompliziert",
          adressierbar: u.adressierbar ?? true,
        });
      }
    }
    // Fallback: letzte Antwort aus den 5 Whys als Ursache übernehmen
    if (seeded.length === 0) {
      const lastWhy = [...(rootData.fiveWhys ?? [])].reverse().find((w) => w?.trim());
      if (lastWhy) {
        seeded.push({ text: lastWhy, cynefin: "kompliziert", adressierbar: true });
      }
    }
    if (seeded.length > 0) {
      setData((prev) => ({ ...prev, ursachen: seeded }));
    }
  }, [step.variant, stepRow?.id, allSteps]);

  function patch(p: Partial<FramingStepData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  async function loadSuggestions(field?: string) {
    try {
      const res = await suggest.mutateAsync({
        session_id: sessionId,
        step_key: step.key,
        field,
      });
      setVorschlaege(res.vorschlaege ?? []);
    } catch (e) {
      toast({
        title: "KI-Vorschläge fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }

  async function handleSave(opts?: { completed?: boolean; next?: boolean }) {
    setSaving(true);
    try {
      await onSave({ ...data, vorschlaege }, { completed: opts?.completed });
      if (opts?.next && onNext) onNext();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              Timebox {step.timeboxMin} Min · Schritt {step.index} von {FRAMING_STEPS.length}
            </Badge>
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground mt-1">{step.frage}</p>
            <p className="text-xs text-muted-foreground mt-2">{step.arbeit}</p>
          </div>
        </div>

        <StepVariant
          step={step}
          data={data}
          patch={patch}
          suggestions={vorschlaege}
          onLoadSuggestions={(field) => loadSuggestions(field)}
          suggestPending={suggest.isPending}
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

        {vorschlaege.length > 0 && step.variant !== "two-fields" ? (
          <div className="rounded-lg border bg-muted/30 p-4">
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
                    vorschlaege.forEach((v) => applySuggestion(step.variant, v, next));
                    setData(next);
                    setVorschlaege([]);
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
              {vorschlaege.map((v, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border bg-background px-3 py-2 text-sm"
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
                      setVorschlaege((prev) => prev.filter((_, j) => j !== i));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Übernehmen
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setVorschlaege((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          {step.variant !== "two-fields" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
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
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => handleSave({ completed: true, next: true })}
            disabled={saving}
          >
            {saving ? "Speichert …" : onNext ? "Abschließen & weiter" : "Abschließen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepVariant({
  step,
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  suggestPending,
}: {
  step: FramingStepDef;
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  suggestPending: boolean;
}) {
  switch (step.variant) {
    case "context-list":
      return <VariantContextList data={data} patch={patch} />;
    case "two-fields":
      return (
        <VariantTwoFields
          data={data}
          patch={patch}
          suggestions={suggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onDismissSuggestion={onDismissSuggestion}
          onLoadSuggestions={onLoadSuggestions}
          suggestPending={suggestPending}
        />
      );
    case "stakeholder":
      return <VariantStakeholder data={data} patch={patch} />;
    case "sailboat":
      return <VariantSailboat data={data} patch={patch} />;
    case "five-whys":
      return <VariantFiveWhys data={data} patch={patch} />;
    case "cynefin":
      return <VariantCynefin data={data} patch={patch} />;
    case "assumptions":
      return <VariantAssumptions data={data} patch={patch} />;
    case "success-constraints":
      return <VariantSuccess data={data} patch={patch} />;
    case "scope-questions":
      return <VariantScope data={data} patch={patch} />;
    case "nuf":
      return <VariantNuf data={data} patch={patch} />;
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
    case "context-list":
      data.nichtZiele = pushUnique(data.nichtZiele, text);
      return;
    case "two-fields": {
      const m = text.match(/^\[(Gegenwart|Present|Vergangenheit|Past|Zukunft|Future|Standard-Zukunft|Default Future|Wettbewerb|Trends|Chancen)\]\s*(.+)$/i);
      const bucket = m ? m[1].toLowerCase() : "future";
      const value = m ? m[2].trim() : text;
      if (bucket === "present" || bucket === "gegenwart") {
        const cur = data.warumJetzt ?? "";
        data.warumJetzt = cur ? `${cur}\n• ${value}` : `• ${value}`;
      } else if (bucket === "past" || bucket === "vergangenheit") {
        data.frueherVersucht = [
          ...(data.frueherVersucht ?? []),
          { text: value, ergebnis: "didnt-work" },
        ];
      } else if (bucket === "wettbewerb") {
        data.wettbewerber = pushUnique(data.wettbewerber, value);
      } else if (bucket === "trends") {
        data.trends = pushUnique(data.trends, value);
      } else if (bucket === "chancen") {
        data.chancen = pushUnique(data.chancen, value);
      } else {
        // future / default future
        const cur = data.defaultFuture ?? "";
        data.defaultFuture = cur ? `${cur}\n• ${value}` : `• ${value}`;
      }
      return;
    }
    case "stakeholder":
      data.stakeholder = pushUnique(data.stakeholder, text);
      return;
    case "sailboat": {
      const sb = data.sailboat ?? { wind: [], anker: [], hafen: "", eisberg: [] };
      const m = text.match(/^\[(Wind|Anker|Hafen|Eisberg)\]\s*(.+)$/i);
      if (m) {
        const bucket = m[1].toLowerCase();
        const value = m[2].trim();
        if (bucket === "wind") sb.wind = pushUnique(sb.wind, value);
        else if (bucket === "anker") sb.anker = pushUnique(sb.anker, value);
        else if (bucket === "hafen")
          sb.hafen = sb.hafen ? `${sb.hafen}\n${value}` : value;
        else if (bucket === "eisberg") sb.eisberg = pushUnique(sb.eisberg, value);
      } else {
        sb.wind = pushUnique(sb.wind, text);
      }
      data.sailboat = sb;
      return;
    }
    case "five-whys": {
      const whys = data.fiveWhys ?? ["", "", "", "", ""];
      const idx = whys.findIndex((w) => !w.trim());
      if (idx >= 0) {
        const next = [...whys];
        next[idx] = text;
        data.fiveWhys = next;
      } else {
        data.ursachen = [
          ...(data.ursachen ?? []),
          { text, cynefin: "kompliziert", adressierbar: true },
        ];
      }
      return;
    }
    case "cynefin":
      data.ursachen = [
        ...(data.ursachen ?? []),
        { text, cynefin: "kompliziert", adressierbar: true },
      ];
      return;
    case "assumptions":
      data.annahmen = [
        ...(data.annahmen ?? []),
        { text, unsicherheit: 3, einfluss: 3 },
      ];
      return;
    case "success-constraints":
      data.constraints = pushUnique(data.constraints, text);
      return;
    case "scope-questions":
      data.sprintFragen = pushUnique(data.sprintFragen, text);
      return;
    case "nuf":
      data.nufBewertungen = [
        ...(data.nufBewertungen ?? []),
        { text, neuheit: 3, nutzen: 3, machbarkeit: 3 },
      ];
      return;
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
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    if (input.trim()) {
      onChange([...items, input.trim()]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Kontext / Ausgangslage</Label>
        <Textarea
          rows={4}
          value={data.kontext ?? ""}
          onChange={(e) => patch({ kontext: e.target.value })}
          placeholder="Kurz beschreiben, worum es geht …"
        />
      </div>
      <ListEditor
        label="Kein Sprint-Ziel (Abgrenzung)"
        items={data.nichtZiele ?? []}
        onChange={(v) => patch({ nichtZiele: v })}
        placeholder="z. B. Neues CI/CD-System aufsetzen"
      />
      <CanvasSection title="Geschäftliche Vergangenheit (optional) – Was wurde früher schon versucht?">
        <PastAttemptsEditor
          items={data.frueherVersucht ?? []}
          onChange={(v) => patch({ frueherVersucht: v })}
          placeholder="z. B. Interne Schulung im Q2/2024"
        />
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

function bucketOfTwoFieldsSuggestion(raw: string): TwoFieldsBucket | null {
  const m = raw.match(
    /^\[(Gegenwart|Present|Vergangenheit|Past|Zukunft|Future|Standard-Zukunft|Default Future|Wettbewerb|Trends|Chancen)\]/i,
  );
  if (!m) return null;
  const tag = m[1].toLowerCase();
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
}: {
  bucket: TwoFieldsBucket;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: () => void;
  pending: boolean;
}) {
  const matches = suggestions
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => bucketOfTwoFieldsSuggestion(v) === bucket)
    .slice(0, 3);
  return (
    <div className="mt-2 space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={onLoadSuggestions}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        )}
        KI-Vorschläge
      </Button>
      {matches.length > 0 ? (
        <ul className="space-y-1.5">
          {matches.map(({ v, i }) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm"
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

function VariantTwoFields({
  data,
  patch,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onLoadSuggestions,
  suggestPending,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
  suggestions: string[];
  onAcceptSuggestion: (i: number) => void;
  onDismissSuggestion: (i: number) => void;
  onLoadSuggestions: (field?: string) => void;
  suggestPending: boolean;
}) {
  const inline = (bucket: TwoFieldsBucket) => (
    <InlineSuggestions
      bucket={bucket}
      suggestions={suggestions}
      onAcceptSuggestion={onAcceptSuggestion}
      onDismissSuggestion={onDismissSuggestion}
      onLoadSuggestions={() => onLoadSuggestions(bucket)}
      pending={suggestPending}
    />
  );
  return (
    <div className="space-y-6">
      <CanvasSection title="Gegenwart – Warum jetzt?">
        <Textarea
          rows={4}
          value={data.warumJetzt ?? ""}
          onChange={(e) => patch({ warumJetzt: e.target.value })}
          placeholder="Was macht das Thema gerade jetzt dringlich?"
        />
        {inline("gegenwart")}
      </CanvasSection>

      <CanvasSection title="Vergangenheit – Was wurde bisher versucht?">
        <PastAttemptsEditor
          items={data.frueherVersucht ?? []}
          onChange={(v) => patch({ frueherVersucht: v })}
          placeholder="z. B. Interne Schulung im Q2/2024"
        />
        {inline("vergangenheit")}
      </CanvasSection>

      <CanvasSection title="Zukunft – Standard-Zukunft (was passiert ohne Handeln?)">
        <Textarea
          rows={4}
          value={data.defaultFuture ?? ""}
          onChange={(e) => patch({ defaultFuture: e.target.value })}
          placeholder="Realistisches Bild der Zukunft, wenn wir nichts tun …"
        />
        {inline("zukunft")}
      </CanvasSection>

      <CanvasSection title="Geschäftliche Zukunft – Wettbewerb, Trends, Chancen">
        <div className="space-y-4">
          <div>
            <ListEditor
              label="Wettbewerb – was machen Wettbewerber / Vergleichbare?"
              items={data.wettbewerber ?? []}
              onChange={(v) => patch({ wettbewerber: v })}
              multiline
              rows={3}
              placeholder="z. B. Anbieter X setzt seit 2024 auf …"
            />
            {inline("wettbewerb")}
          </div>
          <div>
            <ListEditor
              label="Trends – für / gegen die Idee"
              items={data.trends ?? []}
              onChange={(v) => patch({ trends: v })}
              multiline
              rows={3}
              placeholder="z. B. Regulatorik, Marktbewegung, Technologie …"
            />
            {inline("trends")}
          </div>
          <div>
            <ListEditor
              label="Chancen – wo liegen Opportunities?"
              items={data.chancen ?? []}
              onChange={(v) => patch({ chancen: v })}
              multiline
              rows={3}
              placeholder="z. B. Neue Zielgruppe, Partnerschaft, Kanal …"
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
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const stakeholder = data.stakeholder ?? [];
  return (
    <div className="space-y-4">
      <ListEditor
        label="Stakeholder / potenzielle Zielgruppen"
        items={stakeholder}
        onChange={(v) => patch({ stakeholder: v })}
      />
      <div className="space-y-2">
        <Label>Primäre Zielgruppe</Label>
        <Select
          value={data.primaereZielgruppe ?? ""}
          onValueChange={(v) => patch({ primaereZielgruppe: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Aus Stakeholdern wählen …" />
          </SelectTrigger>
          <SelectContent>
            {stakeholder.map((s, i) => (
              <SelectItem key={i} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ListEditor
        label="Sekundäre Gruppen – bewusst geparkt"
        items={data.sekundaerGeparkt ?? []}
        onChange={(v) => patch({ sekundaerGeparkt: v })}
      />
      <CanvasSection title="Customer-Kontext (optional) – Verhalten, frühere Versuche, Pain/Gain">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Wie löst die Zielgruppe das Problem heute?</Label>
            <Textarea
              rows={3}
              value={data.kundeHeuteLoesung ?? ""}
              onChange={(e) => patch({ kundeHeuteLoesung: e.target.value })}
              placeholder="Aktuelles Verhalten, Workarounds, Tools …"
            />
          </div>
          <PastAttemptsEditor
            label="Was hat die Zielgruppe früher versucht?"
            items={data.kundeVersuchePast ?? []}
            onChange={(v) => patch({ kundeVersuchePast: v })}
            placeholder="z. B. Nutzung eines Wettbewerber-Tools"
          />
          <div className="space-y-2">
            <Label>Welchen Pain lindern wir – welchen Gain schaffen wir?</Label>
            <Textarea
              rows={3}
              value={data.kundePainGain ?? ""}
              onChange={(e) => patch({ kundePainGain: e.target.value })}
              placeholder="Konkreter Nutzen aus Sicht der Zielgruppe"
            />
          </div>
        </div>
      </CanvasSection>
    </div>
  );
}

function VariantSailboat({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const sb = data.sailboat ?? { wind: [], anker: [], hafen: "", eisberg: [] };
  const set = (upd: Partial<typeof sb>) => patch({ sailboat: { ...sb, ...upd } });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ListEditor label="Wind – Treiber" items={sb.wind} onChange={(v) => set({ wind: v })} />
      <ListEditor label="Anker – Hindernisse" items={sb.anker} onChange={(v) => set({ anker: v })} />
      <div className="space-y-2 md:col-span-1">
        <Label>Hafen – Ziel</Label>
        <Textarea
          rows={3}
          value={sb.hafen}
          onChange={(e) => set({ hafen: e.target.value })}
          placeholder="Wohin wollen wir?"
        />
      </div>
      <ListEditor
        label="Eisberg – Risiken"
        items={sb.eisberg}
        onChange={(v) => set({ eisberg: v })}
      />
    </div>
  );
}

function VariantFiveWhys({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const whys = data.fiveWhys ?? ["", "", "", "", ""];
  const ursachen = data.ursachen ?? [];
  const setWhy = (i: number, v: string) => {
    const next = [...whys];
    next[i] = v;
    patch({ fiveWhys: next });
  };
  const addUrsache = (text: string) => {
    if (!text.trim()) return;
    patch({
      ursachen: [...ursachen, { text: text.trim(), cynefin: "kompliziert", adressierbar: true }],
    });
  };
  const [ursacheInput, setUrsacheInput] = useState("");
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>5 Whys</Label>
        {whys.map((w, i) => (
          <Input
            key={i}
            value={w}
            onChange={(e) => setWhy(i, e.target.value)}
            placeholder={`Warum ${i + 1}?`}
          />
        ))}
      </div>
      <div className="space-y-2">
        <Label>Adressierbare Ursachen</Label>
        <p className="text-xs text-muted-foreground">
          Nur Ursachen sammeln – die Cynefin-Einordnung erfolgt automatisch im nächsten Schritt.
        </p>
        <div className="flex gap-2">
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
    </div>
  );
}

function VariantCynefin({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const ursachen = data.ursachen ?? [];
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverKey, setDragOverKey] = useState<Cynefin | null>(null);
  const [justDroppedKey, setJustDroppedKey] = useState<Cynefin | null>(null);
  const [snappedIndex, setSnappedIndex] = useState<number | null>(null);
  const dropHandledRef = useMemo(() => ({ current: false }), []);
  const setCynefin = (i: number, c: Cynefin) => {
    const next = [...ursachen];
    next[i] = { ...next[i], cynefin: c };
    patch({ ursachen: next });
  };
  const quadrants: Array<{
    key: Cynefin;
    title: string;
    subtitle: string;
    bg: string;
    border: string;
    accent: string;
  }> = [
    {
      key: "komplex",
      title: "Komplex",
      subtitle: "Ausprobieren – Erkennen – Reagieren",
      bg: "bg-[#fdf4c3] dark:bg-yellow-950/40",
      border: "border-[#e8d770] dark:border-yellow-800/60",
      accent: "text-[#8a7a1f] dark:text-yellow-200",
    },
    {
      key: "kompliziert",
      title: "Kompliziert",
      subtitle: "Erkennen – Analysieren – Reagieren",
      bg: "bg-[#d9eddb] dark:bg-emerald-950/40",
      border: "border-[#9cc9a2] dark:border-emerald-800/60",
      accent: "text-[#2f6b3a] dark:text-emerald-200",
    },
    {
      key: "chaotisch",
      title: "Chaotisch",
      subtitle: "Handeln – Erkennen – Reagieren",
      bg: "bg-[#f7d5d1] dark:bg-red-950/40",
      border: "border-[#e5a49d] dark:border-red-800/60",
      accent: "text-[#8a3229] dark:text-red-200",
    },
    {
      key: "einfach",
      title: "Einfach (Klar)",
      subtitle: "Erkennen – Kategorisieren – Reagieren",
      bg: "bg-[#cfe0f0] dark:bg-sky-950/40",
      border: "border-[#8fb6d6] dark:border-sky-800/60",
      accent: "text-[#1f4a70] dark:text-sky-200",
    },
  ];
  const flashSnap = (c: Cynefin, i: number) => {
    setJustDroppedKey(c);
    setSnappedIndex(i);
    window.setTimeout(() => {
      setJustDroppedKey((k) => (k === c ? null : k));
      setSnappedIndex((s) => (s === i ? null : s));
    }, 550);
  };
  const handleDropInQuadrant = (e: DragEvent, c: Cynefin) => {
    e.preventDefault();
    e.stopPropagation();
    dropHandledRef.current = true;
    setDragOverKey(null);
    const raw = e.dataTransfer.getData("text/plain");
    const idx = Number(raw);
    if (raw === "" || Number.isNaN(idx) || !ursachen[idx]) {
      toast({
        title: "Chip konnte nicht platziert werden",
        description: "Der Ursachen-Chip wurde nicht korrekt erkannt. Bitte erneut ziehen.",
        variant: "destructive",
      });
      return;
    }
    if (ursachen[idx].cynefin === c) {
      // no-op, but still confirm with a subtle snap
      flashSnap(c, idx);
      return;
    }
    setCynefin(idx, c);
    flashSnap(c, idx);
  };
  const handleDropOutside = (e: DragEvent) => {
    e.preventDefault();
    if (dropHandledRef.current) {
      dropHandledRef.current = false;
      return;
    }
    toast({
      title: "Kein gültiger Bereich",
      description:
        "Chip muss in einem der vier Cynefin-Quadranten abgelegt werden (Komplex, Kompliziert, Chaotisch, Einfach).",
      variant: "destructive",
    });
    setDragOverKey(null);
    setDragIndex(null);
  };
  return (
    <div className="space-y-4">
      <CanvasSection title="Was ist das Cynefin-Modell? (Erklärung einblenden)">
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Das Cynefin-Framework unterscheidet <strong>fünf Domänen</strong>, um Probleme nach der
            Beziehung zwischen Ursache und Wirkung einzuordnen und daraus die passende
            Herangehensweise abzuleiten.
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Einfach / Klar</strong> – Ursache und Wirkung sind für alle offensichtlich.
              Vorgehen: <em>Erkennen – Kategorisieren – Reagieren</em>. Es gelten <em>bewährte
              Praktiken</em> (best practice).
            </li>
            <li>
              <strong>Kompliziert</strong> – Ursache und Wirkung erfordern Analyse, Prüfung oder
              Fachwissen. Vorgehen: <em>Erkennen – Analysieren – Reagieren</em>. Es gelten <em>gute
              Praktiken</em> (good practice).
            </li>
            <li>
              <strong>Komplex</strong> – Ursache und Wirkung sind nur im Nachhinein erkennbar.
              Vorgehen: <em>Ausprobieren – Erkennen – Reagieren</em>. Es entstehen <em>emergente
              Praktiken</em>.
            </li>
            <li>
              <strong>Chaotisch</strong> – Keine erkennbare Beziehung zwischen Ursache und Wirkung
              auf Systemebene. Vorgehen: <em>Handeln – Erkennen – Reagieren</em>. Chance auf
              <em> innovative Praktiken</em>.
            </li>
            <li>
              <strong>Unklar (Disorder)</strong> – Zustand des Nicht-Wissens, welche Kausalität
              vorliegt. Menschen fallen dann in ihre Komfortzone zurück. Ziel: schnell in eine der
              anderen vier Domänen wechseln.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Achtung: Die Grenze zwischen <em>Einfach</em> und <em>Chaotisch</em> gilt als
            katastrophal – Selbstzufriedenheit führt zum Scheitern.
          </p>
        </div>
      </CanvasSection>

      <p className="text-xs text-muted-foreground">
        Ursachen aus Schritt 5 in das Cynefin-Modell einordnen: per Drag &amp; Drop in einen Bereich
        ziehen oder unten im Editor klassifizieren.
      </p>


      <div className="relative">
        <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground grid grid-cols-2 mb-2 px-1">
          <span>Ungeordneter Bereich</span>
          <span className="text-right">Geordneter Bereich</span>
        </div>
        <div
          className="relative grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOutside}
        >
          {/* dashed axis cross */}
          <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-dashed border-muted-foreground/40" aria-hidden />
          <div className="pointer-events-none absolute inset-y-4 left-1/2 border-l border-dashed border-muted-foreground/40" aria-hidden />

          {quadrants.map((q) => {
            const isOver = dragOverKey === q.key;
            const justDropped = justDroppedKey === q.key;
            return (
              <div
                key={q.key}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverKey(q.key);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverKey !== q.key) setDragOverKey(q.key);
                }}
                onDragLeave={(e) => {
                  // only clear when leaving the quadrant itself
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverKey((k) => (k === q.key ? null : k));
                }}
                onDrop={(e) => handleDropInQuadrant(e, q.key)}
                className={`relative min-h-[180px] rounded-2xl border ${q.border} ${q.bg} p-5 flex flex-col transition-all duration-150 ${
                  isOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
                } ${justDropped ? "ring-2 ring-primary/60 animate-in fade-in zoom-in-95" : ""}`}
                aria-dropeffect="move"
              >
                <div className="mb-3">
                  <div className={`font-bold text-lg tracking-tight ${q.accent}`}>{q.title}</div>
                  <div className="text-[12px] italic text-foreground/70 mt-0.5">{q.subtitle}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 content-start">
                  {ursachen.map((u, i) =>
                    u.cynefin === q.key ? (
                      <div
                        key={i}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(i));
                          e.dataTransfer.effectAllowed = "move";
                          setDragIndex(i);
                          dropHandledRef.current = false;
                        }}
                        onDragEnd={() => {
                          setDragIndex(null);
                          setDragOverKey(null);
                        }}
                        className={`cursor-grab active:cursor-grabbing rounded-full border border-foreground/15 bg-background/95 px-3 py-1 text-xs font-medium shadow-sm max-w-full truncate transition-all ${
                          u.adressierbar ? "" : "opacity-60 line-through"
                        } ${dragIndex === i ? "opacity-40 scale-95" : ""} ${
                          snappedIndex === i ? "ring-2 ring-primary/70 scale-105" : ""
                        }`}
                        title={u.text}
                      >
                        {u.text || "(leer)"}
                      </div>
                    ) : null,
                  )}
                  {isOver ? (
                    <div className="w-full text-[11px] font-medium text-primary/80 border border-dashed border-primary/50 rounded-full px-2.5 py-1 text-center bg-primary/5">
                      Hier ablegen
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* center diamond */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-background border-2 border-foreground/70 w-20 h-20 flex items-center justify-center shadow-md pointer-events-none rounded-md"
            aria-hidden
          >
            <span className="-rotate-45 text-sm font-semibold tracking-tight">Unklar</span>
          </div>
        </div>
      </div>



      {ursachen.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          Keine Ursachen aus Schritt 5 vorhanden. Gehe zurück zu <strong>Root Cause (5 Whys)</strong>,
          um Ursachen zu erfassen – sie werden hier automatisch übernommen.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Ursachen bearbeiten
          </div>
          {ursachen.map((u, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-md border p-2 md:grid md:grid-cols-[minmax(0,1fr)_180px_140px_auto] md:items-start"
            >
              <Textarea
                value={u.text}
                rows={2}
                className="min-h-[60px] w-full resize-y break-words"
                onChange={(e) => {
                  const next = [...ursachen];
                  next[i] = { ...u, text: e.target.value };
                  patch({ ursachen: next });
                }}
              />
              <div className="flex flex-wrap items-center gap-2 md:contents">
                <Select value={u.cynefin} onValueChange={(v) => setCynefin(i, v as Cynefin)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="einfach">einfach</SelectItem>
                    <SelectItem value="kompliziert">kompliziert</SelectItem>
                    <SelectItem value="komplex">komplex</SelectItem>
                    <SelectItem value="chaotisch">chaotisch</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={u.adressierbar}
                    onCheckedChange={(v) => {
                      const next = [...ursachen];
                      next[i] = { ...u, adressierbar: !!v };
                      patch({ ursachen: next });
                    }}
                  />
                  adressierbar
                </label>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => patch({ ursachen: ursachen.filter((_, j) => j !== i) })}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function VariantAssumptions({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const annahmen = data.annahmen ?? [];
  const [input, setInput] = useState("");
  const add = () => {
    if (!input.trim()) return;
    patch({ annahmen: [...annahmen, { text: input.trim(), unsicherheit: 3, einfluss: 3 }] });
    setInput("");
  };
  return (
    <div className="space-y-3">
      <Label>Annahmen (Unsicherheit / Einfluss je 1–5)</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Annahme …"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="outline" size="icon" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
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
  );
}

function clamp(n: number) {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function VariantSuccess({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Erfolgsmessung – messbar in 5 Tagen</Label>
        <Textarea
          rows={3}
          value={data.erfolgsmessung ?? ""}
          onChange={(e) => patch({ erfolgsmessung: e.target.value })}
        />
      </div>
      <ListEditor
        label="Constraints – was ist gesetzt?"
        items={data.constraints ?? []}
        onChange={(v) => patch({ constraints: v })}
      />
    </div>
  );
}

function VariantScope({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <ListEditor
          label="In Scope"
          items={data.inScope ?? []}
          onChange={(v) => patch({ inScope: v })}
        />
        <ListEditor
          label="Out of Scope"
          items={data.outOfScope ?? []}
          onChange={(v) => patch({ outOfScope: v })}
        />
      </div>
      <ListEditor
        label="Sprint-Fragen (Decision Questions)"
        items={data.sprintFragen ?? []}
        onChange={(v) => patch({ sprintFragen: v })}
        placeholder="z. B. Können wir X in 5 Tagen mit Y validieren?"
      />
    </div>
  );
}

function VariantNuf({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  const bew = data.nufBewertungen ?? [];
  return (
    <div className="space-y-3">
      <Label>Sprint-Fragen bewerten (1–5)</Label>
      {bew.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Keine Sprint-Fragen vorhanden. Nutze KI-Vorschläge oder gehe zurück zu Schritt 8.
        </p>
      ) : null}
      {bew.map((r, i) => {
        const sum = r.neuheit + r.nutzen + r.machbarkeit;
        const isTop = data.top1Challenge === r.text;
        return (
          <div
            key={i}
            className={`grid grid-cols-[1fr_80px_80px_80px_60px_auto] gap-2 items-center rounded-md border p-2 ${
              isTop ? "border-primary bg-primary/5" : ""
            }`}
          >
            <Input
              value={r.text}
              onChange={(e) => {
                const next = [...bew];
                next[i] = { ...r, text: e.target.value };
                patch({ nufBewertungen: next });
              }}
            />
            {(["neuheit", "nutzen", "machbarkeit"] as const).map((k) => (
              <div key={k}>
                <Label className="text-xs capitalize">{k}</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={r[k]}
                  onChange={(e) => {
                    const next = [...bew];
                    next[i] = { ...r, [k]: clamp(+e.target.value) };
                    patch({ nufBewertungen: next });
                  }}
                />
              </div>
            ))}
            <div className="text-sm font-semibold text-center">{sum}</div>
            <Button
              variant={isTop ? "default" : "outline"}
              size="sm"
              onClick={() => patch({ top1Challenge: r.text })}
            >
              Top-1
            </Button>
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
              { text: "", neuheit: 3, nutzen: 3, machbarkeit: 3 },
            ],
          })
        }
      >
        <Plus className="w-4 h-4 mr-1" /> Challenge hinzufügen
      </Button>
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
    <div className="space-y-4">
      <label className="flex items-center gap-3">
        <Checkbox
          checked={!!data.sprintGo}
          onCheckedChange={(v) => patch({ sprintGo: !!v })}
        />
        <span className="font-medium">Sprint-Go?</span>
      </label>
      <div className="space-y-2">
        <Label>Pre-Sprint-To-dos</Label>
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
    </div>
  );
}
