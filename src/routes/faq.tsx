import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — FUFA TV" },
      { name: "description", content: "Frequently asked questions about FUFA TV." },
      { property: "og:title", content: "FAQ — FUFA TV" },
      { property: "og:description", content: "FAQ." },
    ],
  }),
  component: () => (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="mt-6">
          {[
            ["Is FUFA TV free?", "Yes — FUFA TV is free to watch on web and mobile."],
            ["How can I install the app?", "Click 'Get App' in the top bar (Android/Desktop) or use Safari's 'Add to Home Screen' on iOS."],
            ["What if a stream isn't working?", "Use the source selector on the Live page — we always have backup feeds ready."],
            ["Can I watch past matches?", "Yes — head to Videos for highlights and replays."],
          ].map(([q, a], i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left font-bold">{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  ),
});
