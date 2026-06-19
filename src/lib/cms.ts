import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types (camelCase, mapped from DB rows) ----------
export type Competition = { id: string; slug: string; name: string; short: string; color: string; description: string | null; season: string | null; sortOrder: number };
export type Match = { id: string; competitionSlug: string; home: string; away: string; kickoff: string; venue: string | null; status: "scheduled" | "live" | "full_time"; homeScore: number; awayScore: number };
export type LiveStream = { id: string; label: string; sourceType: string; url: string; priority: number; isActive: boolean; isFallback: boolean; isAuto: boolean; category: string | null };
export type Program = { id: string; title: string; competitionSlug: string | null; startTime: string; endTime: string; type: string; thumbnail: string | null; streamId: string | null; matchId: string | null; videoUrl: string | null; description: string | null };
export type Video = { id: string; title: string; competitionSlug: string | null; thumbnail: string | null; youtubeId: string; duration: string | null; publishedAt: string; sortOrder: number };
export type NewsItem = { id: string; slug: string; title: string; excerpt: string | null; body: string | null; hero: string | null; publishedAt: string };
export type TickerItem = { id: string; text: string; sortOrder: number; isActive: boolean };
export type SiteSetting = { key: string; value: any };

// ---------- Mappers ----------
const mapCompetition = (r: any): Competition => ({ id: r.id, slug: r.slug, name: r.name, short: r.short, color: r.color, description: r.description, season: r.season, sortOrder: r.sort_order });
const mapMatch = (r: any): Match => ({ id: r.id, competitionSlug: r.competition_slug, home: r.home, away: r.away, kickoff: r.kickoff, venue: r.venue, status: r.status, homeScore: r.home_score, awayScore: r.away_score });
const mapStream = (r: any): LiveStream => ({ id: r.id, label: r.label, sourceType: r.source_type, url: r.url, priority: r.priority, isActive: r.is_active, isFallback: r.is_fallback, isAuto: r.is_auto, category: r.category });
const mapProgram = (r: any): Program => ({ id: r.id, title: r.title, competitionSlug: r.competition_slug, startTime: r.start_time, endTime: r.end_time, type: r.type, thumbnail: r.thumbnail, streamId: r.stream_id, matchId: r.match_id, videoUrl: r.video_url ?? null, description: r.description ?? null });
const mapVideo = (r: any): Video => ({ id: r.id, title: r.title, competitionSlug: r.competition_slug, thumbnail: r.thumbnail, youtubeId: r.youtube_id, duration: r.duration, publishedAt: r.published_at, sortOrder: r.sort_order });
const mapNews = (r: any): NewsItem => ({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, hero: r.hero, publishedAt: r.published_at });
const mapTicker = (r: any): TickerItem => ({ id: r.id, text: r.text, sortOrder: r.sort_order, isActive: r.is_active });

// ---------- Query options ----------
export const competitionsQuery = queryOptions({
  queryKey: ["competitions"],
  queryFn: async (): Promise<Competition[]> => {
    const { data, error } = await supabase.from("competitions").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapCompetition);
  },
});

export const matchesQuery = queryOptions({
  queryKey: ["matches"],
  queryFn: async (): Promise<Match[]> => {
    const { data, error } = await supabase.from("matches").select("*").order("kickoff");
    if (error) throw error;
    return (data ?? []).map(mapMatch);
  },
});

export const streamsQuery = queryOptions({
  queryKey: ["live_streams"],
  queryFn: async (): Promise<LiveStream[]> => {
    const { data, error } = await supabase.from("live_streams").select("*").order("priority");
    if (error) throw error;
    return (data ?? []).map(mapStream);
  },
});

export const programsQuery = queryOptions({
  queryKey: ["programs"],
  queryFn: async (): Promise<Program[]> => {
    const { data, error } = await supabase.from("programs").select("*").order("start_time");
    if (error) throw error;
    return (data ?? []).map(mapProgram);
  },
});

export const videosQuery = queryOptions({
  queryKey: ["videos"],
  queryFn: async (): Promise<Video[]> => {
    const { data, error } = await supabase.from("videos").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapVideo);
  },
});

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async (): Promise<NewsItem[]> => {
    const { data, error } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNews);
  },
});

export const tickerQuery = queryOptions({
  queryKey: ["ticker_headlines"],
  queryFn: async (): Promise<TickerItem[]> => {
    const { data, error } = await supabase.from("ticker_headlines").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapTicker);
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<Record<string, any>> => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const obj: Record<string, any> = {};
    for (const r of data ?? []) obj[r.key] = r.value;
    return obj;
  },
});

// ---------- Hooks ----------
export const useCompetitions = () => useQuery(competitionsQuery);
export const useMatches = () => useQuery(matchesQuery);
export const useStreams = () => useQuery(streamsQuery);
export const usePrograms = () => useQuery(programsQuery);
export const useVideos = () => useQuery(videosQuery);
export const useNews = () => useQuery(newsQuery);
export const useTicker = () => useQuery(tickerQuery);
export const useSettings = () => useQuery(settingsQuery);

// ---------- Helpers ----------
export function getActiveProgram(programs: Program[]): Program | null {
  const t = Date.now();
  return programs.find(p => new Date(p.startTime).getTime() <= t && new Date(p.endTime).getTime() > t) ?? null;
}
export function getUpcomingPrograms(programs: Program[], limit = 3): Program[] {
  const t = Date.now();
  return programs.filter(p => new Date(p.startTime).getTime() > t).slice(0, limit);
}
export function getLiveMatch(matches: Match[]): Match | null {
  return matches.find(m => m.status === "live") ?? null;
}

// ---------- Generic CRUD mutations ----------
export function useUpsert(table: string, invalidateKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const t = supabase.from(table as any) as any;
      const { data, error } = row.id
        ? await t.update(row).eq("id", row.id).select().single()
        : await t.insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  });
}

export function useDelete(table: string, invalidateKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const t = supabase.from(table as any) as any;
      const { error } = await t.delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  });
}

export function useSettingUpsert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}
