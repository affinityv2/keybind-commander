import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ENDPOINTS = [
  (id: number) => `https://nether.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
  (id: number) => `https://www.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const spellId = Number(url.searchParams.get("id"));

    if (!spellId || isNaN(spellId)) {
      return new Response(JSON.stringify({ error: "Missing or invalid spell id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const makeUrl of ENDPOINTS) {
      try {
        const res = await fetch(makeUrl(spellId), {
          headers: { Accept: "application/json", "User-Agent": "AzerothKeybinds/1.0" },
        });
        if (!res.ok) continue;
        const json: unknown = await res.json();
        if (json && typeof json === "object") {
          const obj = json as Record<string, unknown>;
          const name = typeof obj.name === "string" ? obj.name
            : typeof obj.name_enus === "string" ? obj.name_enus
            : null;
          const icon = typeof obj.icon === "string" ? obj.icon : null;
          if (name && icon) {
            return new Response(JSON.stringify({ name, icon: icon.toLowerCase(), spellId }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch {
        // try next endpoint
      }
    }

    return new Response(JSON.stringify({ error: "Spell not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
