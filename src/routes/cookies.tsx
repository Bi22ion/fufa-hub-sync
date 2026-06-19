import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Cookies — FUFA TV" }, { name: "description", content: "FUFA TV cookie policy." }] }),
  component: () => (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold">Cookie Policy</h1>
        <p className="mt-4 text-foreground/80">We use essential cookies to keep the player working and optional analytics cookies to improve programming.</p>
      </article>
    </Layout>
  ),
});
