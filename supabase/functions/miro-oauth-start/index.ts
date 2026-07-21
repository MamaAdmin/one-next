// Returns a Miro OAuth authorize URL for the current user.
// Uses a stable Edge-Function callback so only one redirect URI has to be
// registered in the Miro app, regardless of preview/production origin.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MIRO_AUTH_URL = "https://miro.com/oauth/authorize";

function envRequired(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    const host = url.hostname;
    return (
      host === "one-next.com" ||
      host === "www.one-next.com" ||
      host === "one-next.lovable.app" ||
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com")
    );
  } catch {
    return false;
  }
}

function getUserId(req: Request): Promise<string> {
  return (async () => {
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) throw new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401 });
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const sb = createClient(envRequired("SUPABASE_URL"), envRequired("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.auth.getUser();
    if (error || !data.user) {
      throw new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401 });
    }
    return data.user.id;
  })();
}

async function signState(userId: string, origin: string, secret: string): Promise<string> {
  const nonce = crypto.randomUUID();
  const payload = `${userId}.${nonce}.${Date.now()}.${btoa(origin)}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return btoa(payload) + "." + sigB64;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    const body = await req.json().catch(() => ({}));
    const origin = typeof body?.origin === "string" ? body.origin : req.headers.get("origin");
    if (!origin || !isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "invalid_origin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const clientId = envRequired("MIRO_CLIENT_ID");
    const secret = envRequired("SUPABASE_SERVICE_ROLE_KEY");
    const state = await signState(userId, origin, secret);
    const redirectUri = `${envRequired("SUPABASE_URL")}/functions/v1/miro-oauth-callback`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    });
    return new Response(
      JSON.stringify({ authorize_url: `${MIRO_AUTH_URL}?${params.toString()}`, redirect_uri: redirectUri }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    if (e instanceof Response) {
      const body = await e.text();
      return new Response(body, { status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.error("miro-oauth-start error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
