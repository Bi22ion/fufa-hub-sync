import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { usePrograms, useCompetitions } from "@/lib/cms";
import { useState } from "react";
import { Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — FUFA TV" }, { name: "description", content: "Full football programming schedule on FUFA TV." }] }),
  component: SchedulePage,
});

const FILTERS = ["All", "Live Match", "Highlights", "News", "Press Conference", "Replay"] as const;

function SchedulePage() {
  const { data: programs = [] } = usePrograms();
  const { data: competitions = [] } = useCompetitions();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const items = programs.filter((p) => filter === "All" || p.type === filter);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Programme Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">All times in your local timezone.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${filter === f ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground/80 hover:border-accent/60"}`}>{f}</button>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {items.length === 0 && <li className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">No programmes scheduled.</li>}
          {items.map((p) => {
            const start = new Date(p.startTime);
            const end = new Date(p.endTime);
            const isLive = start.getTime() <= Date.now() && end.getTime() > Date.now();
            const comp = competitions.find((c) => c.slug === p.competitionSlug);
            return (
              <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
                {p.thumbnail && <img src={p.thumbnail} alt="" className="h-24 w-full rounded-lg object-cover sm:w-40" />}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary/30 px-2 py-0.5 text-xs font-bold uppercase text-accent">{p.type}</span>
                    {comp && <span className="text-xs font-bold uppercase text-muted-foreground">{comp.short}</span>}
                    {isLive && <span className="flex items-center gap-1 rounded bg-accent-red px-2 py-0.5 text-xs font-extrabold uppercase text-white"><span className="live-dot bg-white" /> LIVE</span>}
                  </div>
                  <div className="mt-1 font-display text-lg font-bold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{start.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })} – {end.toLocaleString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="flex gap-2">
                  {isLive
                    ? <Link to="/live"><Button size="sm" className="bg-accent-red text-white hover:bg-accent-red/90"><Play className="mr-1 h-4 w-4" /> Watch</Button></Link>
                    : <Button size="sm" variant="outline" onClick={() => toast.success(`Reminder set for ${p.title}`)}><Bell className="mr-1 h-4 w-4" /> Remind me</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}
