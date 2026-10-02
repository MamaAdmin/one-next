const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  // Measurement-ID ist öffentlich (steht ohnehin im Browser-Tag)
  const id = (Deno.env.get("GOOGLE_ANALYTICS_MEASUREMENT_ID") ?? "").trim();
  return new Response(JSON.stringify({ id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
  });
});
