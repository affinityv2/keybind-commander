import { useMemo, useState } from "react";
import { CLASSES, getClassSpells, iconUrl, type Spell } from "@/lib/spells";
import { CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { AddSpellDialog } from "./AddSpellDialog";
import { fetchWowheadSpell, parseSpellIdInput } from "@/lib/wowhead";

interface LibrarySpell extends Spell {
  source: string;
  sourceColor: string;
}

export function SpellLibrary() {
  const { customSpells, removeCustomSpell, selectedClassId, selectedSpecId, iconOverrides } = useStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"class" | "all" | "custom">("class");

  const allSpells = useMemo<LibrarySpell[]>(() => {
    const out: LibrarySpell[] = [];
    const seen = new Set<string>();
    for (const cls of CLASSES) {
      for (const sp of cls.shared) {
        if (seen.has(sp.id)) continue;
        seen.add(sp.id);
        const icon = iconOverrides[sp.id] ?? sp.icon;
        out.push({ ...sp, icon, source: cls.name, sourceColor: cls.color });
      }
      for (const spec of cls.specs) {
        for (const sp of spec.spells) {
          if (seen.has(sp.id)) continue;
          seen.add(sp.id);
          const icon = iconOverrides[sp.id] ?? sp.icon;
          out.push({ ...sp, icon, source: `${cls.name} (${spec.name})`, sourceColor: cls.color });
        }
      }
    }
    return out;
  }, [iconOverrides]);

  const classSpells = useMemo<LibrarySpell[]>(() => {
    const cls = CLASSES.find((c) => c.id === selectedClassId);
    if (!cls) return [];
    const color = cls.color;
    const list: LibrarySpell[] = cls.shared.map((s) => {
      const icon = iconOverrides[s.id] ?? s.icon;
      return { ...s, icon, source: cls.name, sourceColor: color };
    });
    const specSpells = getClassSpells(selectedClassId, selectedSpecId).filter((s) => !cls.shared.some((sh) => sh.id === s.id));
    for (const s of specSpells) {
      const icon = iconOverrides[s.id] ?? s.icon;
      list.push({ ...s, icon, source: `${cls.name} spec`, sourceColor: color });
    }
    return list;
  }, [selectedClassId, selectedSpecId, iconOverrides]);

  const customList = useMemo<LibrarySpell[]>(
    () => customSpells.map((s) => {
      const icon = iconOverrides[s.id] ?? s.icon;
      return { ...s, icon, source: "Custom", sourceColor: "#d4a04c" };
    }),
    [customSpells, iconOverrides],
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
        Drag a spell onto a bar slot. Right-click a slot for keybind / edit icon / remove.
      </p>
    </div>
  );
}

function LibraryItem({ spell, onRemove }: { spell: LibrarySpell; onRemove?: () => void }) {
  const { iconOverrides, setIconOverride } = useStore();
  const [iconEditOpen, setIconEditOpen] = useState(false);
  const [iconDraft, setIconDraft] = useState("");
  const [iconLoading, setIconLoading] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "library", spellId: spell.id }));
    e.dataTransfer.effectAllowed = "copyMove";
  }

  function openIconEdit() {
    setIconDraft("");
    setIconError(null);
    setIconEditOpen(true);
  }

  async function fetchAndSetIcon() {
    setIconError(null);
    const input = iconDraft.trim();
    if (!input) { setIconError("Enter an icon name or Wowhead spell ID"); return; }

    const spellId = parseSpellIdInput(input);
    if (spellId) {
      setIconLoading(true);
      const meta = await fetchWowheadSpell(spellId);
      setIconLoading(false);
      if (meta) {
        setIconOverride(spell.id, meta.icon);
        setIconEditOpen(false);
        return;
      }
      setIconError("Could not fetch icon from Wowhead. Try entering the icon name directly.");
      return;
    }

    const normalized = input
      .replace(/^Interface\\ICONS\\/i, "")
      .replace(/^Interface\/ICONS\//i, "")
      .replace(/\.(blp|tga|png|jpg)$/i, "")
      .replace(/\\/g, "/")
      .toLowerCase();

    if (normalized) {
      setIconOverride(spell.id, normalized);
      setIconEditOpen(false);
    }
  }

  function resetIcon() {
    setIconOverride(spell.id, null);
    setIconEditOpen(false);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex cursor-grab items-center gap-2 rounded border border-border/60 bg-black/30 p-1.5 transition hover:border-[var(--gold-dim)] hover:bg-black/50 active:cursor-grabbing"
    >
      <div className="relative">
        <img
          src={iconUrl(spell.icon)}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-8 w-8 flex-none rounded border border-black object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = iconUrl("inv_misc_questionmark"); }}
        />
        <button
          onClick={openIconEdit}
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/80 text-[8px] text-muted-foreground opacity-0 transition hover:text-[var(--gold)] group-hover:opacity-100"
          title="Edit icon"
        >
          &#9998;
        </button>
      </div>
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

      <Dialog open={iconEditOpen} onOpenChange={setIconEditOpen}>
        <DialogContent className="wow-panel max-w-sm">
          <DialogHeader>
            <DialogTitle className="wow-heading">Edit icon: {spell.name}</DialogTitle>
            <DialogDescription>Enter a Wowhead spell ID to auto-fetch, or paste an icon name directly.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mb-3">
            <img src={iconUrl(spell.icon)} alt="" className="h-12 w-12 rounded border border-black object-cover" />
            <div className="text-xs text-muted-foreground">
              Current: <span className="font-mono text-[var(--gold)]">{spell.icon}</span>
            </div>
          </div>
          <Input
            autoFocus
            value={iconDraft}
            onChange={(e) => { setIconDraft(e.target.value); setIconError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") fetchAndSetIcon(); }}
            placeholder="Wowhead spell ID or icon name"
            className="bg-input font-mono text-sm"
          />
          {iconError && <p className="text-xs text-destructive">{iconError}</p>}
          {iconDraft.trim() && !/^\d+$/.test(iconDraft.trim()) && !parseSpellIdInput(iconDraft) && (
            <div className="flex items-center gap-2 text-xs">
              <img
                src={iconUrl(iconDraft.trim().replace(/^Interface\\ICONS\\/i, "").replace(/\.(blp|tga|png|jpg)$/i, "").replace(/\\/g, "/").toLowerCase())}
                alt=""
                className="h-8 w-8 rounded border border-black"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <span className="text-muted-foreground">Preview</span>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIconEditOpen(false)}>Cancel</Button>
            {iconOverrides[spell.id] && (
              <Button variant="ghost" onClick={resetIcon} className="text-muted-foreground hover:text-destructive">Reset</Button>
            )}
            <Button onClick={fetchAndSetIcon} disabled={iconLoading} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
              {iconLoading ? "Fetching..." : "Set icon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
