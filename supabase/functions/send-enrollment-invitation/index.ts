import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

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
    const body = await req.json();
    const parsed = InvitationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, fullName, token, companyName } = parsed.data;

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
