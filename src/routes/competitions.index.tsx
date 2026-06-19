import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useCompetitions } from "@/lib/cms";

export const Route = createFileRoute("/competitions/")({
  head: () => ({ meta: [{ title: "Competitions — FUFA TV" }, { name: "description", content: "All FUFA competitions in one place: UPL, Stanbic Uganda Cup, CECAFA, FUFA Women, Juniors, Big League, Beach Soccer and The FUFA Drum." }] }),
  component: CompetitionsIndex,
});

function CompetitionsIndex() {
  const { data: competitions = [] } = useCompetitions();
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Competitions</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {competitions.map((c) => (
            <Link key={c.slug} to="/competitions/$slug" params={{ slug: c.slug }}
                  className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: c.color }}>{c.short.slice(0, 3)}</div>
              <div className="mt-3 font-display text-lg font-bold">{c.name}</div>
              {c.season && <div className="text-xs text-muted-foreground">{c.season}</div>}
              {c.description && <p className="mt-2 text-sm text-foreground/80">{c.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
