import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Tables → query keys to invalidate on any change
const TABLE_KEYS: Record<string, string[]> = {
  programs: ["programs"],
  live_streams: ["live_streams"],
  matches: ["matches"],
  ticker_headlines: ["ticker_headlines"],
  site_settings: ["site_settings"],
  videos: ["videos"],
  news: ["news"],
  competitions: ["competitions"],
};

/**
 * Subscribe once (per app mount) to CMS table changes and invalidate
 * the matching react-query caches so the public site reflects gatekeeper
 * edits in real time.
 */
export function useRealtimeCms() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel("cms-changes");
    for (const table of Object.keys(TABLE_KEYS)) {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => qc.invalidateQueries({ queryKey: TABLE_KEYS[table] })
      );
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
