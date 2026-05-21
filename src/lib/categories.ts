// Fixed thematic categories. Same category = same keybind across all classes.
export type CategoryId =
  | "interrupt"
  | "defensive"
  | "immunity"
  | "movement"
  | "stun"
  | "major_cd"
  | "burst_cd"
  | "self_heal"
  | "cc"
  | "dispel"
  | "purge"
  | "gap_closer"
  | "aoe_dmg"
  | "execute"
  | "raid_cd"
  | "builder"
  | "spender"
  | "dot"
  | "pvp_offensive"
  | "pvp_defensive"
  | "pvp_utility"
  | "utility_1"
  | "utility_2"
  | "totem_trinket";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  defaultKeybind: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "interrupt",     name: "Interrupt",        description: "Kick / silence school lockout", defaultKeybind: "F",       color: "#ef4444" },
  { id: "defensive",     name: "Defensive CD",     description: "Major damage reduction",        defaultKeybind: "1",       color: "#3b82f6" },
  { id: "immunity",      name: "Immunity",         description: "Full immunity / cheat death",   defaultKeybind: "2",       color: "#06b6d4" },
  { id: "movement",      name: "Movement",         description: "Speed boost / blink",           defaultKeybind: "Q",       color: "#a78bfa" },
  { id: "gap_closer",    name: "Gap Closer",       description: "Charge / leap to target",       defaultKeybind: "E",       color: "#f472b6" },
  { id: "stun",          name: "Stun",             description: "Hard stun",                     defaultKeybind: "X",       color: "#facc15" },
  { id: "cc",            name: "Crowd Control",    description: "Polymorph / fear / sap",        defaultKeybind: "C",       color: "#c084fc" },
  { id: "major_cd",      name: "Major Offensive",  description: "Big damage cooldown",           defaultKeybind: "R",       color: "#fb923c" },
  { id: "burst_cd",      name: "Burst Window",     description: "Short burst CD",                defaultKeybind: "T",       color: "#fdba74" },
  { id: "aoe_dmg",       name: "AoE Damage",       description: "Multi-target nuke",             defaultKeybind: "G",       color: "#f87171" },
  { id: "execute",       name: "Execute",          description: "Low-HP finisher",               defaultKeybind: "4",       color: "#dc2626" },
  { id: "self_heal",     name: "Self Heal",        description: "Personal heal / regen",         defaultKeybind: "3",       color: "#4ade80" },
  { id: "raid_cd",       name: "Raid CD",          description: "Group damage reduction / heal", defaultKeybind: "5",       color: "#34d399" },
  { id: "dispel",        name: "Dispel",           description: "Remove magic / disease",        defaultKeybind: "V",       color: "#60a5fa" },
  { id: "purge",         name: "Purge",            description: "Strip enemy buff",              defaultKeybind: "Z",       color: "#22d3ee" },
  { id: "builder",       name: "Builder",          description: "Resource generator / filler",   defaultKeybind: "6",       color: "#94a3b8" },
  { id: "spender",       name: "Spender",          description: "Resource consumer / finisher",  defaultKeybind: "7",       color: "#f59e0b" },
  { id: "dot",           name: "DoT",              description: "Damage over time effect",       defaultKeybind: "8",       color: "#a3e635" },
  { id: "pvp_offensive", name: "PvP Offensive",   description: "PvP talent damage ability",     defaultKeybind: "Shift+4", color: "#e11d48" },
  { id: "pvp_defensive", name: "PvP Defensive",    description: "PvP talent defensive ability",  defaultKeybind: "Shift+5", color: "#0ea5e9" },
  { id: "pvp_utility",   name: "PvP Utility",      description: "PvP talent utility / CC",       defaultKeybind: "Shift+6", color: "#8b5cf6" },
  { id: "utility_1",     name: "Utility I",        description: "Class utility slot",            defaultKeybind: "Shift+1", color: "#94a3b8" },
  { id: "utility_2",     name: "Utility II",       description: "Class utility slot",            defaultKeybind: "Shift+2", color: "#94a3b8" },
  { id: "totem_trinket", name: "Trinket / Totem",  description: "On-use trinket or totem",       defaultKeybind: "Shift+3", color: "#fcd34d" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
