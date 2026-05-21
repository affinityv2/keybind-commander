import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { ActionBars } from "@/components/wow/ActionBars";
import { ClassPicker } from "@/components/wow/ClassPicker";
import { SpellLibrary } from "@/components/wow/SpellLibrary";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <div className="min-h-screen">
        <header className="border-b border-[var(--gold-dim)]/40 bg-black/40 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between">
            <div>
              <h1 className="wow-heading text-3xl">Azeroth Keybinds</h1>
              <p className="text-xs text-muted-foreground">
                Drag-and-drop keybind planner \u2014 2 bars \u00d7 18 slots, per class/spec
              </p>
            </div>
            <a
              href="https://www.wowhead.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[var(--gold-dim)] bg-black/40 px-3 py-1.5 text-xs text-[var(--gold)] hover:border-[var(--gold)]"
            >
              Wowhead \u2197
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-6">
          <div className="mb-6">
            <ClassPicker />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <ActionBars />
            <div className="h-[720px]">
              <SpellLibrary />
            </div>
          </div>

          <footer className="pt-6 text-center text-xs text-muted-foreground">
            Setup gemmes lokalt i din browser. World of Warcraft og spell-navne er trademarks of Blizzard Entertainment.
          </footer>
        </main>
      </div>
    </StoreProvider>
  );
}
