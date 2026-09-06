import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Search,
  Video,
  MessageCircle,
  User,
  Heart,
  MessageSquare,
  Send,
  Plus,
  Bookmark,
  MoreHorizontal,
  X,
  Link2,
  Share2,
  Flag,
  UserMinus,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Camera,
  UserPlus,
} from "lucide-react";
import brandLogo from "@/assets/kurbati-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kurbati Chitchat — Deep Dark Social" },
      {
        name: "description",
        content:
          "Kurbati Chitchat — a sleek deep-dark social space for stories, reels, chat and your profile.",
      },
      { property: "og:title", content: "Kurbati Chitchat" },
      {
        property: "og:description",
        content:
          "A sleek deep-dark social space for stories, reels, chat and your profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "home" | "search" | "reels" | "chat" | "profile";

function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [headerHidden, setHeaderHidden] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewUser, setViewUser] = useState<string | null>(null);
  const lastScroll = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const y = e.currentTarget.scrollTop;
    const prev = lastScroll.current;
    if (y > prev && y > 48) setHeaderHidden(true);
    else if (y < prev - 4 || y <= 8) setHeaderHidden(false);
    lastScroll.current = y;
  };

  return (
    <div className="flex min-h-screen justify-center bg-background font-sans text-foreground">
      {/* Mobile Frame */}
      <div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden border-x border-border bg-black">
        {/* TOP HEADER — auto-hides on scroll down */}
        <header
          className={`absolute inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-[#000000] px-4 py-2.5 transition-transform duration-300 ${
            headerHidden ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <h1 className="flex items-center">
            <img
              src={brandLogo}
              alt="Kurbati Chitchat"
              className="h-10 w-auto select-none"
              draggable={false}
            />
          </h1>
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => setNotificationsOpen(true)}
              className="relative"
            >
              <Heart className="h-6 w-6 cursor-pointer text-white transition hover:scale-110" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button
              type="button"
              aria-label="Open messages"
              onClick={() => setActiveTab("chat")}
            >
              <MessageCircle className="h-6 w-6 cursor-pointer text-white transition hover:scale-110" />
            </button>
          </div>
        </header>

        {/* MAIN DYNAMIC CONTENT AREA */}
        <main
          onScroll={handleScroll}
          className="no-scrollbar flex-1 overflow-y-auto pb-20 pt-[60px]"
        >
          {activeTab === "home" && <HomeFeed onOpenUser={setViewUser} />}
          {activeTab === "search" && <ExplorePage />}
          {activeTab === "reels" && <ReelsPage onOpenUser={setViewUser} />}
          {activeTab === "chat" && <ChatPage />}
          {activeTab === "profile" && <ProfilePage />}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="absolute bottom-0 z-50 flex w-full items-center justify-around border-t border-border bg-black/90 py-3 backdrop-blur-md">
          <NavButton
            label="Home"
            active={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          >
            <Home className="h-6 w-6" />
          </NavButton>
          <NavButton
            label="Explore"
            active={activeTab === "search"}
            onClick={() => setActiveTab("search")}
          >
            <Search className="h-6 w-6" />
          </NavButton>

          {/* Center create button — squarish with rounded corners */}
          <button
            type="button"
            aria-label="Create new post"
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-white/70 bg-white/10 text-white transition hover:bg-white hover:text-black"
          >
            <Plus className="h-5 w-5" />
          </button>

          <NavButton
            label="Reels"
            active={activeTab === "reels"}
            onClick={() => setActiveTab("reels")}
          >
            <Video className="h-6 w-6" />
          </NavButton>
          <NavButton
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-6 w-6" />
          </NavButton>
        </nav>

        {notificationsOpen && (
          <NotificationsSheet onClose={() => setNotificationsOpen(false)} />
        )}
        {viewUser && (
          <UserProfilePage
            username={viewUser}
            onClose={() => setViewUser(null)}
          />
        )}
      </div>
    </div>
  );
}

function NavButton({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`cursor-pointer transition active:scale-90 ${
        active ? "text-white" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Shared overlay primitives                                         */
/* ---------------------------------------------------------------- */

function BottomSheet({
  title,
  onClose,
  children,
  heightClass = "max-h-[75%]",
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  heightClass?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sheet-in relative flex ${heightClass} flex-col overflow-hidden rounded-t-2xl border-t border-border bg-card`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 pt-3">
            <h3 className="text-sm font-semibold">{title}</h3>
            <button type="button" aria-label="Close sheet" onClick={onClose}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}
        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}

function SheetAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition hover:bg-accent ${
        danger ? "text-destructive" : "text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fade-in pointer-events-none absolute bottom-24 left-1/2 z-[90] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black shadow-lg">
      {message}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* 1. HOME FEED                                                      */
/* ---------------------------------------------------------------- */

type Story = { id: number; name: string; username: string; img: string; you?: boolean };

const STORIES: Story[] = [
  { id: 1, name: "Your Story", username: "you", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80", you: true },
  { id: 2, name: "Aarav", username: "aarav_official", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80" },
  { id: 3, name: "Sanya", username: "sanya.k", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80" },
  { id: 4, name: "Kabir", username: "kabir.frames", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80" },
  { id: 5, name: "Zoya", username: "zoya_design", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80" },
  { id: 6, name: "Rey", username: "rey.moves", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=80" },
];

function HomeFeed({ onOpenUser }: { onOpenUser: (username: string) => void }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const others = STORIES.filter((s) => !s.you);

  return (
    <div className="flex flex-col">
      {/* Stories Bar */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-border px-4 py-3">
        {STORIES.map((story) => (
          <div
            key={story.id}
            className="flex flex-shrink-0 flex-col items-center"
          >
            <button
              type="button"
              aria-label={story.you ? "Add to your story" : `View ${story.name}'s story`}
              onClick={() => {
                if (story.you) setUploadOpen(true);
                else setViewerIndex(others.findIndex((o) => o.id === story.id));
              }}
              className="cursor-pointer active:scale-95"
            >
              <div className="relative">
                <div
                  className={`h-16 w-16 overflow-hidden rounded-[18px] p-[2px] ${
                    story.you ? "bg-muted" : "story-ring"
                  }`}
                >
                  <img
                    src={story.img}
                    alt={story.name}
                    className="h-full w-full rounded-[16px] border-2 border-black object-cover"
                  />
                </div>
                {story.you && (
                  <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-[7px] border-2 border-black bg-white text-black">
                    <Plus className="h-3 w-3" />
                  </span>
                )}
              </div>
            </button>
            <button
              type="button"
              aria-label={`Open ${story.username}'s profile`}
              onClick={() => onOpenUser(story.username)}
              className="mt-1 max-w-[64px] truncate text-xs text-foreground/70 transition hover:text-foreground"
            >
              {story.name}
            </button>
          </div>
        ))}
      </div>

      <HomeFeedPosts onOpenUser={onOpenUser} />

      {viewerIndex !== null && (
        <StoryViewer
          stories={others}
          startIndex={viewerIndex}
          onOpenUser={(u) => {
            setViewerIndex(null);
            onOpenUser(u);
          }}
          onClose={() => setViewerIndex(null)}
        />
      )}
      {uploadOpen && <StoryUploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

/* Full-screen Instagram-style story viewer with progress bars */
function StoryViewer({
  stories,
  startIndex,
  onClose,
  onOpenUser,
}: {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onOpenUser: (username: string) => void;
}) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (index < stories.length - 1) setIndex(index + 1);
      else onClose();
    }, 4000);
    return () => window.clearTimeout(t);
  }, [index, stories.length, onClose]);

  const story = stories[index];
  if (!story) return null;

  return (
    <div className="fade-in absolute inset-0 z-[80] flex flex-col bg-black">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3">
        {stories.map((s, i) => (
          <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className={`h-full bg-white ${i === index ? "story-progress" : ""}`}
              style={{
                width: i < index ? "100%" : i === index ? undefined : "0%",
                animationDuration: i === index ? "4s" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-label={`Open ${story.username}'s profile`}
          onClick={() => onOpenUser(story.username)}
          className="flex items-center gap-3"
        >
          <div className="story-ring h-9 w-9 overflow-hidden rounded-[11px] p-[2px]">
            <img
              src={story.img}
              alt={story.name}
              className="h-full w-full rounded-[9px] border-2 border-black object-cover"
            />
          </div>
          <span className="text-sm font-semibold text-white">{story.name}</span>
        </button>
        <span className="text-xs text-white/60">{index + 1}h</span>
        <button
          type="button"
          aria-label="Close story viewer"
          onClick={onClose}
          className="ml-auto"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="relative flex-1">
        <img
          src={story.img.replace("w=160", "w=900")}
          alt={story.name}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label="Previous story"
          onClick={() => (index > 0 ? setIndex(index - 1) : onClose())}
          className="absolute inset-y-0 left-0 grid w-1/3 place-items-start pl-2 pt-1/2 text-white/0 hover:text-white/60"
        >
          <ChevronLeft className="mt-[45vh] h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Next story"
          onClick={() =>
            index < stories.length - 1 ? setIndex(index + 1) : onClose()
          }
          className="absolute inset-y-0 right-0 grid w-1/3 place-items-end pr-2 text-white/0 hover:text-white/60"
        >
          <ChevronRight className="mt-[45vh] h-7 w-7" />
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
        <input
          placeholder={`Reply to ${story.name}...`}
          className="flex-1 rounded-full border border-white/30 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/50"
        />
        <Heart className="h-6 w-6 text-white" />
        <Send className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function StoryUploadModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <BottomSheet title="Add to your story" onClose={onClose}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onPick}
      />
      <div className="p-4">
        {preview ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={preview} alt="Story preview" className="max-h-72 w-full object-cover" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-48 w-full place-items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground transition hover:bg-muted"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm">Choose a photo or video</span>
          </button>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted py-2.5 text-sm font-semibold transition hover:bg-accent"
          >
            <Camera className="h-4 w-4" /> {preview ? "Change" : "Gallery"}
          </button>
          <button
            type="button"
            disabled={!preview}
            onClick={() => {
              setPosted(true);
              window.setTimeout(onClose, 900);
            }}
            className="flex-1 rounded-lg bg-white py-2.5 text-sm font-semibold text-black transition disabled:opacity-40"
          >
            Share story
          </button>
        </div>
      </div>
      {posted && <Toast message="Story shared" />}
    </BottomSheet>
  );
}

type Post = {
  id: number;
  user: string;
  avatar: string;
  img: string;
  caption: string;
  likes: number;
  location?: string;
};

const POSTS: Post[] = [
  {
    id: 1,
    user: "aarav_official",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80",
    caption: "Exploring the deep dark aesthetics of code and design ✨",
    likes: 1245,
    location: "Midnight Studio",
  },
  {
    id: 2,
    user: "zoya_design",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=80",
    caption: "Warm light, cold code. Late night build sessions 🚀 #kurbati",
    likes: 892,
    location: "Bengaluru",
  },
  {
    id: 3,
    user: "kabir.frames",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80",
    caption: "Monochrome hours. The desk where everything ships.",
    likes: 534,
  },
];

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

function HomeFeedPosts({
  onOpenUser,
}: {
  onOpenUser: (username: string) => void;
}) {
  return (
    <>
      {POSTS.map((post) => (
        <PostCard key={post.id} post={post} onOpenUser={onOpenUser} />
      ))}
    </>
  );
}

type Comment = { id: number; user: string; text: string; time: string };

const SEED_COMMENTS: Comment[] = [
  { id: 1, user: "zoya_design", text: "This palette is unreal 🔥", time: "2h" },
  { id: 2, user: "kabir.frames", text: "Deep dark done right.", time: "1h" },
  { id: 3, user: "rohan.dev", text: "Drop the preset please!", time: "42m" },
];

function PostCard({
  post,
  onOpenUser,
}: {
  post: Post;
  onOpenUser: (username: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [popping, setPopping] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [sheet, setSheet] = useState<null | "comments" | "share" | "menu">(null);
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);
  const [toast, setToast] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const likeCount = post.likes + (liked ? 1 : 0);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const toggleLike = () => {
    setLiked((v) => !v);
    if (!liked) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 320);
    }
  };

  // Double-tap only ever likes — never unlikes.
  const doubleTapLike = () => {
    setBurstKey((k) => k + 1);
    if (!liked) {
      setLiked(true);
      setPopping(true);
      window.setTimeout(() => setPopping(false), 320);
    }
  };

  const nativeShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${post.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `@${post.user} on Kurbati`, url });
        setSheet(null);
        return;
      } catch {
        /* user dismissed — fall through to the sheet */
      }
    }
    setSheet("share");
  };

  if (hidden) {
    return (
      <article className="flex items-center justify-between border-b border-border px-4 py-6 text-sm text-muted-foreground">
        Post hidden.
        <button
          type="button"
          onClick={() => setHidden(false)}
          className="font-semibold text-foreground"
        >
          Undo
        </button>
      </article>
    );
  }

  return (
    <article className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          aria-label={`Open ${post.user}'s profile`}
          onClick={() => onOpenUser(post.user)}
          className="flex items-center gap-3 text-left transition active:scale-[0.98]"
        >
          <div className="story-ring h-9 w-9 overflow-hidden rounded-[11px] p-[2px]">
            <img
              src={post.avatar}
              alt={post.user}
              className="h-full w-full rounded-[9px] border-2 border-black object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-semibold">{post.user}</span>
            {post.location && (
              <p className="text-xs text-muted-foreground">{post.location}</p>
            )}
          </div>
        </button>
        <button
          type="button"
          aria-label="Post options"
          onClick={() => setSheet("menu")}
        >
          <MoreHorizontal className="h-5 w-5 cursor-pointer text-muted-foreground" />
        </button>
      </div>

      <button
        type="button"
        aria-label={`Like ${post.user}'s post`}
        onDoubleClick={doubleTapLike}
        className="relative block h-96 w-full overflow-hidden bg-muted"
      >
        <img
          src={post.img}
          alt="Post content"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {burstKey > 0 && (
          <span
            key={burstKey}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <Heart className="heart-burst h-24 w-24 fill-white text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />
          </span>
        )}
      </button>

      <div className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-4">
            <button type="button" onClick={toggleLike} aria-label="Like">
              <Heart
                className={`h-6 w-6 cursor-pointer transition hover:scale-110 ${
                  liked ? "fill-destructive text-destructive" : "text-foreground"
                } ${popping ? "like-pop" : ""}`}
              />
            </button>
            <button
              type="button"
              aria-label="Open comments"
              onClick={() => setSheet("comments")}
            >
              <MessageSquare className="h-6 w-6 cursor-pointer transition hover:scale-110" />
            </button>
            <button type="button" aria-label="Share post" onClick={nativeShare}>
              <Send className="h-6 w-6 cursor-pointer transition hover:scale-110" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-label="Save"
          >
            <Bookmark
              className={`h-6 w-6 cursor-pointer transition hover:scale-110 ${
                saved ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </button>
        </div>
        <p className="mb-1 text-sm font-semibold">
          {formatCount(likeCount)} likes
        </p>
        <p className="text-sm text-foreground/90">
          <button
            type="button"
            onClick={() => onOpenUser(post.user)}
            className="mr-2 font-semibold text-foreground hover:underline"
          >
            {post.user}
          </button>
          {post.caption}
        </p>
        <button
          type="button"
          onClick={() => setSheet("comments")}
          className="mt-1 text-xs text-muted-foreground hover:text-foreground"
        >
          View all {comments.length} comments
        </button>
      </div>

      {sheet === "comments" && (
        <CommentsSheet
          comments={comments}
          onOpenUser={(u) => {
            setSheet(null);
            onOpenUser(u);
          }}
          onAdd={(text) =>
            setComments((c) => [
              ...c,
              { id: Date.now(), user: "you", text, time: "now" },
            ])
          }
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "share" && (
        <BottomSheet title="Share" onClose={() => setSheet(null)} heightClass="max-h-[55%]">
          <SheetAction
            icon={<MessageCircle className="h-5 w-5" />}
            label="Share to chat"
            onClick={() => {
              setSheet(null);
              flash("Sent to chat");
            }}
          />
          <SheetAction
            icon={<Link2 className="h-5 w-5" />}
            label="Copy link"
            onClick={() => {
              navigator.clipboard
                ?.writeText(`${window.location.origin}/p/${post.id}`)
                .catch(() => {});
              setSheet(null);
              flash("Link copied");
            }}
          />
          <SheetAction
            icon={<Share2 className="h-5 w-5" />}
            label="Share via..."
            onClick={() => {
              setSheet(null);
              flash("Opening share options");
            }}
          />
        </BottomSheet>
      )}

      {sheet === "menu" && (
        <BottomSheet onClose={() => setSheet(null)} heightClass="max-h-[55%]">
          <SheetAction
            icon={<Flag className="h-5 w-5" />}
            label="Report"
            danger
            onClick={() => {
              setSheet(null);
              flash("Report submitted");
            }}
          />
          <SheetAction
            icon={<UserMinus className="h-5 w-5" />}
            label={`Unfollow ${post.user}`}
            onClick={() => {
              setSheet(null);
              flash(`Unfollowed ${post.user}`);
            }}
          />
          <SheetAction
            icon={<EyeOff className="h-5 w-5" />}
            label="Hide"
            onClick={() => {
              setSheet(null);
              setHidden(true);
            }}
          />
          <div className="border-t border-border">
            <SheetAction
              icon={<X className="h-5 w-5" />}
              label="Cancel"
              onClick={() => setSheet(null)}
            />
          </div>
        </BottomSheet>
      )}

      {toast && <Toast message={toast} />}
    </article>
  );
}

function CommentsSheet({
  comments,
  onAdd,
  onClose,
  onOpenUser,
}: {
  comments: Comment[];
  onAdd: (text: string) => void;
  onClose: () => void;
  onOpenUser: (username: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onAdd(text);
    setValue("");
  };

  return (
    <BottomSheet title="Comments" onClose={onClose}>
      <div className="flex flex-col">
        <div className="flex-1 px-4 py-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 py-3">
              <button
                type="button"
                aria-label={`Open ${c.user}'s profile`}
                onClick={() => onOpenUser(c.user)}
                className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-[10px] bg-muted"
              >
                <img
                  src={`https://i.pravatar.cc/64?u=${c.user}`}
                  alt={c.user}
                  className="h-full w-full object-cover"
                />
              </button>
              <div className="leading-snug">
                <p className="text-sm">
                  <button
                    type="button"
                    onClick={() => onOpenUser(c.user)}
                    className="mr-2 font-semibold hover:underline"
                  >
                    {c.user}
                  </button>
                  {c.text}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.time} · Reply
                </p>
              </div>
              <Heart className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-card px-4 py-3"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a comment..."
            aria-label="Add a comment"
            className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="text-sm font-semibold text-primary disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>
    </BottomSheet>
  );
}

/* Notifications / activity */
function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const items = [
    { id: 1, user: "zoya_design", text: "liked your post", time: "2m", follow: false },
    { id: 2, user: "rohan.dev", text: "started following you", time: "18m", follow: true },
    { id: 3, user: "kabir.frames", text: "commented: Deep dark done right.", time: "1h", follow: false },
    { id: 4, user: "sanya.k", text: "mentioned you in a story", time: "5h", follow: false },
  ];
  return (
    <BottomSheet title="Activity" onClose={onClose} heightClass="max-h-[80%]">
      <div className="px-4 py-1">
        {items.map((n) => (
          <div key={n.id} className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 overflow-hidden rounded-[12px] bg-muted">
              <img
                src={`https://i.pravatar.cc/80?u=${n.user}`}
                alt={n.user}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="flex-1 text-sm leading-snug">
              <span className="font-semibold">{n.user}</span> {n.text}{" "}
              <span className="text-muted-foreground">{n.time}</span>
            </p>
            {n.follow && (
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black"
              >
                <UserPlus className="h-3 w-3" /> Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ---------------------------------------------------------------- */
/* 2. EXPLORE / SEARCH                                               */
/* ---------------------------------------------------------------- */
function ExplorePage() {
  const seeds = [
    "kurbati1", "kurbati2", "kurbati3", "kurbati4", "kurbati5", "kurbati6",
    "kurbati7", "kurbati8", "kurbati9", "kurbati10", "kurbati11", "kurbati12",
  ];
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search users or tags..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {seeds.map((s) => (
          <div key={s} className="h-32 overflow-hidden bg-muted">
            <img
              src={`https://picsum.photos/seed/${s}/300/300`}
              alt="grid"
              className="h-full w-full object-cover transition hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* 3. REELS                                                          */
/* ---------------------------------------------------------------- */
type Reel = {
  id: number;
  handle: string;
  img: string;
  caption: string;
  likes: string;
};

const REELS: Reel[] = [
  {
    id: 1,
    handle: "@zoya_design",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=80",
    caption: "Vibing with the late night build sessions 🚀 #kurbati",
    likes: "8.2K",
  },
  {
    id: 2,
    handle: "@aarav_official",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80",
    caption: "Desk reset for the new sprint 🖥️ #devlife",
    likes: "12.4K",
  },
  {
    id: 3,
    handle: "@kabir.frames",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80",
    caption: "Slow shutter, fast mind ✨",
    likes: "3.9K",
  },
];

function ReelsPage({
  onOpenUser,
}: {
  onOpenUser: (username: string) => void;
}) {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  return (
    <div className="no-scrollbar flex h-full snap-y snap-mandatory flex-col overflow-y-auto">
      {REELS.map((reel) => {
        const isLiked = liked[reel.id];
        return (
          <section
            key={reel.id}
            className="relative h-[calc(100vh-7.5rem)] flex-shrink-0 snap-start bg-black"
          >
            <img
              src={reel.img}
              alt={reel.handle}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Right action rail */}
            <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-5">
              <button
                type="button"
                aria-label="Like reel"
                onClick={() =>
                  setLiked((s) => ({ ...s, [reel.id]: !s[reel.id] }))
                }
              >
                <Heart
                  className={`h-7 w-7 transition active:scale-90 ${
                    isLiked ? "fill-destructive text-destructive" : "text-white"
                  }`}
                />
              </button>
              <span className="text-xs text-white/90">{reel.likes}</span>
              <MessageSquare className="h-7 w-7 cursor-pointer text-white" />
              <Send className="h-7 w-7 cursor-pointer text-white" />
              <Bookmark className="h-7 w-7 cursor-pointer text-white" />
            </div>

            <div className="absolute bottom-6 left-4 z-10 pr-16">
              <div className="mb-2 flex items-center gap-2">
                <div className="story-ring h-9 w-9 overflow-hidden rounded-[11px] p-[2px]">
                  <img
                    src={`https://i.pravatar.cc/80?u=${reel.handle}`}
                    alt={reel.handle}
                    className="h-full w-full rounded-[9px] border-2 border-black object-cover"
                  />
                </div>
                <h3 className="text-base font-semibold text-white">{reel.handle}</h3>
                <button className="rounded-md border border-white/40 px-2 py-0.5 text-xs font-semibold text-white">
                  Follow
                </button>
              </div>
              <p className="max-w-xs text-sm text-white/90">{reel.caption}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* 4. CHAT                                                           */
/* ---------------------------------------------------------------- */
type Chat = {
  id: number;
  name: string;
  msg: string;
  time: string;
  online: boolean;
};

const CHATS: Chat[] = [
  { id: 1, name: "Rohan Sharma", msg: "Bhai project kahan tak pahuncha?", time: "2m", online: true },
  { id: 2, name: "Priya Verma", msg: "Check out the new dark UI concept.", time: "1h", online: true },
  { id: 3, name: "Aarav Singh", msg: "Reel ready to ship 🔥", time: "3h", online: false },
  { id: 4, name: "Zoya K.", msg: "Typing...", time: "1d", online: false },
];

function ChatPage() {
  const [openChat, setOpenChat] = useState<Chat | null>(null);

  if (openChat) {
    return <ChatThread chat={openChat} onBack={() => setOpenChat(null)} />;
  }

  return (
    <div className="flex flex-col p-4">
      <h2 className="mb-4 text-xl font-bold">Messages</h2>
      {CHATS.map((chat) => (
        <button
          type="button"
          key={chat.id}
          onClick={() => setOpenChat(chat)}
          aria-label={`Open chat with ${chat.name}`}
          className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 text-left transition hover:bg-muted/60 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-muted font-bold text-white">
                {chat.name[0]}
              </div>
              {chat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-[4px] border-2 border-black bg-emerald-500" />
              )}
            </div>
            <div className="leading-tight">
              <h4 className="text-sm font-semibold">{chat.name}</h4>
              <p
                className={`text-xs ${
                  chat.msg === "Typing..." ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {chat.msg}
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{chat.time}</span>
        </button>
      ))}
    </div>
  );
}

type Message = { id: number; text: string; mine: boolean };

function ChatThread({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: chat.msg, mine: false },
    { id: 2, text: "Almost done — shipping the dark UI tonight.", mine: true },
    { id: 3, text: "Let's go 🔥", mine: false },
  ]);
  const [value, setValue] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: Date.now(), text, mine: true }]);
    setValue("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-3">
        <button type="button" aria-label="Back to messages" onClick={onBack}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-muted text-sm font-bold">
          {chat.name[0]}
        </div>
        <div className="leading-tight">
          <h4 className="text-sm font-semibold">{chat.name}</h4>
          <p className="text-xs text-muted-foreground">
            {chat.online ? "Active now" : `Active ${chat.time} ago`}
          </p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
              m.mine
                ? "ml-auto bg-white text-black"
                : "mr-auto bg-muted text-foreground"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message..."
          aria-label="Message"
          className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!value.trim()}
          className="disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* 5. PROFILE                                                        */
/* ---------------------------------------------------------------- */
function ProfilePage() {
  const [grid, setGrid] = useState<"posts" | "saved">("posts");
  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-20 w-20 overflow-hidden rounded-[22px] border-2 border-white/70 bg-muted">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <span className="block font-bold">12</span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <div>
            <span className="block font-bold">1.4K</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div>
            <span className="block font-bold">280</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
        </div>
      </div>
      <h3 className="font-bold">Kurbati Creator</h3>
      <p className="mb-4 text-sm text-foreground/80">
        Building Kurbati Chitchat 🌙 Strict deep-dark mode enthusiast.
      </p>
      <button className="mb-4 rounded-lg border border-border bg-muted py-2 text-sm font-semibold transition hover:bg-accent">
        Edit Profile
      </button>

      {/* Grid toggle */}
      <div className="mb-2 flex border-b border-border">
        <button
          type="button"
          onClick={() => setGrid("posts")}
          className={`flex-1 border-b-2 pb-2 text-sm font-semibold transition ${
            grid === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Posts
        </button>
        <button
          type="button"
          onClick={() => setGrid("saved")}
          className={`flex-1 border-b-2 pb-2 text-sm font-semibold transition ${
            grid === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Saved
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <div key={item} className="h-28 overflow-hidden bg-muted">
            <img
              src={`https://picsum.photos/seed/${grid}${item}/300/300`}
              alt="user post"
              className="h-full w-full object-cover transition hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
