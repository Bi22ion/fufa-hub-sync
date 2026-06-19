import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useNews } from "@/lib/cms";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News — FUFA TV" }, { name: "description", content: "Latest Ugandan football news, press releases and feature stories from FUFA." }] }),
  component: NewsPage,
});

function NewsPage() {
  const { data: news = [] } = useNews();
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">News</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {news.length === 0 && <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">No news yet.</div>}
          {news.map((n) => (
            <article key={n.id} className="overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/50">
              {n.hero && <img src={n.hero} alt={n.title} className="h-56 w-full object-cover" />}
              <div className="p-5">
                <div className="text-xs text-muted-foreground">{new Date(n.publishedAt).toLocaleDateString()}</div>
                <h2 className="mt-1 font-display text-xl font-extrabold leading-tight">{n.title}</h2>
                {n.excerpt && <p className="mt-2 text-sm text-foreground/80">{n.excerpt}</p>}
                {n.body && <p className="mt-3 text-sm text-foreground/70 line-clamp-4">{n.body}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
