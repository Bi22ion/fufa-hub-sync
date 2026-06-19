import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useCompetitions, useMatches, useVideos } from "@/lib/cms";
import { MatchCard } from "@/components/MatchCard";
import { Play } from "lucide-react";

export const Route = createFileRoute("/competitions/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Competition — FUFA TV` },
      { name: "description", content: `FUFA ${params.slug} coverage on FUFA TV.` },
    ],
  }),
  component: CompetitionPage,
});

function CompetitionPage() {
  const { slug } = Route.useParams();
  const { data: competitions = [], isLoading } = useCompetitions();
  const { data: matches = [] } = useMatches();
  const { data: videos = [] } = useVideos();
  const c = competitions.find((x) => x.slug === slug);

  if (isLoading) return <Layout><div className="py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!c) return (
    <Layout>
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold">Competition not found</h1>
        <Link to="/competitions" className="mt-4 inline-block text-accent hover:underline">View all competitions</Link>
      </div>
    </Layout>
  );

  const compMatches = matches.filter((m) => m.competitionSlug === c.slug);
  const compVideos = videos.filter((v) => v.competitionSlug === c.slug);

  return (
    <Layout>
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.color}, var(--surface))` }}>
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-12">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold backdrop-blur">{c.short.slice(0, 3)}</div>
          <div>
            {c.season && <div className="text-xs font-bold uppercase tracking-wider text-white/80">{c.season}</div>}
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{c.name}</h1>
            {c.description && <p className="mt-1 max-w-xl text-sm text-white/80">{c.description}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold">Fixtures & Results</h2>
        {compMatches.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">No matches scheduled yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compMatches.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold">Highlights & Replays</h2>
        {compVideos.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">No videos yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compVideos.map((v) => (
              <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noreferrer"
                 className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-accent/50">
                <div className="relative aspect-video">
                  {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"><Play className="h-12 w-12 text-white" /></div>
                </div>
                <div className="p-3 font-display font-bold">{v.title}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
