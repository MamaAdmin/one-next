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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const baseUrl = 'https://yourdomain.com'; // Configure your domain

    console.log('Generating sitemap...');

    // Fetch published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    // Fetch active courses
    const { data: courses } = await supabase
      .from('lms_courses')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Generate XML sitemap
    const urls = [
      // Static pages
      { loc: baseUrl, lastmod: new Date().toISOString(), priority: '1.0' },
      { loc: `${baseUrl}/about`, lastmod: new Date().toISOString(), priority: '0.8' },
      { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString(), priority: '0.9' },
      { loc: `${baseUrl}/faq`, lastmod: new Date().toISOString(), priority: '0.7' },
      
      // Dynamic articles
      ...(articles || []).map((article) => ({
        loc: `${baseUrl}/blog/${article.slug}`,
        lastmod: article.updated_at,
        priority: '0.8',
      })),
      
      // Dynamic courses
      ...(courses || []).map((course) => ({
        loc: `${baseUrl}/courses/${course.slug}`,
        lastmod: course.updated_at,
        priority: '0.8',
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log(`Generated sitemap with ${urls.length} URLs`);

    // Store sitemap (optional - you could also return it directly)
    const { error: storageError } = await supabase.storage
      .from('public')
      .upload('sitemap.xml', new Blob([sitemap], { type: 'application/xml' }), {
        upsert: true,
        contentType: 'application/xml',
      });

    if (storageError) console.error('Error storing sitemap:', storageError);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
