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
    const { bookingId } = await req.json();
    console.log("Creating checkout session for booking:", bookingId);

    // Initialize Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get booking details
    const { data: booking, error } = await supabaseAdmin
      .from("sprint_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new Error("Booking not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: booking.email,
      limit: 1,
    });

    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : booking.email,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: `Online Design Sprint - ${booking.recommended_sprint_type}`,
              description: `${booking.team_size} Teilnehmer`,
            },
            unit_amount: booking.price_chf * 100, // 999 CHF = 99900 Rappen
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/sprint/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/sprint/booking?step=5`,
      metadata: {
        booking_id: bookingId,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
