import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { iconUrl } from "@/lib/spells";
import { fetchWowheadSpell, parseSpellIdInput, type WowheadSpellMeta } from "@/lib/wowhead";

export function AddSpellDialog() {
  const { addCustomSpell } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
          + Add spell
        </Button>
      </DialogTrigger>
      <DialogContent className="wow-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="wow-heading">Tilf\u00f8j custom spell</DialogTitle>
          <DialogDescription>
            Importer via Wowhead spell ID/URL, eller indtast manuelt (fx fra IdTip ingame).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wowhead">
          <TabsList className="grid w-full grid-cols-2 bg-black/40">
            <TabsTrigger value="wowhead">Wowhead import</TabsTrigger>
            <TabsTrigger value="manual">Manuelt / IdTip</TabsTrigger>
          </TabsList>

          <TabsContent value="wowhead" className="pt-4">
            <WowheadTab onAdded={(s) => { addCustomSpell(s); setOpen(false); }} />
          </TabsContent>

          <TabsContent value="manual" className="pt-4">
            <ManualTab onAdded={(s) => { addCustomSpell(s); setOpen(false); }} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function WowheadTab({ onAdded }: { onAdded: (s: { id: string; name: string; icon: string; categories: []; spellId?: number }) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<WowheadSpellMeta | null>(null);

  async function load() {
    setError(null);
    setPreview(null);
    const id = parseSpellIdInput(input);
    if (!id) { setError("Indtast et spell ID eller Wowhead URL (fx https://www.wowhead.com/spell=45438)"); return; }
    setLoading(true);
    const meta = await fetchWowheadSpell(id);
    setLoading(false);
    if (!meta) {
      setError("Kunne ikke hente fra Wowhead (CORS eller spell ikke fundet). Brug 'Manuelt' fanen i stedet.");
      return;
    }
    setPreview(meta);
  }

  function confirm() {
    if (!preview) return;
    onAdded({
      id: `custom_spell_${preview.spellId}`,
      name: preview.name,
      icon: preview.icon,
      categories: [],
      spellId: preview.spellId,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load(); }}
          placeholder="Spell ID eller Wowhead URL"
          className="bg-input"
        />
        <Button onClick={load} disabled={loading}>{loading ? "Henter..." : "Hent"}</Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {preview && (
        <div className="flex items-center gap-3 rounded border border-[var(--gold-dim)] bg-black/30 p-3">
          <img src={iconUrl(preview.icon)} alt="" className="h-12 w-12 rounded border border-black object-cover" />
          <div className="flex-1">
            <div className="font-semibold">{preview.name}</div>
            <div className="text-xs text-muted-foreground">ID {preview.spellId} \u00b7 {preview.icon}</div>
          </div>
          <Button onClick={confirm} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Tilf\u00f8j</Button>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        Tip: hvis Wowhead blokerer requests fra browseren, brug 'Manuelt' \u2014 du har allerede icon-navnet fra IdTip.
      </p>
    </div>
  );
}

function ManualTab({ onAdded }: { onAdded: (s: { id: string; name: string; icon: string; categories: []; spellId?: number }) => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [spellId, setSpellId] = useState("");

  // Strip common prefixes / extensions users may paste from texture paths
  function normalizeIcon(raw: string) {
    return raw
      .trim()
      .replace(/^Interface\\\\ICONS\\\\/i, "")
      .replace(/^Interface\/ICONS\//i, "")
      .replace(/\.(blp|tga|png|jpg)$/i, "")
      .replace(/\\\\/g, "/")
      .toLowerCase();
  }

  const normalized = normalizeIcon(icon);
  const valid = name.trim().length > 0 && normalized.length > 0;

  function save() {
    if (!valid) return;
    const id = spellId.trim() && /^\d+$/.test(spellId.trim())
      ? `custom_spell_${spellId.trim()}`
      : `custom_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now().toString(36)}`;
    onAdded({
      id,
      name: name.trim(),
      icon: normalized,
      categories: [],
      spellId: spellId.trim() && /^\d+$/.test(spellId.trim()) ? Number(spellId.trim()) : undefined,
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spell navn</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="fx Ice Block" className="bg-input" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Icon (fra IdTip)</label>
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="fx spell_frost_frost" className="bg-input font-mono text-sm" />
        <p className="mt-1 text-[10px] text-muted-foreground">
          IdTip viser texture-path som <code className="text-[var(--gold)]">Interface\\ICONS\\spell_frost_frost</code>. Paste hele linjen \u2014 vi rydder den op.
        </p>
        {normalized && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <img src={iconUrl(normalized)} alt="" className="h-8 w-8 rounded border border-black" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }} />
            <span className="text-muted-foreground">Preview: <span className="font-mono text-[var(--gold)]">{normalized}</span></span>
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spell ID (valgfrit)</label>
        <Input value={spellId} onChange={(e) => setSpellId(e.target.value)} placeholder="fx 45438" className="bg-input" />
      </div>
      <DialogFooter>
        <Button disabled={!valid} onClick={save} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
          Tilf\u00f8j spell
        </Button>
      </DialogFooter>
    </div>
  );
}
