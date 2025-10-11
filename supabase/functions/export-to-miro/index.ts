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
    const { enrollmentId, moduleId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch artifacts from database
    const { data: artifacts, error: fetchError } = await supabase
      .from("lms_artifacts")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("module_id", moduleId);

    if (fetchError) throw fetchError;

    // Create Miro Board
    const miroApiKey = Deno.env.get("MIRO_API_KEY");
    const miroTeamId = Deno.env.get("MIRO_TEAM_ID");

    if (!miroApiKey || !miroTeamId) {
      throw new Error("Miro API credentials not configured");
    }

    const boardResponse = await fetch("https://api.miro.com/v2/boards", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${miroApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Sprint Artifacts - ${enrollmentId.substring(0, 8)}`,
        teamId: miroTeamId,
      }),
    });

    if (!boardResponse.ok) {
      throw new Error(`Miro API error: ${boardResponse.statusText}`);
    }

    const board = await boardResponse.json();

    // Upload artifacts as sticky notes
    for (const artifact of artifacts || []) {
      const { data: signedUrl } = await supabase.storage
        .from("lms-artifacts")
        .createSignedUrl(artifact.file_path, 3600);

      await fetch(`https://api.miro.com/v2/boards/${board.id}/sticky_notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${miroApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            content: `<p><strong>${artifact.title}</strong></p><p>${artifact.description || ""}</p><p><a href="${signedUrl?.signedUrl}">Download</a></p>`,
            shape: "square",
          },
          position: {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        boardUrl: board.viewLink,
        artifactCount: artifacts?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Export to Miro failed:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
