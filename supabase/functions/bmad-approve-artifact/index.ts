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

    const { artifact_id, is_approved } = await req.json();

    console.log('Approving artifact:', { artifact_id, is_approved, user_id: user.id });

    // Update the artifact
    const { data: artifact, error: updateError } = await supabase
      .from('bmad_artifacts')
      .update({
        is_approved,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', artifact_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating artifact:', updateError);
      throw updateError;
    }

    console.log('Artifact updated successfully');

    return new Response(
      JSON.stringify({ artifact }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bmad-approve-artifact:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
