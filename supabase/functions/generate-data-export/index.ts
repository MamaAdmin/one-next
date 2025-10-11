import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { participantId } = await req.json();

    if (!participantId) {
      throw new Error("participantId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch participant data
    const { data: participant } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .single();

    // Fetch enrollments
    const { data: enrollments } = await supabase
      .from("lms_course_enrollments")
      .select("*, lms_course_purchases(*)")
      .eq("participant_id", participantId);

    // Fetch module progress
    const enrollmentIds = enrollments?.map((e) => e.id) || [];
    const { data: progress } = await supabase
      .from("lms_module_progress")
      .select("*")
      .in("enrollment_id", enrollmentIds);

    // Fetch artifacts
    const { data: artifacts } = await supabase
      .from("lms_artifacts")
      .select("*")
      .in("enrollment_id", enrollmentIds);

    // Fetch votes
    const { data: votes } = await supabase
      .from("lms_votes")
      .select("*")
      .eq("participant_id", participantId);

    // Fetch GDPR consents
    const { data: consents } = await supabase
      .from("lms_gdpr_consents")
      .select("*")
      .eq("participant_id", participantId);

    // Create export object
    const exportData = {
      exportDate: new Date().toISOString(),
      participant: {
        id: participant?.id,
        full_name: participant?.full_name,
        email: participant?.email,
        phone: participant?.phone,
        created_at: participant?.created_at,
      },
      enrollments: enrollments?.map((e) => ({
        id: e.id,
        status: e.status,
        current_phase: e.current_phase,
        progress_percentage: e.progress_percentage,
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        purchase: e.lms_course_purchases,
      })),
      moduleProgress: progress,
      artifacts: artifacts?.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        file_type: a.file_type,
        created_at: a.created_at,
      })),
      votes: votes,
      gdprConsents: consents,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lms-data-export-${participantId}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export failed:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
