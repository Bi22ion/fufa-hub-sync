import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="flag-stripe h-1 w-full" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-10 w-10" />
            <span className="font-display text-xl font-extrabold">FUFA <span className="text-accent">TV</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Uganda's Home of Football — Live, Anytime, Anywhere.
          </p>
        </div>
        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-accent">Watch</div>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link to="/live" className="hover:text-accent">Live Football</Link></li>
            <li><Link to="/schedule" className="hover:text-accent">Schedule</Link></li>
            <li><Link to="/videos" className="hover:text-accent">Highlights</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-accent">FUFA</div>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/news" className="hover:text-accent">News</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-accent">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-accent">Legal</div>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link to="/privacy" className="hover:text-accent">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-accent">Terms</Link></li>
            <li><Link to="/cookies" className="hover:text-accent">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FUFA TV. All rights reserved.
      </div>
    </footer>
  );
}
