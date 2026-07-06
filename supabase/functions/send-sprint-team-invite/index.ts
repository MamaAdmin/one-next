import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
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
  moderator: "Moderator",
  decider: "Decider",
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

    const inviteUrl = `${parsed.data.origin}/sprint/invite/${invitation.token}`;
    const roleLabel = ROLE_LABEL[invitation.role_type] ?? invitation.role_type;
    const greetingName = invitation.full_name || invitation.email;

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateName: "sprint-team-invite",
        recipientEmail: invitation.email,
        idempotencyKey: `sprint-team-invite-${invitation.id}`,
        templateData: {
          fullName: greetingName,
          roleLabel,
          sprintTitle: sprint.titel,
          inviteUrl,
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      return new Response(JSON.stringify({ error: errorText || "Email could not be queued" }), {
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
