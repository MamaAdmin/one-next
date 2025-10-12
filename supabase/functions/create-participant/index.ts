import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateParticipantRequest {
  customer_id: string;
  email: string;
  full_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    // Check if user is admin using Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      throw new Error("Failed to check admin status");
    }

    if (!roles) {
      console.error("User is not an admin:", user.id);
      throw new Error("User is not an admin");
    }

    console.log("Admin verified:", user.id);

    // Get request data
    const { customer_id, email, full_name }: CreateParticipantRequest = await req.json();

    if (!customer_id || !email || !full_name) {
      throw new Error("Missing required fields");
    }

    console.log("Creating participant:", { email, full_name, customer_id });

    // Create auth user with auto-confirmed email
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      throw signUpError;
    }

    console.log("Auth user created:", authData.user.id);

    // Create participant record (Service Role Key bypasses RLS)
    const { data: participant, error: participantError } = await supabaseAdmin
      .from("participants")
      .insert({
        user_id: authData.user.id,
        customer_id,
        email,
        full_name,
      })
      .select()
      .single();

    if (participantError) {
      console.error("Participant insert error:", participantError);
      throw participantError;
    }

    console.log("Participant created:", participant.id);

    // Assign 'user' role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "user",
      });

    if (roleInsertError) {
      console.error("Role insert error:", roleInsertError);
      // Don't throw - participant is created, role assignment can be retried
    } else {
      console.log("User role assigned");
    }

    return new Response(
      JSON.stringify({
        success: true,
        participant,
        message: "Teilnehmer erfolgreich erstellt",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("Error creating participant:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Ein Fehler ist aufgetreten",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);
