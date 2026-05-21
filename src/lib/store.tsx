import { createContext, useContext, useMemo, useCallback, useState, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CLASSES, getClassSpells, type Spell } from "./spells";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

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
  // Auth
  user: User | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<State | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Local state (used as cache, synced to Supabase when logged in)
  const [keybinds, setKeybinds] = useLocalStorage<Record<string, string>>("wowkb:v2:keybinds", DEFAULT_KEYBINDS);
  const [assignments, setAssignments] = useLocalStorage<Assignments>("wowkb:v2:assignments", {});
  const [customSpells, setCustomSpells] = useLocalStorage<CustomSpell[]>("wowkb:v2:custom", []);
  const [selectedClassId, setSelectedClassId] = useLocalStorage<string>("wowkb:v2:class", "mage");
  const [selectedSpecId, setSelectedSpecId] = useLocalStorage<string>("wowkb:v2:spec", "frost");

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load data from Supabase for the current user
  const loadFromSupabase = useCallback(async (userId: string) => {
    try {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("selected_class, selected_spec")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setSelectedClassId(profile.selected_class);
        setSelectedSpecId(profile.selected_spec);
      }

      // Load keybinds
      const { data: kbRows } = await supabase
        .from("keybinds")
        .select("slot_key, label")
        .eq("user_id", userId);

      if (kbRows && kbRows.length > 0) {
        const kbMap: Record<string, string> = {};
        for (const r of kbRows) {
          kbMap[r.slot_key] = r.label;
        }
        setKeybinds(kbMap);
      }

      // Load assignments
      const { data: assignRows } = await supabase
        .from("assignments")
        .select("class_id, spec_id, slot_key, spell_id")
        .eq("user_id", userId);

      if (assignRows && assignRows.length > 0) {
        const aMap: Assignments = {};
        for (const r of assignRows) {
          if (!aMap[r.class_id]) aMap[r.class_id] = {};
          if (!aMap[r.class_id][r.spec_id]) aMap[r.class_id][r.spec_id] = {};
          aMap[r.class_id][r.spec_id][r.slot_key] = r.spell_id;
        }
        setAssignments(aMap);
      }

      // Load custom spells
      const { data: csRows } = await supabase
        .from("custom_spells")
        .select("spell_id, name, icon, categories, wowhead_spell_id")
        .eq("user_id", userId);

      if (csRows && csRows.length > 0) {
        const csList: CustomSpell[] = csRows.map((r) => ({
          id: r.spell_id,
          name: r.name,
          icon: r.icon,
          categories: Array.isArray(r.categories) ? r.categories : [],
          source: "custom" as const,
          spellId: r.wowhead_spell_id ?? undefined,
        }));
        setCustomSpells(csList);
      }
    } catch {
      // Silently fall back to localStorage data
    }
  }, [setKeybinds, setAssignments, setCustomSpells, setSelectedClassId, setSelectedSpecId]);

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
      }
    );

    return () => subscription.unsubscribe();
  }, [loadFromSupabase]);

  // Sync helpers — persist to Supabase when logged in
  const syncKeybind = useCallback(async (userId: string, slotKey: string, label: string) => {
    await supabase.from("keybinds").upsert(
      { user_id: userId, slot_key: slotKey, label },
      { onConflict: "user_id,slot_key" },
    );
  }, []);

  const syncDeleteKeybind = useCallback(async (userId: string, slotKey: string) => {
    await supabase.from("keybinds")
      .delete()
      .eq("user_id", userId)
      .eq("slot_key", slotKey);
  }, []);

  const syncAssignment = useCallback(async (userId: string, classId: string, specId: string, slotKey: string, spellId: string) => {
    await supabase.from("assignments").upsert(
      { user_id: userId, class_id: classId, spec_id: specId, slot_key: slotKey, spell_id: spellId },
      { onConflict: "user_id,class_id,spec_id,slot_key" },
    );
  }, []);

  const syncDeleteAssignment = useCallback(async (userId: string, classId: string, specId: string, slotKey: string) => {
    await supabase.from("assignments")
      .delete()
      .eq("user_id", userId)
      .eq("class_id", classId)
      .eq("spec_id", specId)
      .eq("slot_key", slotKey);
  }, []);

  const syncCustomSpell = useCallback(async (userId: string, s: Omit<CustomSpell, "source">) => {
    await supabase.from("custom_spells").upsert(
      {
        user_id: userId,
        spell_id: s.id,
        name: s.name,
        icon: s.icon,
        categories: s.categories,
        wowhead_spell_id: s.spellId ?? null,
      },
      { onConflict: "user_id,spell_id" },
    );
  }, []);

  const syncDeleteCustomSpell = useCallback(async (userId: string, spellId: string) => {
    await supabase.from("custom_spells")
      .delete()
      .eq("user_id", userId)
      .eq("spell_id", spellId);
  }, []);

  const syncProfile = useCallback(async (userId: string, selectedClass: string, selectedSpec: string) => {
    await supabase.from("profiles").upsert(
      { id: userId, selected_class: selectedClass, selected_spec: selectedSpec, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  }, []);

  // Store actions
  const setKeybind = useCallback((key: string, value: string) => {
    setKeybinds((prev) => ({ ...prev, [key]: value }));
    if (user) {
      if (value) {
        syncKeybind(user.id, key, value);
      } else {
        syncDeleteKeybind(user.id, key);
      }
    }
  }, [setKeybinds, user, syncKeybind, syncDeleteKeybind]);

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
        syncAssignment(user.id, classId, specId, key, spellId);
      } else {
        syncDeleteAssignment(user.id, classId, specId, key);
      }
    }
  }, [setAssignments, user, syncAssignment, syncDeleteAssignment]);

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
      // Read current state to sync properly — fire and forget
      const cur = assignments[classId]?.[specId] ?? {};
      const a = cur[fromKey];
      const b = cur[toKey];
      if (b) syncAssignment(user.id, classId, specId, fromKey, b);
      else syncDeleteAssignment(user.id, classId, specId, fromKey);
      if (a) syncAssignment(user.id, classId, specId, toKey, a);
      else syncDeleteAssignment(user.id, classId, specId, toKey);
    }
  }, [setAssignments, assignments, user, syncAssignment, syncDeleteAssignment]);

  const addCustomSpell = useCallback((s: Omit<CustomSpell, "source">) => {
    setCustomSpells((prev) => {
      if (prev.some((p) => p.id === s.id)) return prev;
      return [{ ...s, source: "custom" }, ...prev];
    });
    if (user) {
      syncCustomSpell(user.id, s);
    }
  }, [setCustomSpells, user, syncCustomSpell]);

  const removeCustomSpell = useCallback((id: string) => {
    setCustomSpells((prev) => prev.filter((s) => s.id !== id));
    if (user) {
      syncDeleteCustomSpell(user.id, id);
    }
  }, [setCustomSpells, user, syncDeleteCustomSpell]);

  const selectClass = useCallback((classId: string, specId?: string) => {
    setSelectedClassId(classId);
    const cls = CLASSES.find((c) => c.id === classId);
    const spec = specId ?? cls?.specs[0]?.id ?? "";
    setSelectedSpecId(spec);
    if (user) {
      syncProfile(user.id, classId, spec);
    }
  }, [setSelectedClassId, setSelectedSpecId, user, syncProfile]);

  const selectSpec = useCallback((specId: string) => {
    setSelectedSpecId(specId);
    if (user) {
      syncProfile(user.id, selectedClassId, specId);
    }
  }, [setSelectedSpecId, selectedClassId, user, syncProfile]);

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
      supabase.from("assignments")
        .delete()
        .eq("user_id", user.id)
        .eq("class_id", selectedClassId)
        .eq("spec_id", selectedSpecId);
    }
  }, [setAssignments, selectedClassId, selectedSpecId, user]);

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
