import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CLASSES, getClassSpells, type Spell } from "./spells";

export const ROWS = 2;
export const COLS = 18;

export const slotKey = (row: number, col: number) => `${row}-${col}`;

// Default keybinds for Blizzard-style bar 1 and bar 2 (bar 2 is "bottom right" or shift-modified).
const DEFAULT_KEYBINDS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const row0 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "F1", "F2", "F3", "F4", "F5", "F6"];
  const row1 = ["S+1", "S+2", "S+3", "S+4", "S+5", "S+6", "Q", "E", "R", "T", "F", "G", "Z", "X", "C", "V", "B", "Y"];
  row0.forEach((k, i) => (out[slotKey(0, i)] = k));
  row1.forEach((k, i) => (out[slotKey(1, i)] = k));
  return out;
})();

// Per-class/spec spell placement. assignments[classId][specId][slotKey] = spellId
export type Assignments = Record<string, Record<string, Record<string, string>>>;

export interface CustomSpell extends Spell {
  source: "custom";
  spellId?: number;
}

interface State {
  // Global keybind labels (same on every class)
  keybinds: Record<string, string>;
  setKeybind: (key: string, value: string) => void;
  // Per-class/spec slot -> spellId
  assignments: Assignments;
  placeSpell: (classId: string, specId: string, key: string, spellId: string | null) => void;
  swapSlots: (classId: string, specId: string, fromKey: string, toKey: string) => void;
  // User-added spells
  customSpells: CustomSpell[];
  addCustomSpell: (s: Omit<CustomSpell, "source">) => void;
  removeCustomSpell: (id: string) => void;
  // Class selection
  selectedClassId: string;
  selectedSpecId: string;
  selectClass: (classId: string, specId?: string) => void;
  selectSpec: (specId: string) => void;
  // Reset current class layout
  clearCurrentLayout: () => void;
}

const Ctx = createContext<State | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [keybinds, setKeybinds] = useLocalStorage<Record<string, string>>("wowkb:v2:keybinds", DEFAULT_KEYBINDS);
  const [assignments, setAssignments] = useLocalStorage<Assignments>("wowkb:v2:assignments", {});
  const [customSpells, setCustomSpells] = useLocalStorage<CustomSpell[]>("wowkb:v2:custom", []);
  const [selectedClassId, setSelectedClassId] = useLocalStorage<string>("wowkb:v2:class", "mage");
  const [selectedSpecId, setSelectedSpecId] = useLocalStorage<string>("wowkb:v2:spec", "frost");

  const setKeybind = useCallback((key: string, value: string) => {
    setKeybinds((prev) => ({ ...prev, [key]: value }));
  }, [setKeybinds]);

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
  }, [setAssignments]);

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
  }, [setAssignments]);

  const addCustomSpell = useCallback((s: Omit<CustomSpell, "source">) => {
    setCustomSpells((prev) => {
      if (prev.some((p) => p.id === s.id)) return prev;
      return [{ ...s, source: "custom" }, ...prev];
    });
  }, [setCustomSpells]);

  const removeCustomSpell = useCallback((id: string) => {
    setCustomSpells((prev) => prev.filter((s) => s.id !== id));
  }, [setCustomSpells]);

  const selectClass = useCallback((classId: string, specId?: string) => {
    setSelectedClassId(classId);
    const cls = CLASSES.find((c) => c.id === classId);
    setSelectedSpecId(specId ?? cls?.specs[0]?.id ?? "");
  }, [setSelectedClassId, setSelectedSpecId]);

  const selectSpec = useCallback((specId: string) => setSelectedSpecId(specId), [setSelectedSpecId]);

  const clearCurrentLayout = useCallback(() => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (next[selectedClassId]) {
        next[selectedClassId] = { ...next[selectedClassId] };
        delete next[selectedClassId][selectedSpecId];
      }
      return next;
    });
  }, [setAssignments, selectedClassId, selectedSpecId]);

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
  }), [keybinds, setKeybind, assignments, placeSpell, swapSlots, customSpells, addCustomSpell, removeCustomSpell, selectedClassId, selectedSpecId, selectClass, selectSpec, clearCurrentLayout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Resolve a slot's spell for the current class/spec.
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
