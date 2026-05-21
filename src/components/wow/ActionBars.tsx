import { useState } from "react";
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROWS, COLS, slotKey, useStore, resolveSlot } from "@/lib/store";
import { iconUrl, CLASSES, getClassSpells } from "@/lib/spells";
import { fetchWowheadSpell, parseSpellIdInput } from "@/lib/wowhead";

export function ActionBars() {
  return (
    <div className="wow-panel rounded-lg p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="wow-heading text-2xl">Action Bars</h2>
          <p className="text-xs text-muted-foreground">
            2 bars &times; 18 slots &mdash; drag from library, or between slots to move. Right-click for keybind.
          </p>
        </div>
        <BarLegend />
      </div>

      <div className="space-y-3 overflow-x-auto">
        {Array.from({ length: ROWS }).map((_, row) => (
          <BarRow key={row} row={row} />
        ))}
      </div>
    </div>
  );
}

function BarLegend() {
  const { clearCurrentLayout } = useStore();
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-destructive" onClick={() => {
        if (confirm("Clear all spells for this class/spec? (Keybinds are kept)")) clearCurrentLayout();
      }}>
        Clear layout
      </Button>
    </div>
  );
}

function BarRow({ row }: { row: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dim)]">Bar {row + 1}</span>
      <div className="grid grid-cols-18 gap-1">
        {Array.from({ length: COLS }).map((_, col) => (
          <Slot key={col} row={row} col={col} />
        ))}
      </div>
    </div>
  );
}

function Slot({ row, col }: { row: number; col: number }) {
  const key = slotKey(row, col);
  const {
    keybinds, setKeybind, assignments, customSpells, placeSpell, swapSlots,
    selectedClassId, selectedSpecId, iconOverrides, setIconOverride,
  } = useStore();

  const spell = resolveSlot(selectedClassId, selectedSpecId, key, assignments, customSpells, iconOverrides);
  const keybind = keybinds[key] ?? "";

  const [dragOver, setDragOver] = useState(false);
  const [keybindOpen, setKeybindOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(keybind);
  const [iconEditOpen, setIconEditOpen] = useState(false);
  const [iconDraft, setIconDraft] = useState("");
  const [iconLoading, setIconLoading] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);

  function onDragStart(e: React.DragEvent) {
    if (!spell) { e.preventDefault(); return; }
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "slot", fromKey: key, spellId: spell.id }));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    const effect = e.dataTransfer.effectAllowed;
    e.dataTransfer.dropEffect = effect === "copy" || effect === "copyMove" ? "copy" : "move";
    setDragOver(true);
  }
  function onDragLeave() { setDragOver(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    let data: { type: string; spellId?: string; fromKey?: string };
    try { data = JSON.parse(raw); } catch { return; }
    if (data.type === "library" && data.spellId) {
      placeSpell(selectedClassId, selectedSpecId, key, data.spellId);
    } else if (data.type === "slot" && data.fromKey && data.fromKey !== key) {
      swapSlots(selectedClassId, selectedSpecId, data.fromKey, key);
    }
  }

  function openKeybind() {
    setDraftKey(keybind);
    setKeybindOpen(true);
  }

  function saveKeybind() {
    setKeybind(key, draftKey.trim());
    setKeybindOpen(false);
  }

  function openIconEdit() {
    setIconDraft("");
    setIconError(null);
    setIconEditOpen(true);
  }

  async function fetchAndSetIcon() {
    if (!spell) return;
    setIconError(null);
    const input = iconDraft.trim();
    if (!input) { setIconError("Enter an icon name or Wowhead spell ID"); return; }

    const wowId = parseSpellIdInput(input);
    if (wowId) {
      setIconLoading(true);
      const meta = await fetchWowheadSpell(wowId);
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
    if (!spell) return;
    setIconOverride(spell.id, null);
    setIconEditOpen(false);
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            draggable={!!spell}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`wow-slot relative flex h-10 w-10 items-center justify-center overflow-hidden rounded ${spell ? "cursor-grab active:cursor-grabbing" : "wow-slot-empty"} ${dragOver ? "ring-2 ring-[var(--gold)]" : ""}`}
            title={spell ? spell.name : "Empty slot"}
          >
            {spell ? (
              <img
                src={iconUrl(spell.icon)}
                alt={spell.name}
                loading="lazy"
                className="h-full w-full object-cover"
                draggable={false}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = iconUrl("inv_misc_questionmark"); }}
              />
            ) : (
              <span className="text-sm text-muted-foreground/30">+</span>
            )}
            {keybind && (
              <span className="pointer-events-none absolute right-0 top-0 rounded bg-black/85 px-0.5 text-[8px] font-bold leading-tight text-[var(--gold)] shadow">
                {keybind}
              </span>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="wow-panel min-w-48">
          <ContextMenuLabel className="text-[var(--gold)]">
            Slot {row + 1}.{col + 1}{keybind && ` \u00B7 ${keybind}`}
          </ContextMenuLabel>
          {spell && (
            <ContextMenuLabel className="text-xs font-normal text-muted-foreground">
              {spell.name}
            </ContextMenuLabel>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={openKeybind}>
            Set keybind...
          </ContextMenuItem>
          {spell && (
            <>
              <ContextMenuItem onSelect={openIconEdit}>
                Edit icon...
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => placeSpell(selectedClassId, selectedSpecId, key, null)}
              >
                Remove spell
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onSelect={() => setKeybind(key, "")}>
            Remove keybind
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={keybindOpen} onOpenChange={setKeybindOpen}>
        <DialogContent className="wow-panel max-w-sm">
          <DialogHeader>
            <DialogTitle className="wow-heading">Keybind for slot {row + 1}.{col + 1}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveKeybind(); }}
            placeholder="fx Q, S+1, Ctrl+E"
            className="bg-input"
          />
          <p className="text-[11px] text-muted-foreground">
            Type the key as you want to see it (this is a planner — no real bindings).
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKeybindOpen(false)}>Cancel</Button>
            <Button onClick={saveKeybind} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {spell && (
        <Dialog open={iconEditOpen} onOpenChange={setIconEditOpen}>
          <DialogContent className="wow-panel max-w-sm">
            <DialogHeader>
              <DialogTitle className="wow-heading">Edit icon: {spell.name}</DialogTitle>
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
              onChange={(e) => setIconDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchAndSetIcon(); }}
              placeholder="Wowhead spell ID or icon name"
              className="bg-input font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Enter a <strong>Wowhead spell ID</strong> (e.g. 45438) to auto-fetch the icon, or paste an <strong>icon name</strong> directly (e.g. spell_frost_frost).
            </p>
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
                <Button variant="ghost" onClick={resetIcon} className="text-muted-foreground hover:text-destructive">Reset to default</Button>
              )}
              <Button onClick={fetchAndSetIcon} disabled={iconLoading} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
                {iconLoading ? "Fetching..." : "Set icon"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
