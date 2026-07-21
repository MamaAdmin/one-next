// Reads sticky notes from a sprint's Miro board and returns their texts.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const MIRO_TOKEN_URL = "https://api.miro.com/v1/oauth/token";
const MIRO_API_BASE = "https://api.miro.com/v2";

function envRequired(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

interface MiroConn {
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}

async function getValidAccessToken(svc: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data, error } = await svc
    .from("miro_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`db: ${error.message}`);
  if (!data) throw new Response(JSON.stringify({ error: "miro_not_connected" }), { status: 400 });
  const conn = data as unknown as MiroConn;
  const expiresAt = new Date(conn.token_expires_at).getTime();
  if (Date.now() < expiresAt - 60_000) return conn.access_token;
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: envRequired("MIRO_CLIENT_ID"),
    client_secret: envRequired("MIRO_CLIENT_SECRET"),
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
  const tok = await res.json() as { access_token: string; refresh_token?: string; expires_in: number };
  const newExpiry = new Date(Date.now() + tok.expires_in * 1000).toISOString();
  await svc
    .from("miro_connections")
    .update({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token ?? conn.refresh_token,
      token_expires_at: newExpiry,
    })
    .eq("user_id", userId);
  return tok.access_token;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
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
    const sprintId: string | undefined = body?.sprint_id;
    const stepKey: string = body?.step_key ?? "2.4";
    if (!sprintId) {
      return new Response(JSON.stringify({ error: "missing_sprint_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svc = createClient(envRequired("SUPABASE_URL"), envRequired("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Caller must be a member of the sprint.
    const { data: canEdit } = await svc.rpc("can_edit_sprint", {
      _sprint_id: sprintId,
      _user_id: userId,
    });
    if (!canEdit) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: boardRow, error: boardErr } = await svc
      .from("sprint_miro_boards")
      .select("*")
      .eq("sprint_id", sprintId)
      .eq("step_key", stepKey)
      .maybeSingle();
    if (boardErr) throw new Error(`db: ${boardErr.message}`);
    if (!boardRow) {
      return new Response(JSON.stringify({ error: "no_board_yet" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const boardId = (boardRow as { board_id: string }).board_id;
    const boardCreator = (boardRow as { created_by: string }).created_by;

    // Use the board creator's Miro token (the moderator who owns the board).
    const accessToken = await getValidAccessToken(svc, boardCreator);

    const items: string[] = [];
    let cursor: string | undefined;
    let safety = 0;
    do {
      const url = new URL(`${MIRO_API_BASE}/boards/${boardId}/items`);
      url.searchParams.set("type", "sticky_note");
      url.searchParams.set("limit", "50");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      });
      if (!res.ok) {
        const details = await res.text();
        console.error("miro items fetch failed:", res.status, details);
        return new Response(
          JSON.stringify({ error: "miro_items_failed", status: res.status, details }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const page = await res.json() as {
        data: Array<{ data?: { content?: string; shape?: string } }>;
        cursor?: string;
      };
      for (const it of page.data ?? []) {
        const raw = it?.data?.content ?? "";
        const text = stripHtml(raw);
        if (text) items.push(text);
      }
      cursor = page.cursor;
      safety++;
    } while (cursor && safety < 20);

    return new Response(JSON.stringify({ items, count: items.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Response) {
      const body = await e.text();
      return new Response(body, {
        status: e.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("miro-fetch-board-items error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
