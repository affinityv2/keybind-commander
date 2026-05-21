import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CATEGORIES, type CategoryId } from "./categories";
import { CLASSES, getClassSpells } from "./spells";

export interface Slot {
  keybind: string;
  categoryId: CategoryId | null;
}

export interface BarConfig {
  slots: Slot[];
}

// assignments[classId][specId][slotIndex] = spellId
export type Assignments = Record<string, Record<string, Record<number, string>>>;

interface State {
  bar: BarConfig;
  setBar: (b: BarConfig) => void;
  assignments: Assignments;
  assign: (classId: string, specId: string, slotIndex: number, spellId: string | null) => void;
  selectedClassId: string;
  selectedSpecId: string;
  selectClass: (classId: string, specId?: string) => void;
  selectSpec: (specId: string) => void;
}

const Ctx = createContext<State | null>(null);

const DEFAULT_KEYBINDS = ["1", "2", "3", "4", "5", "Q", "E", "R", "T", "F", "G", "Z", "X", "C", "V", "Shift+1", "Shift+2", "Shift+3"];

// Default categories ordered to fit the first 12 slots nicely
const DEFAULT_CATEGORY_ORDER: CategoryId[] = [
  "defensive",
  "immunity",
  "self_heal",
  "execute",
  "raid_cd",
  "major_cd",
  "burst_cd",
  "movement",
  "interrupt",
  "aoe_dmg",
  "stun",
  "cc",
  "gap_closer",
  "dispel",
  "purge",
  "utility_1",
  "utility_2",
  "totem_trinket",
];

function defaultBar(slotCount = 12): BarConfig {
  const slots: Slot[] = [];
  for (let i = 0; i < slotCount; i++) {
    const catId = DEFAULT_CATEGORY_ORDER[i] ?? null;
    slots.push({
      keybind: DEFAULT_KEYBINDS[i] ?? "",
      categoryId: catId,
    });
  }
  return { slots };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bar, setBar] = useLocalStorage<BarConfig>("wowkb:bar", defaultBar(12));
  const [assignments, setAssignments] = useLocalStorage<Assignments>("wowkb:assignments", {});
  const [selectedClassId, setSelectedClassId] = useLocalStorage<string>("wowkb:class", "mage");
  const [selectedSpecId, setSelectedSpecId] = useLocalStorage<string>("wowkb:spec", "frost");

  const value = useMemo<State>(() => ({
    bar,
    setBar,
    assignments,
    assign: (classId, specId, slotIndex, spellId) => {
      setAssignments((prev) => {
        const next = { ...prev };
        next[classId] = { ...(next[classId] ?? {}) };
        next[classId][specId] = { ...(next[classId][specId] ?? {}) };
        if (spellId === null) {
          delete next[classId][specId][slotIndex];
        } else {
          next[classId][specId][slotIndex] = spellId;
        }
        return next;
      });
    },
    selectedClassId,
    selectedSpecId,
    selectClass: (classId, specId) => {
      setSelectedClassId(classId);
      const cls = CLASSES.find((c) => c.id === classId);
      const newSpec = specId ?? cls?.specs[0]?.id ?? "";
      setSelectedSpecId(newSpec);
    },
    selectSpec: (specId) => setSelectedSpecId(specId),
  }), [bar, setBar, assignments, setAssignments, selectedClassId, selectedSpecId, setSelectedClassId, setSelectedSpecId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Resolve which spell is shown in a slot for the current class/spec.
// If user manually assigned: that spell. Otherwise: first spell from class
// whose categories include the slot's category.
export function resolveSlotSpell(
  classId: string,
  specId: string,
  slotIndex: number,
  slot: Slot,
  assignments: Assignments,
): { spellId: string | null; isManual: boolean; isAuto: boolean } {
  const manual = assignments[classId]?.[specId]?.[slotIndex];
  if (manual) {
    // Validate that spell still exists for this class
    const spells = getClassSpells(classId, specId);
    if (spells.some((s) => s.id === manual)) {
      return { spellId: manual, isManual: true, isAuto: false };
    }
  }
  if (!slot.categoryId) return { spellId: null, isManual: false, isAuto: false };
  const spells = getClassSpells(classId, specId);
  const match = spells.find((s) => s.categories.includes(slot.categoryId!));
  return { spellId: match?.id ?? null, isManual: false, isAuto: !!match };
}

export { CATEGORIES };
