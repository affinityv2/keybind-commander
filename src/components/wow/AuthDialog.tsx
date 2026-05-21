import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="wow-panel max-w-sm">
        <DialogHeader>
          <DialogTitle className="wow-heading">Save your keybinds</DialogTitle>
          <DialogDescription>
            Sign in to save your layouts across devices. Your data stays private — only you can see it.
          </DialogDescription>
        </DialogHeader>
        <AuthTabs onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AuthTabs({ onSuccess }: { onSuccess: () => void }) {
  const { signIn, signUp } = useStore();
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList className="grid w-full grid-cols-2 bg-black/40">
        <TabsTrigger value="login">Sign in</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="pt-4">
        <AuthForm
          submitLabel="Sign in"
          onSubmit={async (email, password) => {
            const { error } = await signIn(email, password);
            if (error) return error;
            onSuccess();
            return null;
          }}
        />
      </TabsContent>

      <TabsContent value="register" className="pt-4">
        <AuthForm
          submitLabel="Create account"
          onSubmit={async (email, password) => {
            const { error } = await signUp(email, password);
            if (error) return error;
            onSuccess();
            return null;
          }}
        />
      </TabsContent>
    </Tabs>
  );
}

function AuthForm({ submitLabel, onSubmit }: {
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onSubmit(email, password);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-input"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className="bg-input"
          required
          minLength={6}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={loading} className="w-full bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold)]/90">
          {loading ? "Please wait..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
