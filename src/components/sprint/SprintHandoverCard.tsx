import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import type { SprintRow } from "@/features/sprint/types";

interface Props {
  sprint: SprintRow;
  onEdit: () => void;
}

const STORAGE_PREFIX = "sprint-handover-confirmed-";

/**
 * Zeigt beim ersten Öffnen eines Sprints die Übernahme aus dem Problem-Framing:
 * Titel, Problemstellung, Challenge Statement, Zielgruppe, Erfolgsmessung,
 * Sprint-Fragen und identifizierte Risiken. Nutzer:in bestätigt einmalig.
 */
export default function SprintHandoverCard({ sprint, onEdit }: Props) {
  const storageKey = `${STORAGE_PREFIX}${sprint.id}`;
  const [confirmed, setConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(!confirmed);

  useEffect(() => {
    if (confirmed) {
      try {
        localStorage.setItem(storageKey, "1");
      } catch {
        // ignore
      }
    }
  }, [confirmed, storageKey]);

  const hasFramingData =
    !!sprint.challenge_statement?.trim() ||
    !!sprint.zielgruppe?.trim() ||
    !!sprint.erfolgsmessung?.trim() ||
    (sprint.sprint_fragen?.length ?? 0) > 0 ||
    (sprint.risiken?.length ?? 0) > 0;

  if (!hasFramingData) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">Handover aus dem Problem Framing</h3>
                {confirmed ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bestätigt
                  </Badge>
                ) : (
                  <Badge className="bg-primary text-primary-foreground">
                    Bitte prüfen
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Alle Felder aus dem Framing wurden übernommen. Bitte einmal durchgehen und bestätigen.
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
            <Field label="Titel" value={sprint.titel} />
            <Field label="Problemstellung" value={sprint.problemstellung} multiline />
            <Field
              label="Challenge Statement"
              value={sprint.challenge_statement}
              multiline
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Primäre Zielgruppe" value={sprint.zielgruppe} multiline />
              <Field label="Erfolgsmessung" value={sprint.erfolgsmessung} multiline />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Decider" value={sprint.decider} />
              <Field label="Sprint Leader" value={sprint.sprint_leader} />
            </div>
            <ListField label="Sprint-Fragen" items={sprint.sprint_fragen} />
            <ListField label="Identifizierte Risiken" items={sprint.risiken ?? []} />

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Anpassen
              </Button>
              {!confirmed ? (
                <Button
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => {
                    setConfirmed(true);
                    setOpen(false);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Übernahme bestätigen
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Schließen
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  const empty = !value?.trim();
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {empty ? (
        <div className="text-sm italic text-muted-foreground/70">— nicht gesetzt —</div>
      ) : multiline ? (
        <p className="text-sm whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {items.length ? (
        <ul className="text-sm space-y-1 list-disc pl-5">
          {items.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm italic text-muted-foreground/70">— nicht gesetzt —</div>
      )}
    </div>
  );
}
