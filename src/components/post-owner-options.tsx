import { useState } from "react";
import { Archive, EyeOff, Link2, MessageSquareOff, Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { refreshPosts, type Post } from "@/lib/posts";

export function PostOwnerOptions({ post, userId, onClose, onRemoved, onUpdated, onMessage }: {
  post: Post; userId: string; onClose: () => void; onRemoved: () => void;
  onUpdated: (patch: Partial<Post>) => void; onMessage: (message: string) => void;
}) {
  const client = useQueryClient();
  const [mode, setMode] = useState<"menu" | "edit" | "delete">("menu");
  const [caption, setCaption] = useState(post.caption);
  const [location, setLocation] = useState(post.location ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const update = async (values: { caption?: string; location?: string | null; hide_counts?: boolean; comments_off?: boolean; is_archived?: boolean }, patch: Partial<Post>, message: string) => {
    setPending(true); setError("");
    try {
      const { data, error: failure } = await supabase.from("posts").update(values).eq("id", String(post.id)).eq("user_id", userId).select("id").single();
      if (failure || !data) throw failure ?? new Error("Post no longer available.");
      if (values.is_archived) onRemoved(); else onUpdated(patch);
      onClose(); onMessage(message);
      await refreshPosts(client);
    } catch { setError("Could not save changes. Please try again."); }
    finally { setPending(false); }
  };
  const remove = async () => {
    setPending(true); setError("");
    try {
      const { data, error: failure } = await supabase.from("posts").delete().eq("id", String(post.id)).eq("user_id", userId).select("id").single();
      if (failure || !data) throw failure ?? new Error("Post no longer available.");
      onRemoved(); onClose(); onMessage("Post deleted");
      await refreshPosts(client);
    } catch { setError("Could not delete this post. Please try again."); }
    finally { setPending(false); }
  };
  const actions = [
    { label: "Edit", icon: Pencil, run: () => setMode("edit") },
    { label: "Archive", icon: Archive, run: () => update({ is_archived: true }, {}, "Post archived") },
    { label: "Hide like count", icon: EyeOff, active: post.hideCounts, run: () => update({ hide_counts: !post.hideCounts }, { hideCounts: !post.hideCounts }, post.hideCounts ? "Like count visible" : "Like count hidden") },
    { label: "Turn off commenting", icon: MessageSquareOff, active: post.commentsOff, run: () => update({ comments_off: !post.commentsOff }, { commentsOff: !post.commentsOff }, post.commentsOff ? "Commenting enabled" : "Commenting turned off") },
    { label: "Copy link", icon: Link2, run: async () => {
      try { await navigator.clipboard.writeText(`${window.location.origin}/home?post=${post.id}`); onClose(); onMessage("Link copied"); }
      catch { setError("Could not copy the link. Please try again."); }
    } },
    { label: "Delete", icon: Trash2, run: () => setMode("delete") },
  ];
  return <div className="pb-4">
    {mode === "menu" ? actions.map(({ label, icon: Icon, run, active }) => <Button key={label} type="button" variant="ghost" disabled={pending} onClick={run} aria-pressed={active} className={`h-12 w-full justify-start gap-3 rounded-none px-4 ${label === "Delete" ? "text-destructive" : "text-foreground"}`}><Icon className="h-5 w-5" /><span className="flex-1 text-left">{label}</span>{active && <span className="text-xs text-muted-foreground">On</span>}</Button>) : mode === "edit" ?
      <form className="space-y-4 p-4" onSubmit={(e) => { e.preventDefault(); void update({ caption: caption.trim(), location: location.trim() || null }, { caption: caption.trim(), location: location.trim() }, "Post updated"); }}>
        <h3 className="font-semibold">Edit post</h3>
        <label className="block text-sm">Caption<textarea value={caption} maxLength={2200} onChange={(e) => setCaption(e.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-input bg-background p-3" /></label>
        <label className="block text-sm">Location<input value={location} maxLength={200} onChange={(e) => setLocation(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background p-3" /></label>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={pending} onClick={() => setMode("menu")}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button></div>
      </form> : <div className="space-y-4 p-4"><h3 className="font-semibold">Delete post?</h3><p className="text-sm text-muted-foreground">This post and its comments will be permanently deleted.</p><div className="flex justify-end gap-2"><Button variant="ghost" disabled={pending} onClick={() => setMode("menu")}>Cancel</Button><Button variant="destructive" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete post"}</Button></div></div>}
    {error && <p role="alert" className="px-4 py-2 text-sm text-destructive">{error}</p>}
  </div>;
}