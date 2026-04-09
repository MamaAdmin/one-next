import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  to: z.string().email().max(255),
  type: z.enum(["recommendation", "booking_received", "payment_confirmed"]),
  data: z.object({
    name: z.string().trim().min(1).max(200),
    sprintType: z.string().max(200).optional(),
    score: z.number().min(0).max(100).optional(),
    bookingLink: z.string().url().max(2000).optional(),
    paymentLink: z.string().url().max(2000).optional(),
    projectLink: z.string().url().max(2000).optional(),
  }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !authData?.user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", authData.user.id);

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, type, data } = parsed.data;
    console.log(`Sending ${type} email to ${to}`);

    let subject = "";
    let html = "";

    if (type === "recommendation") {
      subject = `Ihre Sprint-Empfehlung: ${data.sprintType}`;
      html = `
        <h1>Vielen Dank für Ihr Interesse am Online Design Sprint!</h1>
        <p>Hallo ${data.name},</p>
        <p>Basierend auf Ihren Angaben empfehlen wir Ihnen einen <strong>${data.sprintType}</strong>.</p>
        <h2>Ihre Bewertung:</h2>
        <ul>
          <li>Sprint-Tauglichkeit: ${data.score}/100</li>
          <li>Empfohlener Typ: ${data.sprintType}</li>
        </ul>
        <p><strong>Nächste Schritte:</strong><br>
        Buchen Sie jetzt Ihren Sprint für 999 CHF:<br>
        <a href="${data.bookingLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Jetzt buchen</a></p>
        <p>Beste Grüße,<br>Ihr Sprint-Team</p>
      `;
    } else if (type === "booking_received") {
      subject = "Buchung erhalten - bitte zahlen Sie";
      html = `
        <h1>Ihre Buchung wurde erfolgreich erstellt!</h1>
        <p>Hallo ${data.name},</p>
        <p><strong>Buchungsdetails:</strong></p>
        <ul>
          <li>Sprint-Typ: ${data.sprintType}</li>
          <li>Preis: 999 CHF</li>
        </ul>
        <p><strong>Jetzt zahlen:</strong><br>
        <a href="${data.paymentLink}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Zur Zahlung</a></p>
        <p><em>Wichtig: Ihre Buchung wird erst nach Zahlungseingang bestätigt.</em></p>
        <p>Beste Grüße,<br>Ihr Sprint-Team</p>
      `;
    } else if (type === "payment_confirmed") {
      subject = "Zahlung bestätigt - legen Sie Ihr Projekt an!";
      html = `
        <h1>Ihre Zahlung wurde erfolgreich verarbeitet!</h1>
        <p>Hallo ${data.name},</p>
        <p>Herzlich willkommen zum Online Design Sprint!</p>
        <h2>Nächster Schritt:</h2>
        <p>Legen Sie jetzt Ihr Sprint-Projekt an:<br>
        <a href="${data.projectLink}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-size: 16px;">Projekt anlegen</a></p>
        <h3>Was Sie erwartet:</h3>
        <ol>
          <li>Team-Setup (Mitglieder einladen)</li>
          <li>Sprint-Durchführung (6 Tage)</li>
          <li>Automatischer PDF-Report</li>
        </ol>
        <p>Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.</p>
        <p>Viel Erfolg!<br>Ihr Sprint-Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Online Design Sprint <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Email could not be sent. Please try again later." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
