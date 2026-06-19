import { useTicker } from "@/lib/cms";

const fallback = [
  "📺 FUFA TV — Uganda's Home of Football, Live Anytime",
  "⚽ Catch every UPL, Stanbic Uganda Cup and CECAFA fixture",
];

export function Ticker() {
  const { data } = useTicker();
  const list = (data?.length ? data.map(t => t.text) : fallback);
  const items = [...list, ...list];
  return (
    <div className="overflow-hidden border-y border-border bg-flag-black/40">
      <div className="flex items-center">
        <div className="flex shrink-0 items-center gap-2 bg-accent-red px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white">
          <span className="live-dot" /> Breaking
        </div>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="ticker-track text-sm font-medium text-foreground/90">
            {items.map((h, i) => <span key={i} className="px-4">{h}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
