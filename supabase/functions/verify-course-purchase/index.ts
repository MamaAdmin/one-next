import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, purchaseId } = await req.json();

    if (!sessionId || !purchaseId) {
      throw new Error("sessionId and purchaseId are required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("lms_course_purchases")
      .select("*")
      .eq("id", purchaseId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error("Purchase not found");
    }

    // Already processed
    if (purchase.status === "paid") {
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Verify payment with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Update purchase status
    await supabaseClient
      .from("lms_course_purchases")
      .update({ status: "paid" })
      .eq("id", purchaseId);

    // Create participant for customer if not exists
    const { data: existingParticipant } = await supabaseClient
      .from("participants")
      .select("id")
      .eq("customer_id", purchase.customer_id)
      .eq("email", session.customer_details?.email)
      .maybeSingle();

    let participantId = existingParticipant?.id;

    if (!participantId) {
      const { data: newParticipant, error: participantError } = await supabaseClient
        .from("participants")
        .insert({
          customer_id: purchase.customer_id,
          email: session.customer_details?.email || "",
          full_name: session.customer_details?.name || "Käufer",
        })
        .select()
        .single();

      if (participantError) throw participantError;
      participantId = newParticipant.id;
    }

    // Create enrollment for primary user
    const { error: enrollmentError } = await supabaseClient
      .from("lms_course_enrollments")
      .insert({
        purchase_id: purchaseId,
        participant_id: participantId,
        status: "active",
      });

    if (enrollmentError) throw enrollmentError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Purchase verified and enrollment created",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
