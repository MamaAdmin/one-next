import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { session_id } = await req.json();

    // Fetch session
    const { data: session, error: sessionError } = await supabaseClient
      .from('bmad_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError) throw sessionError;

    console.log('Starting all phases for session:', session_id);

    // Initialize progress tracking
    await supabaseClient
      .from('bmad_sessions')
      .update({
        metadata: {
          ...session.settings,
          phase_progress: {
            business_analyst: 'pending',
            manager: 'pending',
            architect: 'pending',
            developer: 'pending'
          },
          started_all_phases_at: new Date().toISOString(),
          current_phase_number: 0
        }
      })
      .eq('id', session_id);

    // Run all phases sequentially
    for (let i = 0; i < PHASE_ORDER.length; i++) {
      const phase = PHASE_ORDER[i];
      console.log(`Starting phase ${i + 1}/4: ${phase}`);

      // Update progress to running
      await supabaseClient
        .from('bmad_sessions')
        .update({
          metadata: {
            ...session.settings,
            phase_progress: {
              business_analyst: i >= 0 ? (i > 0 ? 'completed' : 'running') : 'pending',
              manager: i >= 1 ? (i > 1 ? 'completed' : 'running') : 'pending',
              architect: i >= 2 ? (i > 2 ? 'completed' : 'running') : 'pending',
              developer: i >= 3 ? 'running' : 'pending'
            },
            current_phase_number: i + 1
          }
        })
        .eq('id', session_id);

      // Run current phase
      try {
        const runPhaseResponse = await supabaseClient.functions.invoke('bmad-run-phase', {
          body: { session_id, agent_type: phase }
        });

        if (runPhaseResponse.error) {
          throw new Error(`Phase ${phase} failed: ${runPhaseResponse.error.message}`);
        }

        const artifact = runPhaseResponse.data;
        console.log(`Phase ${phase} completed, artifact created:`, artifact.id);

        // Check if approval is required
        if (session.settings?.require_approval) {
          console.log(`Approval required for phase ${phase}, checking...`);
          
          // Poll for approval (wait up to 5 minutes)
          let approved = false;
          let attempts = 0;
          const maxAttempts = 60; // 60 attempts * 5 seconds = 5 minutes

          while (!approved && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            const { data: artifactCheck } = await supabaseClient
              .from('bmad_artifacts')
              .select('is_approved')
              .eq('id', artifact.id)
              .single();

            if (artifactCheck?.is_approved === true) {
              approved = true;
              console.log(`Phase ${phase} approved`);
            } else if (artifactCheck?.is_approved === false) {
              throw new Error(`Phase ${phase} was rejected`);
            }
            
            attempts++;
          }

          if (!approved) {
            throw new Error(`Phase ${phase} approval timeout after 5 minutes`);
          }
        }

        // Progress to next phase (if not last phase)
        if (i < PHASE_ORDER.length - 1) {
          const progressResponse = await supabaseClient.functions.invoke('bmad-progress-phase', {
            body: { session_id }
          });

          if (progressResponse.error) {
            throw new Error(`Failed to progress from ${phase}: ${progressResponse.error.message}`);
          }

          console.log(`Progressed to next phase after ${phase}`);
        }

        // Mark phase as completed
        const progressUpdate: any = {
          business_analyst: i >= 0 ? 'completed' : 'pending',
          manager: i >= 1 ? 'completed' : 'pending',
          architect: i >= 2 ? 'completed' : 'pending',
          developer: i >= 3 ? 'completed' : 'pending'
        };

        await supabaseClient
          .from('bmad_sessions')
          .update({
            metadata: {
              ...session.settings,
              phase_progress: progressUpdate,
              current_phase_number: i + 1
            }
          })
          .eq('id', session_id);

      } catch (phaseError) {
        console.error(`Error in phase ${phase}:`, phaseError);
        
        // Mark phase as error
        const errorUpdate: any = {
          business_analyst: i >= 0 ? (i > 0 ? 'completed' : 'error') : 'pending',
          manager: i >= 1 ? (i > 1 ? 'completed' : 'error') : 'pending',
          architect: i >= 2 ? (i > 2 ? 'completed' : 'error') : 'pending',
          developer: i >= 3 ? 'error' : 'pending'
        };

        const errorMessage = phaseError instanceof Error ? phaseError.message : 'Unknown error';

        await supabaseClient
          .from('bmad_sessions')
          .update({
            metadata: {
              ...session.settings,
              phase_progress: errorUpdate,
              current_phase_number: i + 1,
              error_message: errorMessage
            }
          })
          .eq('id', session_id);

        throw phaseError;
      }
    }

    // Mark session as completed
    await supabaseClient
      .from('bmad_sessions')
      .update({
        status: 'completed',
        metadata: {
          ...session.settings,
          phase_progress: {
            business_analyst: 'completed',
            manager: 'completed',
            architect: 'completed',
            developer: 'completed'
          },
          completed_all_phases_at: new Date().toISOString()
        }
      })
      .eq('id', session_id);

    console.log('All phases completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'All phases completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bmad-run-all-phases:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
