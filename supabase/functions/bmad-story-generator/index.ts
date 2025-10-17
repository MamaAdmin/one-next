import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid token");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { sessionId } = await req.json();

    const { data: session, error: sessionError } = await supabase
      .from("bmad_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    const { data: artifacts } = await supabase
      .from("bmad_artifacts")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!artifacts || artifacts.length === 0) {
      throw new Error("No artifacts found for this session");
    }

    // Build comprehensive context
    const artifactsSummary = artifacts
      .map(a => `## ${a.title}\n\nAgent: ${a.agent_type.replace(/_/g, ' ')}\n\n${a.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are a Story File Generator in the BMAD Method.
Your task is to synthesize all agent outputs into comprehensive, developer-ready story files.

Format the output as structured markdown with these sections:
1. Feature Overview
2. Business Context & Value
3. User Stories (with acceptance criteria)
4. Technical Requirements
5. Architecture & Design
6. Implementation Plan
7. Testing Strategy
8. Definition of Done

Make it actionable and ready for development teams.`;

    const userPrompt = `
PROJECT: ${session.title}
${session.description ? `Description: ${session.description}\n` : ''}

AGGREGATED AGENT OUTPUTS:
${artifactsSummary}

Generate comprehensive story files that synthesize all the above information into a developer-ready format.
`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: session.settings?.ai_model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 15000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "";

    // Save story file artifact
    const { data: artifact, error: artifactError } = await supabase
      .from("bmad_artifacts")
      .insert({
        session_id: sessionId,
        agent_type: 'scrum_master', // Story files are final output
        artifact_type: 'story_file',
        title: 'Developer Story Files',
        content: content,
        metadata: {
          artifacts_included: artifacts.length,
          tokens_used: aiData.usage?.total_tokens || 0,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (artifactError) {
      throw artifactError;
    }

    return new Response(
      JSON.stringify({
        artifact,
        tokensUsed: aiData.usage?.total_tokens || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in bmad-story-generator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
