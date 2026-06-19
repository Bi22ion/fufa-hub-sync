import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/useAuth";
import { Mail, Lock, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — FUFA TV" },
      { name: "description", content: "Sign in or create a FUFA TV account to follow your favourite clubs, set reminders and chat live." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const search = Route.useSearch();
  const dest = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/account";

  useEffect(() => {
    if (!loading && session) navigate({ to: dest });
  }, [loading, session, dest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/account", data: { full_name: name } },
        });
        if (error) throw error;
        console.log('Operation successful');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('Operation successful');
      }
    } catch (err: any) {
      console.error('Database Error:', err);
      window.alert('Database Error: ' + (err.message || 'An unexpected error occurred'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleClick = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + dest },
    });
    if (error) {
      console.error('Database Error:', error);
      window.alert('Database Error: ' + (error.message || 'An unexpected error occurred'));
    }
  };

  return (
    <Layout showTicker={false}>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-center font-display text-3xl font-extrabold">
          {mode === "signin" ? "Welcome back" : "Join FUFA TV"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to your subscriber account." : "Create a free account to follow clubs & set reminders."}
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <Button type="button" onClick={handleGoogleClick} disabled={busy} variant="outline" className="w-full border-border">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="pl-9" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} className="pl-9" required />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-accent font-bold text-accent-foreground hover:bg-accent/90">
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-accent">
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy</Link>.
        </p>
      </div>
    </Layout>
  );
}
