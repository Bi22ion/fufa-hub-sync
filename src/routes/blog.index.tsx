import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useBlogPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — FUFA TV" },
      { name: "description", content: "Stories, analysis and features from FUFA TV." },
      { property: "og:title", content: "FUFA TV Blog" },
      { property: "og:description", content: "Stories, analysis and features from Ugandan football." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const visible = posts.filter(p => p.published);
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-extrabold">Blog</h1>
          <p className="mt-2 text-muted-foreground">Stories, tactical analysis, fan culture and behind-the-scenes from Ugandan football.</p>
        </header>
        {isLoading && <div className="text-muted-foreground">Loading…</div>}
        {!isLoading && visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted-foreground">No posts yet. Admins can publish from the Gatekeeper.</div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map(p => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/60">
              {p.hero && <img src={p.hero} alt={p.title} className="h-48 w-full object-cover transition group-hover:scale-105" />}
              <div className="p-5">
                <div className="text-xs uppercase tracking-wider text-accent">{new Date(p.publishedAt).toLocaleDateString()}</div>
                <h2 className="mt-1 font-display text-xl font-extrabold leading-tight group-hover:text-accent">{p.title}</h2>
                {p.excerpt && <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{p.excerpt}</p>}
                {p.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map(t => <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">{t}</span>)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
