import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHASE_PROMPTS = {
  business_analyst: `You are an expert Business Analyst conducting requirements gathering. 
Your task is to analyze the project context and generate a comprehensive requirements document.

Include:
1. Functional Requirements (FR-001, FR-002, etc.)
2. Non-Functional Requirements (Performance, Security, Scalability)
3. User Stories
4. Acceptance Criteria
5. Stakeholder Analysis
6. Risk Assessment

Format the output in Markdown with clear sections and bullet points.`,

  manager: `You are an experienced Project Manager creating a detailed project plan.
Based on the requirements, generate a comprehensive project plan.

Include:
1. Project Phases and Milestones
2. Resource Allocation (Team size, roles)
3. Timeline and Schedule
4. Budget Estimation
5. Risk Management Plan
6. Communication Plan
7. Success Metrics

Format the output in Markdown with clear sections.`,

  architect: `You are a Senior Software Architect designing the system architecture.
Based on the requirements and project plan, create a detailed architecture document.

Include:
1. Architecture Style (Microservices, Monolith, etc.)
2. Technology Stack (Frontend, Backend, Database, Infrastructure)
3. System Components and their Interactions
4. Data Flow Diagrams (describe in text)
5. Security Architecture
6. Scalability Strategy
7. Integration Points
8. Deployment Architecture

Format the output in Markdown with clear sections. Use ASCII diagrams where helpful.`,

  developer: `You are a Senior Software Developer implementing the solution.
Based on the architecture and requirements, generate implementation artifacts.

Include:
1. Core Code Structure (file organization)
2. Key Components/Services (with code snippets)
3. API Endpoints
4. Database Schema
5. Configuration Files
6. Testing Strategy
7. Deployment Scripts

Format the output in Markdown with code blocks. Use TypeScript/React for frontend, Node.js for backend.`
};

const PHASE_ARTIFACT_TYPES = {
  business_analyst: 'business_requirements',
  manager: 'sprint_plan',
  architect: 'technical_architecture',
  developer: 'story_file'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { session_id, agent_type } = await req.json();

    console.log('Running BMAD phase:', { session_id, agent_type });

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from('bmad_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Fetch previous artifacts for context
    const { data: previousArtifacts } = await supabase
      .from('bmad_artifacts')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    // Build context from previous artifacts
    let contextStr = '';
    if (previousArtifacts && previousArtifacts.length > 0) {
      contextStr = '\n\nPrevious Work:\n';
      previousArtifacts.forEach(artifact => {
        contextStr += `\n### ${artifact.title} (by ${artifact.agent_type})\n${artifact.content.substring(0, 1000)}...\n`;
      });
    }

    // Prepare the AI prompt
    const systemPrompt = PHASE_PROMPTS[agent_type as keyof typeof PHASE_PROMPTS];
    const userPrompt = `
Project: ${session.title}

Description: ${session.description}

Project Context:
${session.project_context}
${contextStr}

Generate a comprehensive ${agent_type.replace('_', ' ')} deliverable for this project.
`;

    console.log('Calling Lovable AI with model:', session.settings?.ai_model || 'google/gemini-2.5-flash');

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Save user message to conversations
    const { error: userMsgError } = await supabase
      .from('bmad_conversations')
      .insert({
        session_id,
        agent_type,
        role: 'user',
        content: userPrompt,
        prompt_tokens: Math.ceil(userPrompt.length / 4)
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: session.settings?.ai_model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    const usage = aiData.usage;

    console.log('AI response received, tokens:', usage);

    // Save assistant message to conversations
    const { error: assistantMsgError } = await supabase
      .from('bmad_conversations')
      .insert({
        session_id,
        agent_type,
        role: 'assistant',
        content: generatedContent,
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0
      });

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
    }

    // Create the artifact
    const artifactType = PHASE_ARTIFACT_TYPES[agent_type as keyof typeof PHASE_ARTIFACT_TYPES];
    const { data: artifact, error: artifactError } = await supabase
      .from('bmad_artifacts')
      .insert({
        session_id,
        agent_type,
        title: `${agent_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Deliverable - ${session.title}`,
        content: generatedContent,
        artifact_type: artifactType,
        version: 1,
        is_approved: !session.settings?.require_approval,
        metadata: {
          tokens_used: usage?.total_tokens || 0,
          model: session.settings?.ai_model || 'google/gemini-2.5-flash'
        }
      })
      .select()
      .single();

    if (artifactError) {
      console.error('Error creating artifact:', artifactError);
      throw artifactError;
    }

    console.log('Artifact created successfully:', artifact.id);

    return new Response(
      JSON.stringify({ artifact }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bmad-run-phase:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
