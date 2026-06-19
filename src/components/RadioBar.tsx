import { useEffect, useRef, useState } from "react";
import { Radio, X, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useRadio, radio } from "@/lib/radioStore";
import { useSettings } from "@/lib/cms";

export function RadioBar() {
  const { on } = useRadio();
  const { data: settings = {} } = useSettings();
  const cfg = (settings as any).radio ?? {};
  const streamUrl: string = cfg.streamUrl ?? "";
  const name: string = cfg.name ?? "FUFA FM";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!on) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (!streamUrl) { setErr("No radio stream configured yet."); return; }
    setErr(null);
    const a = audioRef.current;
    if (!a) return;
    a.src = streamUrl;
    a.volume = vol;
    a.muted = muted;
    a.play().then(() => setPlaying(true)).catch(() => setErr("Tap play to start the radio."));
  }, [on, streamUrl]);

  useEffect(() => { if (audioRef.current) { audioRef.current.volume = vol; audioRef.current.muted = muted; } }, [vol, muted]);

  if (!on) return null;

  const togglePlay = async () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) { try { await a.play(); setPlaying(true); setErr(null); } catch { setErr("Could not start playback."); } }
    else { a.pause(); setPlaying(false); }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-accent/40 bg-flag-black/95 text-white shadow-2xl backdrop-blur">
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-accent">
          <span className="live-dot bg-accent" />
          <Radio className="h-4 w-4" /> {name}
        </div>
        <div className="hidden text-xs text-white/70 sm:block">Video sound is muted while the radio is on.</div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={togglePlay} className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/90">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={() => setMuted(m => !m)} className="rounded-md border border-white/20 p-1.5 hover:bg-white/10">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(+e.target.value)} className="hidden w-24 accent-accent sm:block" />
          <button onClick={() => radio.set(false)} className="rounded-md border border-white/20 p-1.5 hover:bg-white/10" aria-label="Close radio">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {err && <div className="bg-accent-red/20 px-4 py-1 text-center text-[11px] text-white">{err}</div>}
    </div>
  );
}
