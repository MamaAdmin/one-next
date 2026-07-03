import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const InvitationSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().trim().min(1).max(200),
  token: z.string().min(1).max(500),
  companyName: z.string().trim().min(1).max(200),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const callerId = userData.user.id;

    const body = await req.json();
    const parsed = InvitationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, fullName, token, companyName } = parsed.data;

    // Verify caller owns the invitation referenced by this token
    const { data: invitation } = await supabase
      .from("user_invitations")
      .select("id, invited_by, customer_id, email")
      .eq("token", token)
      .maybeSingle();

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!invitation || (invitation.invited_by !== callerId && !isAdmin)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (invitation.email !== email) {
      return new Response(JSON.stringify({ error: "Email does not match invitation" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }


    console.log("Sending invitation email to:", email);

    const inviteUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovableproject.com")}/accept-enrollment-invitation?token=${token}`;

    const emailResponse = await resend.emails.send({
      from: "OneNext <onboarding@resend.dev>",
      to: [email],
      subject: `Einladung zu ${companyName}`,
      html: `
        <h1>Willkommen bei ${companyName}, ${fullName}!</h1>
        <p>Sie wurden eingeladen, dem Learning Management System von ${companyName} beizutreten.</p>
        <p>Klicken Sie auf den folgenden Link, um Ihren Account zu aktivieren:</p>
        <p><a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Einladung annehmen</a></p>
        <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p>${inviteUrl}</p>
        <p>Diese Einladung ist 7 Tage gültig.</p>
        <p>Beste Grüße,<br>Das OneNext Team</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-enrollment-invitation function:", error);
    return new Response(
      JSON.stringify({ error: "Email could not be sent. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
