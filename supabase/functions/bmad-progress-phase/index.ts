import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHASE_ORDER = [
  'business_analyst',
  'product_manager', 
  'ux_expert',
  'product_owner',
  'architect',
  'scrum_master',
  'developer',
  'qa_tester',
  'orchestrator'
];

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

    const { session_id } = await req.json();

    console.log('Progressing to next phase:', { session_id });

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

    const currentPhaseIndex = PHASE_ORDER.indexOf(session.current_phase);
    
    if (currentPhaseIndex === -1) {
      throw new Error('Invalid current phase');
    }


    // Check if this is the last phase
    if (currentPhaseIndex === PHASE_ORDER.length - 1) {
      // Mark session as completed
      const { data: updatedSession, error: updateError } = await supabase
        .from('bmad_sessions')
        .update({
          status: 'completed',
          current_phase: 'orchestrator',
          updated_at: new Date().toISOString()
        })
        .eq('id', session_id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('Session completed');
      return new Response(
        JSON.stringify({ session: updatedSession, completed: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Progress to next phase
    const nextPhase = PHASE_ORDER[currentPhaseIndex + 1];
    const updates: any = {
      current_phase: nextPhase,
      updated_at: new Date().toISOString()
    };

    // Update status based on phase index
    if (currentPhaseIndex === 0) {
      // Von Business Analyst → Product Manager
      updates.planning_completed_at = new Date().toISOString();
    } else if (currentPhaseIndex === 4) {
      // Von Architect → Scrum Master (Start Development)
      updates.status = 'development';
      updates.development_started_at = new Date().toISOString();
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from('bmad_sessions')
      .update(updates)
      .eq('id', session_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw updateError;
    }

    console.log('Session progressed to:', nextPhase);

    return new Response(
      JSON.stringify({ session: updatedSession, next_phase: nextPhase }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bmad-progress-phase:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
