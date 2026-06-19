import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSession, useIsAdmin, signOut } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  useCompetitions, useMatches, useStreams, usePrograms, useVideos, useNews, useTicker, useSettings,
  useUpsert, useDelete, useSettingUpsert,
} from "@/lib/cms";
import {
  SUPER_ADMIN_EMAIL,
  bootstrapSuperAdmin, listAllUsers, grantAdminRole, revokeAdminRole, deleteUserAccount,
} from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, LogOut, Plus, Trash2, Save, Radio, Calendar, Trophy, Newspaper, Video, Megaphone, Tv, Settings, Users, ExternalLink, UserCheck, UserX, Rss } from "lucide-react";
import { toast } from "sonner";
import { useBlogPosts, useBlogUpsert, useBlogDelete } from "@/lib/blog";

export const Route = createFileRoute("/gatekeeper")({
  head: () => ({ meta: [{ title: "Gatekeeper" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: GatekeeperPage,
});


function GatekeeperPage() {
  const { user, loading } = useSession();
  const { isAdmin, checked } = useIsAdmin(user);
  const navigate = useNavigate();
  const [tab, setTab] = useState("streams");
  const isSuperAdmin = !!user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const bootstrap = useServerFn(bootstrapSuperAdmin);

  // Auto-bootstrap super admin (idempotent) so the absolute owner always has admin rights.
  useEffect(() => {
    if (isSuperAdmin && checked && !isAdmin) {
      bootstrap({} as any)
        .then(() => { toast.success("Super admin verified. Reloading…"); setTimeout(() => location.reload(), 600); })
        .catch((e: any) => toast.error(e?.message ?? "Could not bootstrap super admin"));
    }
  }, [isSuperAdmin, checked, isAdmin]);

  if (loading || (user && !checked)) {
    return <Layout showTicker={false}><div className="py-20 text-center text-muted-foreground">Verifying access…</div></Layout>;
  }

  if (!user) {
    return (
      <Layout showTicker={false}>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <Shield className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-3 font-display text-2xl font-extrabold">Gatekeeper</h1>
          <p className="mt-2 text-sm text-muted-foreground">Restricted. Sign in with an approved admin account.</p>
          <Link to="/auth" search={{ redirect: "/gatekeeper" }}><Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Sign in</Button></Link>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return <NotAdmin onSignOut={async () => { await signOut(); navigate({ to: "/" }); }} />;

  return (
    <Layout showTicker={false}>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
              <Shield className="h-4 w-4" /> Gatekeeper
              {isSuperAdmin && <span className="rounded bg-accent-red px-1.5 py-0.5 text-[10px] font-extrabold text-white">SUPER ADMIN</span>}
            </div>
            <h1 className="font-display text-3xl font-extrabold">CMS Dashboard</h1>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm"><ExternalLink className="mr-1 h-4 w-4" /> View public site</Button>
            </a>
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-surface">
            <TabsTrigger value="streams"><Tv className="mr-1 h-4 w-4" />Live Streams</TabsTrigger>
            <TabsTrigger value="programs"><Calendar className="mr-1 h-4 w-4" />Schedule</TabsTrigger>
            <TabsTrigger value="matches"><Radio className="mr-1 h-4 w-4" />Matches</TabsTrigger>
            <TabsTrigger value="competitions"><Trophy className="mr-1 h-4 w-4" />Competitions</TabsTrigger>
            <TabsTrigger value="videos"><Video className="mr-1 h-4 w-4" />Videos</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="mr-1 h-4 w-4" />News</TabsTrigger>
            <TabsTrigger value="ticker"><Megaphone className="mr-1 h-4 w-4" />Ticker</TabsTrigger>
            <TabsTrigger value="blog"><Rss className="mr-1 h-4 w-4" />Blog</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4" />Site Content</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Users & Roles</TabsTrigger>}
          </TabsList>
          <TabsContent value="streams" className="mt-6"><PreviewBar path="/live" label="Live page" /><StreamsManager /></TabsContent>
          <TabsContent value="programs" className="mt-6"><PreviewBar path="/schedule" label="Schedule page" /><ProgramsManager /></TabsContent>
          <TabsContent value="matches" className="mt-6"><PreviewBar path="/schedule" label="Schedule page" /><MatchesManager /></TabsContent>
          <TabsContent value="competitions" className="mt-6"><PreviewBar path="/competitions" label="Competitions page" /><CompetitionsManager /></TabsContent>
          <TabsContent value="videos" className="mt-6"><PreviewBar path="/videos" label="Videos page" /><VideosManager /></TabsContent>
          <TabsContent value="news" className="mt-6"><PreviewBar path="/news" label="News page" /><NewsManager /></TabsContent>
          <TabsContent value="ticker" className="mt-6"><PreviewBar path="/" label="Home (ticker)" /><TickerManager /></TabsContent>
          <TabsContent value="blog" className="mt-6"><PreviewBar path="/blog" label="Blog page" /><BlogManager /></TabsContent>
          <TabsContent value="settings" className="mt-6"><PreviewBar path="/" label="Home / About / Contact / Radio" /><SettingsManager /></TabsContent>
          {isSuperAdmin && <TabsContent value="users" className="mt-6"><UsersManager currentUserId={user.id} /></TabsContent>}
        </Tabs>
      </div>
    </Layout>
  );
}

function PreviewBar({ path, label }: { path: string; label: string }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-dashed border-accent/30 bg-accent/5 px-4 py-2 text-xs">
      <span className="text-muted-foreground">Editing the <strong className="text-foreground">{label}</strong> template — changes appear instantly on the public site.</span>
      <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-accent hover:underline">
        Preview <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ============================================================================
// USERS & ROLES (Super admin only)
// ============================================================================
function UsersManager({ currentUserId }: { currentUserId: string }) {
  const list = useServerFn(listAllUsers);
  const grant = useServerFn(grantAdminRole);
  const revoke = useServerFn(revokeAdminRole);
  const del = useServerFn(deleteUserAccount);
  const [users, setUsers] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setErr(null);
    try { setUsers(await list({} as any)); }
    catch (e: any) { setErr(e?.message ?? "Failed to load users"); }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const act = async (id: string, fn: () => Promise<any>, okMsg: string) => {
    setBusy(id);
    try { await fn(); toast.success(okMsg); await refresh(); }
    catch (e: any) { toast.error(e?.message ?? "Action failed"); }
    finally { setBusy(null); }
  };

  return (
    <Section title="Users & Roles" desc={`Only the super admin (${SUPER_ADMIN_EMAIL}) can approve, revoke or remove accounts. Other admins can edit content but cannot touch this page.`}>
      {err && <div className="mb-3 rounded-lg border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red">{err}</div>}
      {!users && !err && <div className="text-sm text-muted-foreground">Loading users…</div>}
      {users && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{users.length} account(s)</div>
            <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
          </div>
          <ul className="space-y-2">
            {users.map((u) => {
              const isAdminUser = u.roles?.includes("admin");
              const isSelf = u.id === currentUserId;
              return (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{u.email || "(no email)"}</span>
                      {u.isSuperAdmin && <span className="rounded bg-accent-red px-1.5 py-0.5 text-[10px] font-extrabold text-white">SUPER ADMIN</span>}
                      {isAdminUser && !u.isSuperAdmin && <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-accent">Admin</span>}
                      {!u.confirmed && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-muted-foreground">Unconfirmed</span>}
                      {isSelf && <span className="text-[10px] text-muted-foreground">(you)</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()} · Last seen {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : "—"}</div>
                  </div>
                  <div className="flex gap-2">
                    {!u.isSuperAdmin && !isAdminUser && (
                      <Button size="sm" disabled={busy === u.id} onClick={() => act(u.id, () => grant({ data: { userId: u.id } }), "Granted admin")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <UserCheck className="mr-1 h-4 w-4" /> Make admin
                      </Button>
                    )}
                    {!u.isSuperAdmin && isAdminUser && (
                      <Button size="sm" variant="outline" disabled={busy === u.id} onClick={() => act(u.id, () => revoke({ data: { userId: u.id } }), "Revoked admin")}>
                        <UserX className="mr-1 h-4 w-4" /> Revoke
                      </Button>
                    )}
                    {!u.isSuperAdmin && !isSelf && (
                      <Button size="sm" variant="outline" disabled={busy === u.id} onClick={() => {
                        if (confirm(`Permanently delete account ${u.email}? This cannot be undone.`))
                          act(u.id, () => del({ data: { userId: u.id } }), "Account deleted");
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Section>
  );
}



function NotAdmin({ onSignOut }: { onSignOut: () => void }) {
  const [busy, setBusy] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  // Check on mount
  useState(() => {
    supabase.rpc("any_admin_exists").then(({ data }) => setAdminExists(!!data));
  });
  const claim = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data === "claimed") { toast.success("You are now the admin. Reloading…"); setTimeout(() => location.reload(), 800); }
    else if (data === "admin_exists") { toast.error("An admin already exists."); setAdminExists(true); }
    else toast.error("Could not claim admin");
  };
  return (
    <Layout showTicker={false}>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-3 font-display text-2xl font-extrabold">Not authorised</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account does not have admin access.</p>
        {adminExists === false && (
          <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4">
            <p className="text-sm">No admin exists yet. As the first signed-in user you can claim the admin role.</p>
            <Button onClick={claim} disabled={busy} className="mt-3 bg-accent text-accent-foreground hover:bg-accent/90">
              {busy ? "Claiming…" : "Claim admin role"}
            </Button>
          </div>
        )}
        <Button variant="outline" className="mt-4" onClick={onSignOut}>Sign out</Button>
      </div>
    </Layout>
  );
}

// ============================================================================
// Generic row editor
// ============================================================================
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

// ============================================================================
// STREAMS
// ============================================================================
function StreamsManager() {
  const { data: streams = [] } = useStreams();
  const upsert = useUpsert("live_streams", ["live_streams"]);
  const del = useDelete("live_streams", ["live_streams"]);
  const [draft, setDraft] = useState<any>({ label: "", url: "", priority: 10, is_active: true, is_auto: false, is_fallback: false, source_type: "youtube_live", category: "" });

  const save = async (row: any) => {
    try { await upsert.mutateAsync(row); toast.success("Saved"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Section title="Live Streams" desc="Manage all live sources. ‘Auto’ streams keep running when nothing is scheduled. ‘Fallback’ plays only when everything else is offline.">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Label"><Input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. ESPN Sports" /></Field>
        <Field label="Embed URL"><Input value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} placeholder="https://www.youtube.com/embed/..." /></Field>
        <Field label="Category"><Input value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="UPL / Global / FUFA" /></Field>
        <Field label="Priority (lower = first)"><Input type="number" value={draft.priority} onChange={e => setDraft({ ...draft, priority: +e.target.value })} /></Field>
        <div className="flex items-end gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_auto} onCheckedChange={(v) => setDraft({ ...draft, is_auto: v })} /> Always-on (24/7)</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_fallback} onCheckedChange={(v) => setDraft({ ...draft, is_fallback: v })} /> Fallback</label>
          <Button onClick={async () => { if (!draft.label || !draft.url) return toast.error("Label and URL required"); await save(draft); setDraft({ label: "", url: "", priority: 10, is_active: true, is_auto: false, is_fallback: false, source_type: "youtube_live", category: "" }); }} className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-1 h-4 w-4" />Add stream</Button>
        </div>
      </div>

      <ul className="space-y-2">
        {streams.map((s) => (
          <li key={s.id} className="grid gap-2 rounded-lg border border-border bg-background/40 p-3 sm:grid-cols-[1fr_auto]">
            <StreamRow row={s} onSave={save} onDelete={() => del.mutate(s.id)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function StreamRow({ row, onSave, onDelete }: { row: any; onSave: (r: any) => Promise<void> | void; onDelete: () => void }) {
  const [d, setD] = useState({ id: row.id, label: row.label, url: row.url, priority: row.priority, is_active: row.isActive, is_auto: row.isAuto, is_fallback: row.isFallback, source_type: row.sourceType, category: row.category ?? "" });
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-4">
        <Input value={d.label} onChange={e => setD({ ...d, label: e.target.value })} />
        <Input value={d.url} onChange={e => setD({ ...d, url: e.target.value })} className="sm:col-span-2" />
        <Input type="number" value={d.priority} onChange={e => setD({ ...d, priority: +e.target.value })} />
      </div>
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1"><Switch checked={d.is_active} onCheckedChange={(v) => setD({ ...d, is_active: v })} />Active</label>
        <label className="flex items-center gap-1"><Switch checked={d.is_auto} onCheckedChange={(v) => setD({ ...d, is_auto: v })} />Auto</label>
        <label className="flex items-center gap-1"><Switch checked={d.is_fallback} onCheckedChange={(v) => setD({ ...d, is_fallback: v })} />Fallback</label>
        <Button size="sm" onClick={() => onSave(d)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="h-4 w-4" /></Button>
        <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </>
  );
}

// ============================================================================
// PROGRAMS
// ============================================================================
function ProgramsManager() {
  const { data: programs = [] } = usePrograms();
  const { data: streams = [] } = useStreams();
  const { data: competitions = [] } = useCompetitions();
  const upsert = useUpsert("programs", ["programs"]);
  const del = useDelete("programs", ["programs"]);
  const TYPES = ["Live Match", "Highlights", "News", "Press Conference", "Replay"];
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initial state uses 'competitionsSlug' to match your database
  const [d, setD] = useState<any>({ 
    title: "", type: "Live Match", start_time: "", end_time: "", thumbnail: "", 
    competitionsSlug: "", stream_id: "", video_url: "", description: "" 
  });
  
  const reset = () => {
    setEditingId(null);
    setD({ title: "", type: "Live Match", start_time: "", end_time: "", thumbnail: "", 
           competitionsSlug: "", stream_id: "", video_url: "", description: "" });
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setD({
      ...p,
      start_time: new Date(p.startTime).toISOString().slice(0, 16),
      end_time: new Date(p.endTime).toISOString().slice(0, 16),
      video_url: p.videoUrl || "",
      // Ensure we map the database field back to the form state
      competitionsSlug: p.competitionsSlug || "" 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const add = async () => {
    if (!d.title || !d.start_time || !d.end_time) return toast.error("Title, start and end required");
    try {
      // Build the payload
      const payload: any = {
        title: d.title,
        type: d.type,
        start_time: new Date(d.start_time).toISOString(),
        end_time: new Date(d.end_time).toISOString(),
        thumbnail: d.thumbnail,
        competitionsSlug: d.competitionsSlug || null, // FIX: Use camelCase column name
        stream_id: d.stream_id || null,
        video_url: d.video_url || null,
        description: d.description || null,
      };

      // FIX: Only add ID if editing. If null, Supabase generates it via gen_random_uuid()
      if (editingId) {
        payload.id = editingId;
      }

      await upsert.mutateAsync(payload);
      toast.success(editingId ? "Updated successfully" : "Scheduled");
      reset();
    } catch (e: any) { 
      console.error(e); 
      toast.error(e.message); 
    }
  };
  
  return (
    <Section title="Programme Schedule" desc="Every viewer is tuned to whatever programme is on the air right now — they can't skip, pause or rewind, just like a TV channel. When nothing is scheduled, the 24/7 channels take over.">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Title"><Input value={d.title} onChange={e => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="Type">
          <select value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Start"><Input type="datetime-local" value={d.start_time} onChange={e => setD({ ...d, start_time: e.target.value })} /></Field>
        <Field label="End"><Input type="datetime-local" value={d.end_time} onChange={e => setD({ ...d, end_time: e.target.value })} /></Field>
        <Field label="Video URL (YouTube / MP4 / embed) — plays on our site at the scheduled time">
          <Input value={d.video_url} onChange={e => setD({ ...d, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        </Field>
        <Field label="Thumbnail URL"><Input value={d.thumbnail} onChange={e => setD({ ...d, thumbnail: e.target.value })} /></Field>
        <Field label="Competition">
          <select value={d.competitionsSlug} onChange={(e) => setD({ ...d, competitionsSlug: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            <option value="">— None —</option>
            {competitions.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Pinned Live Stream (for live matches)">
          <select value={d.stream_id} onChange={(e) => setD({ ...d, stream_id: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            <option value="">— Auto pick —</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Short description (optional)">
            <Textarea value={d.description} onChange={e => setD({ ...d, description: e.target.value })} rows={2} />
          </Field>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          {editingId && <Button variant="outline" onClick={reset}>Cancel Edit</Button>}
          <Button onClick={add} className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 h-4 w-4" />{editingId ? "Save Changes" : "Schedule programme"}
          </Button>
        </div>
      </div>
  
      <ul className="space-y-2">
        {programs.map((p) => {
          const start = new Date(p.startTime).getTime();
          const end = new Date(p.endTime).getTime();
          const now = Date.now();
          const status = now < start ? "Upcoming" : now < end ? "ON AIR" : "Ended";
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
              <div className="min-w-0 flex-1">
                 <div className="font-bold">
                    {p.title}
                    <span className="ml-2 text-xs uppercase text-accent">{p.type}</span>
                    <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${status === "ON AIR" ? "bg-accent-red text-white" : status === "Upcoming" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>{status}</span>
                 </div>
                 <div className="text-xs text-muted-foreground">{new Date(p.startTime).toLocaleString()} → {new Date(p.endTime).toLocaleTimeString()}</div>
                 {p.videoUrl && <div className="mt-1 truncate text-[11px] text-muted-foreground/80">🎬 {p.videoUrl}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          );
        })}
        {programs.length === 0 && <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No programmes scheduled yet. Add one above.</li>}
      </ul>
    </Section>
  );
}
// ============================================================================
// MATCHES
// ============================================================================
function MatchesManager() {
  const { data: matches = [] } = useMatches();
  const { data: competitions = [] } = useCompetitions();
  const upsert = useUpsert("matches", ["matches"]);
  const del = useDelete("matches", ["matches"]);
  const [d, setD] = useState<any>({ competition_slug: "", home: "", away: "", kickoff: "", venue: "", status: "scheduled", home_score: 0, away_score: 0 });

  return (
    <Section title="Matches" desc="Edit fixtures, scores, statuses in real-time.">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Competition">
          <select value={d.competition_slug} onChange={(e) => setD({ ...d, competition_slug: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            <option value="">— pick —</option>
            {competitions.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Kickoff"><Input type="datetime-local" value={d.kickoff} onChange={e => setD({ ...d, kickoff: e.target.value })} /></Field>
        <Field label="Home team"><Input value={d.home} onChange={e => setD({ ...d, home: e.target.value })} /></Field>
        <Field label="Away team"><Input value={d.away} onChange={e => setD({ ...d, away: e.target.value })} /></Field>
        <Field label="Venue"><Input value={d.venue} onChange={e => setD({ ...d, venue: e.target.value })} /></Field>
        <Field label="Status">
          <select value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            <option value="scheduled">Scheduled</option><option value="live">Live</option><option value="full_time">Full Time</option>
          </select>
        </Field>
        <div className="flex items-end sm:col-span-2">
          <Button onClick={async () => { if (!d.competition_slug || !d.home || !d.away || !d.kickoff) return toast.error("Fill all required"); await upsert.mutateAsync({ ...d, kickoff: new Date(d.kickoff).toISOString() }); toast.success("Added"); }} className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-1 h-4 w-4" />Add match</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {matches.map(m => (
          <li key={m.id} className="grid items-center gap-2 rounded-lg border border-border bg-background/40 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="text-sm font-bold">{m.home} <span className="text-muted-foreground">vs</span> {m.away}</div>
            <Input type="number" value={m.homeScore} onChange={(e) => upsert.mutate({ id: m.id, home_score: +e.target.value })} className="w-20" />
            <Input type="number" value={m.awayScore} onChange={(e) => upsert.mutate({ id: m.id, away_score: +e.target.value })} className="w-20" />
            <div className="flex gap-2">
              <select value={m.status} onChange={(e) => upsert.mutate({ id: m.id, status: e.target.value })} className="h-9 rounded-md border border-border bg-background px-2 text-xs">
                <option value="scheduled">Scheduled</option><option value="live">Live</option><option value="full_time">FT</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => del.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ============================================================================
// COMPETITIONS
// ============================================================================
function CompetitionsManager() {
  const { data: competitions = [] } = useCompetitions();
  const upsert = useUpsert("competitions", ["competitions"]);
  const del = useDelete("competitions", ["competitions"]);
  
  // Initialize state with all required fields for your database schema
  const [d, setD] = useState<any>({ 
    slug: "", 
    name: "", 
    short: "", 
    color: "#1E40C8", 
    season: "", 
    description: "", 
    sort_order: 99 
  });

  const addCompetition = async () => {
    if (!d.slug || !d.name) return toast.error("Slug + Name required");
    
    try {
      // Explicitly construct the payload to ensure no extra fields interfere
      const payload = {
        slug: d.slug,
        name: d.name,
        short: d.short,
        color: d.color,
        season: d.season,
        description: d.description,
        sort_order: d.sort_order
      };

      await upsert.mutateAsync(payload);
      toast.success("Competition added/updated successfully");
      
      // Reset form to initial state
      setD({ slug: "", name: "", short: "", color: "#1E40C8", season: "", description: "", sort_order: 99 });
    } catch (e: any) {
      console.error("Database Error:", e);
      toast.error(e.message || "Failed to save competition");
    }
  };

  return (
    <Section title="Competitions">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-3">
        <Field label="Slug"><Input value={d.slug} onChange={e => setD({ ...d, slug: e.target.value })} placeholder="upl" /></Field>
        <Field label="Name"><Input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></Field>
        <Field label="Short"><Input value={d.short} onChange={e => setD({ ...d, short: e.target.value })} /></Field>
        <Field label="Colour"><Input type="color" value={d.color} onChange={e => setD({ ...d, color: e.target.value })} /></Field>
        <Field label="Season"><Input value={d.season} onChange={e => setD({ ...d, season: e.target.value })} /></Field>
        <Field label="Sort order"><Input type="number" value={d.sort_order} onChange={e => setD({ ...d, sort_order: +e.target.value })} /></Field>
        <div className="sm:col-span-3">
          <Field label="Description">
            <Textarea value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-3">
          <Button onClick={addCompetition} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 h-4 w-4" /> Add competition
          </Button>
        </div>
      </div>
      
      <ul className="space-y-2">
        {competitions.map(c => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full" style={{ background: c.color }} />
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug} · {c.season}</div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete competition "${c.name}"?`)) del.mutate(c.id); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ============================================================================
// VIDEOS
// ============================================================================
function VideosManager() {
  const { data: videos = [] } = useVideos();
  const { data: competitions = [] } = useCompetitions();
  const upsert = useUpsert("videos", ["videos"]);
  const del = useDelete("videos", ["videos"]);
  const [d, setD] = useState<any>({ title: "", youtube_id: "", thumbnail: "", duration: "", competition_slug: "", sort_order: 99 });
  return (
    <Section title="Videos & Highlights">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Title"><Input value={d.title} onChange={e => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="YouTube ID"><Input value={d.youtube_id} onChange={e => setD({ ...d, youtube_id: e.target.value })} placeholder="dQw4w9WgXcQ" /></Field>
        <Field label="Thumbnail URL"><Input value={d.thumbnail} onChange={e => setD({ ...d, thumbnail: e.target.value })} /></Field>
        <Field label="Duration"><Input value={d.duration} onChange={e => setD({ ...d, duration: e.target.value })} placeholder="8:42" /></Field>
        <Field label="Competition">
          <select value={d.competition_slug} onChange={(e) => setD({ ...d, competition_slug: e.target.value })} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
            <option value="">— none —</option>
            {competitions.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Sort order"><Input type="number" value={d.sort_order} onChange={e => setD({ ...d, sort_order: +e.target.value })} /></Field>
        <div className="sm:col-span-2"><Button onClick={async () => { if (!d.title || !d.youtube_id) return toast.error("Title + YT id required"); await upsert.mutateAsync({ ...d, competition_slug: d.competition_slug || null }); toast.success("Added"); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-1 h-4 w-4" />Add video</Button></div>
      </div>
      <ul className="space-y-2">
        {videos.map(v => (
          <li key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
            <div>{v.title} <span className="text-xs text-muted-foreground">· {v.duration}</span></div>
            <Button size="sm" variant="outline" onClick={() => del.mutate(v.id)}><Trash2 className="h-4 w-4" /></Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ============================================================================
// NEWS
// ============================================================================
function NewsManager() {
  const { data: news = [] } = useNews();
  const upsert = useUpsert("news", ["news"]);
  const del = useDelete("news", ["news"]);
  const [d, setD] = useState<any>({ slug: "", title: "", excerpt: "", body: "", hero: "" });
  return (
    <Section title="News">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Slug"><Input value={d.slug} onChange={e => setD({ ...d, slug: e.target.value })} /></Field>
        <Field label="Title"><Input value={d.title} onChange={e => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="Hero image URL"><Input value={d.hero} onChange={e => setD({ ...d, hero: e.target.value })} /></Field>
        <Field label="Excerpt"><Input value={d.excerpt} onChange={e => setD({ ...d, excerpt: e.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="Body"><Textarea rows={5} value={d.body} onChange={e => setD({ ...d, body: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Button onClick={async () => { if (!d.slug || !d.title) return toast.error("Slug + title required"); await upsert.mutateAsync(d); toast.success("Published"); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-1 h-4 w-4" />Publish</Button></div>
      </div>
      <ul className="space-y-2">
        {news.map(n => (
          <li key={n.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
            <div><div className="font-bold">{n.title}</div><div className="text-xs text-muted-foreground">/{n.slug} · {new Date(n.publishedAt).toLocaleDateString()}</div></div>
            <Button size="sm" variant="outline" onClick={() => del.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ============================================================================
// TICKER
// ============================================================================
function TickerManager() {
  const { data: ticker = [] } = useTicker();
  const upsert = useUpsert("ticker_headlines", ["ticker_headlines"]);
  const del = useDelete("ticker_headlines", ["ticker_headlines"]);
  const [text, setText] = useState("");
  return (
    <Section title="Ticker Headlines" desc="Breaking news bar at the top of every page.">
      <div className="mb-4 flex gap-2">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="🔴 Breaking…" />
        <Button onClick={async () => { if (!text) return; await upsert.mutateAsync({ text, sort_order: (ticker.length + 1) * 10 }); setText(""); toast.success("Added"); }} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" /></Button>
      </div>
      <ul className="space-y-2">
        {ticker.map(t => (
          <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
            <span>{t.text}</span>
            <Button size="sm" variant="outline" onClick={() => del.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ============================================================================
// SITE CONTENT
// ============================================================================
function SettingsManager() {
  const { data: settings = {} } = useSettings();
  const upsert = useSettingUpsert();
  const sections: { key: string; label: string; fields: { name: string; label: string; type?: "text" | "textarea" }[] }[] = [
    { key: "brand", label: "Brand", fields: [{ name: "name", label: "Site name" }, { name: "tagline", label: "Tagline" }] },
    { key: "hero", label: "Home Hero", fields: [{ name: "headline", label: "Headline" }, { name: "sub", label: "Subheadline", type: "textarea" }] },
    { key: "about", label: "About Page", fields: [{ name: "body", label: "Body", type: "textarea" }] },
    { key: "contact", label: "Contact", fields: [{ name: "email", label: "Email" }, { name: "phone", label: "Phone" }, { name: "address", label: "Address" }] },
    { key: "radio", label: "Radio (FUFA FM)", fields: [
      { name: "name", label: "Station name (e.g. FUFA FM)" },
      { name: "streamUrl", label: "Stream URL (Icecast/Shoutcast .mp3/.aac/.m3u8)" },
      { name: "tagline", label: "Tagline / description", type: "textarea" },
    ] },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sections.map(s => <SettingsBlock key={s.key} block={s} value={settings[s.key] ?? {}} onSave={(v) => upsert.mutateAsync({ key: s.key, value: v }).then(() => toast.success(`${s.label} saved`))} />)}
    </div>
  );
}

function SettingsBlock({ block, value, onSave }: { block: any; value: any; onSave: (v: any) => void }) {
  const [d, setD] = useState<any>(value);
  return (
    <Section title={block.label}>
      <div className="space-y-3">
        {block.fields.map((f: any) => (
          <Field key={f.name} label={f.label}>
            {f.type === "textarea"
              ? <Textarea rows={4} value={d[f.name] ?? ""} onChange={e => setD({ ...d, [f.name]: e.target.value })} />
              : <Input value={d[f.name] ?? ""} onChange={e => setD({ ...d, [f.name]: e.target.value })} />}
          </Field>
        ))}
        <Button onClick={() => onSave(d)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-1 h-4 w-4" />Save</Button>
      </div>
    </Section>
  );
}

// ============================================================================
// BLOG
// ============================================================================
function BlogManager() {
  const { data: posts = [] } = useBlogPosts();
  const upsert = useBlogUpsert();
  const del = useBlogDelete();
  const empty = { slug: "", title: "", excerpt: "", body: "", hero: "", author: "", tags: "", published: true };
  const [d, setD] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadForEdit = (p: any) => {
    setEditingId(p.id);
    setD({
      slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", body: p.body ?? "",
      hero: p.hero ?? "", author: p.author ?? "", tags: (p.tags ?? []).join(", "), published: p.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => { setD(empty); setEditingId(null); };

  const save = async () => {
    if (!d.slug || !d.title) return toast.error("Slug + title required");
    const row: any = {
      slug: d.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      title: d.title, excerpt: d.excerpt || null, body: d.body || null, hero: d.hero || null,
      author: d.author || null, published: !!d.published,
      tags: (d.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
    };
    if (editingId) row.id = editingId;
    try { await upsert.mutateAsync(row); toast.success(editingId ? "Updated" : "Published"); reset(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Section title="Blog" desc="Long-form articles, analysis and features. Public readers see only published posts; admins see drafts too.">
      <div className="mb-6 grid gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 sm:grid-cols-2">
        <Field label="Slug (URL)"><Input value={d.slug} onChange={e => setD({ ...d, slug: e.target.value })} placeholder="our-first-post" /></Field>
        <Field label="Title"><Input value={d.title} onChange={e => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="Author"><Input value={d.author} onChange={e => setD({ ...d, author: e.target.value })} placeholder="FUFA TV Editorial" /></Field>
        <Field label="Hero image URL"><Input value={d.hero} onChange={e => setD({ ...d, hero: e.target.value })} /></Field>
        <Field label="Tags (comma separated)"><Input value={d.tags} onChange={e => setD({ ...d, tags: e.target.value })} placeholder="upl, tactics, opinion" /></Field>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm"><Switch checked={d.published} onCheckedChange={(v) => setD({ ...d, published: v })} /> Published</label>
        </div>
        <div className="sm:col-span-2"><Field label="Excerpt"><Textarea rows={2} value={d.excerpt} onChange={e => setD({ ...d, excerpt: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Body"><Textarea rows={10} value={d.body} onChange={e => setD({ ...d, body: e.target.value })} placeholder="Write the full article here. Blank lines create paragraphs." /></Field></div>
        <div className="flex gap-2 sm:col-span-2">
          <Button onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 h-4 w-4" />{editingId ? "Save changes" : "Publish post"}
          </Button>
          {editingId && <Button variant="outline" onClick={reset}>Cancel</Button>}
        </div>
      </div>

      <ul className="space-y-2">
        {posts.length === 0 && <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No posts yet. Write your first above.</li>}
        {posts.map(p => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-bold">
                {p.title}
                {!p.published && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-muted-foreground">Draft</span>}
              </div>
              <div className="text-xs text-muted-foreground">/blog/{p.slug} · {new Date(p.publishedAt).toLocaleDateString()}{p.author ? ` · ${p.author}` : ""}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadForEdit(p)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
