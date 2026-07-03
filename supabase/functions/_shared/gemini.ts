// Shared helper: call Google Gemini API directly.
// Costs are billed to the user's Google Cloud / AI Studio project (GEMINI_API_KEY),
// not through the Lovable AI Gateway.

export type GeminiMessage = { role: "system" | "user" | "assistant"; content: string };

export interface CallGeminiOptions {
  model?: string; // native Gemini id, e.g. "gemini-2.5-flash". Accepts also "google/gemini-2.5-flash".
  messages: GeminiMessage[];
  json?: boolean;
  responseSchema?: unknown;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface CallGeminiResult {
  content: string;
  finishReason?: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function normalizeModel(model: string | undefined): string {
  const m = (model ?? "gemini-2.5-flash").trim();
  // Strip provider prefix if present (e.g. "google/gemini-2.5-flash").
  const withoutPrefix = m.includes("/") ? m.split("/").slice(-1)[0] : m;
  // Map known preview/proxy ids to a supported direct Gemini model.
  if (withoutPrefix === "gemini-3-flash-preview") return "gemini-2.5-flash";
  return withoutPrefix;
}

export async function callGemini(opts: CallGeminiOptions): Promise<CallGeminiResult> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const model = normalizeModel(opts.model);

  // Roles: OpenAI "system" -> Gemini systemInstruction; "assistant" -> "model"; "user" -> "user".
  const systemParts = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .filter(Boolean);
  const contents = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.7,
    maxOutputTokens: opts.maxOutputTokens ?? 8192,
  };
  if (opts.json) generationConfig.responseMimeType = "application/json";
  if (opts.responseSchema) generationConfig.responseSchema = opts.responseSchema;

  const body: Record<string, unknown> = {
    contents,
    generationConfig,
  };
  if (systemParts.length) {
    body.systemInstruction = { parts: [{ text: systemParts.join("\n\n") }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(`Gemini API ${resp.status}: ${text}`) as Error & {
      status?: number;
    };
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  const candidate = data?.candidates?.[0];
  const finishReason: string | undefined = candidate?.finishReason;
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((p: { text?: string }) => (typeof p?.text === "string" ? p.text : ""))
    .join("");

  if (finishReason === "MAX_TOKENS") {
    console.warn("[callGemini] finishReason=MAX_TOKENS – Antwort ggf. abgeschnitten");
  }

  const usageMeta = data?.usageMetadata ?? {};
  return {
    content: text ?? "",
    finishReason,
    usage: {
      prompt_tokens: usageMeta.promptTokenCount ?? 0,
      completion_tokens: usageMeta.candidatesTokenCount ?? 0,
      total_tokens:
        usageMeta.totalTokenCount ??
        (usageMeta.promptTokenCount ?? 0) + (usageMeta.candidatesTokenCount ?? 0),
    },
  };
}

/** Map an HTTP status returned from Gemini to the status our edge function should return. */
export function geminiErrorStatus(err: unknown): number {
  const status = (err as { status?: number })?.status;
  if (status === 429) return 429;
  if (status === 401 || status === 403) return 502;
  return 500;
}
