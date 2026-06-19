import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useSettings } from "@/lib/cms";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FUFA TV" },
      { name: "description", content: "About FUFA TV — the official 24/7 football broadcaster of the Federation of Uganda Football Associations." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings = {} } = useSettings();
  const about = settings.about ?? { body: "" };
  const contact = settings.contact ?? {};
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-4xl font-extrabold">About FUFA TV</h1>
        <p className="mt-4 text-lg text-foreground/90 whitespace-pre-wrap">{about.body || "FUFA TV is the official broadcast home of the Federation of Uganda Football Associations."}</p>
        <h2 className="mt-10 font-display text-2xl font-extrabold">Our mission</h2>
        <p className="mt-2 text-foreground/80">Grow Ugandan football by connecting every fan to every match, every day.</p>
        {(contact.email || contact.phone || contact.address) && (
          <>
            <h2 className="mt-10 font-display text-2xl font-extrabold">Contact</h2>
            <ul className="mt-2 space-y-1 text-foreground/80">
              {contact.email && <li>📧 {contact.email}</li>}
              {contact.phone && <li>📞 {contact.phone}</li>}
              {contact.address && <li>📍 {contact.address}</li>}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
