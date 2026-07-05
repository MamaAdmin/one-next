import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filePath, bucket = 'blog-images' } = await req.json();

    if (!filePath || typeof filePath !== 'string') {
      throw new Error('filePath is required');
    }

    // Only allow public buckets to prevent bypassing storage RLS on private buckets
    const ALLOWED_BUCKETS = ['blog-images', 'company-logos'];
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return new Response(
        JSON.stringify({ error: 'Bucket not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);


    console.log(`Optimizing image: ${filePath}`);

    // Download original image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError) throw downloadError;

    // Create thumbnail (simplified - in production use a proper image processing library)
    const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
    
    // Upload thumbnail (simplified - would need actual thumbnail generation)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(thumbnailPath, fileData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(thumbnailPath);

    console.log(`Thumbnail created: ${thumbnailUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailPath,
        thumbnailUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error optimizing image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
