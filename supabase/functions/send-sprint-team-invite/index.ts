import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  invitation_id: z.string().uuid(),
  origin: z.string().url().max(500),
});

const ROLE_LABEL: Record<string, string> = {
  decider: "Decider",
  sprint_leader: "Sprint Leader",
  finance: "Finance Expert",
  marketing: "Marketing Expert",
  customer: "Customer Expert",
  tech: "Tech / Logistics Expert",
  design: "Design Expert",
  wildcard: "Wildcard",
  viewer: "Beobachter",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Load invitation and sprint
    const { data: invitation, error: invErr } = await admin
      .from("sprint_invitations")
      .select("id, sprint_id, email, full_name, role_type, token, status, expires_at, invited_by")
      .eq("id", parsed.data.invitation_id)
      .maybeSingle();

    if (invErr || !invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: only sprint owner (or the invited_by) may send
    const { data: sprint } = await admin
      .from("sprints")
      .select("id, owner_id, titel")
      .eq("id", invitation.sprint_id)
      .maybeSingle();

    if (!sprint || sprint.owner_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);
    const inviteUrl = `${parsed.data.origin}/sprint/invite/${invitation.token}`;
    const roleLabel = ROLE_LABEL[invitation.role_type] ?? invitation.role_type;
    const greetingName = invitation.full_name || invitation.email;

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
        <h1 style="font-size:22px;margin:0 0 16px;">Einladung zum Sprint</h1>
        <p style="margin:0 0 12px;">Hallo ${greetingName},</p>
        <p style="margin:0 0 12px;">
          du wurdest als <strong>${roleLabel}</strong> zum Sprint
          <strong>„${sprint.titel}"</strong> eingeladen.
        </p>
        <p style="margin:0 0 20px;">Klicke auf den Button, um beizutreten:</p>
        <p style="margin:24px 0;">
          <a href="${inviteUrl}" style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">
            Einladung annehmen
          </a>
        </p>
        <p style="margin:24px 0 8px;font-size:13px;color:#6b7280;">
          Der Link ist 14 Tage gültig. Falls der Button nicht funktioniert:<br />
          <a href="${inviteUrl}" style="color:#374151;">${inviteUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          one-next – Ihr Partner für individuelle KI-Entwicklung.
        </p>
      </div>
    `;

    const { error: emailErr } = await resend.emails.send({
      from: "one-next Sprint <onboarding@resend.dev>",
      to: [invitation.email],
      subject: `Einladung: ${sprint.titel} · Rolle ${roleLabel}`,
      html,
    });

    if (emailErr) {
      return new Response(JSON.stringify({ error: emailErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
