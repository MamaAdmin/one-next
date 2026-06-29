import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAY_VALID = new Set([1, 2, 3, 4, 5]);

const MAP_LANES: { id: string; label: string }[] = [
  { id: "customers", label: "Kunden" },
  { id: "other_actors", label: "Weitere Akteure" },
  { id: "discovery", label: "Entdeckung" },
  { id: "core", label: "Kern" },
  { id: "outcome", label: "Ergebnis" },
  { id: "target_risk", label: "Zielrisiko" },
];

interface StepDef {
  key: string;
  title: string;
  frage: string;
  dayLabel?: string;
}

function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(opts: {
  sprintTitle: string;
  problem: string;
  day: number;
  dayLabel: string;
  generatedAt: string;
  summary: string;
  keyDecisions: string[];
  stepDefs: StepDef[];
  steps: Record<string, any>;
  mapAssignments: Record<string, string>;
}): string {
  const {
    sprintTitle,
    problem,
    day,
    dayLabel,
    generatedAt,
    summary,
    keyDecisions,
    stepDefs,
    steps,
    mapAssignments,
  } = opts;

  const dateStr = new Date(generatedAt).toLocaleString("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const stepsHtml = stepDefs
    .map((def) => {
      const row = steps[def.key];
      const d = row?.data ?? {};
      const auswahl: string[] = Array.isArray(d.auswahl) ? d.auswahl : [];
      const antworten: string[] = Array.isArray(d.antworten)
        ? d.antworten.filter(Boolean)
        : [];
      const eigene: string[] = Array.isArray(d.eigene) ? d.eigene : [];
      const notes: string = d.notes ?? "";
      const done = !!row?.completed_at;

      const renderList = (label: string, items: string[]) =>
        items.length
          ? `<div class="kv"><span class="kv-label">${label}</span><ul class="kv-list">${items
              .map((i) => `<li>${escapeHtml(i)}</li>`)
              .join("")}</ul></div>`
          : "";

      return `
        <article class="step">
          <header class="step-head">
            <h3>${escapeHtml(def.title)}</h3>
            <span class="badge ${done ? "badge-done" : "badge-open"}">${
              done ? "✓ Abgeschlossen" : "Offen"
            }</span>
          </header>
          <p class="frage">${escapeHtml(def.frage)}</p>
          ${renderList("Auswahl", auswahl)}
          ${renderList("Antworten", antworten)}
          ${renderList("Eigene Einträge", eigene)}
          ${
            notes
              ? `<div class="kv"><span class="kv-label">Notizen</span><p class="notes">${escapeHtml(
                  notes,
                )}</p></div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  const mapHtml =
    day === 1 && Object.keys(mapAssignments).length > 0
      ? `
        <section class="section page-break">
          <h2>Customer Journey Map</h2>
          <div class="lanes">
            ${MAP_LANES.map((lane) => {
              const items = Object.entries(mapAssignments)
                .filter(([, l]) => l === lane.id)
                .map(([item]) => item);
              return `
                <div class="lane">
                  <h4>${escapeHtml(lane.label)}</h4>
                  ${
                    items.length
                      ? `<ul>${items
                          .map((i) => `<li>${escapeHtml(i)}</li>`)
                          .join("")}</ul>`
                      : `<p class="muted">—</p>`
                  }
                </div>
              `;
            }).join("")}
          </div>
        </section>
      `
      : "";

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>One Pager · ${escapeHtml(sprintTitle)} · ${escapeHtml(dayLabel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --primary: #2563eb;
    --primary-soft: #eff6ff;
    --ink: #0f172a;
    --muted: #64748b;
    --line: #e2e8f0;
    --bg-soft: #f8fafc;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    color: var(--ink);
    font-size: 11pt;
    line-height: 1.5;
    background: #fff;
  }
  .page { padding: 0; }

  /* Cover header on first page */
  .cover {
    border-bottom: 3px solid var(--primary);
    padding-bottom: 16px;
    margin-bottom: 22px;
  }
  .cover-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .brand {
    font-weight: 800;
    font-size: 14pt;
    color: var(--primary);
    letter-spacing: -0.01em;
  }
  .brand small { color: var(--muted); font-weight: 500; }
  .day-badge {
    background: var(--primary);
    color: #fff;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 10pt;
  }
  h1 {
    font-size: 22pt;
    font-weight: 800;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .subtitle { color: var(--muted); font-size: 10pt; margin: 0; }
  .problem {
    margin-top: 10px;
    padding: 10px 14px;
    background: var(--bg-soft);
    border-left: 3px solid var(--primary);
    border-radius: 4px;
    font-size: 10pt;
    color: var(--ink);
  }
  .problem-label {
    display: block;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 2px;
  }

  .section { margin: 18px 0; }
  .section h2 {
    font-size: 13pt;
    color: var(--primary);
    margin: 0 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--line);
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .summary-text {
    font-size: 11pt;
    white-space: pre-wrap;
    margin: 0 0 10px;
  }
  .decisions {
    margin: 0;
    padding-left: 18px;
  }
  .decisions li { margin: 3px 0; }

  .page-break { page-break-before: always; }

  .step {
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;
    page-break-inside: avoid;
    background: #fff;
  }
  .step-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .step h3 {
    margin: 0;
    font-size: 11pt;
    font-weight: 700;
    color: var(--ink);
  }
  .badge {
    font-size: 8pt;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .badge-done { background: var(--primary-soft); color: var(--primary); }
  .badge-open { background: #f1f5f9; color: var(--muted); }
  .frage {
    font-size: 9.5pt;
    color: var(--muted);
    font-style: italic;
    margin: 0 0 6px;
  }
  .kv { margin-top: 6px; }
  .kv-label {
    display: block;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 2px;
  }
  .kv-list {
    margin: 0;
    padding-left: 16px;
    font-size: 10pt;
  }
  .kv-list li { margin: 1px 0; }
  .notes {
    margin: 0;
    font-size: 10pt;
    background: var(--bg-soft);
    padding: 6px 10px;
    border-radius: 4px;
    white-space: pre-wrap;
  }

  .lanes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .lane {
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 8px 10px;
    background: var(--bg-soft);
    page-break-inside: avoid;
  }
  .lane h4 {
    margin: 0 0 4px;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--primary);
    font-weight: 700;
  }
  .lane ul { margin: 0; padding-left: 16px; font-size: 9.5pt; }
  .muted { color: var(--muted); font-style: italic; font-size: 9pt; margin: 0; }

  @page {
    size: A4 portrait;
    margin: 18mm 16mm 22mm 16mm;
  }
</style>
</head>
<body>
<div class="page">
  <header class="cover">
    <div class="cover-top">
      <div class="brand">one-next<small> · Design Sprint</small></div>
      <div class="day-badge">${escapeHtml(dayLabel)}</div>
    </div>
    <h1>${escapeHtml(sprintTitle)}</h1>
    <p class="subtitle">One Pager · Generiert ${escapeHtml(dateStr)}</p>
    ${
      problem
        ? `<div class="problem"><span class="problem-label">Problemstellung</span>${escapeHtml(
            problem,
          )}</div>`
        : ""
    }
  </header>

  <section class="section">
    <h2>Executive Summary · KI (Gemini)</h2>
    <p class="summary-text">${escapeHtml(summary) || "<em>Keine Zusammenfassung vorhanden.</em>"}</p>
    ${
      keyDecisions.length
        ? `<h3 style="font-size:11pt;margin:10px 0 4px;color:var(--ink);">Key Decisions</h3>
           <ul class="decisions">${keyDecisions
             .map((d) => `<li>${escapeHtml(d)}</li>`)
             .join("")}</ul>`
        : ""
    }
  </section>

  <section class="section page-break">
    <h2>Ergebnisse je Schritt</h2>
    ${stepsHtml || '<p class="muted">Keine Schritte für diesen Tag.</p>'}
  </section>

  ${mapHtml}
</div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sprintId: string = body?.sprintId;
    const day: number = Number(body?.day);
    const stepDefs: StepDef[] = Array.isArray(body?.stepDefs) ? body.stepDefs : [];
    const dayLabelInput: string = body?.dayLabel ?? `Tag ${day}`;

    if (!sprintId || !DAY_VALID.has(day)) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: claimErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (claimErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load sprint (RLS enforces membership)
    const { data: sprint, error: sErr } = await supabase
      .from("sprints")
      .select("*")
      .eq("id", sprintId)
      .maybeSingle();
    if (sErr || !sprint) {
      return new Response(JSON.stringify({ error: "Sprint not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: stepRows, error: stErr } = await supabase
      .from("sprint_steps")
      .select("*")
      .eq("sprint_id", sprintId);
    if (stErr) throw stErr;

    const stepsByKey: Record<string, any> = {};
    for (const r of stepRows ?? []) stepsByKey[r.step_key] = r;

    const summaryRow = stepsByKey[`summary.${day}`];
    let summaryData = summaryRow?.data as
      | { summary?: string; keyDecisions?: string[]; generatedAt?: string }
      | undefined;

    // Lazy-generate summary if missing
    if (!summaryData?.summary) {
      try {
        const genResp = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/sprint-day-summary`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
              apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            },
            body: JSON.stringify({ sprintId, day }),
          },
        );
        if (genResp.ok) {
          summaryData = await genResp.json();
        }
      } catch (_e) {
        // proceed without summary
      }
    }

    // Map data lives on step 1.8
    const mapAssignments: Record<string, string> =
      (stepsByKey["1.8"]?.data?.mapZuordnung as Record<string, string>) ?? {};

    const html = buildHtml({
      sprintTitle: sprint.titel ?? "Sprint",
      problem: sprint.problemstellung ?? "",
      day,
      dayLabel: dayLabelInput,
      generatedAt: summaryData?.generatedAt ?? new Date().toISOString(),
      summary: summaryData?.summary ?? "",
      keyDecisions: Array.isArray(summaryData?.keyDecisions)
        ? summaryData!.keyDecisions!
        : [],
      stepDefs,
      steps: stepsByKey,
      mapAssignments,
    });

    const PDFSHIFT_API_KEY = Deno.env.get("PDFSHIFT_API_KEY");
    if (!PDFSHIFT_API_KEY) {
      return new Response(
        JSON.stringify({ error: "PDFSHIFT_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const pdfResp = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`,
      },
      body: JSON.stringify({
        source: html,
        landscape: false,
        format: "A4",
        margin: { top: "18mm", right: "16mm", bottom: "22mm", left: "16mm" },
        footer: {
          source:
            '<div style="font-family:Inter,sans-serif;font-size:8pt;color:#64748b;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>one-next.com · Design Sprint</span><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
          spacing: "6mm",
        },
        sandbox: false,
      }),
    });

    if (!pdfResp.ok) {
      const errText = await pdfResp.text();
      return new Response(
        JSON.stringify({ error: `PDFShift ${pdfResp.status}: ${errText}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const pdfBytes = await pdfResp.arrayBuffer();
    const safeTitle = (sprint.titel ?? "Sprint")
      .replace(/[^a-z0-9\-_]+/gi, "_")
      .slice(0, 40);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="OneNext_Sprint_${safeTitle}_Tag${day}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
