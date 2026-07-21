// Stable OAuth callback handler for Miro.
// Miro always redirects here; this function validates the signed state,
// extracts the original origin, and forwards the browser back to the caller.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

async function verifyAndDecodeState(
  state: string,
  secret: string,
): Promise<{ userId: string; origin: string } | null> {
  const [payloadB64, sigB64] = state.split(".");
  if (!payloadB64 || !sigB64) return null;
  let payload = "";
  try {
    payload = atob(payloadB64);
  } catch {
    return null;
  }
  const parts = payload.split(".");
  if (parts.length !== 4) return null;
  const [uid, _nonce, tsStr, originB64] = parts;
  const ts = Number(tsStr);
  if (!ts || Date.now() - ts > 15 * 60 * 1000) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
  if (!ok) return null;

  let origin = "";
  try {
    origin = atob(originB64);
  } catch {
    return null;
  }
  if (!isAllowedOrigin(origin)) return null;
  return { userId: uid, origin };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Miro hat die Verbindung abgelehnt: ${error}`, {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }
    if (!code || !state) {
      return new Response("Ungültige Anfrage (code oder state fehlt).", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const secret = envRequired("SUPABASE_SERVICE_ROLE_KEY");
    const decoded = await verifyAndDecodeState(state, secret);
    if (!decoded) {
      return new Response("Ungültiger oder abgelaufener state.", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const redirectUri = `${envRequired("SUPABASE_URL")}/functions/v1/miro-oauth-callback`;
    const target = new URL(`${decoded.origin}/miro/callback`);
    target.searchParams.set("code", code);
    target.searchParams.set("state", state);
    target.searchParams.set("redirect_uri", redirectUri);

    return Response.redirect(target.toString(), 302);
  } catch (e) {
    console.error("miro-oauth-callback error:", e);
    return new Response("Interner Fehler.", { status: 500, headers: corsHeaders });
  }
});
