import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  fullName: string;
  token: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, token, companyName }: InvitationEmailRequest = await req.json();

    console.log("Sending invitation email to:", email);

    const inviteUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovableproject.com")}/accept-invitation?token=${token}`;

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
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-enrollment-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
