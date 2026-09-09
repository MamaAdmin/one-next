import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCredits } from "@/features/whiteboard/pricing";
import type { GenerationJob, GenerationUsage } from "@/features/whiteboard/usage";

const statusLabel: Record<string, string> = {
  running: "läuft",
  done: "fertig",
  partial: "teilweise",
  failed: "fehlgeschlagen",
};

export const KieUsageStats = () => {
  const [usage, setUsage] = useState<GenerationUsage[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: usageRows }, { data: jobRows }] = await Promise.all([
        (supabase as any)
          .from("generation_usage")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        (supabase as any)
          .from("generation_jobs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setUsage((usageRows ?? []) as GenerationUsage[]);
      setJobs((jobRows ?? []) as GenerationJob[]);
    };
    void load();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const sum = (from: number) =>
      usage
        .filter((u) => new Date(u.created_at).getTime() >= from)
        .reduce((acc, u) => acc + Number(u.credits_used ?? 0), 0);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const finished = usage.filter((u) => u.credits_used !== null);
    const total = finished.reduce((acc, u) => acc + Number(u.credits_used ?? 0), 0);
    const videoIds = new Set(finished.map((u) => u.video_id).filter(Boolean));

    const byModel = new Map<string, number>();
    usage.forEach((u) => {
      const model = u.image_model ?? u.voice_model ?? u.video_model ?? u.script_model ?? "unbekannt";
      byModel.set(model, (byModel.get(model) ?? 0) + Number(u.credits_used ?? 0));
    });
    const byUser = new Map<string, number>();
    usage.forEach((u) => {
      byUser.set(u.user_id, (byUser.get(u.user_id) ?? 0) + Number(u.credits_used ?? 0));
    });

    return {
      today: sum(startOfDay.getTime()),
      week: sum(now - 7 * 24 * 3600 * 1000),
      month: sum(startOfMonth.getTime()),
      perVideo: videoIds.size ? total / videoIds.size : 0,
      byModel: [...byModel.entries()].sort((a, b) => b[1] - a[1]),
      byUser: [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [usage]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Credits heute", value: stats.today },
          { label: "Letzte 7 Tage", value: stats.week },
          { label: "Aktueller Monat", value: stats.month },
          { label: "Ø pro Lernvideo", value: stats.perVideo },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCredits(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verbrauch nach Modell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stats.byModel.length === 0 && (
              <p className="text-muted-foreground">Noch kein Verbrauch erfasst.</p>
            )}
            {stats.byModel.map(([model, value]) => (
              <div key={model} className="flex justify-between gap-3">
                <span className="truncate text-muted-foreground">{model}</span>
                <span>{formatCredits(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verbrauch nach Benutzer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stats.byUser.length === 0 && (
              <p className="text-muted-foreground">Noch kein Verbrauch erfasst.</p>
            )}
            {stats.byUser.map(([user, value]) => (
              <div key={user} className="flex justify-between gap-3">
                <span className="truncate text-muted-foreground">{user.slice(0, 8)}…</span>
                <span>{formatCredits(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Letzte Generierungsaufträge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {jobs.length === 0 && <p className="text-muted-foreground">Noch keine Aufträge.</p>}
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
              <span className="text-muted-foreground truncate">
                {new Date(job.created_at).toLocaleString("de-CH")} · {job.kind} · {job.model}
              </span>
              <span className="flex items-center gap-2">
                {formatCredits(job.estimated_credits)} Credits
                <Badge variant={job.status === "done" ? "secondary" : "destructive"}>
                  {statusLabel[job.status] ?? job.status}
                </Badge>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
