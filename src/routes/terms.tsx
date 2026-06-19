import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — FUFA TV" }, { name: "description", content: "FUFA TV terms of service." }] }),
  component: () => (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold">Terms of Service</h1>
        <p className="mt-4 text-foreground/80">By using FUFA TV you agree to use the service for personal, non-commercial viewing of football content. Streams are provided as-is.</p>
      </article>
    </Layout>
  ),
});
