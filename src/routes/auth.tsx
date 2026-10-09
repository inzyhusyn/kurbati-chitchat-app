import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import brandLogo from "@/assets/kurbati-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — Kurbati Chitchat" },
      { name: "description", content: "Log in or create your Kurbati Chitchat account with email or Google." },
      { property: "og:title", content: "Log in or sign up — Kurbati Chitchat" },
      { property: "og:description", content: "Join Kurbati Chitchat with email or Google." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "info"; text: string } | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (mode !== "signup") { setUsernameStatus("idle"); return; }
    const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, "");
    if (clean.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", clean).maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(t);
  }, [username, mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/home", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, "");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { username: clean } },
        });
        if (error) throw error;
        if (!data.session) setMsg({ type: "info", text: "Check your email to confirm your account, then log in." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg({ type: "info", text: "Password reset link sent. Check your inbox." });
      }
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setMsg({ type: "error", text: result.error.message ?? "Google sign-in failed" });
  };

  const input =
    "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none";

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <div className="flex w-full max-w-md flex-col justify-center border-x border-border bg-black px-8 py-10">
        <img src={brandLogo} alt="Kurbati Chitchat" className="mx-auto mb-2 h-14 w-auto" />
        <h1 className="mb-8 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Sign up to share moments with friends." : mode === "forgot" ? "Reset your password" : "Welcome back"}
        </h1>

        {mode !== "forgot" && (
          <>
            <button
              type="button"
              onClick={google}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12s4.15 9.25 9.25 9.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.06-1.06-.15-1.51z" />
              </svg>
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input className={input} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} />
          )}
          <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {mode !== "forgot" && (
            <input className={input} type="password" placeholder="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          )}
          {msg && (
            <p className={`text-xs ${msg.type === "error" ? "text-destructive" : "text-primary"}`}>{msg.text}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl border border-primary py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Log in"}
          </button>
        </form>

        {mode === "login" && (
          <button type="button" onClick={() => setMode("forgot")} className="mt-4 text-center text-xs text-muted-foreground hover:text-white">
            Forgot password?
          </button>
        )}

        <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Have an account? " : "Don't have an account? "}
          <button type="button" onClick={() => { setMsg(null); setMode(mode === "signup" ? "login" : "signup"); }} className="font-semibold text-primary">
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
