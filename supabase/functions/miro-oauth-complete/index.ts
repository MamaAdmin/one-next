// Exchanges Miro OAuth code for tokens and stores them for the current user.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const MIRO_TOKEN_URL = "https://api.miro.com/v1/oauth/token";

function envRequired(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function expectedRedirectUri(): string {
  return `${envRequired("SUPABASE_URL")}/functions/v1/miro-oauth-callback`;
}

async function verifyState(state: string, userId: string, secret: string): Promise<boolean> {
  const [payloadB64, sigB64] = state.split(".");
  if (!payloadB64 || !sigB64) return false;
  let payload = "";
  try {
    payload = atob(payloadB64);
  } catch {
    return false;
  }
  const parts = payload.split(".");
  if (parts.length !== 4) return false;
  const [uid, _nonce, tsStr, _originB64] = parts;
  if (uid !== userId) return false;
  const ts = Number(tsStr);
  if (!ts || Date.now() - ts > 15 * 60 * 1000) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sbUser = createClient(envRequired("SUPABASE_URL"), envRequired("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await sbUser.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const code: string | undefined = body?.code;
    const state: string | undefined = body?.state;
    const redirectUri: string | undefined = body?.redirect_uri;
    if (!code || !state || !redirectUri) {
      return new Response(JSON.stringify({ error: "missing_params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = envRequired("SUPABASE_SERVICE_ROLE_KEY");
    const ok = await verifyState(state, userId, secret);
    if (!ok) {
      return new Response(JSON.stringify({ error: "invalid_state" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = envRequired("MIRO_CLIENT_ID");
    const clientSecret = envRequired("MIRO_CLIENT_SECRET");
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });
    const tokRes = await fetch(`${MIRO_TOKEN_URL}?${params.toString()}`, { method: "POST" });
    if (!tokRes.ok) {
      const details = await tokRes.text();
      console.error("miro token exchange failed:", tokRes.status, details);
      return new Response(
        JSON.stringify({ error: "miro_token_exchange_failed", status: tokRes.status, details }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const tok = await tokRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user_id?: string;
      team_id?: string;
      scope?: string;
    };

    // Optional identity lookup
    let miroName: string | null = null;
    try {
      const meRes = await fetch("https://api.miro.com/v2/users/me", {
        headers: { Authorization: `Bearer ${tok.access_token}`, Accept: "application/json" },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        miroName = me?.name ?? null;
      }
    } catch (_) {
      // non-fatal
    }

    const svc = createClient(envRequired("SUPABASE_URL"), envRequired("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const expiresAt = new Date(Date.now() + tok.expires_in * 1000).toISOString();
    const { error: upErr } = await svc
      .from("miro_connections")
      .upsert(
        {
          user_id: userId,
          miro_user_id: tok.user_id ?? null,
          miro_team_id: tok.team_id ?? null,
          miro_name: miroName,
          access_token: tok.access_token,
          refresh_token: tok.refresh_token,
          token_expires_at: expiresAt,
          scope: tok.scope ?? null,
        },
        { onConflict: "user_id" },
      );
    if (upErr) {
      console.error("miro connection upsert failed:", upErr);
      return new Response(JSON.stringify({ error: "db_upsert_failed", details: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, miro_name: miroName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("miro-oauth-complete error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
