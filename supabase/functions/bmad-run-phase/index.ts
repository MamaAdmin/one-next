import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { callGemini } from "../_shared/gemini.ts";

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

  product_manager: `You are an experienced Product Manager creating a detailed product roadmap.
Based on the business requirements, generate a comprehensive product vision.

Include:
1. Product Vision & Mission Statement
2. Target Market & Customer Personas
3. Feature Prioritization (MoSCoW)
4. Product Roadmap (Q1-Q4)
5. Success Metrics (KPIs)
6. Competitive Analysis
7. Go-to-Market Strategy

Format the output in Markdown with clear sections.`,

  ux_expert: `You are a Senior UX Designer creating user experience artifacts.
Based on requirements and product vision, generate UX deliverables.

Include:
1. User Journey Maps
2. Low-Fidelity Wireframes (describe in text/ASCII)
3. Information Architecture
4. Interaction Patterns
5. Accessibility Considerations
6. Responsive Design Guidelines
7. Design System Recommendations

Format the output in Markdown with ASCII wireframe sketches where helpful.`,

  product_owner: `You are a Product Owner creating detailed user stories.
Based on product vision and UX designs, generate actionable user stories.

Include:
1. Epic Breakdown
2. User Stories (As a [user], I want [goal], so that [benefit])
3. Acceptance Criteria (Given-When-Then format)
4. Story Point Estimates
5. Dependencies between stories
6. Definition of Done
7. Sprint Backlog Prioritization

Format the output in Markdown with clear story IDs (US-001, US-002, etc.).`,

  architect: `You are a Senior Software Architect designing the system architecture.
Based on the requirements and user stories, create a detailed architecture document.

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

  scrum_master: `You are a Scrum Master preparing stories for development.
Based on user stories and architecture, create detailed sprint plans.

Include:
1. Sprint Goal Definition
2. Story Refinement Details
3. Technical Context for each story
4. Dependency Resolution Plan
5. Risk Mitigation Strategies
6. Team Capacity Planning
7. Definition of Ready Checklist

Format the output in Markdown with clear sprint structure.`,

  developer: `You are a Senior Software Developer implementing the solution.
Based on the architecture and sprint plan, generate implementation artifacts.

Include:
1. Core Code Structure (file organization)
2. Key Components/Services (with code snippets)
3. API Endpoints
4. Database Schema
5. Configuration Files
6. Testing Strategy
7. Deployment Scripts

Format the output in Markdown with code blocks. Use TypeScript/React for frontend, Node.js for backend.`,

  qa_tester: `You are a Senior QA Engineer creating comprehensive test strategies.
Based on all previous artifacts, generate test plans.

Include:
1. Test Strategy Overview
2. Test Cases (TC-001, TC-002, etc.)
3. Integration Test Scenarios
4. E2E Test Scenarios
5. Performance Test Plan
6. Security Test Checklist
7. Bug Tracking Template

Format the output in Markdown with clear test IDs and expected results.`,

  orchestrator: `You are the BMAD Orchestrator coordinating all agents.
Analyze all artifacts and create a comprehensive project orchestration plan.

Include:
1. Phase Completion Status
2. Cross-Agent Dependencies
3. Quality Gate Checks
4. Risk Assessment Across All Phases
5. Resource Allocation Optimization
6. Timeline Synchronization
7. Next Steps Recommendations

Format the output in Markdown with executive summary.`
};

const PHASE_ARTIFACT_TYPES = {
  business_analyst: 'business_requirements',
  product_manager: 'product_vision',
  ux_expert: 'ux_wireframes',
  product_owner: 'user_stories',
  architect: 'technical_architecture',
  scrum_master: 'sprint_plan',
  developer: 'story_file',
  qa_tester: 'test_plan',
  orchestrator: 'orchestration_log'
};

// Provider detection based on model name
function detectProvider(model: string): 'openai' | 'anthropic' | 'gemini' {
  const lower = model.toLowerCase();
  if (
    lower.startsWith('gpt-') ||
    lower.startsWith('o1-') ||
    lower.startsWith('o3-') ||
    lower.startsWith('o4-') ||
    lower.startsWith('openai/')
  ) {
    return 'openai';
  }
  if (lower.startsWith('claude-') || lower.startsWith('anthropic/')) {
    return 'anthropic';
  }
  return 'gemini'; // google/gemini-* and bare gemini-* → Gemini API direct
}

function stripProviderPrefix(model: string): string {
  return model.includes('/') ? model.split('/').slice(-1)[0] : model;
}

// OpenAI direct API call
async function callOpenAI(model: string, messages: Array<{role: string, content: string}>) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: stripProviderPrefix(model),
      messages,
      max_completion_tokens: 4000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

// Anthropic direct API call
async function callAnthropic(model: string, messages: Array<{role: string, content: string}>) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Anthropic has a different message format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: stripProviderPrefix(model),
      system: systemMessage,
      messages: userMessages,
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens
    }
  };
}

// Google Gemini direct API call (via GEMINI_API_KEY, not Lovable Gateway).
async function callGeminiProvider(model: string, messages: Array<{role: string, content: string}>) {
  const result = await callGemini({
    model,
    messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: 0.7,
    maxOutputTokens: 8192,
  });
  return {
    content: result.content,
    usage: result.usage,
  };
}

// Unified AI provider call — no Lovable Gateway anymore.
async function callAIProvider(model: string, messages: Array<{role: string, content: string}>) {
  const provider = detectProvider(model);
  console.log('Using AI provider:', provider, 'with model:', model);

  switch (provider) {
    case 'openai':
      return await callOpenAI(model, messages);
    case 'anthropic':
      return await callAnthropic(model, messages);
    case 'gemini':
    default:
      return await callGeminiProvider(model, messages);
  }
}

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

    // Ownership check
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (session.created_by !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

    const selectedModel = session.settings?.ai_model || 'google/gemini-2.5-flash';
    console.log('Calling AI with model:', selectedModel);

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

    // Call appropriate AI provider
    const { content: generatedContent, usage } = await callAIProvider(selectedModel, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

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
