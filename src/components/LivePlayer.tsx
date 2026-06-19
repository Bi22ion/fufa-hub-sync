import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStreams, usePrograms, useMatches, getActiveProgram, getLiveMatch, type LiveStream, type Program } from "@/lib/cms";
import { Radio, Users, Maximize2, Minimize2, Lock, Volume2, VolumeX } from "lucide-react";
import { useRadio } from "@/lib/radioStore";

type Source =
  | { kind: "program"; id: string; label: string; url: string; program: Program; locked: true }
  | (LiveStream & { kind: "live" | "auto" | "fallback"; locked?: false });

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function isYouTube(url: string) { return !!extractYouTubeId(url); }

function buildScheduledEmbed(videoUrl: string, offsetSeconds: number): string {
  const id = extractYouTubeId(videoUrl);
  if (id) {
    const start = Math.max(0, Math.floor(offsetSeconds));
    const params = new URLSearchParams({
      autoplay: "1", mute: "1", controls: "0", disablekb: "1",
      modestbranding: "1", rel: "0", playsinline: "1", enablejsapi: "1",
      start: String(start),
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }
  const sep = videoUrl.includes("#") ? "&" : "#";
  return `${videoUrl}${sep}t=${Math.max(0, Math.floor(offsetSeconds))}`;
}

function normaliseLiveUrl(url: string): string {
  const id = extractYouTubeId(url);
  if (!id) return url;
  const params = new URLSearchParams({
    autoplay: "1", mute: "1", playsinline: "1", enablejsapi: "1",
    modestbranding: "1", rel: "0",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function ytCommand(iframe: HTMLIFrameElement | null, func: string) {
  if (!iframe?.contentWindow) return;
  try {
    iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  } catch {}
}

export function LivePlayer({ showSelector = true, showOpenFull = false }: { showSelector?: boolean; showOpenFull?: boolean }) {
  const { data: streams = [] } = useStreams();
  const { data: programs = [] } = usePrograms();
  const { data: matches = [] } = useMatches();
  const { on: radioOn } = useRadio();

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  const chain = useMemo<Source[]>(() => {
    const out: Source[] = [];
    const active = getActiveProgram(programs);

    if (active && active.videoUrl) {
      const offset = Math.max(0, (Date.now() - new Date(active.startTime).getTime()) / 1000);
      out.push({
        kind: "program", id: `prog-${active.id}`,
        label: `📡 NOW: ${active.title}`,
        url: buildScheduledEmbed(active.videoUrl, offset),
        program: active, locked: true,
      });
    } else if (active && active.streamId) {
      const pinned = streams.find(s => s.id === active.streamId);
      if (pinned) out.push({ ...pinned, url: normaliseLiveUrl(pinned.url), label: `📡 NOW: ${active.title}`, kind: "live" });
    } else if (active) {
      const fallback =
        streams.find(s => s.isActive && !s.isAuto && !s.isFallback) ??
        streams.find(s => s.isActive && s.isAuto) ??
        streams.find(s => s.isActive && s.isFallback) ??
        streams.find(s => s.isActive);
      if (fallback) {
        out.push({ ...fallback, url: normaliseLiveUrl(fallback.url), id: `prog-${active.id}`, label: `📡 NOW: ${active.title}`, kind: "live" });
      }
    }

    for (const s of streams.filter(s => s.isActive && !s.isAuto && !s.isFallback).sort((a, b) => a.priority - b.priority)) {
      if (!out.find(o => o.id === s.id)) out.push({ ...s, url: normaliseLiveUrl(s.url), kind: "live" });
    }
    for (const s of streams.filter(s => s.isActive && s.isAuto).sort((a, b) => a.priority - b.priority)) {
      out.push({ ...s, url: normaliseLiveUrl(s.url), kind: "auto" });
    }
    for (const s of streams.filter(s => s.isActive && s.isFallback)) out.push({ ...s, url: normaliseLiveUrl(s.url), kind: "fallback" });
    return out;
  }, [streams, programs]);

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (chain[0]?.kind === "program") setActiveId(chain[0].id);
    else if (!chain.find(s => s.id === activeId)) setActiveId(chain[0]?.id ?? null);
  }, [chain[0]?.id, chain.length]);
  const active = chain.find(s => s.id === activeId) ?? chain[0];

  const [viewers, setViewers] = useState(0);
  useEffect(() => {
    setViewers(1200 + Math.floor(Math.random() * 800));
    const id = setInterval(() => setViewers(v => Math.max(50, v + Math.floor(Math.random() * 11) - 5)), 4000);
    return () => clearInterval(id);
  }, []);

  const liveMatch = getLiveMatch(matches);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [userMuted, setUserMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const effectiveMuted = userMuted || radioOn;
  useEffect(() => {
    const t = setTimeout(() => ytCommand(iframeRef.current, effectiveMuted ? "mute" : "unMute"), 400);
    return () => clearTimeout(t);
  }, [effectiveMuted, active?.id]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = wrapRef.current; if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  if (!active) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-border bg-flag-black text-sm text-muted-foreground">
        No live source configured. Admins can add one from the Gatekeeper.
      </div>
    );
  }

  const kindLabel: Record<string, string> = {
    program: "Scheduled programme (locked to broadcast time)",
    live: "Admin live source",
    auto: "Automated 24/7 sports feed",
    fallback: "Highlights fallback loop",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-flag-black shadow-2xl">
      <div ref={wrapRef} className="relative aspect-video w-full bg-black">
        <iframe
          ref={iframeRef}
          key={active.id}
          src={active.url}
          title={active.label}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
        {active.kind === "program" && (
          <div className="pointer-events-auto absolute inset-0" aria-hidden onContextMenu={(e) => e.preventDefault()} />
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md bg-accent-red px-2 py-1 text-xs font-extrabold uppercase text-white shadow-lg">
          <span className="live-dot bg-white" /> LIVE
        </div>
        {active.kind === "program" && (
          <div className="pointer-events-none absolute left-3 top-12 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Lock className="h-3 w-3" /> Broadcast time
          </div>
        )}
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white">
          <Users className="h-3.5 w-3.5" /> {viewers.toLocaleString()}
        </div>
        {liveMatch && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/80 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <span>{liveMatch.home}</span>
              <span className="rounded bg-accent px-2 py-0.5 text-accent-foreground">{liveMatch.homeScore} - {liveMatch.awayScore}</span>
              <span>{liveMatch.away}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={() => setUserMuted(m => !m)}
            disabled={radioOn}
            title={radioOn ? "Radio is on — video stays muted" : (effectiveMuted ? "Unmute video" : "Mute video")}
            className="flex items-center gap-1 rounded-md bg-black/70 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur hover:bg-black/90 disabled:opacity-60"
          >
            {effectiveMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {effectiveMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-lg hover:bg-accent/90"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>

          {showOpenFull && !isFullscreen && (
            <Link to="/live" className="flex items-center gap-1 rounded-md bg-flag-yellow px-3 py-1.5 text-xs font-bold text-flag-black shadow-lg hover:bg-flag-yellow/90">
              Open Live
            </Link>
          )}
        </div>

        {radioOn && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-full bg-black/80 px-4 py-2 text-xs font-bold uppercase text-white">
            📻 Radio is playing — video sound muted
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
            <Radio className="h-3.5 w-3.5" /> Now Playing
          </div>
          <div className="truncate font-display text-base font-bold">{active.label}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">{kindLabel[active.kind]}</div>
      </div>

      {showSelector && chain.length > 1 && (
        <div className="border-t border-border bg-surface/60 p-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Browse Channels {chain[0]?.kind === "program" && <span className="ml-1 text-[10px] text-accent/80">(scheduled programme is locked to current air time)</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {chain.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active.id === s.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background/40 text-foreground/80 hover:border-accent/60 hover:text-accent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { isYouTube, extractYouTubeId };
