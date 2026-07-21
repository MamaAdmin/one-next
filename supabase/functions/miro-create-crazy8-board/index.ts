// Creates a Miro board with 8 frames for a Crazy 8s sketching session.
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
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
}

async function getValidAccessToken(svc: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data, error } = await svc
    .from("miro_connections")
    .select("user_id, access_token, refresh_token, token_expires_at")
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
  const tok = await res.json() as { access_token: string; refresh_token?: string; expires_in: number; scope?: string };
  const newExpiry = new Date(Date.now() + tok.expires_in * 1000).toISOString();
  await svc
    .from("miro_connections")
    .update({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token ?? conn.refresh_token,
      token_expires_at: newExpiry,
      scope: tok.scope,
    })
    .eq("user_id", userId);
  return tok.access_token;
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

    // Confirm the caller can edit this sprint (owner or non-viewer member).
    const { data: canEdit, error: canErr } = await svc.rpc("can_edit_sprint", {
      _sprint_id: sprintId,
      _user_id: userId,
    });
    if (canErr) throw new Error(`can_edit_sprint: ${canErr.message}`);
    if (!canEdit) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse an existing board if one is already stored for this step.
    const { data: existing } = await svc
      .from("sprint_miro_boards")
      .select("*")
      .eq("sprint_id", sprintId)
      .eq("step_key", stepKey)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ board: existing, reused: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load sprint title for the board name.
    const { data: sprintRow } = await svc
      .from("sprints")
      .select("titel")
      .eq("id", sprintId)
      .maybeSingle();
    const sprintTitle = (sprintRow as { titel?: string } | null)?.titel ?? "Sprint";

    const accessToken = await getValidAccessToken(svc, userId);

    // 1. Create the board.
    const createRes = await fetch(`${MIRO_API_BASE}/boards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `${sprintTitle} · Crazy 8s`,
        description: `Crazy 8s Skizzen für Sprint "${sprintTitle}"`,
        policy: {
          permissionsPolicy: {
            collaborationToolsStartAccess: "all_editors",
            copyAccess: "team_members",
            sharingAccess: "team_members_with_editing_rights",
          },
          sharingPolicy: {
            access: "edit",
            inviteToAccountAndBoardLinkAccess: "no_access",
            organizationAccess: "edit",
            teamAccess: "edit",
          },
        },
      }),
    });
    if (!createRes.ok) {
      const details = await createRes.text();
      console.error("miro create board failed:", createRes.status, details);
      return new Response(
        JSON.stringify({ error: "miro_create_board_failed", status: createRes.status, details }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const board = await createRes.json() as { id: string; viewLink: string };
    const boardId = board.id;
    const boardUrl: string = board.viewLink;
    const embedUrl = `https://miro.com/app/live-embed/${encodeURIComponent(boardId)}/?embedMode=view_only_without_ui&embedAutoplay=true`;

    // 2. Create 8 frames in a 4x2 grid.
    const frameW = 800;
    const frameH = 600;
    const gap = 40;
    const cols = 4;
    for (let i = 0; i < 8; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * (frameW + gap);
      const y = (row - 0.5) * (frameH + gap);
      const framePayload = {
        data: { title: `Idee ${i + 1}`, type: "freeform" as const },
        style: { fillColor: "#ffffff" },
        position: { origin: "center", x, y },
        geometry: { width: frameW, height: frameH },
      };
      const fRes = await fetch(`${MIRO_API_BASE}/boards/${boardId}/frames`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(framePayload),
      });
      if (!fRes.ok) {
        const details = await fRes.text();
        console.error(`miro create frame ${i + 1} failed:`, fRes.status, details);
      }
    }

    // 3. Persist reference.
    const { data: saved, error: saveErr } = await svc
      .from("sprint_miro_boards")
      .insert({
        sprint_id: sprintId,
        step_key: stepKey,
        board_id: boardId,
        board_url: boardUrl,
        embed_url: embedUrl,
        created_by: userId,
      })
      .select("*")
      .single();
    if (saveErr) {
      console.error("save miro board failed:", saveErr);
      return new Response(JSON.stringify({ error: "db_save_failed", details: saveErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ board: saved, reused: false }), {
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
    console.error("miro-create-crazy8-board error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
