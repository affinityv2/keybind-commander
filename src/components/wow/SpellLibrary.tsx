import { useMemo, useState } from "react";
import { CLASSES, getClassSpells, iconUrl, type Spell } from "@/lib/spells";
import { CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddSpellDialog } from "./AddSpellDialog";

interface LibrarySpell extends Spell {
  source: string; // class name or "Custom"
  sourceColor: string;
}

export function SpellLibrary() {
  const { customSpells, removeCustomSpell, selectedClassId, selectedSpecId } = useStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"class" | "all" | "custom">("class");

  const allSpells = useMemo<LibrarySpell[]>(() => {
    const out: LibrarySpell[] = [];
    const seen = new Set<string>();
    for (const cls of CLASSES) {
      for (const sp of cls.shared) {
        if (seen.has(sp.id)) continue;
        seen.add(sp.id);
        out.push({ ...sp, source: cls.name, sourceColor: cls.color });
      }
      for (const spec of cls.specs) {
        for (const sp of spec.spells) {
          if (seen.has(sp.id)) continue;
          seen.add(sp.id);
          out.push({ ...sp, source: `${cls.name} (${spec.name})`, sourceColor: cls.color });
        }
      }
    }
    return out;
  }, []);

  const classSpells = useMemo<LibrarySpell[]>(() => {
    const cls = CLASSES.find((c) => c.id === selectedClassId);
    if (!cls) return [];
    const color = cls.color;
    const list: LibrarySpell[] = cls.shared.map((s) => ({ ...s, source: cls.name, sourceColor: color }));
    const specSpells = getClassSpells(selectedClassId, selectedSpecId).filter((s) => !cls.shared.some((sh) => sh.id === s.id));
    for (const s of specSpells) {
      list.push({ ...s, source: `${cls.name} spec`, sourceColor: color });
    }
    return list;
  }, [selectedClassId, selectedSpecId]);

  const customList = useMemo<LibrarySpell[]>(
    () => customSpells.map((s) => ({ ...s, source: "Custom", sourceColor: "#d4a04c" })),
    [customSpells],
  );

  const visible = useMemo(() => {
    const base = tab === "class" ? classSpells : tab === "all" ? allSpells : customList;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((s) => {
      if (s.name.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)) return true;
      return s.categories.some((c) => {
        const cat = CATEGORY_MAP[c as CategoryId];
        return cat && (cat.name.toLowerCase().includes(q) || c.toLowerCase().includes(q));
      });
    });
  }, [tab, classSpells, allSpells, customList, query]);

  return (
    <div className="wow-panel flex h-full flex-col rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="wow-heading text-lg">Spell library</h2>
        <AddSpellDialog onSpellAdded={() => setTab("custom")} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-3">
        <TabsList className="grid w-full grid-cols-3 bg-black/40">
          <TabsTrigger value="class">Class</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="class" />
        <TabsContent value="all" />
        <TabsContent value="custom" />
      </Tabs>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="mb-3 bg-input"
      />

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {visible.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            {tab === "custom" ? "No custom spells yet. Click 'Add spell' to import from Wowhead or IdTip." : "No spells match."}
          </p>
        ) : (
          visible.map((s) => (
            <LibraryItem key={s.id} spell={s} onRemove={tab === "custom" ? () => removeCustomSpell(s.id) : undefined} />
          ))
        )}
      </div>

      <p className="mt-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
        Drag a spell onto a bar slot. Drag between slots to move. Right-click a slot for keybind / remove.
      </p>
    </div>
  );
}

function LibraryItem({ spell, onRemove }: { spell: LibrarySpell; onRemove?: () => void }) {
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "library", spellId: spell.id }));
    e.dataTransfer.effectAllowed = "copyMove";
  }
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex cursor-grab items-center gap-2 rounded border border-border/60 bg-black/30 p-1.5 transition hover:border-[var(--gold-dim)] hover:bg-black/50 active:cursor-grabbing"
    >
      <img
        src={iconUrl(spell.icon)}
        alt=""
        loading="lazy"
        draggable={false}
        className="h-8 w-8 flex-none rounded border border-black object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = iconUrl("inv_misc_questionmark"); }}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{spell.name}</div>
        <div className="flex items-center gap-1">
          <span className="truncate text-[10px]" style={{ color: spell.sourceColor }}>{spell.source}</span>
          {spell.categories[0] && CATEGORY_MAP[spell.categories[0] as CategoryId] && (
            <span className="shrink-0 rounded px-1 text-[8px] font-medium" style={{ color: CATEGORY_MAP[spell.categories[0] as CategoryId].color, backgroundColor: CATEGORY_MAP[spell.categories[0] as CategoryId].color + "18" }}>
              {CATEGORY_MAP[spell.categories[0] as CategoryId].name}
            </span>
          )}
        </div>
      </div>
      {onRemove && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
          onClick={onRemove}
          title="Remove"
        >×</Button>
      )}
    </div>
  );
}
