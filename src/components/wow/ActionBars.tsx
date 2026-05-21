import { useState } from "react";
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROWS, COLS, slotKey, useStore, resolveSlot } from "@/lib/store";
import { iconUrl, CLASSES, getClassSpells } from "@/lib/spells";

export function ActionBars() {
  return (
    <div className="wow-panel rounded-lg p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="wow-heading text-2xl">Action Bars</h2>
          <p className="text-xs text-muted-foreground">
            2 bars \u00d7 18 slots \u2014 tr\u00e6k fra library, eller mellem slots for at flytte. H\u00f8jreklik for keybind.
          </p>
        </div>
        <BarLegend />
      </div>

      <div className="space-y-3">
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
        if (confirm("Ryd alle spells p\u00e5 denne class/spec? (Keybinds bevares)")) clearCurrentLayout();
      }}>
        Ryd layout
      </Button>
    </div>
  );
}

function BarRow({ row }: { row: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-right font-mono text-[10px] uppercase tracking-wider text-[var(--gold-dim)]">Bar {row + 1}</span>
      <div className="flex flex-wrap gap-1.5">
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
    selectedClassId, selectedSpecId,
  } = useStore();

  const spell = resolveSlot(selectedClassId, selectedSpecId, key, assignments, customSpells);
  const keybind = keybinds[key] ?? "";

  const [dragOver, setDragOver] = useState(false);
  const [keybindOpen, setKeybindOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(keybind);

  function onDragStart(e: React.DragEvent) {
    if (!spell) { e.preventDefault(); return; }
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "slot", fromKey: key, spellId: spell.id }));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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
            className={`wow-slot relative flex h-14 w-14 items-center justify-center overflow-hidden rounded ${spell ? "cursor-grab active:cursor-grabbing" : "wow-slot-empty"} ${dragOver ? "ring-2 ring-[var(--gold)]" : ""}`}
            title={spell ? spell.name : "Tom slot"}
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
              <span className="text-xl text-muted-foreground/30">+</span>
            )}
            {keybind && (
              <span className="pointer-events-none absolute right-0.5 top-0.5 rounded bg-black/85 px-1 text-[10px] font-bold leading-tight text-[var(--gold)] shadow">
                {keybind}
              </span>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="wow-panel min-w-48">
          <ContextMenuLabel className="text-[var(--gold)]">
            Slot {row + 1}.{col + 1}{keybind && ` \u00b7 ${keybind}`}
          </ContextMenuLabel>
          {spell && (
            <ContextMenuLabel className="text-xs font-normal text-muted-foreground">
              {spell.name}
            </ContextMenuLabel>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={openKeybind}>
            S\u00e6t keybind\u2026
          </ContextMenuItem>
          {spell && (
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => placeSpell(selectedClassId, selectedSpecId, key, null)}
            >
              Fjern spell
            </ContextMenuItem>
          )}
          <ContextMenuItem onSelect={() => setKeybind(key, "")}>
            Fjern keybind
          </ContextMenuItem>
          <ContextMenuSeparator />
          <CopyToAllClassesItem fromKey={key} spellName={spell?.name} />
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
            Skriv tasten som du vil se den (vi binder ikke noget rigtigt \u2014 dette er en planner).
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKeybindOpen(false)}>Annull\u00e9r</Button>
            <Button onClick={saveKeybind} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Gem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Optional helper: tag spells with shared `id` across classes? Out of scope here.
function CopyToAllClassesItem({ fromKey }: { fromKey: string; spellName?: string }) {
  void fromKey;
  return null;
}
