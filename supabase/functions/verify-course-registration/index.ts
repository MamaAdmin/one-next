import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { registrationId } = await req.json();
    if (!registrationId) {
      return new Response(JSON.stringify({ error: "registrationId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: reg, error: regErr } = await supabase
      .from("public_course_registrations")
      .select("id, stripe_session_id, payment_status")
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reg.payment_status === "paid") {
      return new Response(JSON.stringify({ status: "paid", alreadyVerified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!reg.stripe_session_id) {
      return new Response(JSON.stringify({ error: "No Stripe session" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(reg.stripe_session_id);
    const paid = session.payment_status === "paid";

    await supabase
      .from("public_course_registrations")
      .update({
        payment_status: paid ? "paid" : session.payment_status ?? "pending",
      })
      .eq("id", registrationId);

    return new Response(
      JSON.stringify({ status: paid ? "paid" : session.payment_status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-course-registration error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
