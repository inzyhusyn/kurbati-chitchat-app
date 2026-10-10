import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Check, FolderPlus, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FOLDERS = ["Favorites", "Ideas"];

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

type SavedRow = { post_id: string; folder_name: string; created_at: string };

export function useMySaves() {
  return useQuery({
    queryKey: ["saves"],
    queryFn: async (): Promise<SavedRow[]> => {
      const me = await uid();
      const { data, error } = await supabase
        .from("saved_posts")
        .select("post_id, folder_name, created_at")
        .eq("user_id", me)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useSaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, folder }: { postId: string; folder: string | null }) => {
      const me = await uid();
      const { error } = folder
        ? await supabase.from("saved_posts").upsert({ user_id: me, post_id: postId, folder_name: folder }, { onConflict: "user_id,post_id" })
        : await supabase.from("saved_posts").delete().eq("user_id", me).eq("post_id", postId);
      if (error) throw error;
    },
    onMutate: ({ postId, folder }) => {
      const prev = qc.getQueryData<SavedRow[]>(["saves"]) ?? [];
      const rest = prev.filter((r) => r.post_id !== postId);
      qc.setQueryData(["saves"], folder ? [{ post_id: postId, folder_name: folder, created_at: new Date().toISOString() }, ...rest] : rest);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(["saves"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["saves"] }),
  });
}

export function useSavedFolder(postId: string) {
  const { data = [] } = useMySaves();
  return data.find((r) => r.post_id === postId)?.folder_name ?? null;
}

/** Bottom sheet asking which collection to save a post into. */
export function SaveToFolderSheet({ postId, onClose, onDone }: { postId: string; onClose: () => void; onDone?: (msg: string) => void }) {
  const { data = [] } = useMySaves();
  const current = data.find((r) => r.post_id === postId)?.folder_name ?? null;
  const folders = [...new Set([...DEFAULT_FOLDERS, ...data.map((r) => r.folder_name)])];
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const m = useSaveMutation();

  const choose = (folder: string | null) => {
    m.mutate({ postId, folder });
    onDone?.(folder ? `Saved to ${folder}` : "Removed from saved");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full rounded-t-2xl border-t border-border bg-card p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Save to collection</h3>
          <button type="button" aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col">
          {folders.map((f) => (
            <button key={f} type="button" onClick={() => choose(f)} className="flex items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-muted">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-muted"><Bookmark className="h-5 w-5" /></span>
              <span className="flex-1 text-sm font-medium">{f}</span>
              {current === f && <Check className="h-5 w-5 text-primary" />}
            </button>
          ))}
          {creating ? (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const n = name.trim().slice(0, 40);
                if (n) choose(n);
              }}
            >
              <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Collection name" className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary" />
              <button type="submit" disabled={!name.trim()} className="rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40">Save</button>
            </form>
          ) : (
            <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-muted">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-dashed border-border"><FolderPlus className="h-5 w-5" /></span>
              <span className="text-sm font-medium">Create new collection</span>
            </button>
          )}
          {current && (
            <button type="button" onClick={() => choose(null)} className="mt-2 rounded-lg py-3 text-sm font-semibold text-destructive hover:bg-muted">
              Remove from saved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Profile > Saved tab: posts grouped by collection. */
export function SavedCollections() {
  const { data: saves = [], isSuccess } = useMySaves();
  const [folder, setFolder] = useState<string | null>(null);
  const ids = saves.map((s) => s.post_id);
  const { data: posts = [] } = useQuery({
    queryKey: ["saves", "posts", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("id, media_url, media_type").in("id", ids);
      if (error) throw error;
      return data;
    },
  });
  const byId = new Map(posts.map((p) => [p.id, p]));
  const groups = new Map<string, SavedRow[]>();
  for (const s of saves) groups.set(s.folder_name, [...(groups.get(s.folder_name) ?? []), s]);

  if (isSuccess && saves.length === 0)
    return <p className="py-10 text-center text-sm text-muted-foreground">Nothing saved yet. Tap the bookmark on any post.</p>;

  const thumb = (src?: string, type?: string) =>
    !src ? <div className="h-full w-full bg-muted" /> : type === "video"
      ? <video src={src} className="h-full w-full object-cover" muted playsInline />
      : <img src={src} alt="" className="h-full w-full object-cover" />;

  if (folder) {
    const items = groups.get(folder) ?? [];
    return (
      <div>
        <button type="button" onClick={() => setFolder(null)} className="mb-2 text-sm font-semibold text-primary">← All collections</button>
        <h4 className="mb-2 font-semibold">{folder} · {items.length}</h4>
        <div className="grid grid-cols-3 gap-1">
          {items.map((s) => {
            const p = byId.get(s.post_id);
            return <div key={s.post_id} className="h-28 overflow-hidden bg-muted">{thumb(p?.media_url, p?.media_type)}</div>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {[...groups.entries()].map(([name, items]) => {
        const cover = byId.get(items[0]!.post_id);
        return (
          <button key={name} type="button" onClick={() => setFolder(name)} className="text-left">
            <div className="aspect-square overflow-hidden rounded-[14px] bg-muted">{thumb(cover?.media_url, cover?.media_type)}</div>
            <p className="mt-1 text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "post" : "posts"}</p>
          </button>
        );
      })}
      <span className="hidden"><Plus /></span>
    </div>
  );
}
