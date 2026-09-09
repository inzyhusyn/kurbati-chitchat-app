import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ChevronDown,
  Camera,
  Layers,
  Sparkles,
  Music2,
  Crop,
  SlidersHorizontal,
  MapPin,
  Users,
  Lock,
  BarChart3,
  Check,
  Plus,
  Loader2,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ---------------------------------------------------------------- data */

type Mode = "Post" | "Story" | "Reel" | "Live";
const MODES: Mode[] = ["Post", "Story", "Reel", "Live"];

type MediaItem = { id: string; url: string; type: "image" | "video" };

const GALLERY: MediaItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `g${i}`,
  url: `https://picsum.photos/seed/kurbatiroll${i + 1}/600/600`,
  type: i % 7 === 3 ? ("video" as const) : ("image" as const),
}));

const FILTERS: { name: string; css: string }[] = [
  { name: "Normal", css: "none" },
  { name: "Clarendon", css: "contrast(1.2) saturate(1.35)" },
  { name: "Gingham", css: "brightness(1.05) hue-rotate(-10deg) saturate(0.85)" },
  { name: "Moon", css: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Lark", css: "brightness(1.08) saturate(1.1) contrast(0.9)" },
  { name: "Reyes", css: "sepia(0.22) brightness(1.1) contrast(0.85)" },
  { name: "Juno", css: "saturate(1.4) contrast(1.05) hue-rotate(-8deg)" },
  { name: "Slumber", css: "saturate(0.66) brightness(1.05) sepia(0.15)" },
  { name: "Nashville", css: "sepia(0.2) contrast(1.2) brightness(1.05)" },
  { name: "Willow", css: "grayscale(0.5) contrast(0.95) brightness(1.1)" },
];

const TRACKS = [
  "Kesariya — Arijit Singh",
  "Blinding Lights — The Weeknd",
  "Tum Hi Ho — Arijit Singh",
  "Levitating — Dua Lipa",
  "Apna Bana Le — Sachin-Jigar",
  "Calm Down — Rema",
];

const PEOPLE = [
  "aarav_official",
  "sanya.k",
  "kabir.frames",
  "zoya_design",
  "rey.moves",
  "rohan.sharma",
  "priya.verma",
];

const LOCATIONS = [
  "Mumbai, India",
  "Kolkata, India",
  "Goa Beach",
  "Manali, Himachal",
  "Dubai, UAE",
  "Paris, France",
];

type Audience = "everyone" | "followers" | "close_friends" | "only_me" | "custom";

const AUDIENCE_LABEL: Record<Audience, string> = {
  everyone: "Everyone",
  followers: "Followers only",
  close_friends: "Close friends",
  only_me: "Only me",
  custom: "Custom audience",
};

function readPrivateAccount(): boolean {
  try {
    const raw = localStorage.getItem("kurbati.settings.v1");
    if (!raw) return false;
    return Boolean((JSON.parse(raw) as { privateAccount?: boolean }).privateAccount);
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------- shell */

function Header({
  title,
  onBack,
  backIcon = "x",
  action,
  onAction,
  busy,
}: {
  title: string;
  onBack: () => void;
  backIcon?: "x" | "back";
  action?: string;
  onAction?: () => void;
  busy?: boolean;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-black px-3 py-3">
      <button type="button" aria-label="Back" onClick={onBack} className="p-1 text-white">
        {backIcon === "x" ? <X className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          disabled={busy}
          className="flex items-center gap-1 px-1 text-base font-semibold text-white disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {action}
        </button>
      ) : (
        <span className="w-7" />
      )}
    </header>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-lg">
      {message}
    </div>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-[110] flex items-end bg-black/70 fade-in" onClick={onClose}>
      <div
        className="sheet-in max-h-[70%] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-[#0b0b0b] pb-6"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/30" />
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- flow */

export function CreatePostFlow({
  username,
  onClose,
  onPosted,
}: {
  username: string;
  onClose: () => void;
  onPosted?: () => void;
}) {
  const [step, setStep] = useState<"pick" | "edit" | "details">("pick");
  const [mode, setMode] = useState<Mode>("Post");
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState("Normal");
  const [music, setMusic] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[95] flex flex-col bg-black">
      {step === "pick" && (
        <GalleryPicker
          mode={mode}
          setMode={setMode}
          selected={selected}
          setSelected={setSelected}
          onClose={onClose}
          onNext={() => setStep("edit")}
          notify={setToast}
        />
      )}
      {step === "edit" && selected[0] && (
        <EditingStudio
          media={selected[0]}
          count={selected.length}
          filter={filter}
          setFilter={setFilter}
          music={music}
          setMusic={setMusic}
          enhanced={enhanced}
          setEnhanced={setEnhanced}
          onBack={() => setStep("pick")}
          onNext={() => setStep("details")}
          notify={setToast}
        />
      )}
      {step === "details" && selected[0] && (
        <DetailsScreen
          username={username}
          media={selected}
          mode={mode}
          filter={filter}
          music={music}
          setMusic={setMusic}
          onBack={() => setStep("edit")}
          onDone={() => {
            onPosted?.();
            onClose();
          }}
          notify={setToast}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

/* --------------------------------------------------------- 1. gallery */

function GalleryPicker({
  mode,
  setMode,
  selected,
  setSelected,
  onClose,
  onNext,
  notify,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  selected: MediaItem[];
  setSelected: (m: MediaItem[]) => void;
  onClose: () => void;
  onNext: () => void;
  notify: (m: string) => void;
}) {
  const [multi, setMulti] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const preview = selected[0] ?? GALLERY[0]!;

  const toggle = (item: MediaItem) => {
    if (!multi) {
      setSelected([item]);
      return;
    }
    const exists = selected.some((s) => s.id === item.id);
    if (exists) setSelected(selected.filter((s) => s.id !== item.id));
    else if (selected.length >= 10) notify("You can select up to 10 items");
    else setSelected([...selected, item]);
  };

  const onCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelected([
      { id: `cam-${Date.now()}`, url, type: file.type.startsWith("video") ? "video" : "image" },
    ]);
    notify("Captured — tap Next");
  };

  return (
    <>
      <Header
        title="New post"
        onBack={onClose}
        action={mode === "Live" ? "Go live" : "Next"}
        onAction={() => {
          if (mode === "Live") {
            notify("Live rooms are coming soon");
            return;
          }
          if (selected.length === 0) {
            notify("Select a photo or video first");
            return;
          }
          onNext();
        }}
      />

      {/* preview */}
      <div className="relative aspect-square w-full shrink-0 bg-[#0b0b0b]">
        <img src={preview.url} alt="Selected media preview" className="h-full w-full object-cover" />
        {preview.type === "video" && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            Video
          </span>
        )}
      </div>

      {/* controls */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-semibold text-white"
          onClick={() => notify("Recents album")}
        >
          Recents <ChevronDown className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={multi}
            onClick={() => {
              const next = !multi;
              setMulti(next);
              if (!next) setSelected(selected.slice(0, 1));
              notify(next ? "Select multiple on" : "Select multiple off");
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              multi ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
          >
            <Layers className="h-4 w-4" /> Select multiple
          </button>
          <button
            type="button"
            aria-label="Open camera"
            onClick={() => cameraRef.current?.click()}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={onCapture}
          />
        </div>
      </div>

      {/* grid */}
      <div className="no-scrollbar flex-1 overflow-y-auto pb-2">
        <div className="grid grid-cols-4 gap-[2px]">
          {GALLERY.map((item) => {
            const idx = selected.findIndex((s) => s.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className="relative aspect-square"
                aria-label={`Select media ${item.id}`}
              >
                <img src={item.url} alt="" className="h-full w-full object-cover" />
                {item.type === "video" && (
                  <span className="absolute bottom-1 right-1 text-[10px] font-semibold text-white">
                    0:15
                  </span>
                )}
                {idx >= 0 && (
                  <span className="absolute inset-0 border-2 border-white bg-black/30">
                    <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-black">
                      {multi ? idx + 1 : <Check className="h-3 w-3" />}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* mode switcher */}
      <div className="flex items-center justify-center gap-6 border-t border-border bg-black py-3">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-sm font-semibold tracking-wide ${
              mode === m ? "text-white" : "text-white/45"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </>
  );
}

/* ----------------------------------------------------------- 2. edit */

function EditingStudio({
  media,
  count,
  filter,
  setFilter,
  music,
  setMusic,
  enhanced,
  setEnhanced,
  onBack,
  onNext,
  notify,
}: {
  media: MediaItem;
  count: number;
  filter: string;
  setFilter: (f: string) => void;
  music: string | null;
  setMusic: (m: string | null) => void;
  enhanced: boolean;
  setEnhanced: (v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  notify: (m: string) => void;
}) {
  const [tab, setTab] = useState<"filter" | "edit" | "music">("filter");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [square, setSquare] = useState(true);

  const css = useMemo(() => {
    const base = FILTERS.find((f) => f.name === filter)?.css ?? "none";
    const parts = [base === "none" ? "" : base];
    parts.push(`brightness(${brightness / 100})`, `contrast(${contrast / 100})`);
    if (warmth) parts.push(`sepia(${warmth / 100})`);
    if (enhanced) parts.push("saturate(1.25)", "contrast(1.08)");
    return parts.filter(Boolean).join(" ");
  }, [filter, brightness, contrast, warmth, enhanced]);

  return (
    <>
      <Header title="Edit" onBack={onBack} backIcon="back" action="Next" onAction={onNext} />

      <div className="flex items-center justify-end gap-4 px-4 py-2">
        <button
          type="button"
          aria-pressed={enhanced}
          onClick={() => {
            setEnhanced(!enhanced);
            notify(!enhanced ? "Magic enhance on" : "Magic enhance off");
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            enhanced ? "bg-white text-black" : "bg-white/10 text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" /> Enhance
        </button>
        <button
          type="button"
          onClick={() => setTab("music")}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Volume2 className="h-4 w-4" /> Audio
        </button>
      </div>

      <div
        className={`relative w-full shrink-0 overflow-hidden bg-[#0b0b0b] ${
          square ? "aspect-square" : "aspect-[4/5]"
        }`}
      >
        <img
          src={media.url}
          alt="Editing preview"
          style={{ filter: css }}
          className="h-full w-full object-cover"
        />
        {count > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
            1/{count}
          </span>
        )}
        {music && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <Music2 className="h-3 w-3" /> {music}
          </span>
        )}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {tab === "filter" && (
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-3 py-4">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setFilter(f.name)}
                className="shrink-0 text-center"
              >
                <img
                  src={media.url}
                  alt=""
                  style={{ filter: f.css }}
                  className={`h-20 w-20 rounded-[14px] object-cover ${
                    filter === f.name ? "ring-2 ring-white" : "opacity-80"
                  }`}
                />
                <span
                  className={`mt-1.5 block text-[11px] ${
                    filter === f.name ? "font-semibold text-white" : "text-white/60"
                  }`}
                >
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "edit" && (
          <div className="space-y-5 px-4 py-4">
            <button
              type="button"
              onClick={() => setSquare(!square)}
              className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white"
            >
              <Crop className="h-4 w-4" /> Crop — {square ? "1:1 square" : "4:5 portrait"}
            </button>
            <Slider label="Brightness" value={brightness} min={50} max={150} onChange={setBrightness} />
            <Slider label="Contrast" value={contrast} min={50} max={160} onChange={setContrast} />
            <Slider label="Warmth" value={warmth} min={0} max={60} onChange={setWarmth} />
            <button
              type="button"
              onClick={() => {
                setBrightness(100);
                setContrast(100);
                setWarmth(0);
                setFilter("Normal");
                setEnhanced(false);
                notify("Adjustments reset");
              }}
              className="text-xs font-semibold text-white/70"
            >
              Reset all
            </button>
          </div>
        )}

        {tab === "music" && (
          <div className="px-2 py-3">
            {music && (
              <button
                type="button"
                onClick={() => {
                  setMusic(null);
                  notify("Music removed");
                }}
                className="mb-2 w-full px-2 text-left text-xs font-semibold text-destructive"
              >
                Remove current track
              </button>
            )}
            {TRACKS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setMusic(t);
                  notify("Track added");
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Music2 className="h-4 w-4" /> {t}
                </span>
                {music === t && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-border bg-black">
        {(
          [
            ["filter", "Filters", SlidersHorizontal],
            ["edit", "Edit", Crop],
            ["music", "Music", Music2],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 py-3 text-[11px] font-semibold ${
              tab === key ? "text-white" : "text-white/45"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white"
      />
    </label>
  );
}

/* -------------------------------------------------------- 3. details */

function DetailsScreen({
  username,
  media,
  mode,
  filter,
  music,
  setMusic,
  onBack,
  onDone,
  notify,
}: {
  username: string;
  media: MediaItem[];
  mode: Mode;
  filter: string;
  music: string | null;
  setMusic: (m: string | null) => void;
  onBack: () => void;
  onDone: () => void;
  notify: (m: string) => void;
}) {
  const [caption, setCaption] = useState("");
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [location, setLocation] = useState<string | null>(null);
  const [tagged, setTagged] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience>("everyone");
  const [custom, setCustom] = useState<string[]>([]);
  const [hideCounts, setHideCounts] = useState(false);
  const [commentsOff, setCommentsOff] = useState(false);
  const [sheet, setSheet] = useState<"location" | "tag" | "audience" | "music" | "custom" | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const isPrivate = useMemo(readPrivateAccount, []);

  const effectiveAudience: Audience = isPrivate ? "followers" : audience;

  const share = async () => {
    setSaving(true);
    const first = media[0]!;
    const { error } = await supabase.from("posts").insert({
      author_username: username,
      media_url: first.url,
      media_type: first.type,
      post_kind: mode.toLowerCase(),
      filter,
      music,
      caption,
      poll_question: pollOpen && pollQuestion.trim() ? pollQuestion.trim() : null,
      poll_options: pollOpen ? pollOptions.filter((o) => o.trim()) : [],
      location,
      tagged_people: tagged,
      audience: effectiveAudience,
      custom_audience: effectiveAudience === "custom" ? custom : [],
      hide_counts: hideCounts,
      comments_off: commentsOff,
    });
    setSaving(false);
    if (error) {
      notify("Could not share. Please try again.");
      return;
    }
    notify("Shared!");
    setTimeout(onDone, 700);
  };

  return (
    <>
      <Header
        title="New post"
        onBack={onBack}
        backIcon="back"
        action="Share"
        onAction={share}
        busy={saving}
      />

      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        {/* caption */}
        <div className="flex gap-3 border-b border-border px-4 py-4">
          <img
            src={media[0]!.url}
            alt="Post thumbnail"
            className="h-16 w-16 shrink-0 rounded-[12px] object-cover"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
            placeholder="Write a caption..."
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        {/* poll */}
        <div className="border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setPollOpen(!pollOpen)}
            className="flex w-full items-center justify-between text-sm text-white"
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" /> Add a poll
            </span>
            <span className="text-xs text-white/50">{pollOpen ? "Remove" : "Add"}</span>
          </button>
          {pollOpen && (
            <div className="mt-3 space-y-2">
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question"
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) =>
                    setPollOptions(pollOptions.map((o, j) => (j === i ? e.target.value : o)))
                  }
                  placeholder={`Option ${i + 1}`}
                  className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="flex items-center gap-1 text-xs font-semibold text-white/70"
                >
                  <Plus className="h-3 w-3" /> Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* rows */}
        <Row
          icon={MapPin}
          label={location ?? "Add location"}
          onClick={() => setSheet("location")}
        />
        <Row
          icon={Users}
          label={tagged.length ? `Tagged: ${tagged.length} people` : "Tag people"}
          onClick={() => setSheet("tag")}
        />
        <Row
          icon={Lock}
          label="Audience"
          value={
            isPrivate ? "Followers only (private account)" : AUDIENCE_LABEL[audience]
          }
          disabled={isPrivate}
          onClick={() =>
            isPrivate
              ? notify("Your account is private — followers only is enforced")
              : setSheet("audience")
          }
        />
        <Row
          icon={Music2}
          label={music ?? "Add music"}
          onClick={() => setSheet("music")}
        />

        <p className="px-4 pb-1 pt-5 text-xs font-semibold uppercase tracking-wide text-white/40">
          Advanced settings
        </p>
        <ToggleRow
          label="Hide like and view counts"
          hint="Only you will see the totals on this post."
          checked={hideCounts}
          onChange={setHideCounts}
        />
        <ToggleRow
          label="Turn off commenting"
          hint="You can change this later from the post menu."
          checked={commentsOff}
          onChange={setCommentsOff}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-border bg-black p-3">
        <button
          type="button"
          onClick={share}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Sharing..." : "Share"}
        </button>
      </div>

      {sheet === "location" && (
        <Sheet title="Add location" onClose={() => setSheet(null)}>
          {LOCATIONS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLocation(l);
                setSheet(null);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white hover:bg-white/5"
            >
              <MapPin className="h-4 w-4" /> {l}
              {location === l && <Check className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </Sheet>
      )}

      {sheet === "tag" && (
        <Sheet title="Tag people" onClose={() => setSheet(null)}>
          <PeopleList
            people={PEOPLE}
            selected={tagged}
            onToggle={(u) =>
              setTagged(tagged.includes(u) ? tagged.filter((t) => t !== u) : [...tagged, u])
            }
          />
        </Sheet>
      )}

      {sheet === "music" && (
        <Sheet title="Add music" onClose={() => setSheet(null)}>
          {TRACKS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setMusic(t);
                setSheet(null);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white hover:bg-white/5"
            >
              <Music2 className="h-4 w-4" /> {t}
              {music === t && <Check className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </Sheet>
      )}

      {sheet === "audience" && (
        <Sheet title="Who can see this post" onClose={() => setSheet(null)}>
          {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAudience(a);
                if (a === "custom") setSheet("custom");
                else setSheet(null);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white hover:bg-white/5"
            >
              {AUDIENCE_LABEL[a]}
              {audience === a && <Check className="h-4 w-4" />}
            </button>
          ))}
        </Sheet>
      )}

      {sheet === "custom" && (
        <Sheet title="Custom audience" onClose={() => setSheet(null)}>
          <PeopleList
            people={PEOPLE}
            selected={custom}
            onToggle={(u) =>
              setCustom(custom.includes(u) ? custom.filter((c) => c !== u) : [...custom, u])
            }
          />
          <div className="px-4 pt-2">
            <button
              type="button"
              onClick={() => setSheet(null)}
              className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-black"
            >
              Done ({custom.length})
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

function PeopleList({
  people,
  selected,
  onToggle,
}: {
  people: string[];
  selected: string[];
  onToggle: (u: string) => void;
}) {
  return (
    <div>
      {people.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onToggle(u)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white hover:bg-white/5"
        >
          <img
            src={`https://picsum.photos/seed/${u}/80/80`}
            alt=""
            className="h-9 w-9 rounded-[10px] object-cover"
          />
          <span className="flex-1">{u}</span>
          <span
            className={`grid h-5 w-5 place-items-center rounded-[6px] border ${
              selected.includes(u) ? "border-white bg-white text-black" : "border-white/40"
            }`}
          >
            {selected.includes(u) && <Check className="h-3 w-3" />}
          </span>
        </button>
      ))}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={disabled}
      className={`flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left text-sm ${
        disabled ? "text-white/35" : "text-white"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1 truncate">{label}</span>
      {value && <span className="max-w-[45%] truncate text-xs text-white/50">{value}</span>}
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-3.5">
      <div className="flex-1">
        <p className="text-sm text-white">{label}</p>
        <p className="mt-0.5 text-xs text-white/45">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
          checked ? "bg-white" : "bg-white/20"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full transition ${
            checked ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
          }`}
        />
      </button>
    </div>
  );
}
