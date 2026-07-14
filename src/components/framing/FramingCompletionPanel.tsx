import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  useGenerateChallenge,
  useUpdateFramingSession,
} from "@/hooks/useFraming";
import { useCreateSprint } from "@/hooks/useSprint";
import { supabase } from "@/integrations/supabase/client";
import type {
  ChallengeStatementResult,
  FramingSessionRow,
  FramingStepRow,
} from "@/features/framing/types";

interface Props {
  session: FramingSessionRow;
  steps: FramingStepRow[];
}

const RESULT_STORAGE_PREFIX = "framing-result-";

export default function FramingCompletionPanel({ session, steps }: Props) {
  const navigate = useNavigate();
  const generate = useGenerateChallenge();
  const updateSession = useUpdateFramingSession(session.id);
  const createSprint = useCreateSprint();

  const isLocked = session.status === "done";
  const storageKey = `${RESULT_STORAGE_PREFIX}${session.id}`;

  const [result, setResult] = useState<ChallengeStatementResult | null>(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && "result" in parsed) {
          return parsed.result as ChallengeStatementResult;
        }
        return parsed as ChallengeStatementResult;
      }
    } catch {
      // ignore
    }
    return session.challenge_statement
      ? {
          titel: session.titel_arbeitstitel || "Sprint",
          challenge_statement: session.challenge_statement,
          zielgruppe: "",
          erfolgsmessung: "",
          sprintFragen: [],
          risiken: [],
        }
      : null;
  });
  const [ownSprintFragen, setOwnSprintFragen] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.ownSprintFragen)) {
          return parsed.ownSprintFragen as string[];
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [ownRisiken, setOwnRisiken] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.ownRisiken)) {
          return parsed.ownRisiken as string[];
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [signedOff, setSignedOff] = useState(isLocked);
  const [decider, setDecider] = useState("Julia");
  const [recruitDone, setRecruitDone] = useState(isLocked);
  const [recruitNote, setRecruitNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Persist result + own additions to localStorage
  useEffect(() => {
    if (result) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ result, ownSprintFragen, ownRisiken }),
        );
      } catch {
        // ignore
      }
    }
  }, [result, ownSprintFragen, ownRisiken, storageKey]);

  const step7 = steps.find((s) => s.step_key === "7")?.data as
    | { erfolgsmessung?: string; kiErfolgsmessung?: string[] }
    | undefined;
  const step8 = steps.find((s) => s.step_key === "8")?.data as
    | {
        inScope?: string[];
        outOfScope?: string[];
        kiInScope?: string[];
        kiOutOfScope?: string[];
      }
    | undefined;

  const scopeOk =
    ((step8?.inScope?.length ?? 0) + (step8?.kiInScope?.length ?? 0)) >= 1 &&
    ((step8?.outOfScope?.length ?? 0) + (step8?.kiOutOfScope?.length ?? 0)) >= 1;
  const measureOk =
    (step7?.erfolgsmessung?.trim().length ?? 0) > 0 ||
    (step7?.kiErfolgsmessung?.length ?? 0) > 0;
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

  // Auto-generate on first mount if nothing exists yet and not locked
  useEffect(() => {
    if (!isLocked && !result && !autoTriggered && !generate.isPending) {
      setAutoTriggered(true);
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFinish() {
    if (!result) return;
    setBusy(true);
    try {
      await updateSession.mutateAsync({
        challenge_statement: result.challenge_statement,
        titel_arbeitstitel: result.titel,
      });

      let sprintId = session.resulting_sprint_id ?? null;

      // Verify the linked sprint still exists and isn't soft-deleted.
      // If it was deleted, unlink and fall through to create a fresh sprint.
      if (sprintId) {
        const { data: existing } = await supabase
          .from("sprints")
          .select("id,deleted_at")
          .eq("id", sprintId)
          .maybeSingle();
        if (!existing || (existing as { deleted_at: string | null }).deleted_at) {
          sprintId = null;
        }
      }

      const mergedSprintFragen = [
        ...result.sprintFragen,
        ...ownSprintFragen,
      ]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const mergedRisiken = [...result.risiken, ...ownRisiken]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (sprintId) {
        // Team-first flow: sprint already exists → update it.
        const { error: upErr } = await supabase
          .from("sprints")
          .update({
            titel: result.titel,
            problemstellung: result.challenge_statement,
            decider: decider.trim(),
            sprint_leader: decider.trim(),
            challenge_statement: result.challenge_statement,
            zielgruppe: result.zielgruppe,
            erfolgsmessung: result.erfolgsmessung,
            sprint_fragen: mergedSprintFragen,
            risiken: mergedRisiken,
          })
          .eq("id", sprintId);
        if (upErr) throw upErr;
      } else {
        const sprint = await createSprint.mutateAsync({
          titel: result.titel,
          problemstellung: result.challenge_statement,
          modus: "team",
          decider: decider.trim(),
          sprint_leader: decider.trim(),
          challenge_statement: result.challenge_statement,
          zielgruppe: result.zielgruppe,
          erfolgsmessung: result.erfolgsmessung,
          sprint_fragen: mergedSprintFragen,
          risiken: mergedRisiken,
        });
        sprintId = sprint.id;
        await updateSession.mutateAsync({
          status: "done",
          resulting_sprint_id: sprint.id,
        });
      }

      if (session.status !== "done") {
        await updateSession.mutateAsync({ status: "done" });
      }

      toast({ title: "Framing abgeschlossen", description: "Weiter zum Sprint-Kickoff." });
      navigate(`/sprint/${sprintId}/kickoff`);
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

  async function handleReopen() {
    setBusy(true);
    try {
      await updateSession.mutateAsync({ status: "active" });
      // Reset local UI state so the checklist becomes editable again.
      setSignedOff(false);
      setRecruitDone(false);
      toast({
        title: "Workshop wieder geöffnet",
        description: "Definition of Done ist wieder editierbar.",
      });
    } catch (e) {
      toast({
        title: "Konnte nicht wieder geöffnet werden",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {isLocked ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Workshop abgeschlossen. Die Definition of Done ist gesperrt und kann
                nicht mehr verändert werden.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReopen}
              disabled={busy}
            >
              Workshop wieder öffnen
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-none shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
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
              disabled={generate.isPending || isLocked}
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
              {!isLocked ? (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generate.isPending}
                  >
                    {generate.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Challenge Statement neu generieren
                  </Button>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Arbeitstitel für den Sprint</Label>
                <Input
                  value={result.titel}
                  onChange={(e) => setResult({ ...result, titel: e.target.value })}
                  disabled={isLocked}
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
                  disabled={isLocked}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Primäre Zielgruppe</Label>
                  <Textarea
                    rows={2}
                    value={result.zielgruppe}
                    onChange={(e) =>
                      setResult({ ...result, zielgruppe: e.target.value })
                    }
                    disabled={isLocked}
                    placeholder="Wird bei Generierung befüllt …"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Erfolgsmessung</Label>
                  <Textarea
                    rows={2}
                    value={result.erfolgsmessung}
                    onChange={(e) =>
                      setResult({ ...result, erfolgsmessung: e.target.value })
                    }
                    disabled={isLocked}
                    placeholder="Wird bei Generierung befüllt …"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs">Sprint-Fragen</Label>

                {/* KI-Vorschläge (blau) */}
                {result.sprintFragen.length ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                      <Sparkles className="w-3.5 h-3.5" /> KI-Vorschläge
                    </div>
                    <ul className="space-y-2">
                      {result.sprintFragen.map((s, i) => (
                        <li
                          key={`ki-${i}`}
                          className="flex items-start gap-2 rounded-md border border-accent/60 bg-accent-soft px-2.5 py-1.5"
                        >
                          <Input
                            value={s}
                            className="bg-background/60"
                            onChange={(e) => {
                              const next = [...result.sprintFragen];
                              next[i] = e.target.value;
                              setResult({ ...result, sprintFragen: next });
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setResult({
                                  ...result,
                                  sprintFragen: result.sprintFragen.filter(
                                    (_, j) => j !== i,
                                  ),
                                })
                              }
                            >
                              ✕
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Noch keine KI-Sprint-Fragen — bitte generieren.
                  </p>
                )}

                {/* Eigene Sprint-Fragen */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-foreground/80">
                    Eigene Sprint-Fragen
                  </div>
                  {ownSprintFragen.length ? (
                    <ul className="space-y-2">
                      {ownSprintFragen.map((s, i) => (
                        <li key={`own-${i}`} className="flex items-start gap-2">
                          <Input
                            value={s}
                            placeholder="Eigene Sprint-Frage …"
                            onChange={(e) => {
                              const next = [...ownSprintFragen];
                              next[i] = e.target.value;
                              setOwnSprintFragen(next);
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOwnSprintFragen(
                                  ownSprintFragen.filter((_, j) => j !== i),
                                )
                              }
                            >
                              ✕
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {!isLocked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOwnSprintFragen([...ownSprintFragen, ""])
                      }
                    >
                      + Eigene Frage hinzufügen
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs">Identifizierte Risiken</Label>

                {/* KI-Vorschläge (blau) */}
                {result.risiken.length ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                      <Sparkles className="w-3.5 h-3.5" /> KI-Vorschläge
                    </div>
                    <ul className="space-y-2">
                      {result.risiken.map((s, i) => (
                        <li
                          key={`ki-${i}`}
                          className="flex items-start gap-2 rounded-md border border-accent/60 bg-accent-soft px-2.5 py-1.5"
                        >
                          <Input
                            value={s}
                            className="bg-background/60"
                            onChange={(e) => {
                              const next = [...result.risiken];
                              next[i] = e.target.value;
                              setResult({ ...result, risiken: next });
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setResult({
                                  ...result,
                                  risiken: result.risiken.filter((_, j) => j !== i),
                                })
                              }
                            >
                              ✕
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Noch keine KI-Risiken erfasst.
                  </p>
                )}

                {/* Eigene Risiken */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-foreground/80">
                    Eigene Risiken
                  </div>
                  {ownRisiken.length ? (
                    <ul className="space-y-2">
                      {ownRisiken.map((s, i) => (
                        <li key={`own-${i}`} className="flex items-start gap-2">
                          <Input
                            value={s}
                            placeholder="Eigenes Risiko …"
                            onChange={(e) => {
                              const next = [...ownRisiken];
                              next[i] = e.target.value;
                              setOwnRisiken(next);
                            }}
                            disabled={isLocked}
                          />
                          {!isLocked ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOwnRisiken(ownRisiken.filter((_, j) => j !== i))
                              }
                            >
                              ✕
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {!isLocked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOwnRisiken([...ownRisiken, ""])}
                    >
                      + Eigenes Risiko hinzufügen
                    </Button>
                  ) : null}
                </div>
              </div>
              {!isLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generate.isPending}
                >
                  {generate.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Neu generieren
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Definition of Done</h3>
            {isLocked ? <Lock className="w-4 h-4 text-primary" /> : null}
          </div>
          <fieldset disabled={isLocked} className="contents">
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
                        disabled={isLocked}
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
              <Item done={scopeOk} label="Scope klar (In/Out je ≥1 Punkt – eigene oder KI)" />
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
                    disabled={isLocked}
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
                        disabled={isLocked}
                      />
                      Angestoßen
                    </label>
                    <Input
                      value={recruitNote}
                      onChange={(e) => setRecruitNote(e.target.value)}
                      placeholder="Kurzer Vermerk (optional)"
                      className="max-w-sm"
                      disabled={isLocked}
                    />
                  </div>
                }
              />
            </ul>
          </fieldset>

          {!isLocked ? (
            <div className="flex justify-end pt-4">
              <Button
                disabled={!allDone || busy}
                onClick={handleFinish}
                className="bg-gradient-primary hover:opacity-90"
              >
                {busy ? "Legt Sprint an …" : "Workshop abschließen & Sprint anlegen"}
              </Button>
            </div>
          ) : session.resulting_sprint_id ? (
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/sprint/${session.resulting_sprint_id}`)}
              >
                Zum Sprint
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2 pt-4">
              <p className="text-xs text-muted-foreground">
                Kein verknüpfter Sprint vorhanden. Lege jetzt einen neuen Sprint aus diesem Framing an.
              </p>
              <Button
                disabled={busy || !result}
                onClick={handleFinish}
                className="bg-gradient-primary hover:opacity-90"
              >
                {busy ? "Legt Sprint an …" : "Sprint aus Framing erzeugen"}
              </Button>
            </div>
          )}
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
