import { CATEGORIES } from "@/lib/categories";
import { useStore } from "@/lib/store";

export function CategoryLegend() {
  const { bar } = useStore();
  const used = new Set(bar.slots.map((s) => s.categoryId).filter(Boolean) as string[]);

  return (
    <div className="wow-panel rounded-lg p-4">
      <h2 className="wow-heading mb-1 text-lg">Tema-kategorier</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Hver kategori er bundet til samme keybind p\u00e5 tv\u00e6rs af alle classes. Skift class i toppen for at se hvordan kategorien udfyldes (fx <em>Ice Block</em> \u2194 <em>Aspect of the Turtle</em>).
      </p>
      <div className="grid max-h-[420px] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
        {CATEGORIES.map((c) => {
          const isUsed = used.has(c.id);
          return (
            <div
              key={c.id}
              className={`flex items-center gap-2 rounded border px-2 py-1.5 text-xs ${isUsed ? "border-[var(--gold-dim)] bg-black/30" : "border-border bg-black/10 opacity-50"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="flex-1 font-semibold">{c.name}</span>
              <span className="text-muted-foreground">{c.description}</span>
              <kbd className="rounded border border-[var(--gold-dim)] bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-[var(--gold)]">
                {c.defaultKeybind}
              </kbd>
            </div>
          );
        })}
      </div>
    </div>
  );
}
