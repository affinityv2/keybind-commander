import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { ActionBar } from "@/components/wow/ActionBar";
import { ClassPicker } from "@/components/wow/ClassPicker";
import { CategoryLegend } from "@/components/wow/CategoryLegend";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <div className="min-h-screen">
        <header className="border-b border-[var(--gold-dim)]/40 bg-black/40 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="wow-heading text-3xl">Azeroth Keybinds</h1>
              <p className="text-xs text-muted-foreground">
                Tema-baseret keybind planner \u2014 samme rolle, samme knap, p\u00e5 tv\u00e6rs af alle classes
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

        <main className="mx-auto max-w-7xl space-y-6 p-6">
          <ClassPicker />
          <ActionBar />
          <CategoryLegend />

          <footer className="pt-4 text-center text-xs text-muted-foreground">
            Setup gemmes automatisk lokalt i din browser. World of Warcraft og alle spell-navne er trademarks of Blizzard Entertainment.
          </footer>
        </main>
      </div>
    </StoreProvider>
  );
}
