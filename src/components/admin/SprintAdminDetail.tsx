import { useAdminSprintDetail } from "@/hooks/useAdminSprints";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStepDef, SPRINT_STEPS } from "@/features/sprint/steps";

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("de-DE");
  } catch {
    return "—";
  }
}

interface Props {
  sprintId: string | null;
  onOpenChange: (open: boolean) => void;
}

export default function SprintAdminDetail({ sprintId, onOpenChange }: Props) {
  const { data, isLoading } = useAdminSprintDetail(sprintId ?? undefined);

  return (
    <Sheet open={!!sprintId} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        {isLoading || !data ? (
          <div className="py-8 text-muted-foreground">Wird geladen…</div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{data.sprint.titel}</SheetTitle>
              <SheetDescription>
                Erstellt von{" "}
                <span className="font-medium">
                  {data.sprint.owner?.full_name ||
                    data.sprint.owner?.email ||
                    data.sprint.owner_id}
                </span>{" "}
                · {fmt(data.sprint.created_at)}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {data.sprint.modus === "solo" ? "Solo" : "Team"}
                </Badge>
                <Badge
                  variant={
                    data.sprint.status === "active"
                      ? "default"
                      : data.sprint.status === "done"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {data.sprint.status === "active"
                    ? "Aktiv"
                    : data.sprint.status === "done"
                    ? "Abgeschlossen"
                    : "Archiviert"}
                </Badge>
                <Badge variant="outline">
                  Aktueller Schritt:{" "}
                  {getStepDef(data.sprint.current_step)?.title ??
                    data.sprint.current_step}
                </Badge>
              </div>

              {data.sprint.problemstellung ? (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Problemstellung</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {data.sprint.problemstellung}
                  </p>
                </div>
              ) : null}

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Mitglieder ({data.members.length})
                </h3>
                {data.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Mitglieder.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {data.members.map((m) => (
                      <li key={m.id} className="flex justify-between gap-4">
                        <span>
                          {m.profile?.full_name ||
                            m.profile?.email ||
                            m.email ||
                            m.user_id ||
                            "—"}
                        </span>
                        <span className="text-muted-foreground">{m.rolle}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Schritt-Fortschritt (
                  {data.steps.filter((s) => s.completed_at).length}/
                  {SPRINT_STEPS.length} abgeschlossen)
                </h3>
                <ul className="space-y-1 text-sm">
                  {SPRINT_STEPS.map((def) => {
                    const s = data.steps.find((x) => x.step_key === def.key);
                    const done = !!s?.completed_at;
                    return (
                      <li
                        key={def.key}
                        className="flex justify-between gap-4 border-b border-border/40 py-1"
                      >
                        <span className={done ? "" : "text-muted-foreground"}>
                          {done ? "✓ " : "○ "}
                          {def.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {done ? fmt(s?.completed_at) : "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
