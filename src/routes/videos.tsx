import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useVideos, useCompetitions } from "@/lib/cms";
import { InlineVideoCard } from "@/components/InlineVideoCard";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{ title: "Videos & Highlights — FUFA TV" }, { name: "description", content: "On-demand football highlights, full match replays, interviews and press conferences." }] }),
  component: VideosPage,
});

function VideosPage() {
  const { data: videos = [] } = useVideos();
  const { data: competitions = [] } = useCompetitions();
  const [q, setQ] = useState("");
  const [comp, setComp] = useState<string>("all");
  const list = videos.filter((v) => (comp === "all" || v.competitionSlug === comp) && v.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Videos & Highlights</h1>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search highlights..." className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent" />
          </div>
          <select value={comp} onChange={(e) => setComp(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="all">All competitions</option>
            {competitions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <InlineVideoCard
              key={v.id}
              youtubeId={v.youtubeId}
              title={v.title}
              thumbnail={v.thumbnail}
              duration={v.duration}
              subtitle={competitions.find(c => c.slug === v.competitionSlug)?.short ?? null}
            />
          ))}
          {list.length === 0 && <div className="col-span-full rounded-xl border border-border bg-surface p-6 text-center text-muted-foreground">No videos match.</div>}
        </div>
      </div>
    </Layout>
  );
}
