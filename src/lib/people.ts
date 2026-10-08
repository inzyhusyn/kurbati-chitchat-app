import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicProfile = { id: string; username: string; display_name: string; avatar_url: string | null };

/** Real registered users (excluding the signed-in user). */
export function usePeople(): PublicProfile[] {
  const { data = [] } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data.filter((p) => p.id !== u.user?.id);
    },
    staleTime: 60_000,
  });
  return data;
}

export function usePeopleNames(): string[] {
  return usePeople().map((p) => p.username);
}
