import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(150).optional().default(""),
  services: z.array(z.string().max(100)).min(1).max(12),
  timing: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(1).max(2000),
  website: z.string().max(0).optional(), // honeypot
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Ungültige Angaben" }, 400);
    const d = parsed.data;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await admin.from("contact_inquiries").insert({
      name: d.name, email: d.email, company: d.company || null,
      services: d.services, timing: d.timing || null, message: d.message,
    });
    if (error) throw error;

    const key = Deno.env.get("RESEND_API_KEY");
    if (key) {
      try {
        await new Resend(key).emails.send({
          from: "one-next Anfrage <onboarding@resend.dev>",
          to: ["info@one-next.com"],
          reply_to: d.email,
          subject: `Neue Anfrage: ${d.services.join(", ")}`.slice(0, 200),
          html: `<h2>Neue Anfrage über one-next.com</h2>
<p><strong>Name:</strong> ${esc(d.name)}<br><strong>E-Mail:</strong> ${esc(d.email)}<br>
<strong>Unternehmen:</strong> ${esc(d.company || "–")}<br><strong>Zeitrahmen:</strong> ${esc(d.timing || "–")}</p>
<p><strong>Leistungen:</strong> ${d.services.map(esc).join(", ")}</p>
<p><strong>Nachricht:</strong><br>${esc(d.message).replace(/\n/g, "<br>")}</p>`,
        });
      } catch (mailError) {
        console.error("Mail failed", mailError);
      }
    }
    return json({ ok: true });
  } catch (e) {
    console.error("submit-contact-inquiry", e);
    return json({ error: "Anfrage konnte nicht gesendet werden" }, 500);
  }
});
