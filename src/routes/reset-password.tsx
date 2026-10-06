import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Kurbati Chitchat" },
      { name: "description", content: "Choose a new password for your Kurbati Chitchat account." },
      { property: "og:title", content: "Set a new password — Kurbati Chitchat" },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    navigate({ to: "/home", replace: true });
  };
  return (
    <main className="flex min-h-screen justify-center bg-background">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col justify-center gap-3 border-x border-border bg-black px-8">
        <h1 className="text-lg font-semibold text-white">Set a new password</h1>
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none" />
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button disabled={busy} className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">Update password</button>
      </form>
    </main>
  );
}
