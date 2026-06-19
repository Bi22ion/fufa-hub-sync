import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { LivePlayer } from "@/components/LivePlayer";
import { InlineVideoCard } from "@/components/InlineVideoCard";
import { MatchCard } from "@/components/MatchCard";
import { useCompetitions, useMatches, useVideos, usePrograms, useSettings, getUpcomingPrograms } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Radio, Calendar } from "lucide-react";
import { useRadio } from "@/lib/radioStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUFA TV — Uganda's Home of Football, Live 24/7" },
      { name: "description", content: "Live Ugandan football, schedules, highlights and news. Watch UPL, Stanbic Uganda Cup, CECAFA, women's & junior football anytime on FUFA TV." },
      { property: "og:title", content: "FUFA TV — Uganda's Home of Football" },
      { property: "og:description", content: "24/7 live football, highlights and news from FUFA." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: competitions = [] } = useCompetitions();
  const { data: matches = [] } = useMatches();
  const { data: videos = [] } = useVideos();
  const { data: programs = [] } = usePrograms();
  const { data: settings = {} } = useSettings();
  const upcoming = getUpcomingPrograms(programs, 4);
  const hero = settings.hero ?? { headline: "Watch Live Ugandan Football, 24/7", sub: "" };
  const { on: radioOn } = useRadio();

  return (
    <Layout>
      <section className="bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{hero.headline}</h1>
            {hero.sub && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{hero.sub}</p>}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="group relative">
                <LivePlayer showSelector={false} showOpenFull />
                <Link
                  to="/live"
                  aria-label="Open full live page"
                  className="absolute inset-x-0 -bottom-3 mx-auto block w-fit rounded-full bg-accent-red px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-2xl ring-2 ring-background hover:bg-accent-red/90"
                >
                  Tap to watch full screen →
                </Link>
              </div>
            </div>
            <aside className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent"><Calendar className="h-4 w-4" /> Up Next</div>
              <ul className="space-y-3">
                {upcoming.length === 0 && <li className="text-xs text-muted-foreground">No upcoming programmes scheduled.</li>}
                {upcoming.map((p) => (
                  <li key={p.id} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-xs text-muted-foreground">{new Date(p.startTime).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="font-display font-bold">{p.title}</div>
                    <div className="text-xs text-accent">{p.type}</div>
                  </li>
                ))}
              </ul>
              <Link to="/schedule" className="mt-4 block">
                <Button variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">Full Schedule</Button>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <Link to="/live">
          <div className="flex items-center justify-between rounded-2xl bg-accent p-6 text-accent-foreground shadow-2xl transition hover:scale-[1.01]">
            <div>
              <div className="font-display text-2xl font-extrabold">Watch Live Football Now</div>
              <div className="text-sm opacity-80">Scheduled programmes + always-on global sports channels.</div>
            </div>
            <Button size="lg" className="bg-accent-red font-bold text-white hover:bg-accent-red/90"><Radio className="mr-2 h-5 w-5" /> Go to Live</Button>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Today's Matches</h2>
          <Link to="/schedule" className="text-sm font-bold text-accent hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold">Latest Highlights</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((v) => (
            <InlineVideoCard
              key={v.id}
              youtubeId={v.youtubeId}
              title={v.title}
              thumbnail={v.thumbnail}
              duration={v.duration}
              subtitle={competitions.find(c => c.slug === v.competitionSlug)?.short ?? null}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold">Competitions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {competitions.map((c) => (
            <Link key={c.slug} to="/competitions/$slug" params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-surface p-5 text-center transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold text-white shadow-lg" style={{ background: c.color }}>{c.short.slice(0, 3)}</div>
              <div className="mt-3 font-display text-sm font-bold leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
