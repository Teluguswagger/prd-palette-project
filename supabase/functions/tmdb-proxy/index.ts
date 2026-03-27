const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE = 'https://api.themoviedb.org/3';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint } = await req.json();

    if (!endpoint || typeof endpoint !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing endpoint' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent path traversal
    if (endpoint.includes('..') || !endpoint.startsWith('/')) {
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'TMDB API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE}${endpoint}${separator}api_key=${apiKey}`;

    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();

    return new Response(JSON.stringify(data), {
      status: tmdbRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
