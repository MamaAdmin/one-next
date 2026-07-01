import { useEffect, useMemo, useState } from "react";
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
import type { FramingStepDef } from "@/features/framing/steps";
import type {
  FramingStepData,
  FramingStepRow,
  Cynefin,
} from "@/features/framing/types";
import { useFramingSuggest } from "@/hooks/useFraming";

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
              Timebox {step.timeboxMin} Min · Schritt {step.index} von 10
            </Badge>
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground mt-1">{step.frage}</p>
            <p className="text-xs text-muted-foreground mt-2">{step.arbeit}</p>
          </div>
        </div>

        <StepVariant step={step} data={data} patch={patch} />

        {vorschlaege.length > 0 ? (
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
}: {
  step: FramingStepDef;
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  switch (step.variant) {
    case "context-list":
      return <VariantContextList data={data} patch={patch} />;
    case "two-fields":
      return <VariantTwoFields data={data} patch={patch} />;
    case "stakeholder":
      return <VariantStakeholder data={data} patch={patch} />;
    case "sailboat":
      return <VariantSailboat data={data} patch={patch} />;
    case "five-whys":
      return <VariantFiveWhys data={data} patch={patch} />;
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

/* ---------- shared list editor ---------- */

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            if (input.trim()) {
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              <span className="flex-1">{it}</span>
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
    </div>
  );
}

function VariantTwoFields({
  data,
  patch,
}: {
  data: FramingStepData;
  patch: (p: Partial<FramingStepData>) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Warum jetzt?</Label>
        <Textarea
          rows={5}
          value={data.warumJetzt ?? ""}
          onChange={(e) => patch({ warumJetzt: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Default Future – was passiert ohne Handeln?</Label>
        <Textarea
          rows={5}
          value={data.defaultFuture ?? ""}
          onChange={(e) => patch({ defaultFuture: e.target.value })}
        />
      </div>
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
        <Label>Ursachen einordnen (Cynefin + adressierbar?)</Label>
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
          <div key={i} className="grid grid-cols-[1fr_180px_140px_auto] gap-2 items-center">
            <Input
              value={u.text}
              onChange={(e) => {
                const next = [...ursachen];
                next[i] = { ...u, text: e.target.value };
                patch({ ursachen: next });
              }}
            />
            <Select
              value={u.cynefin}
              onValueChange={(v) => {
                const next = [...ursachen];
                next[i] = { ...u, cynefin: v as Cynefin };
                patch({ ursachen: next });
              }}
            >
              <SelectTrigger>
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
        ))}
      </div>
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
