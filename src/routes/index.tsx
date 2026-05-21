import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { ActionBars } from "@/components/wow/ActionBars";
import { ClassPicker } from "@/components/wow/ClassPicker";
import { SpellLibrary } from "@/components/wow/SpellLibrary";
import { AuthDialog } from "@/components/wow/AuthDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}

function AppLayout() {
  const { user, authLoading, signOut } = useStore();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--gold-dim)]/40 bg-black/40 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div>
            <h1 className="wow-heading text-3xl">Azeroth Keybinds</h1>
            <p className="text-xs text-muted-foreground">
              Drag-and-drop keybind planner &mdash; 2 bars &times; 18 slots, per class/spec
            </p>
          </div>
          <div className="flex items-center gap-3">
            {authLoading ? (
              <span className="text-xs text-muted-foreground">Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{user.email}</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-destructive" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" className="h-7 bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90" onClick={() => setAuthOpen(true)}>
                Sign in to save
              </Button>
            )}
            <a
              href="https://www.wowhead.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[var(--gold-dim)] bg-black/40 px-3 py-1.5 text-xs text-[var(--gold)] hover:border-[var(--gold)]"
            >
              Wowhead &#x2197;
            </a>
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

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
          {user
            ? "Your layouts are saved to your account and sync across devices."
            : "Sign in to save your layouts across devices and browsers."}
          {" "}World of Warcraft and spell names are trademarks of Blizzard Entertainment.
        </footer>
      </main>
    </div>
  );
}
