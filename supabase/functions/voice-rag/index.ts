import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting in-memory store (production should use Redis/Supabase)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // 10 requests
const RATE_LIMIT_WINDOW = 60000; // per minute

function getRateLimitKey(req: Request): string {
  // Use IP or user-agent as key (in production, use auth.uid())
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetAt) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  // Increment count
  limit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const rateLimitKey = getRateLimitKey(req);

  try {
    // Check rate limit
    if (!checkRateLimit(rateLimitKey)) {
      console.warn(`⚠️ Rate limit exceeded for ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a minute.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data', code: 'INVALID_CONTENT_TYPE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string || 'de';

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided', code: 'MISSING_AUDIO' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Maximum size is 10MB, received ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`,
          code: 'FILE_TOO_LARGE'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Forwarding audio to n8n: ${audioFile.size} bytes, language: ${language}`);

    // Get n8n webhook URL from secrets
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || 
                          'https://jule-haitz.n8n-wsk.com/voice-rag';

    // Forward to n8n webhook
    const n8nFormData = new FormData();
    n8nFormData.append('audio', audioFile);
    n8nFormData.append('language', language);

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: n8nFormData,
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error(`❌ n8n webhook error: ${webhookResponse.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process audio with AI service',
          code: 'WEBHOOK_ERROR',
          details: webhookResponse.statusText
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await webhookResponse.json();
    const processingTime = Date.now() - startTime;

    console.log(`✅ Voice RAG completed in ${processingTime}ms`);
    console.log(`📊 Response keys: ${Object.keys(result).join(', ')}`);

    // Return result to frontend
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error in voice-rag function (${processingTime}ms):`, error);

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';

    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        statusCode = 504;
        errorCode = 'TIMEOUT';
        errorMessage = 'Request timed out. The AI service took too long to respond.';
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
