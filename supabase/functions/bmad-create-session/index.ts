import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { title, description, project_context, settings, sprint_id, framing_session_id } = await req.json();

    console.log('Creating BMAD session:', { title, user_id: user.id, sprint_id });

    let linkedSprintId: string | null = null;
    let linkedFramingId: string | null = null;

    if (sprint_id) {
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });

      const { data: sprint, error: sprintError } = await supabase
        .from('sprints')
        .select('id, owner_id, status, deleted_at')
        .eq('id', sprint_id)
        .maybeSingle();

      if (sprintError) throw sprintError;
      if (!sprint || sprint.deleted_at) {
        throw new Error('Sprint nicht gefunden');
      }
      if (!isAdmin && sprint.owner_id !== user.id) {
        throw new Error('Kein Zugriff auf diesen Sprint');
      }
      if (sprint.status !== 'done') {
        throw new Error('Der Design Sprint ist noch nicht abgeschlossen');
      }

      linkedSprintId = sprint.id;

      const { data: framing } = await supabase
        .from('framing_sessions')
        .select('id, status')
        .eq('resulting_sprint_id', sprint.id)
        .eq('status', 'done')
        .maybeSingle();

      if (!framing) {
        throw new Error('Das zugehörige Problem Framing ist noch nicht abgeschlossen');
      }
      if (framing_session_id && framing_session_id !== framing.id) {
        throw new Error('Problem Framing passt nicht zum Sprint');
      }
      linkedFramingId = framing.id;
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('bmad_sessions')
      .insert({
        title,
        description,
        project_context,
        status: 'planning',
        current_phase: 'business_analyst',
        created_by: user.id,
        sprint_id: linkedSprintId,
        framing_session_id: linkedFramingId,
        settings: settings || {
          ai_model: 'google/gemini-2.5-flash',
          auto_progress: false,
          require_approval: true
        }
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('BMAD session created successfully:', session.id);

    return new Response(
      JSON.stringify({ session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bmad-create-session:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
