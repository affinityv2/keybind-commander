import { CLASSES } from "@/lib/spells";
import { useStore } from "@/lib/store";

export function ClassPicker() {
  const { selectedClassId, selectedSpecId, selectClass, selectSpec } = useStore();
  const cls = CLASSES.find((c) => c.id === selectedClassId)!;

  return (
    <div className="wow-panel rounded-lg p-4">
      <h2 className="wow-heading mb-3 text-lg">Class</h2>
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
        Aktiv: <span className="font-semibold" style={{ color: cls.color }}>{cls.name}</span> — {cls.specs.find(s => s.id === selectedSpecId)?.name}
      </div>
    </div>
  );
}
