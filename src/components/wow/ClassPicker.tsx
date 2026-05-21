import { useState } from "react";
import { CLASSES } from "@/lib/spells";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export function ClassPicker() {
  const { selectedClassId, selectedSpecId, selectClass, selectSpec } = useStore();

  const cls = CLASSES.find((c) => c.id === selectedClassId)!;

  return (
    <div className="wow-panel rounded-lg p-4">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="wow-heading text-lg">Class</h2>
        <ProfileBar />
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2 sm:grid-cols-13">
        {CLASSES.map((c) => {
          const active = c.id === selectedClassId;
          return (
            <button
              key={c.id}
              onClick={() => selectClass(c.id)}
              title={c.name}
              className={`relative flex aspect-square items-center justify-center rounded border-2 text-[10px] font-bold uppercase tracking-tight transition ${active ? "border-[var(--gold)]" : "border-transparent hover:border-[var(--gold-dim)]"}`}
              style={{
                background: `linear-gradient(180deg, ${c.color}33, ${c.color}11)`,
                color: c.color,
                textShadow: "0 1px 0 #000",
              }}
            >
              {c.name.split(" ").map((w) => w[0]).join("")}
            </button>
          );
        })}
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--gold-dim)]">Spec</h3>
      <div className="flex flex-wrap gap-2">
        {cls.specs.map((s) => {
          const active = s.id === selectedSpecId;
          return (
            <button
              key={s.id}
              onClick={() => selectSpec(s.id)}
              className={`rounded border px-3 py-1.5 text-sm font-medium transition ${active ? "border-[var(--gold)] bg-accent text-[var(--gold)]" : "border-border bg-secondary/40 hover:bg-secondary"}`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded border border-border bg-black/30 p-2 text-xs text-muted-foreground">
        Active: <span className="font-semibold" style={{ color: cls.color }}>{cls.name}</span> &mdash; {cls.specs.find(s => s.id === selectedSpecId)?.name}
      </div>
    </div>
  );
}

function ProfileBar() {
  const { profiles, activeProfileId, switchProfile, addProfile, renameProfile, deleteProfile, exportProfile, importProfile } = useStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [exportCode, setExportCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  function handleExport() {
    const code = exportProfile();
    setExportCode(code);
    setExportOpen(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleImport() {
    setImportError(false);
    setImportCode("");
    setImportOpen(true);
  }

  function doImport() {
    const ok = importProfile(importCode);
    if (ok) {
      setImportOpen(false);
    } else {
      setImportError(true);
    }
  }

  function doAddProfile() {
    if (!newName.trim()) return;
    addProfile(newName.trim());
    setNewName("");
    setAddOpen(false);
  }

  function openRename() {
    if (!activeProfile) return;
    setRenameDraft(activeProfile.name);
    setRenameOpen(true);
  }

  function doRename() {
    if (!renameDraft.trim() || !activeProfile) return;
    renameProfile(activeProfile.id, renameDraft.trim());
    setRenameOpen(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={activeProfileId}
        onChange={(e) => switchProfile(e.target.value)}
        className="h-7 rounded border border-border bg-black/40 px-2 text-xs text-foreground"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-muted-foreground" onClick={() => setAddOpen(true)} title="New profile">+</Button>
      <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-muted-foreground" onClick={openRename} title="Rename profile">&#9998;</Button>
      {profiles.length > 1 && (
        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-muted-foreground hover:text-destructive" onClick={() => { if (activeProfile) deleteProfile(activeProfile.id); }} title="Delete profile">&times;</Button>
      )}

      <div className="mx-1 h-4 w-px bg-border" />

      <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-muted-foreground" onClick={handleExport} title="Export profile code">Export</Button>
      <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs text-muted-foreground" onClick={handleImport} title="Import profile code">Import</Button>

      {/* Add Profile Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="wow-panel max-w-sm">
          <DialogHeader>
            <DialogTitle className="wow-heading">New profile</DialogTitle>
            <DialogDescription>Create a fresh profile with default keybinds.</DialogDescription>
          </DialogHeader>
          <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") doAddProfile(); }} placeholder="Profile name" className="bg-input" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={doAddProfile} disabled={!newName.trim()} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Profile Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="wow-panel max-w-sm">
          <DialogHeader>
            <DialogTitle className="wow-heading">Rename profile</DialogTitle>
          </DialogHeader>
          <Input autoFocus value={renameDraft} onChange={(e) => setRenameDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") doRename(); }} className="bg-input" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={doRename} disabled={!renameDraft.trim()} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="wow-panel max-w-lg">
          <DialogHeader>
            <DialogTitle className="wow-heading">Export profile</DialogTitle>
            <DialogDescription>Share this code with friends so they can import your layout.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <textarea
              readOnly
              value={exportCode}
              className="w-full rounded border border-border bg-black/40 p-3 font-mono text-[10px] leading-tight text-foreground focus:outline-none"
              rows={5}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExportOpen(false)}>Close</Button>
            <Button onClick={handleCopy} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
              {copied ? "Copied!" : "Copy code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="wow-panel max-w-lg">
          <DialogHeader>
            <DialogTitle className="wow-heading">Import profile</DialogTitle>
            <DialogDescription>Paste a profile code from a friend to load their layout.</DialogDescription>
          </DialogHeader>
          <textarea
            autoFocus
            value={importCode}
            onChange={(e) => { setImportCode(e.target.value); setImportError(false); }}
            placeholder="Paste profile code here..."
            className="w-full rounded border border-border bg-black/40 p-3 font-mono text-[10px] leading-tight text-foreground focus:outline-none focus:border-[var(--gold)]"
            rows={5}
          />
          {importError && <p className="text-xs text-destructive">Invalid code. Make sure you copied the entire code.</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={doImport} disabled={!importCode.trim()} className="bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
