import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useLike(postKey: string) {
  const qc = useQueryClient();
  const key = ["like", postKey];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const me = await uid();
      const { count } = await supabase
        .from("post_likes")
        .select("user_id", { count: "exact", head: true })
        .eq("post_key", postKey);
      const { data: mine } = await supabase
        .from("post_likes")
        .select("user_id")
        .eq("post_key", postKey)
        .eq("user_id", me)
        .maybeSingle();
      return { count: count ?? 0, liked: !!mine };
    },
  });
  const m = useMutation({
    mutationFn: async (like: boolean) => {
      const me = await uid();
      if (like) {
        const { error } = await supabase
          .from("post_likes")
          .upsert({ user_id: me, post_key: postKey }, { onConflict: "user_id,post_key", ignoreDuplicates: true });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").delete().eq("user_id", me).eq("post_key", postKey);
        if (error) throw error;
      }
    },
    onMutate: (like) => {
      const prev = qc.getQueryData<{ count: number; liked: boolean }>(key);
      if (prev && prev.liked !== like)
        qc.setQueryData(key, { liked: like, count: prev.count + (like ? 1 : -1) });
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
  return {
    liked: q.data?.liked ?? false,
    count: q.data?.count ?? 0,
    setLiked: (v: boolean) => m.mutate(v),
  };
}

export function useFollow(username: string) {
  const qc = useQueryClient();
  const key = ["follow", username];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const me = await uid();
      const { data } = await supabase
        .from("follows")
        .select("target_username")
        .eq("follower_id", me)
        .eq("target_username", username)
        .maybeSingle();
      return !!data;
    },
  });
  const m = useMutation({
    mutationFn: async (follow: boolean) => {
      const me = await uid();
      const { error } = follow
        ? await supabase
            .from("follows")
            .upsert({ follower_id: me, target_username: username }, { onConflict: "follower_id,target_username", ignoreDuplicates: true })
        : await supabase.from("follows").delete().eq("follower_id", me).eq("target_username", username);
      if (error) throw error;
    },
    onMutate: (v) => {
      const prev = qc.getQueryData<boolean>(key);
      qc.setQueryData(key, v);
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.prev ?? false),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
  return {
    following: q.data ?? false,
    isReady: q.isSuccess,
    isPending: m.isPending,
    setFollowing: (v: boolean) => m.mutate(v),
  };
}
