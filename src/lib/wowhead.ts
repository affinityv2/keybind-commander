// Fetch a spell's name + icon from Wowhead by spell ID.
// Uses Wowhead's public tooltip JSON endpoint (CORS-friendly).
// Returns null on failure so caller can fall back to manual entry.

export interface WowheadSpellMeta {
  name: string;
  icon: string;
  spellId: number;
}

const ENDPOINTS = [
  (id: number) => `https://nether.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
  (id: number) => `https://www.wowhead.com/tooltip/spell/${id}?dataEnv=1&locale=0`,
];

export async function fetchWowheadSpell(spellId: number): Promise<WowheadSpellMeta | null> {
  for (const make of ENDPOINTS) {
    try {
      const res = await fetch(make(spellId), { headers: { Accept: "application/json" } });
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

// Parse a Wowhead URL or raw ID. Returns the spell id or null.
export function parseSpellIdInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Pure numeric
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  // wowhead URL: https://www.wowhead.com/spell=45438/ice-block
  const m = trimmed.match(/spell[=\/](\d+)/i);
  if (m) return Number(m[1]);
  return null;
}
