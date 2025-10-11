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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete inactive collaboration sessions older than 7 days
    const { data: inactiveSessions, error: sessionsError } = await supabase
      .from("lms_collaboration_sessions")
      .delete()
      .eq("is_active", false)
      .lt("updated_at", sevenDaysAgo.toISOString())
      .select();

    if (sessionsError) {
      console.error("Error deleting sessions:", sessionsError);
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete dropped enrollments older than 90 days
    const { data: droppedEnrollments, error: enrollmentsError } = await supabase
      .from("lms_course_enrollments")
      .delete()
      .eq("status", "dropped")
      .lt("updated_at", ninetyDaysAgo.toISOString())
      .select();

    if (enrollmentsError) {
      console.error("Error deleting enrollments:", enrollmentsError);
    }

    // Delete old votes (older than 90 days)
    const { data: oldVotes, error: votesError } = await supabase
      .from("lms_votes")
      .delete()
      .lt("created_at", ninetyDaysAgo.toISOString())
      .select();

    if (votesError) {
      console.error("Error deleting votes:", votesError);
    }

    console.log("Cleanup completed:", {
      sessionsDeleted: inactiveSessions?.length || 0,
      enrollmentsDeleted: droppedEnrollments?.length || 0,
      votesDeleted: oldVotes?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionsDeleted: inactiveSessions?.length || 0,
        enrollmentsDeleted: droppedEnrollments?.length || 0,
        votesDeleted: oldVotes?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Cleanup failed:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
