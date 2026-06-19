export type Competition = {
  slug: string;
  name: string;
  short: string;
  color: string;
  description: string;
  season: string;
};

export const competitions: Competition[] = [
  { slug: "uganda-premier-league", name: "StarTimes Uganda Premier League", short: "UPL", color: "#1E40C8", description: "Uganda's top-flight football league.", season: "2025/2026" },
  { slug: "stanbic-uganda-cup", name: "Stanbic Uganda Cup", short: "Cup", color: "#FFCC00", description: "The premier national knock-out competition.", season: "2025/2026" },
  { slug: "cecafa", name: "CECAFA", short: "CECAFA", color: "#E30613", description: "Council for East and Central Africa Football Associations.", season: "2025/2026" },
  { slug: "fufa-juniors-league", name: "FUFA Juniors League", short: "Juniors", color: "#1E40C8", description: "Developing the next generation of Cranes.", season: "2025/2026" },
  { slug: "fufa-women-super-league", name: "FUFA Women Super League", short: "Women", color: "#E30613", description: "Top tier of women's football in Uganda.", season: "2025/2026" },
  { slug: "fufa-big-league", name: "FUFA Big League", short: "Big League", color: "#FFCC00", description: "Second tier feeding the Premier League.", season: "2025/2026" },
  { slug: "beach-soccer", name: "Beach Soccer Uganda", short: "Beach", color: "#1E40C8", description: "Sand, sun and Sand Cranes action.", season: "2025/2026" },
  { slug: "the-fufa-drum", name: "The FUFA Drum", short: "Drum", color: "#E30613", description: "Regional pride competition across Uganda.", season: "2025/2026" },
];

export type Match = {
  id: string;
  competitionSlug: string;
  home: string;
  away: string;
  kickoff: string; // ISO
  venue: string;
  status: "scheduled" | "live" | "full_time";
  homeScore: number;
  awayScore: number;
};

const now = Date.now();
const iso = (offsetMin: number) => new Date(now + offsetMin * 60_000).toISOString();

export const matches: Match[] = [
  { id: "m1", competitionSlug: "uganda-premier-league", home: "KCCA FC", away: "Vipers SC", kickoff: iso(-30), venue: "Lugogo", status: "live", homeScore: 1, awayScore: 1 },
  { id: "m2", competitionSlug: "uganda-premier-league", home: "SC Villa", away: "URA FC", kickoff: iso(90), venue: "Mandela National Stadium", status: "scheduled", homeScore: 0, awayScore: 0 },
  { id: "m3", competitionSlug: "stanbic-uganda-cup", home: "Express FC", away: "BUL FC", kickoff: iso(240), venue: "Wankulukuku", status: "scheduled", homeScore: 0, awayScore: 0 },
  { id: "m4", competitionSlug: "fufa-women-super-league", home: "Kampala Queens", away: "She Corporate", kickoff: iso(-120), venue: "FUFA Technical Centre", status: "full_time", homeScore: 2, awayScore: 0 },
  { id: "m5", competitionSlug: "cecafa", home: "Uganda Cranes", away: "Kenya", kickoff: iso(1440), venue: "Mandela National Stadium", status: "scheduled", homeScore: 0, awayScore: 0 },
  { id: "m6", competitionSlug: "fufa-juniors-league", home: "Proline Academy", away: "Kataka FC", kickoff: iso(360), venue: "Kavumba", status: "scheduled", homeScore: 0, awayScore: 0 },
];

export type LiveStream = {
  id: string;
  label: string;
  sourceType: "youtube_live" | "hls" | "iframe";
  url: string;
  priority: number;
  isActive: boolean;
  isFallback?: boolean;
};

// FUFA TV official YouTube live embed + safe fallbacks
export const liveStreams: LiveStream[] = [
  { id: "s1", label: "FUFA TV Official", sourceType: "youtube_live", url: "https://www.youtube.com/embed/live_stream?channel=UCxq0bb5HRJxRJ7g5HZqU9wA&autoplay=1", priority: 1, isActive: true },
  { id: "s2", label: "Uganda Premier League Live", sourceType: "youtube_live", url: "https://www.youtube.com/embed/live_stream?channel=UCm6jBpJWGmuKicHTYbsMm2g&autoplay=1", priority: 2, isActive: true },
  { id: "s3", label: "CAF TV", sourceType: "youtube_live", url: "https://www.youtube.com/embed/live_stream?channel=UCDqLwlGyAaczL0DXjQyqkAg&autoplay=1", priority: 3, isActive: true },
  { id: "s4", label: "Backup Highlights Loop", sourceType: "youtube_live", url: "https://www.youtube.com/embed/videoseries?list=PLwI-aiLNV6IIE9w8gJ8ZcjUiHpqMt4ZIz&autoplay=1&loop=1", priority: 4, isActive: true, isFallback: true },
];

export type Video = {
  id: string;
  title: string;
  competitionSlug: string;
  thumbnail: string;
  youtubeId: string;
  publishedAt: string;
  duration: string;
};

export const videos: Video[] = [
  { id: "v1", title: "KCCA vs Vipers — Match Highlights", competitionSlug: "uganda-premier-league", thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*24), duration: "8:42" },
  { id: "v2", title: "Uganda Cranes Top 10 Goals 2025", competitionSlug: "cecafa", thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*48), duration: "12:18" },
  { id: "v3", title: "Stanbic Uganda Cup Final Recap", competitionSlug: "stanbic-uganda-cup", thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*72), duration: "15:03" },
  { id: "v4", title: "Women's Super League Round Up", competitionSlug: "fufa-women-super-league", thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*36), duration: "6:21" },
  { id: "v5", title: "FUFA Drum Regional Showdown", competitionSlug: "the-fufa-drum", thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*96), duration: "10:55" },
  { id: "v6", title: "Beach Soccer — Sand Cranes vs Tanzania", competitionSlug: "beach-soccer", thumbnail: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80", youtubeId: "dQw4w9WgXcQ", publishedAt: iso(-60*120), duration: "9:14" },
];

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  hero: string;
  publishedAt: string;
};

export const news: NewsItem[] = [
  { id: "n1", slug: "cranes-name-squad", title: "Uganda Cranes name 26-man squad for CECAFA", excerpt: "Coach Paul Put has confirmed the final list ahead of the regional tournament.", body: "Full squad announcement with debutants and returning veterans...", hero: "https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?w=1200&q=80", publishedAt: iso(-60*4) },
  { id: "n2", slug: "upl-fixtures-released", title: "StarTimes UPL releases Match Day 12 fixtures", excerpt: "Big derby weekend headlined by KCCA vs SC Villa.", body: "Complete Match Day 12 schedule and broadcast partners...", hero: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&q=80", publishedAt: iso(-60*10) },
  { id: "n3", slug: "women-league-expansion", title: "FUFA confirms Women Super League expansion", excerpt: "Two new clubs added to the top flight from next season.", body: "Federation outlines criteria and development pathway...", hero: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80", publishedAt: iso(-60*30) },
];

export const tickerHeadlines = [
  "🔴 LIVE: KCCA 1-1 Vipers — second half underway at Lugogo",
  "📅 SC Villa host URA FC tonight at Mandela National Stadium",
  "🏆 Stanbic Uganda Cup quarter-finals draw set for Friday",
  "⚽ Cranes squad announced for CECAFA — 26 players named",
  "🎯 Women Super League expands to 12 clubs next season",
  "📺 FUFA TV broadcasting all UPL matches this weekend",
];

// Schedule: next 24h of programs
export type Program = {
  id: string;
  title: string;
  competitionSlug?: string;
  startTime: string;
  endTime: string;
  type: "Live Match" | "Highlights" | "News" | "Press Conference" | "Replay";
  thumbnail: string;
};

export const schedule: Program[] = [
  { id: "p1", title: "FUFA Football Today", startTime: iso(-60), endTime: iso(-30), type: "News", thumbnail: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&q=80" },
  { id: "p2", title: "KCCA vs Vipers — LIVE", competitionSlug: "uganda-premier-league", startTime: iso(-30), endTime: iso(75), type: "Live Match", thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80" },
  { id: "p3", title: "Post-Match Press Conference", startTime: iso(75), endTime: iso(105), type: "Press Conference", thumbnail: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80" },
  { id: "p4", title: "SC Villa vs URA — LIVE", competitionSlug: "uganda-premier-league", startTime: iso(105), endTime: iso(210), type: "Live Match", thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80" },
  { id: "p5", title: "Women Super League Highlights", competitionSlug: "fufa-women-super-league", startTime: iso(210), endTime: iso(270), type: "Highlights", thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80" },
  { id: "p6", title: "FUFA Juniors Showcase", competitionSlug: "fufa-juniors-league", startTime: iso(270), endTime: iso(330), type: "Highlights", thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80" },
  { id: "p7", title: "The FUFA Drum Replay", competitionSlug: "the-fufa-drum", startTime: iso(330), endTime: iso(420), type: "Replay", thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80" },
];

export function getActiveProgram(): Program | null {
  const t = Date.now();
  return schedule.find(p => new Date(p.startTime).getTime() <= t && new Date(p.endTime).getTime() > t) ?? null;
}

export function getUpcomingPrograms(limit = 3): Program[] {
  const t = Date.now();
  return schedule.filter(p => new Date(p.startTime).getTime() > t).slice(0, limit);
}

export function getLiveMatch(): Match | null {
  return matches.find(m => m.status === "live") ?? null;
}
