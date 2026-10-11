import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/account";
import { refreshPosts } from "@/lib/posts";
import { Button } from "@/components/ui/button";

export function ArchivedPosts() {
  const { data: me } = useMyProfile();
  const client = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { data: posts = [], isPending, isError } = useQuery({
    queryKey: ["archive-posts", me?.id], enabled: !!me,
    queryFn: async () => {
      if (!me) return [];
      const { data, error } = await supabase.from("posts").select("id, media_url, media_type, caption").eq("user_id", me.id).eq("is_archived", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const restore = async (id: string) => {
    if (!me) return;
    setPending(id); setError("");
    const { error } = await supabase.from("posts").update({ is_archived: false }).eq("id", id).eq("user_id", me.id);
    if (error) setError("Could not restore this post."); else await refreshPosts(client);
    setPending(null);
  };
  return <div className="p-4">
    {(isPending || isError || !posts.length) && <p className="py-10 text-center text-sm text-muted-foreground">{isPending ? "Loading archive…" : isError ? "Could not load archived posts." : "No archived posts."}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="grid grid-cols-2 gap-3">{posts.map((post) => <div key={post.id}>
      <div className="aspect-square overflow-hidden bg-muted">{post.media_type === "video" ? <video src={post.media_url} muted playsInline className="h-full w-full object-cover" /> : <img src={post.media_url} alt={post.caption || "Archived post"} className="h-full w-full object-cover" />}</div>
      <Button variant="outline" className="mt-2 w-full" disabled={pending !== null} onClick={() => restore(post.id)}>{pending === post.id ? "Restoring…" : "Show on profile"}</Button>
    </div>)}</div>
  </div>;
}