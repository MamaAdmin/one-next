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
    const { contentType, contentId, newStatus, userId } = await req.json();

    if (!contentType || !contentId || !newStatus) {
      throw new Error('contentType, contentId, and newStatus are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Sending workflow notification for ${contentType}/${contentId}: ${newStatus}`);

    // Get content details
    const { data: content, error: contentError } = await supabase
      .from(contentType)
      .select('*')
      .eq('id', contentId)
      .single();

    if (contentError) throw contentError;

    // Get user email if userId provided
    let recipientEmail = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      recipientEmail = profile?.email;
    }

    // Send email notification via Resend if API key is configured
    if (resendApiKey && recipientEmail) {
      const statusMessages: Record<string, string> = {
        in_review: 'zur Prüfung eingereicht',
        approved: 'genehmigt',
        rejected: 'abgelehnt',
        published: 'veröffentlicht',
      };

      const message = statusMessages[newStatus] || 'aktualisiert';
      const title = content.title || content.question || 'Inhalt';

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CMS <noreply@yourdomain.com>',
          to: recipientEmail,
          subject: `Workflow Update: ${title}`,
          html: `
            <h2>Workflow Status Update</h2>
            <p>Der Inhalt "<strong>${title}</strong>" wurde ${message}.</p>
            <p><strong>Neuer Status:</strong> ${newStatus}</p>
            <p><a href="${supabaseUrl}/admin">Zum Dashboard</a></p>
          `,
        }),
      });

      console.log(`Notification email sent to ${recipientEmail}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
