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
    const { courseId, courseDateId, firstName, lastName, email, phone, company, paymentMethod } = await req.json();

    if (!courseId || !firstName || !lastName || !email) {
      throw new Error("courseId, firstName, lastName, and email are required");
    }

    if (paymentMethod === "twint" && !phone) {
      throw new Error("Phone number is required for Twint payment");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from("public_courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    // Create registration
    const { data: registration, error: regError } = await supabaseClient
      .from("public_course_registrations")
      .insert({
        course_id: courseId,
        course_date_id: courseDateId || null,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        company: company || null,
        payment_method: paymentMethod || "stripe",
        payment_status: "pending",
        amount_paid: course.price_chf,
      })
      .select()
      .single();

    if (regError) throw regError;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build payment method types based on selection
    const paymentMethodTypes: string[] = [];
    if (paymentMethod === "twint") {
      paymentMethodTypes.push("twint");
    } else {
      paymentMethodTypes.push("card");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes as any,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: course.title,
              description: course.description || undefined,
            },
            unit_amount: Math.round(course.price_chf * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/kurse?success=true&registration_id=${registration.id}`,
      cancel_url: `${req.headers.get("origin")}/kurse?cancelled=true`,
      metadata: {
        registration_id: registration.id,
        course_id: courseId,
        payment_method: paymentMethod,
      },
    });

    // Update registration with Stripe session ID
    await supabaseClient
      .from("public_course_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", registration.id);

    return new Response(
      JSON.stringify({ url: session.url, registrationId: registration.id }),
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
