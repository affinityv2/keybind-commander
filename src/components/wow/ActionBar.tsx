import { useStore } from "@/lib/store";
import { ActionSlot } from "./ActionSlot";
import { Slider } from "@/components/ui/slider";

export function ActionBar() {
  const { bar, setBar } = useStore();

  function setCount(count: number) {
    const current = bar.slots;
    if (count === current.length) return;
    if (count < current.length) {
      setBar({ slots: current.slice(0, count) });
    } else {
      const defaults = ["1", "2", "3", "4", "5", "Q", "E", "R", "T", "F", "G", "Z", "X", "C", "V", "Shift+1", "Shift+2", "Shift+3"];
      const extra = Array.from({ length: count - current.length }, (_, i) => ({
        keybind: defaults[current.length + i] ?? "",
        categoryId: null,
      }));
      setBar({ slots: [...current, ...extra] });
    }
  }

  return (
    <div className="wow-panel rounded-lg p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="wow-heading text-2xl">Action Bar</h2>
          <p className="text-xs text-muted-foreground">Klik p\u00e5 en slot for at \u00e6ndre keybind, kategori eller spell-override</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-[var(--gold-dim)]">Slots</span>
          <div className="w-40">
            <Slider
              min={12}
              max={18}
              step={1}
              value={[bar.slots.length]}
              onValueChange={(v) => setCount(v[0])}
            />
          </div>
          <span className="w-6 text-center font-bold text-[var(--gold)]">{bar.slots.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {bar.slots.map((_, i) => (
          <ActionSlot key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
