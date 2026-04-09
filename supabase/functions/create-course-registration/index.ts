import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  courseId: z.string().uuid(),
  courseDateId: z.string().uuid().nullable().optional(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  paymentMethod: z.enum(["stripe", "twint"]).optional().default("stripe"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { courseId, courseDateId, firstName, lastName, email, phone, company, paymentMethod } = parsed.data;

    if (paymentMethod === "twint" && !phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required for Twint payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        payment_method: paymentMethod,
        payment_status: "pending",
        amount_paid: course.price_chf,
      })
      .select()
      .single();

    if (regError) {
      console.error("Registration error:", regError);
      return new Response(
        JSON.stringify({ error: "Registration failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const paymentMethodTypes: string[] = [];
    if (paymentMethod === "twint") {
      paymentMethodTypes.push("twint");
    } else {
      paymentMethodTypes.push("card");
    }

    const lineItems = course.stripe_price_id
      ? [{ price: course.stripe_price_id, quantity: 1 }]
      : [
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
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes as any,
      customer_email: email,
      line_items: lineItems as any,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${req.headers.get("origin")}/zahlung-erfolgreich?type=kurs&registration_id=${registration.id}`,
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
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again later." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
