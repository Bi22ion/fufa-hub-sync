import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — FUFA TV" },
      { name: "description", content: "Get in touch with FUFA TV." },
      { property: "og:title", content: "Contact — FUFA TV" },
      { property: "og:description", content: "Get in touch with FUFA TV." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <Layout>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Contact FUFA TV</h1>
          <p className="mt-2 text-foreground/80">Questions, partnerships or feedback — we'd love to hear from you.</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-accent" /> tv@fufa.co.ug</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-accent" /> +256 414 000 000</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> FUFA House, Mengo, Kampala</li>
          </ul>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="space-y-3 rounded-2xl border border-border bg-surface p-6"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-accent" />
              <div className="mt-3 font-display text-xl font-bold">Thanks — message received!</div>
              <div className="text-sm text-muted-foreground">We'll get back to you shortly.</div>
            </div>
          ) : (
            <>
              <input required placeholder="Your name" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
              <input required type="email" placeholder="Email" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
              <textarea required placeholder="Your message" rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
              <Button type="submit" className="w-full bg-accent font-bold text-accent-foreground hover:bg-accent/90">Send Message</Button>
            </>
          )}
        </form>
      </div>
    </Layout>
  );
}
