import { useState } from "react";
import { Play, X } from "lucide-react";

export function InlineVideoCard({
  youtubeId,
  title,
  thumbnail,
  duration,
  subtitle,
}: {
  youtubeId: string;
  title: string;
  thumbnail?: string | null;
  duration?: string | null;
  subtitle?: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full overflow-hidden rounded-xl border border-border bg-surface text-left transition hover:-translate-y-0.5 hover:border-accent/50"
      >
        <div className="relative aspect-video overflow-hidden bg-black">
          {thumbnail
            ? <img src={thumbnail} alt={title} className="h-full w-full object-cover transition group-hover:scale-105" />
            : <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt={title} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/50">
            <Play className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
          {duration && <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-bold text-white">{duration}</div>}
        </div>
        <div className="p-3">
          <div className="font-display font-bold leading-tight">{title}</div>
          {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-hidden rounded-xl bg-black shadow-2xl">
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
              <div className="border-t border-border bg-surface p-3">
                <div className="font-display font-bold">{title}</div>
                {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
