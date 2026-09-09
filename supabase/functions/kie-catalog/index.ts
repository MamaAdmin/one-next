import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(supabaseUrl, serviceKey);

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return json({ error: "Nicht angemeldet" }, 401);
  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "Keine Berechtigung" }, 403);
  return { userId: data.user.id };
}

async function callAi(messages: Array<{ role: string; content: string }>): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("KI-Zugang ist nicht eingerichtet.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: "google/gemini-3.8-flash", messages }),
  });
  if (res.status === 429) throw new Error("KI-Limit erreicht. Bitte kurz warten.");
  if (res.status === 402) throw new Error("KI-Guthaben aufgebraucht. Bitte Credits aufladen.");
  if (!res.ok) throw new Error(`KI nicht erreichbar (${res.status})`);
  const body = await res.json();
  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Die KI hat keine Antwort geliefert.");
  return String(text);
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.search(/[[{]/);
  if (start < 0) throw new Error("Die KI-Antwort war nicht lesbar.");
  return JSON.parse(cleaned.slice(start)) as T;
}

async function loadCatalog() {
  const { data, error } = await admin
    .from("kie_models")
    .select("name, display_name, provider, category, unit, credits_per_unit, active, description_de, strengths, use_cases, quality_tier, speed_tier, docs_url")
    .order("category");
  if (error) throw new Error(error.message);
  return data ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action ?? "");

    if (action === "advise") {
      const prompt = String(payload.prompt ?? "").trim();
      if (!prompt) return json({ error: "Bitte beschreibe dein Vorhaben." }, 400);
      const catalog = await loadCatalog();
      const answer = await callAi([
        {
          role: "system",
          content:
            "Du berätst bei der Auswahl von Kie.ai-Modellen. Antworte ausschliesslich auf Deutsch und ausschliesslich mit JSON, ohne Markdown. " +
            "Verwende ausschliesslich Modellnamen aus dem übergebenen Katalog. Schreibe KI statt AI. Format: " +
            '{"zusammenfassung":"1-2 Sätze","empfehlungen":[{"rolle":"Bild|Sprache|Video|Text|Musik","modell":"exakter Katalogname","begruendung":"ein Satz","credits":Zahl}],"gesamt_credits":Zahl,"guenstigere_alternative":{"modell":"exakter Katalogname","begruendung":"ein Satz","credits":Zahl}}',
        },
        {
          role: "user",
          content: `Katalog:\n${JSON.stringify(catalog)}\n\nVorhaben: ${prompt}`,
        },
      ]);
      const result = parseJson<Record<string, unknown>>(answer);
      const { data: saved } = await admin
        .from("model_recommendations")
        .insert({ user_id: auth.userId, prompt, result })
        .select("id")
        .maybeSingle();
      return json({ result, id: saved?.id ?? null });
    }

    if (action === "sync") {
      const docsRes = await fetch("https://docs.kie.ai/llms.txt");
      if (!docsRes.ok) {
        return json({ error: `Kie.ai-Dokumentation nicht erreichbar (${docsRes.status})` }, 502);
      }
      const docs = (await docsRes.text()).slice(0, 30000);
      const catalog = await loadCatalog();
      const answer = await callAi([
        {
          role: "system",
          content:
            "Du vergleichst eine Modell-Dokumentation mit einem bestehenden Katalog. Antworte ausschliesslich mit JSON, ohne Markdown, auf Deutsch. Format: " +
            '{"vorschlaege":[{"art":"neu|geaendert|entfernt","name":"Modellname","display_name":"Anzeigename","provider":"Anbieter","category":"text|image|voice|video|music","unit":"job|image|1k_chars|second","description_de":"ein Satz","use_cases":["..."],"docs_url":"URL","hinweis":"kurze Begründung"}]}' +
            " Nenne höchstens 20 Vorschläge und erfinde keine Preise.",
        },
        {
          role: "user",
          content: `Bestehender Katalog:\n${JSON.stringify(catalog.map((m) => m.name))}\n\nDokumentation:\n${docs}`,
        },
      ]);
      const parsed = parseJson<{ vorschlaege?: unknown[] }>(answer);
      const suggestions = Array.isArray(parsed.vorschlaege) ? parsed.vorschlaege : [];
      const { data: run } = await admin
        .from("kie_catalog_sync_runs")
        .insert({ user_id: auth.userId, status: "done", suggestions })
        .select("id, created_at")
        .maybeSingle();
      return json({ suggestions, runId: run?.id ?? null, createdAt: run?.created_at ?? null });
    }

    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500);
  }
});
