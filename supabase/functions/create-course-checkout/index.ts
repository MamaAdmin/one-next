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
    const { courseId, customerId, licenses = 1 } = await req.json();

    if (!courseId || !customerId) {
      throw new Error("courseId and customerId are required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from("lms_courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      throw new Error("Customer not found");
    }

    // Calculate total price
    const totalPrice = course.price_chf * licenses;

    // Create pending purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("lms_course_purchases")
      .insert({
        customer_id: customerId,
        course_id: courseId,
        number_of_licenses: licenses,
        total_price: totalPrice,
        status: "pending",
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check/create Stripe customer
    const customers = await stripe.customers.list({
      email: customer.email,
      limit: 1,
    });

    let stripeCustomerId;
    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.company_name || customer.name,
      });
      stripeCustomerId = newCustomer.id;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: course.title,
              description: `${licenses} Lizenz(en) für ${course.title}`,
            },
            unit_amount: Math.round(course.price_chf * 100), // Convert to cents
          },
          quantity: licenses,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/lms/purchase-confirmation?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchase.id}`,
      cancel_url: `${req.headers.get("origin")}/lms?canceled=true`,
      metadata: {
        purchase_id: purchase.id,
        course_id: courseId,
        customer_id: customerId,
        licenses: licenses.toString(),
      },
    });

    // Update purchase with Stripe session ID
    await supabaseClient
      .from("lms_course_purchases")
      .update({ payment_id: session.id })
      .eq("id", purchase.id);

    return new Response(
      JSON.stringify({ url: session.url, purchaseId: purchase.id }),
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
