import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PhaseGateCheck {
  enrollment_id: string;
  phase_number: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { enrollment_id, phase_number }: PhaseGateCheck = await req.json();

    console.log("Checking phase gate:", { enrollment_id, phase_number });

    // Get phase gate requirements
    const { data: gateData, error: gateError } = await supabase
      .from("lms_phase_gates")
      .select("*")
      .eq("enrollment_id", enrollment_id)
      .eq("phase_number", phase_number)
      .single();

    if (gateError) throw gateError;

    if (!gateData) {
      return new Response(
        JSON.stringify({
          passed: true,
          message: "Keine Phase Gate Anforderungen gefunden",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if required artifacts are uploaded
    const requiredArtifacts = gateData.required_artifacts || [];
    const { data: artifacts, error: artifactsError } = await supabase
      .from("lms_artifacts")
      .select("module_id")
      .eq("enrollment_id", enrollment_id);

    if (artifactsError) throw artifactsError;

    const uploadedModuleIds = artifacts?.map((a: any) => a.module_id) || [];
    const missingArtifacts = requiredArtifacts.filter(
      (reqId: string) => !uploadedModuleIds.includes(reqId)
    );

    if (missingArtifacts.length > 0) {
      return new Response(
        JSON.stringify({
          passed: false,
          message: `Fehlende Artifacts: ${missingArtifacts.length} Module müssen noch abgeschlossen werden`,
          missing_artifacts: missingArtifacts,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update phase gate status
    await supabase
      .from("lms_phase_gates")
      .update({ status: "passed" })
      .eq("id", gateData.id);

    return new Response(
      JSON.stringify({
        passed: true,
        message: "Phase Gate erfolgreich bestanden!",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-phase-gate:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
