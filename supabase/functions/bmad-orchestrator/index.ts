import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_PROMPTS = {
  business_analyst: `You are a Business Analyst in the BMAD Method.
Analyze the project context and produce:
- Business Requirements Document
- Stakeholder Analysis
- Success Criteria
- Constraints and Dependencies
Format output as structured markdown with clear sections.`,
  
  product_manager: `You are a Product Manager in the BMAD Method.
Based on Business Requirements, create:
- Product Vision Statement
- Feature Prioritization Matrix
- Release Roadmap (3-6 months)
- KPIs and Metrics
Reference previous Business Analyst output.`,
  
  ux_expert: `You are a UX Expert in the BMAD Method.
Transform Product Vision into:
- User Journey Maps
- Wireframe Descriptions (text-based, detailed)
- Information Architecture
- Interaction Patterns
Use previous outputs as foundation.`,
  
  product_owner: `You are a Product Owner in the BMAD Method.
Convert UX designs into:
- Detailed User Stories (As a... I want... So that...)
- Acceptance Criteria
- Story Point Estimates
- Backlog Prioritization
Reference all previous agent outputs.`,
  
  architect: `You are a Software Architect in the BMAD Method.
Design technical implementation:
- System Architecture Diagram (text description)
- Technology Stack Recommendations
- Data Model / Schema Design
- API Specifications
- Security & Performance Considerations
Base decisions on User Stories and Product Vision.`,
  
  scrum_master: `You are a Scrum Master in the BMAD Method.
Create execution plan:
- Sprint Plan (2-week sprints)
- Task Breakdown with time estimates
- Team Capacity Planning
- Risk Assessment and Mitigation
- Definition of Done
Synthesize all previous agent outputs.`
};

const AGENT_ORDER = [
  'business_analyst',
  'product_manager',
  'ux_expert',
  'product_owner',
  'architect',
  'scrum_master'
];

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

    // Verify JWT and check admin role
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

    const { sessionId, agentType, userInput, autoProgress } = await req.json();

    // Load session and artifacts
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

    // Build context for AI
    const systemPrompt = AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS];
    const previousOutputs = artifacts
      ?.map(a => `## ${a.agent_type.replace(/_/g, ' ').toUpperCase()} - ${a.title}\n\n${a.content}`)
      .join('\n\n---\n\n') || '';

    const userPrompt = `
PROJECT CONTEXT:
${session.project_context}

${previousOutputs ? `PREVIOUS AGENT OUTPUTS:\n${previousOutputs}\n\n` : ''}

${userInput ? `ADDITIONAL REFINEMENTS:\n${userInput}\n\n` : ''}

YOUR TASK:
Generate your output based on the above context. Provide comprehensive, detailed, and actionable content in markdown format.
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
        max_tokens: 10000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "";

    // Save conversation
    await supabase.from("bmad_conversations").insert({
      session_id: sessionId,
      agent_type: agentType,
      role: "user",
      content: userPrompt,
    });

    await supabase.from("bmad_conversations").insert({
      session_id: sessionId,
      agent_type: agentType,
      role: "assistant",
      content: content,
      prompt_tokens: aiData.usage?.prompt_tokens,
      completion_tokens: aiData.usage?.completion_tokens,
    });

    // Determine artifact type and title
    const artifactTypeMap: Record<string, string> = {
      business_analyst: 'business_requirements',
      product_manager: 'product_vision',
      ux_expert: 'ux_wireframes',
      product_owner: 'user_stories',
      architect: 'technical_architecture',
      scrum_master: 'sprint_plan'
    };

    const artifactTitleMap: Record<string, string> = {
      business_analyst: 'Business Requirements Document',
      product_manager: 'Product Vision & Roadmap',
      ux_expert: 'UX Design & Wireframes',
      product_owner: 'User Stories & Backlog',
      architect: 'Technical Architecture',
      scrum_master: 'Sprint Plan & Execution Strategy'
    };

    // Save artifact
    const { data: artifact, error: artifactError } = await supabase
      .from("bmad_artifacts")
      .insert({
        session_id: sessionId,
        agent_type: agentType,
        artifact_type: artifactTypeMap[agentType],
        title: artifactTitleMap[agentType],
        content: content,
        metadata: {
          user_input: userInput || null,
          tokens_used: aiData.usage?.total_tokens || 0,
        },
      })
      .select()
      .single();

    if (artifactError) {
      throw artifactError;
    }

    // Determine next agent
    let nextAgent = null;
    let completed = false;
    
    if (autoProgress) {
      const currentIndex = AGENT_ORDER.indexOf(agentType);
      if (currentIndex < AGENT_ORDER.length - 1) {
        nextAgent = AGENT_ORDER[currentIndex + 1];
      } else {
        completed = true;
      }
    }

    // Update session
    const updateData: any = {
      current_phase: nextAgent || agentType,
      updated_at: new Date().toISOString(),
    };

    if (completed) {
      updateData.status = 'development';
      updateData.planning_completed_at = new Date().toISOString();
      updateData.development_started_at = new Date().toISOString();
    }

    await supabase
      .from("bmad_sessions")
      .update(updateData)
      .eq("id", sessionId);

    return new Response(
      JSON.stringify({
        artifact,
        nextAgent,
        completed,
        tokensUsed: aiData.usage?.total_tokens || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in bmad-orchestrator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
