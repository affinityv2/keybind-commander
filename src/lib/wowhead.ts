export interface WowheadSpellMeta {
  name: string;
  icon: string;
  spellId: number;
}

const SUPABASE_URL: string | undefined = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY: string | undefined = import.meta.env?.VITE_SUPABASE_ANON_KEY;

const DIRECT_ENDPOINTS = [
  (id: number) => `https://nether.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
  (id: number) => `https://www.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
];

export async function fetchWowheadSpell(spellId: number): Promise<WowheadSpellMeta | null> {
  // Try Supabase edge function proxy first (no CORS issues)
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/wowhead-proxy?id=${spellId}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        const json: unknown = await res.json();
        if (json && typeof json === "object") {
          const obj = json as Record<string, unknown>;
          const name = typeof obj.name === "string" ? obj.name : null;
          const icon = typeof obj.icon === "string" ? obj.icon : null;
          if (name && icon && typeof obj.spellId === "number") {
            return { name, icon, spellId: obj.spellId };
          }
        }
      }
    } catch {
      // fall through to direct endpoints
    }
  }

  // Fallback: try direct Wowhead endpoints (may fail due to CORS)
  for (const makeUrl of DIRECT_ENDPOINTS) {
    try {
      const res = await fetch(makeUrl(spellId), { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      if (json && typeof json === "object") {
        const obj = json as Record<string, unknown>;
        const name = typeof obj.name === "string" ? obj.name
          : typeof obj.name_enus === "string" ? obj.name_enus
          : null;
        const icon = typeof obj.icon === "string" ? obj.icon : null;
        if (name && icon) {
          return { name, icon: icon.toLowerCase(), spellId };
        }
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
}

export function parseSpellIdInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const m = trimmed.match(/spell[=\/](\d+)/i);
  if (m) return Number(m[1]);
  return null;
}
