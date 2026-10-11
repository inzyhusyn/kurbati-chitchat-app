import { supabase } from "@/integrations/supabase/client";
import type { QueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export type Post = {
  id: string | number;
  userId?: string | null;
  hideCounts?: boolean;
  commentsOff?: boolean;
  user: string;
  avatar: string | null;
  img: string;
  mediaType?: string;
  caption: string;
  likes: number;
  location?: string;
};

export function toPost(row: Tables<"posts">, profile?: Pick<Tables<"profiles">, "username" | "avatar_url"> | null): Post {
  return {
    id: row.id, userId: row.user_id, user: profile?.username ?? row.author_username,
    avatar: profile?.avatar_url ?? null, img: row.media_url, mediaType: row.media_type,
    caption: row.caption, likes: 0, hideCounts: row.hide_counts, commentsOff: row.comments_off,
    ...(row.location ? { location: row.location } : {}),
  };
}

export async function refreshPosts(client: QueryClient) {
  await Promise.all(["feed", "user-profile", "post-detail", "saves", "archive-posts"].map((key) =>
    client.invalidateQueries({ queryKey: [key] }),
  ));
}

export async function getPost(id: string) {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("username, avatar_url").eq("id", data.user_id ?? "").maybeSingle();
  if (profileError) throw profileError;
  return toPost(data, profile);
}