import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  useGenerateChallenge,
  useUpdateFramingSession,
} from "@/hooks/useFraming";
import { useCreateSprint } from "@/hooks/useSprint";
import type {
  ChallengeStatementResult,
  FramingSessionRow,
  FramingStepRow,
} from "@/features/framing/types";

interface Props {
  session: FramingSessionRow;
  steps: FramingStepRow[];
}

export default function FramingCompletionPanel({ session, steps }: Props) {
  const navigate = useNavigate();
  const generate = useGenerateChallenge();
  const updateSession = useUpdateFramingSession(session.id);
  const createSprint = useCreateSprint();

  const [result, setResult] = useState<ChallengeStatementResult | null>(
    session.challenge_statement
      ? {
          titel: session.titel_arbeitstitel || "Sprint",
          challenge_statement: session.challenge_statement,
          zielgruppe: "",
          erfolgsmessung: "",
          sprintFragen: [],
          risiken: [],
        }
      : null,
  );
  const [signedOff, setSignedOff] = useState(false);
  const [decider, setDecider] = useState("");
  const [recruitDone, setRecruitDone] = useState(false);
  const [recruitNote, setRecruitNote] = useState("");
  const [busy, setBusy] = useState(false);

  const step7 = steps.find((s) => s.step_key === "7")?.data as
    | { erfolgsmessung?: string }
    | undefined;
  const step8 = steps.find((s) => s.step_key === "8")?.data as
    | { inScope?: string[]; outOfScope?: string[] }
    | undefined;

  const scopeOk =
    (step8?.inScope?.length ?? 0) >= 1 && (step8?.outOfScope?.length ?? 0) >= 1;
  const measureOk = !!step7?.erfolgsmessung?.trim();
  const statementOk = !!result?.challenge_statement && signedOff;
  const deciderOk = decider.trim().length > 1;

  const allDone = statementOk && scopeOk && measureOk && deciderOk && recruitDone;

  async function handleGenerate() {
    try {
      const r = await generate.mutateAsync({ session_id: session.id });
      setResult(r);
    } catch (e) {
      toast({
        title: "Challenge-Statement konnte nicht generiert werden",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }

  async function handleFinish() {
    if (!result) return;
    setBusy(true);
    try {
      // Persist challenge statement first
      await updateSession.mutateAsync({
        challenge_statement: result.challenge_statement,
        titel_arbeitstitel: result.titel,
      });
      const sprint = await createSprint.mutateAsync({
        titel: result.titel,
        problemstellung: result.challenge_statement,
        modus: "solo",
        decider: decider.trim(),
        sprint_leader: "",
      });
      await updateSession.mutateAsync({
        status: "done",
        resulting_sprint_id: sprint.id,
      });
      toast({ title: "Sprint angelegt", description: "Auf zum Tag 1 · Map." });
      navigate(`/sprint/${sprint.id}`);
    } catch (e) {
      toast({
        title: "Sprint konnte nicht angelegt werden",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Abschluss & Challenge Statement</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Die KI bündelt eure Antworten in ein Challenge Statement. Prüfen, ggf.
              anpassen, sign-off — und der Sprint kann starten.
            </p>
          </div>

          {!result ? (
            <Button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="bg-gradient-primary hover:opacity-90"
            >
              {generate.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Challenge Statement generieren
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Arbeitstitel für den Sprint</Label>
                <Input
                  value={result.titel}
                  onChange={(e) => setResult({ ...result, titel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Challenge Statement</Label>
                <Textarea
                  rows={6}
                  value={result.challenge_statement}
                  onChange={(e) =>
                    setResult({ ...result, challenge_statement: e.target.value })
                  }
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Primäre Zielgruppe</Label>
                  <p className="text-sm text-muted-foreground">
                    {result.zielgruppe || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Erfolgsmessung</Label>
                  <p className="text-sm text-muted-foreground">
                    {result.erfolgsmessung || "—"}
                  </p>
                </div>
              </div>
              {result.sprintFragen.length ? (
                <div>
                  <Label className="text-xs">Sprint-Fragen</Label>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    {result.sprintFragen.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generate.isPending}>
                <Sparkles className="w-4 h-4 mr-2" /> Neu generieren
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <h3 className="text-xl font-bold">Definition of Done</h3>
          <ul className="space-y-3">
            <Item
              done={statementOk}
              label="Challenge Statement bestätigt (Sign-off)"
              extra={
                result ? (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={signedOff}
                      onCheckedChange={(v) => setSignedOff(!!v)}
                    />
                    Ich bestätige das Challenge Statement
                  </label>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Zuerst Challenge Statement generieren.
                  </span>
                )
              }
            />
            <Item done={scopeOk} label="Scope klar (In/Out je ≥1 Punkt in Schritt 8)" />
            <Item done={measureOk} label="Messziel definiert (Schritt 7)" />
            <Item
              done={deciderOk}
              label="Decider bestätigt"
              extra={
                <Input
                  value={decider}
                  onChange={(e) => setDecider(e.target.value)}
                  placeholder="Name der Person, die entscheidet"
                  className="max-w-sm"
                />
              }
            />
            <Item
              done={recruitDone}
              label="Rekrutierung ≥5 Testnutzer:innen angestoßen"
              extra={
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={recruitDone}
                      onCheckedChange={(v) => setRecruitDone(!!v)}
                    />
                    Angestoßen
                  </label>
                  <Input
                    value={recruitNote}
                    onChange={(e) => setRecruitNote(e.target.value)}
                    placeholder="Kurzer Vermerk (optional)"
                    className="max-w-sm"
                  />
                </div>
              }
            />
          </ul>

          <div className="flex justify-end pt-4">
            <Button
              disabled={!allDone || busy}
              onClick={handleFinish}
              className="bg-gradient-primary hover:opacity-90"
            >
              {busy ? "Legt Sprint an …" : "Workshop abschließen & Sprint anlegen"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Item({
  done,
  label,
  extra,
}: {
  done: boolean;
  label: string;
  extra?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        className={`w-5 h-5 mt-0.5 shrink-0 ${done ? "text-primary" : "text-muted-foreground/40"}`}
      />
      <div className="flex-1 space-y-1">
        <div className={done ? "font-medium" : ""}>{label}</div>
        {extra}
      </div>
    </li>
  );
}
