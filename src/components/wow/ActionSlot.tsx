import { CLASSES, iconUrl, getClassSpells } from "@/lib/spells";
import { useStore, resolveSlotSpell } from "@/lib/store";
import { CATEGORY_MAP } from "@/lib/categories";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  index: number;
}

export function ActionSlot({ index }: Props) {
  const { bar, setBar, assignments, assign, selectedClassId, selectedSpecId } = useStore();
  const slot = bar.slots[index];
  const resolved = resolveSlotSpell(selectedClassId, selectedSpecId, index, slot, assignments);
  const spell = resolved.spellId
    ? getClassSpells(selectedClassId, selectedSpecId).find((s) => s.id === resolved.spellId)
    : null;
  const category = slot.categoryId ? CATEGORY_MAP[slot.categoryId] : null;

  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(slot.keybind);
  const [draftCat, setDraftCat] = useState<string>(slot.categoryId ?? "none");

  function openDialog() {
    setDraftKey(slot.keybind);
    setDraftCat(slot.categoryId ?? "none");
    setOpen(true);
  }

  function saveSlot() {
    const nextSlots = [...bar.slots];
    nextSlots[index] = {
      keybind: draftKey,
      categoryId: draftCat === "none" ? null : (draftCat as any),
    };
    setBar({ ...bar, slots: nextSlots });
  }

  const classSpells = getClassSpells(selectedClassId, selectedSpecId);
  const matchingSpells = slot.categoryId
    ? classSpells.filter((s) => s.categories.includes(slot.categoryId!))
    : classSpells;
  const otherSpells = classSpells.filter((s) => !matchingSpells.includes(s));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={openDialog}
          className={`wow-slot relative flex h-16 w-16 items-center justify-center overflow-hidden rounded ${spell ? "" : "wow-slot-empty"}`}
          style={category ? { boxShadow: `inset 0 0 0 1px ${category.color}40, inset 0 2px 4px rgba(0,0,0,0.8)` } : undefined}
          title={spell ? `${spell.name} — ${category?.name ?? ""}` : category?.name ?? "Empty slot"}
        >
          {spell ? (
            <img
              src={iconUrl(spell.icon)}
              alt={spell.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `${iconUrl("inv_misc_questionmark")}`;
              }}
            />
          ) : category ? (
            <span className="px-1 text-center text-[9px] font-semibold uppercase leading-tight text-muted-foreground">
              {category.name}
            </span>
          ) : (
            <span className="text-2xl text-muted-foreground/40">+</span>
          )}

          {/* Keybind label */}
          {slot.keybind && (
            <span className="absolute right-0.5 top-0.5 rounded bg-black/80 px-1 text-[10px] font-bold leading-tight text-[var(--gold)] shadow">
              {slot.keybind}
            </span>
          )}

          {/* Manual-assignment indicator */}
          {resolved.isManual && (
            <span className="absolute bottom-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)] shadow" />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="wow-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="wow-heading">Slot {index + 1}</DialogTitle>
          <DialogDescription>
            Tildel kategori og keybind. Spell f\u00f8lger automatisk class — eller v\u00e6lg manuelt nedenfor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keybind
              </label>
              <Input
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="fx Q, 1, Shift+2"
                className="bg-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kategori (tema)
              </label>
              <Select value={draftCat} onValueChange={setDraftCat}>
                <SelectTrigger className="bg-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Ingen —</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Override spell for {CLASSES.find(c => c.id === selectedClassId)?.name} ({selectedSpecId})
            </label>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              <button
                onClick={() => { assign(selectedClassId, selectedSpecId, index, null); }}
                className="flex w-full items-center gap-2 rounded border border-border bg-secondary/40 px-2 py-1.5 text-left text-sm hover:bg-secondary"
              >
                <span className="text-muted-foreground">Auto (kategori-match)</span>
              </button>
              {matchingSpells.length > 0 && (
                <>
                  <div className="px-1 pt-1 text-[10px] uppercase tracking-wider text-[var(--gold-dim)]">Matcher kategori</div>
                  {matchingSpells.map((s) => (
                    <SpellRow key={s.id} spell={s} onPick={() => assign(selectedClassId, selectedSpecId, index, s.id)} active={resolved.spellId === s.id} />
                  ))}
                </>
              )}
              {otherSpells.length > 0 && (
                <>
                  <div className="px-1 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground">\u00d8vrige spells</div>
                  {otherSpells.map((s) => (
                    <SpellRow key={s.id} spell={s} onPick={() => assign(selectedClassId, selectedSpecId, index, s.id)} active={resolved.spellId === s.id} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annull\u00e9r</Button>
          <Button
            className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90"
            onClick={() => { saveSlot(); setOpen(false); }}
          >
            Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SpellRow({ spell, onPick, active }: { spell: ReturnType<typeof getClassSpells>[number]; onPick: () => void; active: boolean }) {
  return (
    <button
      onClick={onPick}
      className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left text-sm transition ${active ? "border-[var(--gold)] bg-accent" : "border-border bg-secondary/30 hover:bg-secondary/70"}`}
    >
      <img src={iconUrl(spell.icon)} alt="" className="h-7 w-7 rounded border border-black object-cover" />
      <div className="flex flex-1 flex-col">
        <span className="font-medium">{spell.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {spell.categories.map((c) => CATEGORY_MAP[c].name).join(" \u00b7 ")}
        </span>
      </div>
    </button>
  );
}
