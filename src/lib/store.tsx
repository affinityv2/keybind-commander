import { createContext, useContext, useMemo, useCallback, useState, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CLASSES, getClassSpells, type Spell } from "./spells";
import { supabase, type User, type Session } from "./supabase";
import type { CategoryId } from "./categories";

export const ROWS = 2;
export const COLS = 18;

export const slotKey = (row: number, col: number) => `${row}-${col}`;

const DEFAULT_KEYBINDS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const row0 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "F1", "F2", "F3", "F4", "F5", "F6"];
  const row1 = ["S+1", "S+2", "S+3", "S+4", "S+5", "S+6", "Q", "E", "R", "T", "F", "G", "Z", "X", "C", "V", "B", "Y"];
  row0.forEach((k, i) => (out[slotKey(0, i)] = k));
  row1.forEach((k, i) => (out[slotKey(1, i)] = k));
  return out;
})();

export type Assignments = Record<string, Record<string, Record<string, string>>>;

export interface CustomSpell extends Spell {
  source: "custom";
  spellId?: number;
}

interface State {
  keybinds: Record<string, string>;
  setKeybind: (key: string, value: string) => void;
  assignments: Assignments;
  placeSpell: (classId: string, specId: string, key: string, spellId: string | null) => void;
  swapSlots: (classId: string, specId: string, fromKey: string, toKey: string) => void;
  customSpells: CustomSpell[];
  addCustomSpell: (s: Omit<CustomSpell, "source">) => void;
  removeCustomSpell: (id: string) => void;
  selectedClassId: string;
  selectedSpecId: string;
  selectClass: (classId: string, specId?: string) => void;
  selectSpec: (specId: string) => void;
  clearCurrentLayout: () => void;
  user: User | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<State | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [keybinds, setKeybinds] = useLocalStorage<Record<string, string>>("wowkb:v2:keybinds", DEFAULT_KEYBINDS);
  const [assignments, setAssignments] = useLocalStorage<Assignments>("wowkb:v2:assignments", {});
  const [customSpells, setCustomSpells] = useLocalStorage<CustomSpell[]>("wowkb:v2:custom", []);
  const [selectedClassId, setSelectedClassId] = useLocalStorage<string>("wowkb:v2:class", "mage");
  const [selectedSpecId, setSelectedSpecId] = useLocalStorage<string>("wowkb:v2:spec", "frost");

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper: get auth header for Supabase REST calls
  const getAuthHeader = useCallback((): Record<string, string> => {
    // Access the session from the supabase module's internal state
    // We store the token in localStorage, so read it from there
    try {
      const raw = localStorage.getItem("sb-auth-session");
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.access_token) {
          return { Authorization: `Bearer ${session.access_token}` };
        }
      }
    } catch { /* ignore */ }
    return {};
  }, []);

  // Load data from Supabase for the current user
  const loadFromSupabase = useCallback(async (userId: string) => {
    try {
      const authHeader = getAuthHeader();

      // Load profile
      const profileRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=selected_class,selected_spec&id=eq.${userId}&limit=1`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, ...authHeader } },
      );
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData?.[0]) {
          setSelectedClassId(profileData[0].selected_class);
          setSelectedSpecId(profileData[0].selected_spec);
        }
      }

      // Load keybinds
      const kbRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/keybinds?select=slot_key,label&user_id=eq.${userId}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, ...authHeader } },
      );
      if (kbRes.ok) {
        const kbRows = await kbRes.json();
        if (kbRows?.length > 0) {
          const kbMap: Record<string, string> = {};
          for (const r of kbRows) kbMap[r.slot_key] = r.label;
          setKeybinds(kbMap);
        }
      }

      // Load assignments
      const aRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/assignments?select=class_id,spec_id,slot_key,spell_id&user_id=eq.${userId}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, ...authHeader } },
      );
      if (aRes.ok) {
        const aRows = await aRes.json();
        if (aRows?.length > 0) {
          const aMap: Assignments = {};
          for (const r of aRows) {
            if (!aMap[r.class_id]) aMap[r.class_id] = {};
            if (!aMap[r.class_id][r.spec_id]) aMap[r.class_id][r.spec_id] = {};
            aMap[r.class_id][r.spec_id][r.slot_key] = r.spell_id;
          }
          setAssignments(aMap);
        }
      }

      // Load custom spells
      const csRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/custom_spells?select=spell_id,name,icon,categories,wowhead_spell_id&user_id=eq.${userId}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, ...authHeader } },
      );
      if (csRes.ok) {
        const csRows = await csRes.json();
        if (csRows?.length > 0) {
          const csList: CustomSpell[] = csRows.map((r: Record<string, unknown>) => ({
            id: r.spell_id as string,
            name: r.name as string,
            icon: r.icon as string,
            categories: Array.isArray(r.categories) ? r.categories as CategoryId[] : [],
            source: "custom" as const,
            spellId: (r.wowhead_spell_id as number) ?? undefined,
          }));
          setCustomSpells(csList);
        }
      }
    } catch {
      // Silently fall back to localStorage data
    }
  }, [setKeybinds, setAssignments, setCustomSpells, setSelectedClassId, setSelectedSpecId, getAuthHeader]);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadFromSupabase(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        (async () => {
          if (session?.user) {
            setUser(session.user);
            if (event === "SIGNED_IN") {
              await loadFromSupabase(session.user.id);
            }
          } else {
            setUser(null);
          }
        })();
      },
    );

    return () => subscription.unsubscribe();
  }, [loadFromSupabase]);

  // REST helpers for syncing to Supabase
  const restUpsert = useCallback(async (table: string, body: Record<string, unknown>, onConflict: string) => {
    const authHeader = getAuthHeader();
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
      method: "POST",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
        ...authHeader,
      },
      body: JSON.stringify(body),
    });
  }, [getAuthHeader]);

  const restDelete = useCallback(async (table: string, filters: Record<string, string>) => {
    const authHeader = getAuthHeader();
    const qs = Object.entries(filters).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      method: "DELETE",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        ...authHeader,
      },
    });
  }, [getAuthHeader]);

  // Store actions
  const setKeybind = useCallback((key: string, value: string) => {
    setKeybinds((prev) => ({ ...prev, [key]: value }));
    if (user) {
      if (value) {
        restUpsert("keybinds", { user_id: user.id, slot_key: key, label: value }, "user_id,slot_key");
      } else {
        restDelete("keybinds", { user_id: user.id, slot_key: key });
      }
    }
  }, [setKeybinds, user, restUpsert, restDelete]);

  const placeSpell = useCallback((classId: string, specId: string, key: string, spellId: string | null) => {
    setAssignments((prev) => {
      const next = { ...prev };
      next[classId] = { ...(next[classId] ?? {}) };
      next[classId][specId] = { ...(next[classId][specId] ?? {}) };
      if (spellId === null) {
        delete next[classId][specId][key];
      } else {
        next[classId][specId][key] = spellId;
      }
      return next;
    });
    if (user) {
      if (spellId) {
        restUpsert("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: key, spell_id: spellId }, "user_id,class_id,spec_id,slot_key");
      } else {
        restDelete("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: key });
      }
    }
  }, [setAssignments, user, restUpsert, restDelete]);

  const swapSlots = useCallback((classId: string, specId: string, fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setAssignments((prev) => {
      const next = { ...prev };
      next[classId] = { ...(next[classId] ?? {}) };
      next[classId][specId] = { ...(next[classId][specId] ?? {}) };
      const map = next[classId][specId];
      const a = map[fromKey];
      const b = map[toKey];
      if (b === undefined) delete map[fromKey]; else map[fromKey] = b;
      if (a === undefined) delete map[toKey];   else map[toKey] = a;
      return next;
    });
    if (user) {
      const cur = assignments[classId]?.[specId] ?? {};
      const a = cur[fromKey];
      const b = cur[toKey];
      if (b) restUpsert("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: fromKey, spell_id: b }, "user_id,class_id,spec_id,slot_key");
      else restDelete("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: fromKey });
      if (a) restUpsert("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: toKey, spell_id: a }, "user_id,class_id,spec_id,slot_key");
      else restDelete("assignments", { user_id: user.id, class_id: classId, spec_id: specId, slot_key: toKey });
    }
  }, [setAssignments, assignments, user, restUpsert, restDelete]);

  const addCustomSpell = useCallback((s: Omit<CustomSpell, "source">) => {
    setCustomSpells((prev) => {
      if (prev.some((p) => p.id === s.id)) return prev;
      return [{ ...s, source: "custom" }, ...prev];
    });
    if (user) {
      restUpsert("custom_spells", { user_id: user.id, spell_id: s.id, name: s.name, icon: s.icon, categories: s.categories, wowhead_spell_id: s.spellId ?? null }, "user_id,spell_id");
    }
  }, [setCustomSpells, user, restUpsert]);

  const removeCustomSpell = useCallback((id: string) => {
    setCustomSpells((prev) => prev.filter((s) => s.id !== id));
    if (user) {
      restDelete("custom_spells", { user_id: user.id, spell_id: id });
    }
  }, [setCustomSpells, user, restDelete]);

  const selectClass = useCallback((classId: string, specId?: string) => {
    setSelectedClassId(classId);
    const cls = CLASSES.find((c) => c.id === classId);
    const spec = specId ?? cls?.specs[0]?.id ?? "";
    setSelectedSpecId(spec);
    if (user) {
      restUpsert("profiles", { id: user.id, selected_class: classId, selected_spec: spec, updated_at: new Date().toISOString() }, "id");
    }
  }, [setSelectedClassId, setSelectedSpecId, user, restUpsert]);

  const selectSpec = useCallback((specId: string) => {
    setSelectedSpecId(specId);
    if (user) {
      restUpsert("profiles", { id: user.id, selected_class: selectedClassId, selected_spec: specId, updated_at: new Date().toISOString() }, "id");
    }
  }, [setSelectedSpecId, selectedClassId, user, restUpsert]);

  const clearCurrentLayout = useCallback(() => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (next[selectedClassId]) {
        next[selectedClassId] = { ...next[selectedClassId] };
        delete next[selectedClassId][selectedSpecId];
      }
      return next;
    });
    if (user) {
      restDelete("assignments", { user_id: user.id, class_id: selectedClassId, spec_id: selectedSpecId });
    }
  }, [setAssignments, selectedClassId, selectedSpecId, user, restDelete]);

  // Auth actions
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<State>(() => ({
    keybinds,
    setKeybind,
    assignments,
    placeSpell,
    swapSlots,
    customSpells,
    addCustomSpell,
    removeCustomSpell,
    selectedClassId,
    selectedSpecId,
    selectClass,
    selectSpec,
    clearCurrentLayout,
    user,
    authLoading,
    signIn,
    signUp,
    signOut,
  }), [keybinds, setKeybind, assignments, placeSpell, swapSlots, customSpells, addCustomSpell, removeCustomSpell, selectedClassId, selectedSpecId, selectClass, selectSpec, clearCurrentLayout, user, authLoading, signIn, signUp, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function resolveSlot(
  classId: string,
  specId: string,
  key: string,
  assignments: Assignments,
  customSpells: CustomSpell[],
): Spell | null {
  const spellId = assignments[classId]?.[specId]?.[key];
  if (!spellId) return null;
  const classSpells = getClassSpells(classId, specId);
  return classSpells.find((s) => s.id === spellId)
    ?? customSpells.find((s) => s.id === spellId)
    ?? null;
}
