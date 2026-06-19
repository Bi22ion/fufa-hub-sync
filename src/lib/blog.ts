import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  hero: string | null;
  author: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string;
};

const map = (r: any): BlogPost => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, hero: r.hero,
  author: r.author, tags: r.tags ?? [], published: r.published, publishedAt: r.published_at,
});

export const blogQuery = queryOptions({
  queryKey: ["blog_posts"],
  queryFn: async (): Promise<BlogPost[]> => {
    const { data, error } = await (supabase.from("blog_posts" as any) as any)
      .select("*").order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
});

export const useBlogPosts = () => useQuery(blogQuery);

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog_posts", slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await (supabase.from("blog_posts" as any) as any)
        .select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data ? map(data) : null;
    },
  });
}

export function useBlogUpsert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const t = supabase.from("blog_posts" as any) as any;
      const { data, error } = row.id
        ? await t.update(row).eq("id", row.id).select().single()
        : await t.insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog_posts"] }),
  });
}

export function useBlogDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("blog_posts" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog_posts"] }),
  });
}
