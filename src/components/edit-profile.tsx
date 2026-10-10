import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { persistMedia, type Profile } from "@/lib/account";
import { Avatar } from "@/components/avatar";

export function EditProfileScreen({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);
  const [website, setWebsite] = useState(profile.website ?? "");
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const pick = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    if (f.size > 10 * 1024 * 1024) return toast.error("Image must be under 10MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    let site = website.trim();
    if (site && !/^https?:\/\//i.test(site)) site = `https://${site}`;
    if (site) {
      try { new URL(site); } catch { return toast.error("Website link looks invalid"); }
    }
    setSaving(true);
    try {
      const avatar_url = file && preview ? await persistMedia(preview) : profile.avatar_url;
      const { data, error } = await supabase
        .from("profiles")
        .update({ display_name: name.trim().slice(0, 60), bio: bio.slice(0, 150), website: site, avatar_url })
        .eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_private, website")
        .single();
      if (error) throw error;
      qc.setQueryData(["my-profile"], data);
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Profile updated");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button type="button" aria-label="Back" onClick={onClose}><ArrowLeft className="h-6 w-6 text-white" /></button>
        <h2 className="font-semibold text-white">Edit profile</h2>
        <button type="button" onClick={save} disabled={saving} className="font-semibold text-primary disabled:opacity-50">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Done"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="h-24 w-24 overflow-hidden rounded-[26px] border-2 border-white/70 bg-muted">
            <Avatar src={preview} alt="Profile photo" />
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-primary">
            Change profile photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs text-muted-foreground">Full name</span>
          <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs text-muted-foreground">Username</span>
          <input value={profile.username} disabled className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm opacity-60" />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs text-muted-foreground">Bio ({bio.length}/150)</span>
          <textarea value={bio} maxLength={150} rows={3} onChange={(e) => setBio(e.target.value)} className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs text-muted-foreground">Website</span>
          <input value={website} placeholder="yourwebsite.com" onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
    </div>
  );
}
