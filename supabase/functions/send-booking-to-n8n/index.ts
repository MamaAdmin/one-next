import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { bookingId } = await req.json();
    console.log("Sending booking to N8N:", bookingId);

    // Fetch booking details
    const { data: booking, error } = await supabaseAdmin
      .from("sprint_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }

    // Prepare payload for N8N
    const n8nPayload = {
      booking_id: booking.id,
      timestamp: new Date().toISOString(),
      customer: {
        name: booking.name,
        email: booking.email,
        company: booking.company,
        team_size: booking.team_size,
      },
      sprint_details: {
        recommended_type: booking.recommended_sprint_type,
        preferred_start_date: booking.preferred_start_date,
        suitability_score: booking.sprint_suitability_score,
        price_chf: booking.price_chf,
        gates_ok: booking.gates_ok,
      },
      feasibility_check: {
        challenge: booking.challenge_description,
        relevance: booking.relevance_reason,
        target_audience: booking.target_audience,
        consequences: booking.consequences,
        success_criteria: booking.success_criteria,
        testable_in_5_days: booking.testable_in_5_days,
        decider_available: booking.decider_available,
        user_access_count: booking.user_access_count,
        impact_scale: booking.impact_scale,
      },
      status: {
        booking: booking.booking_status,
        payment: booking.payment_status,
      },
    };

    // Send to N8N webhook
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      throw new Error("N8N_WEBHOOK_URL not configured");
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      console.error("N8N webhook failed:", await n8nResponse.text());
      throw new Error(`N8N webhook returned ${n8nResponse.status}`);
    }

    console.log("Successfully sent booking to N8N");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-booking-to-n8n:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
