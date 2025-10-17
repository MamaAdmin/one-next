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

    const { data: session } = await supabase
      .from("bmad_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      throw new Error("Session not found");
    }

    // Query database schema information
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    const tableList = tables?.map(t => t.table_name).join(", ") || "N/A";

    // Create flattened repository overview
    const repoOverview = `# Repository Overview

## Project Information
- **Title**: ${session.title}
- **Description**: ${session.description || 'N/A'}
- **Generated**: ${new Date().toISOString()}

## Technology Stack
- **Frontend**: React 18.3.1, TypeScript, Tailwind CSS
- **Backend**: Supabase (Lovable Cloud)
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui, Radix UI
- **Build Tool**: Vite
- **Forms**: React Hook Form + Zod

## Database Schema
**Tables**: ${tables?.length || 0}
${tableList}

## Project Structure
\`\`\`
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── lms/          # LMS-specific components
│   ├── admin/        # Admin components
│   └── blog/         # Blog components
├── pages/            # Page components (React Router)
│   ├── admin/        # Admin dashboard pages
│   └── lms/          # LMS pages
├── hooks/            # Custom React hooks
├── integrations/     # Supabase integration
└── lib/              # Utility functions

supabase/
├── functions/        # Edge Functions (Deno)
└── migrations/       # Database migrations
\`\`\`

## Key Features
1. **Workshop Management**: Design Sprint & Problem Framing workshops
2. **LMS Platform**: Course management with modules and toolboxes
3. **Admin Dashboard**: Content management and analytics
4. **AI Integration**: Voice RAG bot, AI consulting services
5. **Authentication**: Supabase Auth with role-based access
6. **Payment Integration**: Stripe for course purchases

## Edge Functions
Available backend functions:
- bmad-orchestrator (AI agent orchestration)
- bmad-story-generator (Story file generation)
- bmad-repo-flattener (This function)
- create-checkout-session (Stripe integration)
- voice-rag (Voice AI assistant)
- [Additional functions available in supabase/functions/]

## Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_PROJECT_ID

## Development Workflow
1. Frontend runs on Vite dev server
2. Backend uses Supabase Edge Functions (Deno)
3. Database migrations via Lovable Cloud
4. Real-time updates via Supabase Realtime

## Security
- Row Level Security (RLS) enabled on all tables
- Admin role checks via \`has_role()\` function
- JWT verification on Edge Functions
- Input sanitization with Zod schemas

This overview provides context for AI-driven development and code generation.
`;

    // Save as artifact
    const { data: artifact, error: artifactError } = await supabase
      .from("bmad_artifacts")
      .insert({
        session_id: sessionId,
        agent_type: 'architect',
        artifact_type: 'flattened_repo',
        title: 'Repository Context & Structure',
        content: repoOverview,
        metadata: {
          tables_count: tables?.length || 0,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (artifactError) {
      throw artifactError;
    }

    return new Response(
      JSON.stringify({ artifact }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in bmad-repo-flattener:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
