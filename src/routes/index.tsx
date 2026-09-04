import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";

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

  return (
    <div className="flex min-h-screen justify-center bg-background font-sans text-foreground">
      {/* Mobile Frame */}
      <div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden border-x border-border bg-black">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-black/80 px-4 py-3 backdrop-blur-md">
          <h1 className="brand-gradient-text text-2xl font-bold italic tracking-wide">
            Kurbati Chitchat
          </h1>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 cursor-pointer text-primary transition hover:scale-110" />
            <button
              type="button"
              aria-label="Open messages"
              onClick={() => setActiveTab("chat")}
            >
              <MessageCircle className="h-6 w-6 cursor-pointer transition hover:scale-110 hover:text-primary" />
            </button>
          </div>
        </header>

        {/* MAIN DYNAMIC CONTENT AREA */}
        <main className="no-scrollbar flex-1 overflow-y-auto pb-20">
          {activeTab === "home" && <HomeFeed />}
          {activeTab === "search" && <ExplorePage />}
          {activeTab === "reels" && <ReelsPage />}
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

          {/* Center create button */}
          <button
            type="button"
            aria-label="Create new post"
            className="grid h-9 w-9 place-items-center rounded-xl border border-primary bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
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
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// 1. HOME FEED COMPONENT
type Story = { id: number; name: string; img: string; you?: boolean };

function HomeFeed() {
  const stories: Story[] = [
    { id: 1, name: "Your Story", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80", you: true },
    { id: 2, name: "Aarav", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80" },
    { id: 3, name: "Sanya", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80" },
    { id: 4, name: "Kabir", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80" },
    { id: 5, name: "Zoya", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80" },
    { id: 6, name: "Rey", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=80" },
  ];

  return (
    <div className="flex flex-col">
      {/* Stories Bar */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-border px-4 py-3">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-shrink-0 cursor-pointer flex-col items-center"
          >
            <div className="relative">
              <div
                className={`grid h-16 w-16 place-items-center rounded-full p-[2px] ${
                  story.you ? "bg-muted" : "story-ring"
                }`}
              >
                <img
                  src={story.img}
                  alt={story.name}
                  className="h-full w-full rounded-full border-2 border-black object-cover"
                />
              </div>
              {story.you && (
                <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full border-2 border-black bg-primary text-primary-foreground">
                  <Plus className="h-3 w-3" />
                </span>
              )}
            </div>
            <span className="mt-1 max-w-[64px] truncate text-xs text-muted-foreground">
              {story.name}
            </span>
          </div>
        ))}
      </div>

      <HomeFeedPosts />
    </div>
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

function HomeFeedPosts() {
  return (
    <>
      {POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [popping, setPopping] = useState(false);

  const likeCount = post.likes + (liked ? 1 : 0);

  const toggleLike = () => {
    setLiked((v) => !v);
    if (!liked) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 320);
    }
  };

  return (
    <article className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="story-ring grid h-9 w-9 place-items-center rounded-full p-[2px]">
            <img
              src={post.avatar}
              alt={post.user}
              className="h-full w-full rounded-full border-2 border-black object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-semibold">{post.user}</span>
            {post.location && (
              <p className="text-xs text-muted-foreground">{post.location}</p>
            )}
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 cursor-pointer text-muted-foreground" />
      </div>

      <button
        type="button"
        aria-label={`Like ${post.user}'s post`}
        onDoubleClick={toggleLike}
        className="block h-96 w-full bg-muted"
      >
        <img
          src={post.img}
          alt="Post content"
          className="h-full w-full object-cover"
          loading="lazy"
        />
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
            <MessageSquare className="h-6 w-6 cursor-pointer transition hover:scale-110" />
            <Send className="h-6 w-6 cursor-pointer transition hover:scale-110" />
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
          <span className="mr-2 font-semibold text-foreground">{post.user}</span>
          {post.caption}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">View all comments</p>
      </div>
    </article>
  );
}

// 2. EXPLORE / SEARCH COMPONENT
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
        {seeds.map((s, i) => (
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

// 3. REELS COMPONENT
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

function ReelsPage() {
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
                <div className="story-ring grid h-9 w-9 place-items-center rounded-full p-[2px]">
                  <img
                    src={`https://i.pravatar.cc/80?u=${reel.handle}`}
                    alt={reel.handle}
                    className="h-full w-full rounded-full border-2 border-black object-cover"
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

// 4. CHAT COMPONENT
function ChatPage() {
  const chats = [
    { id: 1, name: "Rohan Sharma", msg: "Bhai project kahan tak pahuncha?", time: "2m", online: true },
    { id: 2, name: "Priya Verma", msg: "Check out the new dark UI concept.", time: "1h", online: true },
    { id: 3, name: "Aarav Singh", msg: "Reel ready to ship 🔥", time: "3h", online: false },
    { id: 4, name: "Zoya K.", msg: "Typing...", time: "1d", online: false },
  ];
  return (
    <div className="flex flex-col p-4">
      <h2 className="mb-4 text-xl font-bold">Messages</h2>
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 transition hover:bg-muted/60"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted font-bold text-primary">
                {chat.name[0]}
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-emerald-500" />
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
        </div>
      ))}
    </div>
  );
}

// 5. PROFILE COMPONENT
function ProfilePage() {
  const [grid, setGrid] = useState<"posts" | "saved">("posts");
  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary bg-muted">
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
