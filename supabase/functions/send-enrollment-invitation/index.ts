import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnrollmentInvitation {
  participant_email: string;
  participant_name: string;
  course_title: string;
  enrollment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { participant_email, participant_name, course_title, enrollment_id }: EnrollmentInvitation = await req.json();

    console.log("Sending enrollment invitation:", {
      participant_email,
      course_title,
      enrollment_id,
    });

    const loginUrl = `${Deno.env.get("SUPABASE_URL")}/lms/enrollment/${enrollment_id}`;

    const emailResponse = await resend.emails.send({
      from: "One Next <onboarding@resend.dev>",
      to: [participant_email],
      subject: `Ihr Kurs wurde freigeschaltet: ${course_title}`,
      html: `
        <h1>Willkommen, ${participant_name}!</h1>
        <p>Ihr Kurs <strong>${course_title}</strong> wurde freigeschaltet.</p>
        <p>Sie können jetzt mit dem Lernen beginnen:</p>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Zum Kurs
        </a>
        <p>Viel Erfolg bei Ihrem Learning Journey!</p>
        <p>Ihr One Next Team</p>
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
    console.error("Error in send-enrollment-invitation:", error);
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
