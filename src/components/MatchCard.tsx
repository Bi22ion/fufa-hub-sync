import type { Match } from "@/lib/cms";
import { useCompetitions } from "@/lib/cms";
import { Link } from "@tanstack/react-router";

export function MatchCard({ match }: { match: Match }) {
  const { data: competitions = [] } = useCompetitions();
  const comp = competitions.find((c) => c.slug === match.competitionSlug);
  const kickoff = new Date(match.kickoff);
  return (
    <Link
      to="/competitions/$slug"
      params={{ slug: match.competitionSlug }}
      className="block rounded-xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-accent">{comp?.short ?? match.competitionSlug}</span>
        {match.status === "live" && (
          <span className="flex items-center gap-1 rounded bg-accent-red px-2 py-0.5 font-extrabold uppercase text-white">
            <span className="live-dot bg-white" /> LIVE
          </span>
        )}
        {match.status === "full_time" && (
          <span className="rounded bg-muted px-2 py-0.5 font-bold uppercase text-muted-foreground">FT</span>
        )}
        {match.status === "scheduled" && (
          <span className="text-muted-foreground">{kickoff.toLocaleString([], { hour: "2-digit", minute: "2-digit", weekday: "short" })}</span>
        )}
      </div>
      <div className="grid grid-cols-3 items-center gap-2">
        <div className="truncate font-display font-bold">{match.home}</div>
        <div className="text-center">
          {match.status === "scheduled"
            ? <div className="text-2xl font-extrabold text-muted-foreground">vs</div>
            : <div className="text-2xl font-extrabold text-accent">{match.homeScore} - {match.awayScore}</div>}
        </div>
        <div className="truncate text-right font-display font-bold">{match.away}</div>
      </div>
      {match.venue && <div className="mt-2 text-center text-xs text-muted-foreground">{match.venue}</div>}
    </Link>
  );
}
