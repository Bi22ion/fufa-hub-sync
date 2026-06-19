import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useSession, signOut } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { LogOut, User as UserIcon, Heart, Bell } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — FUFA TV" }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

function Account() {
  const { session, user, loading } = useSession();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !session) navigate({ to: "/auth" }); }, [loading, session]);
  if (!user) return null;

  return (
    <Layout showTicker={false}>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-extrabold text-accent-foreground">
            {(user.email ?? "F")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">{(user.user_metadata as any)?.full_name ?? user.email}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="mr-1 h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Heart, label: "Favourite Clubs", desc: "Coming soon — follow your team for instant alerts." },
            { icon: Bell, label: "Match Reminders", desc: "Set reminders from the Schedule page." },
            { icon: UserIcon, label: "Profile", desc: "Edit your display name and avatar." },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-border bg-surface p-5">
              <b.icon className="h-5 w-5 text-accent" />
              <div className="mt-2 font-display font-bold">{b.label}</div>
              <div className="text-xs text-muted-foreground">{b.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-5 text-center text-sm text-muted-foreground">
          <Link to="/live" className="font-bold text-accent hover:underline">→ Jump back to Live Football</Link>
        </div>
      </div>
    </Layout>
  );
}
