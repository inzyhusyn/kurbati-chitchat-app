import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media.functions";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  is_private: boolean;
};

function baseUsername(email?: string | null, name?: string | null) {
  const raw = (name || email?.split("@")[0] || "kurbati").toLowerCase();
  return raw.replace(/[^a-z0-9._]/g, "").slice(0, 20) || "kurbati";
}

/** Loads the signed-in user's profile, creating it on first sign-in. */
export async function ensureProfile(): Promise<Profile> {
  const { data: u, error: uErr } = await supabase.auth.getUser();
  if (uErr || !u.user) throw new Error("Not signed in");
  const user = u.user;
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, is_private")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return existing;

  const meta = user.user_metadata ?? {};
  const base = baseUsername(user.email, meta['username']);
  for (let i = 0; i < 5; i++) {
    const username = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        display_name: meta['full_name'] || meta['name'] || username,
        avatar_url: meta['avatar_url'] || meta['picture'] || null,
      })
      .select("id, username, display_name, avatar_url, bio, is_private")
      .single();
    if (!error && data) return data;
    if (error && error.code !== "23505") throw error;
  }
  throw new Error("Could not create profile");
}

export function useMyProfile() {
  return useQuery({ queryKey: ["my-profile"], queryFn: ensureProfile, staleTime: 60_000 });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Uploads local (blob:) media to storage and returns a permanent URL. */
export async function persistMedia(url: string): Promise<string> {
  if (!url.startsWith("blob:") && !url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  const base64 = await blobToBase64(blob);
  const res = await uploadMedia({ data: { base64, contentType: blob.type || "image/jpeg" } });
  return res.url;
}
