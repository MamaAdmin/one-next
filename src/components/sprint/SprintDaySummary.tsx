import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SprintRow, SprintStepData, SprintStepRow } from "@/features/sprint/types";
import { MAP_LANES } from "@/features/sprint/types";
import { SPRINT_STEPS, type SprintDay } from "@/features/sprint/steps";

interface DaySummary {
  summary: string;
  keyDecisions: string[];
  generatedAt: string;
}

interface Props {
  sprint: SprintRow;
  day: SprintDay;
  allSteps: SprintStepRow[];
}

export default function SprintDaySummary({ sprint, day, allSteps }: Props) {
  const summaryRow = useMemo(
    () => allSteps.find((s) => s.step_key === `summary.${day}`),
    [allSteps, day],
  );
  const [summary, setSummary] = useState<DaySummary | null>(
    (summaryRow?.data as DaySummary | undefined) ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSummary((summaryRow?.data as DaySummary | undefined) ?? null);
  }, [summaryRow?.id]);

  // Auto-generate first time
  useEffect(() => {
    if (!summary) {
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayStepDefs = SPRINT_STEPS.filter((s) => s.day === day);
  const dayLabel = dayStepDefs[0]?.dayLabel ?? `Tag ${day}`;

  // Map data from step 1.8
  const mapStep = allSteps.find((s) => s.step_key === "1.8");
  const mapData = (mapStep?.data as SprintStepData | undefined) ?? {};
  const mapAssignments = mapData.mapZuordnung ?? {};
  const mapItemsByLane = useMemo(() => {
    const byLane: Record<string, string[]> = {};
    for (const lane of MAP_LANES) byLane[lane.id] = [];
    for (const [item, lane] of Object.entries(mapAssignments)) {
      if (byLane[lane]) byLane[lane].push(item);
    }
    return byLane;
  }, [mapAssignments]);

  async function generate() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sprint-day-summary", {
        body: { sprintId: sprint.id, day },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setSummary(data as DaySummary);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      toast({ title: "Zusammenfassung fehlgeschlagen", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!pageRef.current) return;
    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // multi-page
        let remaining = imgHeight;
        let position = 0;
        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          remaining -= pageHeight;
          if (remaining > 0) {
            position -= pageHeight;
            pdf.addPage();
          }
        }
      }
      const safeTitle = sprint.titel.replace(/[^a-z0-9\-_]+/gi, "_").slice(0, 40);
      pdf.save(`OneNext_Sprint_${safeTitle}_Tag${day}.pdf`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "PDF-Export fehlgeschlagen";
      toast({ title: "PDF-Export fehlgeschlagen", description: msg, variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <Card className="border-2 border-primary/30 shadow-xl">
      <CardContent className="p-6 lg:p-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">One Pager · {dayLabel}</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Neu generieren
            </Button>
            <Button size="sm" onClick={downloadPdf} disabled={pdfLoading || !summary}>
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF herunterladen
            </Button>
          </div>
        </div>

        {/* Printable page */}
        <div
          ref={pageRef}
          className="bg-white text-slate-900 rounded-lg p-8 space-y-6"
          style={{ minHeight: "auto" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Design Sprint One Pager
              </p>
              <h1 className="text-2xl font-bold mt-1">{sprint.titel}</h1>
              <p className="text-sm text-slate-600 mt-1">{dayLabel}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Datum: {new Date().toLocaleDateString("de-DE")}</p>
              {summary?.generatedAt && (
                <p>
                  KI-Zusammenfassung:{" "}
                  {new Date(summary.generatedAt).toLocaleString("de-DE")}
                </p>
              )}
            </div>
          </div>

          {/* KI Summary */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> KI-Zusammenfassung
            </h2>
            {loading && !summary ? (
              <p className="text-sm text-slate-500 italic">Wird generiert …</p>
            ) : summary?.summary ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
            ) : (
              <p className="text-sm text-slate-500 italic">Noch keine Zusammenfassung.</p>
            )}

            {summary?.keyDecisions && summary.keyDecisions.length > 0 ? (
              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-1">Key Decisions</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {summary.keyDecisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* Steps */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Ergebnisse je Schritt</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {dayStepDefs.map((def) => {
                const row = allSteps.find((s) => s.step_key === def.key);
                const d = (row?.data as SprintStepData | undefined) ?? {};
                const items =
                  d.auswahl && d.auswahl.length > 0
                    ? d.auswahl
                    : d.antworten && d.antworten.length > 0
                    ? d.antworten
                    : d.eigene ?? [];
                return (
                  <div
                    key={def.key}
                    className="rounded border border-slate-200 p-3 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700">{def.title}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {row?.completed_at ? "✓" : "·"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">{def.frage}</p>
                    {items.length > 0 ? (
                      <ul className="text-xs space-y-0.5 list-disc list-inside">
                        {items.slice(0, 6).map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-slate-400">Keine Einträge</p>
                    )}
                    {d.notes ? (
                      <p className="text-[11px] mt-2 text-slate-600 italic">{d.notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Map for day 1 */}
          {day === 1 && Object.keys(mapAssignments).length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Customer Journey Map</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {MAP_LANES.map((lane) => (
                  <div
                    key={lane.id}
                    className="rounded border border-slate-200 p-2 bg-white"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {lane.label}
                    </p>
                    {mapItemsByLane[lane.id].length > 0 ? (
                      <ul className="text-xs space-y-0.5">
                        {mapItemsByLane[lane.id].map((it, i) => (
                          <li
                            key={i}
                            className="px-2 py-1 rounded bg-slate-100 border border-slate-200"
                          >
                            {it}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] italic text-slate-400">—</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Footer */}
          <div className="border-t pt-3 text-[10px] text-slate-400 flex justify-between">
            <span>one-next.com · Design Sprint</span>
            <span>{sprint.modus === "solo" ? "Solo" : "Team"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
