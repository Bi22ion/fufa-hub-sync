import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useBlogPost } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — FUFA TV Blog` },
      { name: "description", content: "Read this story on the FUFA TV blog." },
    ],
  }),
  component: BlogPostPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <Layout><div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Couldn't load this post</h1>
        <p className="mt-2 text-sm text-muted-foreground">{(error as Error)?.message}</p>
        <button onClick={() => { reset(); router.invalidate(); }} className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">Retry</button>
      </div></Layout>
    );
  },
  notFoundComponent: () => (
    <Layout><div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-accent">← Back to blog</Link>
    </div></Layout>
  ),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) return <Layout><div className="py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!post) return (
    <Layout><div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-accent">← Back to blog</Link>
    </div></Layout>
  );

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-bold uppercase text-accent hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to blog
        </Link>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">{post.title}</h1>
        <div className="mt-2 text-xs text-muted-foreground">
          {post.author && <>By <span className="font-bold text-foreground">{post.author}</span> · </>}
          {new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </div>
        {post.hero && <img src={post.hero} alt={post.title} className="mt-6 w-full rounded-2xl object-cover" />}
        {post.excerpt && <p className="mt-6 text-lg text-foreground/90">{post.excerpt}</p>}
        {post.body && (
          <div className="prose prose-invert mt-6 max-w-none whitespace-pre-wrap text-foreground/90">
            {post.body}
          </div>
        )}
        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-4">
            {post.tags.map(t => <span key={t} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase text-accent">{t}</span>)}
          </div>
        )}
      </article>
    </Layout>
  );
}
