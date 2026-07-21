// Shared Miro helpers for edge functions.
// Kept minimal so each function can import just what it needs.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const MIRO_AUTH_URL = "https://miro.com/oauth/authorize";
export const MIRO_TOKEN_URL = "https://api.miro.com/v1/oauth/token";
export const MIRO_API_BASE = "https://api.miro.com/v2";

export function getEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function serviceClient(): SupabaseClient {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getUserFromRequest(req: Request): Promise<{ id: string; email: string | null }> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401 });
  const sb = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401 });
  }
  return { id: data.user.id, email: data.user.email ?? null };
}

interface MiroConnection {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}

/** Returns a valid access token, refreshing if necessary. */
export async function getValidAccessToken(userId: string): Promise<string> {
  const svc = serviceClient();
  const { data, error } = await svc
    .from("miro_connections")
    .select("user_id, access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`db: ${error.message}`);
  if (!data) throw new Response(JSON.stringify({ error: "miro_not_connected" }), { status: 400 });
  const conn = data as MiroConnection;
  const expiresAt = new Date(conn.token_expires_at).getTime();
  // Refresh 60s before expiry.
  if (Date.now() < expiresAt - 60_000) return conn.access_token;

  const clientId = getEnv("MIRO_CLIENT_ID");
  const clientSecret = getEnv("MIRO_CLIENT_SECRET");
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: conn.refresh_token,
  });
  const res = await fetch(`${MIRO_TOKEN_URL}?${params.toString()}`, { method: "POST" });
  if (!res.ok) {
    const body = await res.text();
    throw new Response(
      JSON.stringify({ error: "miro_refresh_failed", status: res.status, details: body }),
      { status: 502 },
    );
  }
  const tok = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  };
  const newExpiry = new Date(Date.now() + tok.expires_in * 1000).toISOString();
  const { error: upErr } = await svc
    .from("miro_connections")
    .update({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token ?? conn.refresh_token,
      token_expires_at: newExpiry,
      scope: tok.scope,
    })
    .eq("user_id", userId);
  if (upErr) throw new Error(`db: ${upErr.message}`);
  return tok.access_token;
}

export async function miroFetch(
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${MIRO_API_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
}
