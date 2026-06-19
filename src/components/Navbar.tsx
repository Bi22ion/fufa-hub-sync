import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Radio, Download, User as UserIcon, LogIn, Rss } from "lucide-react";
import { useState } from "react";
import { useCompetitions } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useSession } from "@/lib/useAuth";
import { useRadio, radio } from "@/lib/radioStore";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/live", label: "Live" },
  { to: "/schedule", label: "Schedule" },
  { to: "/videos", label: "Videos" },
  { to: "/news", label: "News" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [compsOpen, setCompsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { canInstall, install } = usePWAInstall();
  const { data: competitions = [] } = useCompetitions();
  const { session } = useSession();
  const { on: radioOn } = useRadio();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center">
          {/* Logo loads directly from the public root folder. Enlarged + responsive so it is clearly visible on every device. */}
          <img
            src="/fufa-logo-v2.png"
            alt="FUFA Logo"
            className="h-14 w-auto object-contain sm:h-16 lg:h-20"
          />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary/30 ${pathname === l.to ? "text-accent" : "text-foreground/90"}`}>
              {l.label}
            </Link>
          ))}
          <div className="relative" onMouseEnter={() => setCompsOpen(true)} onMouseLeave={() => setCompsOpen(false)}>
            <button className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/90 hover:bg-primary/30">Competitions ▾</button>
            {compsOpen && (
              <div className="absolute left-0 top-full w-72 rounded-lg border border-border bg-surface p-2 shadow-2xl">
                {competitions.map((c) => (
                  <Link key={c.slug} to="/competitions/$slug" params={{ slug: c.slug }} className="block rounded-md px-3 py-2 text-sm hover:bg-primary/30">{c.name}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {canInstall && (
            <Button variant="outline" size="sm" onClick={install} className="hidden border-accent/40 text-accent hover:bg-accent/10 hover:text-accent sm:inline-flex">
              <Download className="mr-1 h-4 w-4" /> Get App
            </Button>
          )}
          {session ? (
            <Link to="/account">
              <Button variant="outline" size="sm" className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
                <UserIcon className="mr-1 h-4 w-4" /> Account
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
                <LogIn className="mr-1 h-4 w-4" /> Sign in
              </Button>
            </Link>
          )}
         {/* Radio Toggle Button */}
          <button
            onClick={() => radio.toggle()}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:scale-110 active:scale-95`}
            aria-label="Toggle Radio"
          >
            {/* The Outer Animated Ring - Draws attention when Radio is off */}
            {!radioOn && (
              <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-75"></div>
            )}
            
            <div className={`relative h-11 w-11 overflow-hidden rounded-full border-2 transition-all duration-500 hover:rotate-[360deg] ${
              radioOn 
                ? "border-accent shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" 
                : "border-muted-foreground/30 animate-bounce"
            }`}>
              <img 
                src="/fufa-fm.png" 
                alt="FUFA FM" 
                className="h-full w-full object-cover" 
              />
            </div>
            
            {/* Active Status Indicator */}
            <span className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
              radioOn ? "bg-green-500" : "bg-gray-400"
            }`} />
          </button>

          {/* Watch Live Button */}
          <Link to="/live">
            <Button size="sm" className="bg-accent-red font-bold text-white hover:bg-accent-red/90">
              <Radio className="mr-1 h-4 w-4 animate-pulse" /> WATCH LIVE
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-surface p-3 lg:hidden">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-primary/30">{l.label}</Link>
          ))}
          <div className="mt-2 border-t border-border pt-2">
            <div className="px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">Competitions</div>
            {competitions.map((c) => (
              <Link key={c.slug} to="/competitions/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-primary/30">{c.name}</Link>
            ))}
          </div>
          <div className="mt-2 border-t border-border pt-2">
            {session
              ? <Link to="/account" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold text-accent">My Account</Link>
              : <Link to="/auth" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold text-accent">Sign in / Sign up</Link>}
          </div>
        </div>
      )}

      <div className="flag-stripe h-1 w-full" />
    </header>
  );
}
