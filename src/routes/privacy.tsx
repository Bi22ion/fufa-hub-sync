import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — FUFA TV" }, { name: "description", content: "FUFA TV privacy policy." }] }),
  component: () => (
    <Layout>
      <article className="prose prose-invert mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-foreground/80">FUFA TV respects your privacy. We collect minimal data needed to deliver the service. Anonymous analytics help us improve programming. We never sell personal data.</p>
      </article>
    </Layout>
  ),
});
