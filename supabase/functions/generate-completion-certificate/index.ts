import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CertificateRequest {
  enrollment_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace('Bearer ', '');

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { enrollment_id }: CertificateRequest = await req.json();
    if (!enrollment_id || typeof enrollment_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid enrollment_id' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating certificate for enrollment:", enrollment_id);

    // Get enrollment details
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("lms_course_enrollments")
      .select(`
        *,
        participants (
          user_id,
          full_name,
          email
        ),
        lms_course_purchases (
          lms_courses (
            title
          )
        )
      `)
      .eq("id", enrollment_id)
      .single();

    if (enrollmentError) throw enrollmentError;

    // Ownership check: caller must own the enrollment, or be admin
    const isOwner = enrollment.participants?.user_id === authData.user.id;
    let isAdmin = false;
    if (!isOwner) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      isAdmin = !!roleRow;
    }
    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const participantName = enrollment.participants?.full_name || "Teilnehmer";
    const participantEmail = enrollment.participants?.email;
    const courseTitle = enrollment.lms_course_purchases?.lms_courses?.title || "Kurs";
    const completedDate = new Date(enrollment.completed_at).toLocaleDateString("de-DE");

    // Generate simple HTML certificate
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              text-align: center;
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .certificate {
              background: white;
              padding: 60px;
              max-width: 800px;
              margin: 0 auto;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 {
              font-size: 48px;
              margin-bottom: 20px;
              color: #333;
            }
            .participant {
              font-size: 36px;
              font-weight: bold;
              margin: 30px 0;
              color: #667eea;
            }
            .course {
              font-size: 24px;
              margin: 20px 0;
              color: #555;
            }
            .date {
              font-size: 18px;
              color: #777;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>🎓 Zertifikat</h1>
            <p>Hiermit wird bescheinigt, dass</p>
            <div class="participant">${participantName}</div>
            <p>erfolgreich den Kurs</p>
            <div class="course">${courseTitle}</div>
            <p>abgeschlossen hat.</p>
            <div class="date">Abschlussdatum: ${completedDate}</div>
          </div>
        </body>
      </html>
    `;

    // Send certificate via email
    const emailResponse = await resend.emails.send({
      from: "One Next <onboarding@resend.dev>",
      to: [participantEmail],
      subject: `Ihr Zertifikat: ${courseTitle}`,
      html: certificateHTML,
    });

    console.log("Certificate sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Zertifikat wurde per Email versandt",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating certificate:", error);
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
