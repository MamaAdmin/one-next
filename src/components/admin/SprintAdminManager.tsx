import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAllSprints, useAdminAllFramingSessions, useRestoreSprint, type AdminSprintRow } from "@/hooks/useAdminSprints";
import { FRAMING_STEPS } from "@/features/framing/steps";
import { toast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStepDef } from "@/features/sprint/steps";
import SprintAdminDetail from "./SprintAdminDetail";

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ownerLabel(row: AdminSprintRow) {
  return row.owner?.full_name || row.owner?.email || row.owner_id.slice(0, 8);
}

export default function SprintAdminManager() {
  const { data, isLoading } = useAdminAllSprints();
  const { data: deletedSprints = [] } = useAdminAllSprints({ deletedOnly: true });
  const { data: framingData, isLoading: framingLoading } = useAdminAllFramingSessions();
  const restoreMut = useRestoreSprint();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [modus, setModus] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const rows = data ?? [];

  const stats = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      done: rows.filter((r) => r.status === "done").length,
      archived: rows.filter((r) => r.status === "archived").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (modus !== "all" && r.modus !== modus) return false;
      if (!q) return true;
      return (
        r.titel.toLowerCase().includes(q) ||
        (r.owner?.email ?? "").toLowerCase().includes(q) ||
        (r.owner?.full_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, status, modus]);

  const framingRows = framingData ?? [];
  const framingStats = useMemo(() => ({
    total: framingRows.length,
    active: framingRows.filter((r) => r.status === "active").length,
    done: framingRows.filter((r) => r.status === "done").length,
    archived: framingRows.filter((r) => r.status === "archived").length,
  }), [framingRows]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Design Sprints</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Sprints gesamt" value={stats.total} />
          <StatCard label="Aktiv" value={stats.active} />
          <StatCard label="Abgeschlossen" value={stats.done} />
          <StatCard label="Archiviert" value={stats.archived} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Suche nach Titel oder Ersteller…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="done">Abgeschlossen</SelectItem>
            <SelectItem value="archived">Archiviert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modus} onValueChange={setModus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Modus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Modi</SelectItem>
            <SelectItem value="solo">Solo</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Ersteller</TableHead>
                <TableHead>Modus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktueller Schritt</TableHead>
                <TableHead>Mitglieder</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Abgeschlossen</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Wird geladen…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Keine Sprints gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const step = getStepDef(r.current_step);
                  return (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/sprint/${r.id}`)}
                    >
                      <TableCell className="font-medium">{r.titel}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{ownerLabel(r)}</span>
                          {r.owner?.email && r.owner.full_name ? (
                            <span className="text-xs text-muted-foreground">
                              {r.owner.email}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {r.modus === "solo" ? "Solo" : "Team"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "active"
                              ? "default"
                              : r.status === "done"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {r.status === "active"
                            ? "Aktiv"
                            : r.status === "done"
                            ? "Abgeschlossen"
                            : "Archiviert"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {step ? step.title : r.current_step}
                      </TableCell>
                      <TableCell>{r.member_count}</TableCell>
                      <TableCell className="text-sm">{fmtDate(r.created_at)}</TableCell>
                      <TableCell className="text-sm">
                        {r.status === "done" ? fmtDate(r.updated_at) : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(r.id);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Problem Framing</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Framings gesamt" value={framingStats.total} />
          <StatCard label="Aktiv" value={framingStats.active} />
          <StatCard label="Abgeschlossen" value={framingStats.done} />
          <StatCard label="Archiviert" value={framingStats.archived} />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arbeitstitel</TableHead>
                  <TableHead>Ersteller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktueller Schritt</TableHead>
                  <TableHead>Mitglieder</TableHead>
                  <TableHead>Ergebnis-Sprint</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead>Aktualisiert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {framingLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Wird geladen…
                    </TableCell>
                  </TableRow>
                ) : framingRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Keine Problem-Framing-Sessions gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  framingRows.map((r) => {
                    const step = FRAMING_STEPS.find((s) => s.index === r.current_step);
                    return (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(
                          r.resulting_sprint_id
                            ? `/sprint/${r.resulting_sprint_id}`
                            : `/sprint/framing/${r.id}`
                        )}
                      >
                        <TableCell className="font-medium">{r.titel_arbeitstitel}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{r.owner?.full_name || r.owner?.email || r.owner_id.slice(0, 8)}</span>
                            {r.owner?.email && r.owner.full_name ? (
                              <span className="text-xs text-muted-foreground">{r.owner.email}</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === "active" ? "default" : r.status === "done" ? "secondary" : "outline"
                            }
                          >
                            {r.status === "active" ? "Aktiv" : r.status === "done" ? "Abgeschlossen" : "Archiviert"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {step ? `${step.index}. ${step.title}` : r.current_step}
                        </TableCell>
                        <TableCell>{r.member_count}</TableCell>
                        <TableCell className="text-sm">
                          {r.resulting_sprint_id ? (
                            <Badge variant="outline">Sprint erstellt</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{fmtDate(r.created_at)}</TableCell>
                        <TableCell className="text-sm">{fmtDate(r.updated_at)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Gelöschte Sprints ({deletedSprints.length})</h3>
        <p className="text-sm text-muted-foreground">
          Von Nutzer:innen gelöschte Sprints. Als Admin kannst du sie wiederherstellen.
        </p>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Ersteller</TableHead>
                  <TableHead>Gelöscht am</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedSprints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Keine gelöschten Sprints.
                    </TableCell>
                  </TableRow>
                ) : (
                  deletedSprints.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.titel}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{ownerLabel(r)}</span>
                          {r.owner?.email && r.owner.full_name ? (
                            <span className="text-xs text-muted-foreground">{r.owner.email}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{fmtDate(r.deleted_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={restoreMut.isPending}
                          onClick={async () => {
                            try {
                              await restoreMut.mutateAsync(r.id);
                              toast({ title: "Sprint wiederhergestellt" });
                            } catch (e) {
                              toast({
                                title: "Wiederherstellen fehlgeschlagen",
                                description: e instanceof Error ? e.message : "Unbekannter Fehler",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1.5" />
                          Wiederherstellen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>




      <SprintAdminDetail
        sprintId={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
