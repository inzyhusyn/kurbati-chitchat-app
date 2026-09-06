import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UserCog,
  Bookmark,
  Archive,
  Activity,
  Bell,
  Clock,
  Lock,
  Users,
  Ban,
  EyeOff,
  VolumeX,
  ShieldAlert,
  Heart,
  SlidersHorizontal,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  Smartphone,
  KeyRound,
  ShieldCheck,
  IdCard,
  Search,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Persistence                                                        */
/* ------------------------------------------------------------------ */

const KEY = "kurbati.settings.v1";

type ContentPrivacy =
  | "all"
  | "only-me"
  | "followers"
  | "close-friends"
  | "custom";

type SettingsState = {
  privateAccount: boolean;
  contentPrivacy: ContentPrivacy;
  closeFriends: string[];
  customAudience: string[];
  hideCounts: boolean;
  hideStoryFrom: string[];
  muted: string[];
  restricted: string[];
  blocked: string[];
  notifications: { push: boolean; inApp: boolean; messages: boolean };
  permissions: {
    camera: boolean;
    microphone: boolean;
    photos: boolean;
    contacts: boolean;
  };
  theme: "dark" | "light" | "system";
  dailyLimitMinutes: number;
  twoFactor: boolean;
  loginAlerts: boolean;
  personal: { name: string; email: string; phone: string; birthday: string };
  signedOut: boolean;
};

const PEOPLE = [
  "aarav_official",
  "sanya.k",
  "kabir.frames",
  "zoya_design",
  "rey.moves",
  "rohan.sharma",
  "priya.verma",
  "meera_lens",
];

const DEFAULTS: SettingsState = {
  privateAccount: false,
  contentPrivacy: "all",
  closeFriends: ["sanya.k", "kabir.frames"],
  customAudience: [],
  hideCounts: false,
  hideStoryFrom: [],
  muted: [],
  restricted: [],
  blocked: ["meera_lens"],
  notifications: { push: true, inApp: true, messages: true },
  permissions: {
    camera: true,
    microphone: false,
    photos: true,
    contacts: false,
  },
  theme: "dark",
  dailyLimitMinutes: 60,
  twoFactor: false,
  loginAlerts: true,
  personal: {
    name: "Kurbati Creator",
    email: "creator@kurbati.app",
    phone: "+91 90000 00000",
    birthday: "1998-04-12",
  },
  signedOut: false,
};

function loadSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return DEFAULTS;
  }
}

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

function Screen({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fade-in flex h-full flex-col bg-black">
      <div className="flex items-center gap-3 border-b border-border px-3 py-3">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-10">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function Row({
  icon: Icon,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-white/5"
    >
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-white"}`} />
      <span className="flex-1">
        <span
          className={`block text-sm ${danger ? "text-destructive" : "text-white"}`}
        >
          {label}
        </span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
      {!danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
      {Icon && <Icon className="h-5 w-5 text-white" />}
      <span className="flex-1">
        <span className="block text-sm text-white">{label}</span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-white" : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
            checked ? "left-[22px] bg-black" : "left-0.5 bg-white"
          }`}
        />
      </button>
    </label>
  );
}

function Radio({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-white/5"
    >
      <span className="flex-1">
        <span className="block text-sm text-white">{label}</span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border ${
          selected ? "border-white bg-white" : "border-white/40"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-black" />}
      </span>
    </button>
  );
}

function PeoplePicker({
  people,
  selected,
  onToggle,
  actionLabel,
  emptyLabel,
}: {
  people: string[];
  selected: string[];
  onToggle: (u: string) => void;
  actionLabel?: (inList: boolean) => string;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState("");
  const list = people.filter((p) => p.includes(q.toLowerCase().trim()));
  return (
    <div>
      <div className="m-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
        />
      </div>
      {list.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyLabel ?? "No one found."}
        </p>
      )}
      {list.map((p) => {
        const inList = selected.includes(p);
        return (
          <div key={p} className="flex items-center gap-3 px-4 py-3">
            <img
              src={`https://i.pravatar.cc/80?u=${p}`}
              alt={p}
              className="h-10 w-10 rounded-[12px] object-cover"
            />
            <span className="flex-1 text-sm text-white">{p}</span>
            <button
              type="button"
              onClick={() => onToggle(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                inList
                  ? "border border-border bg-muted text-white hover:bg-accent"
                  : "bg-white text-black"
              }`}
            >
              {actionLabel
                ? actionLabel(inList)
                : inList
                  ? "Remove"
                  : "Add"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Grid({ seed }: { seed: string }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
        <div key={i} className="h-28 overflow-hidden bg-muted">
          <img
            src={`https://picsum.photos/seed/${seed}${i}/300/300`}
            alt={`${seed} item ${i}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 border-b-2 py-2.5 text-sm font-semibold transition ${
            active === t
              ? "border-white text-white"
              : "border-transparent text-muted-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fade-in pointer-events-none absolute bottom-24 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-lg">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

type ScreenKey =
  | "root"
  | "account"
  | "password"
  | "security"
  | "personal"
  | "saved"
  | "archive"
  | "activity"
  | "notifications"
  | "time"
  | "privacy"
  | "close-friends"
  | "blocked"
  | "hide-story"
  | "muted"
  | "restricted"
  | "permissions"
  | "theme"
  | "help"
  | "about"
  | "sessions";

const TITLES: Record<ScreenKey, string> = {
  root: "Settings and privacy",
  account: "Account settings",
  password: "Password",
  security: "Security",
  personal: "Personal details",
  saved: "Saved",
  archive: "Archive",
  activity: "Your activity",
  notifications: "Notifications",
  time: "Time spent",
  privacy: "Account privacy",
  "close-friends": "Close friends",
  blocked: "Blocked",
  "hide-story": "Hide story and live",
  muted: "Muted accounts",
  restricted: "Restricted accounts",
  permissions: "Device permissions",
  theme: "App theme",
  help: "Help",
  about: "About",
  sessions: "Login & sessions",
};

export function SettingsScreen({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [stack, setStack] = useState<ScreenKey[]>(["root"]);
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setS(loadSettings()), []);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
  }, [s]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const current = stack[stack.length - 1] ?? "root";
  const push = (k: ScreenKey) => setStack((p) => [...p, k]);
  const back = () =>
    setStack((p) => (p.length > 1 ? p.slice(0, -1) : (onClose(), p)));
  const set = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));
  const toggleIn = (k: "closeFriends" | "customAudience" | "hideStoryFrom" | "muted" | "restricted" | "blocked", u: string) =>
    setS((prev) => ({
      ...prev,
      [k]: prev[k].includes(u) ? prev[k].filter((x) => x !== u) : [...prev[k], u],
    }));

  if (s.signedOut) {
    return (
      <div className="fade-in absolute inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <LogOut className="h-8 w-8 text-white" />
        <h2 className="text-lg font-semibold text-white">You're logged out</h2>
        <p className="text-sm text-muted-foreground">
          You have been signed out of Kurbati Chitchat on this device.
        </p>
        <button
          type="button"
          onClick={() => {
            set("signedOut", false);
            setStack(["root"]);
            onClose();
          }}
          className="mt-2 w-full max-w-xs rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
        >
          Log back in
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[90] bg-black">
      <Screen title={TITLES[current]} onBack={back}>
        {current === "root" && (
          <>
            <div className="flex items-center gap-3 px-4 py-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                alt={username}
                className="h-12 w-12 rounded-[14px] object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-white">{username}</p>
                <p className="text-xs text-muted-foreground">
                  Manage your account and privacy
                </p>
              </div>
            </div>

            <SectionLabel>Your account</SectionLabel>
            <Row icon={UserCog} label="Account settings" hint="Password, security, personal details" onClick={() => push("account")} />
            <Row icon={Bookmark} label="Saved" hint="Posts and reels" onClick={() => push("saved")} />
            <Row icon={Archive} label="Archive" hint="Posts and stories" onClick={() => push("archive")} />
            <Row icon={Activity} label="Your activity" hint="Likes, comments, tags" onClick={() => push("activity")} />
            <Row icon={Bell} label="Notifications" hint="Push, in-app, messages" onClick={() => push("notifications")} />
            <Row icon={Clock} label="Time spent" onClick={() => push("time")} />

            <SectionLabel>Who can see your content</SectionLabel>
            <Row icon={Lock} label="Account privacy & content privacy" hint={s.privateAccount ? "Private account" : "Public account"} onClick={() => push("privacy")} />
            <Row icon={Users} label="Close friends" hint={`${s.closeFriends.length} people`} onClick={() => push("close-friends")} />
            <Row icon={Ban} label="Blocked" hint={`${s.blocked.length} accounts`} onClick={() => push("blocked")} />
            <Row icon={EyeOff} label="Hide story and live" hint={`${s.hideStoryFrom.length} hidden from`} onClick={() => push("hide-story")} />
            <Row icon={VolumeX} label="Muted accounts" hint={`${s.muted.length} muted`} onClick={() => push("muted")} />
            <Row icon={ShieldAlert} label="Restricted accounts" hint={`${s.restricted.length} restricted`} onClick={() => push("restricted")} />
            <Toggle icon={Heart} label="Hide like and share counts" hint="On posts from everyone" checked={s.hideCounts} onChange={(v) => set("hideCounts", v)} />

            <SectionLabel>Preferences</SectionLabel>
            <Row icon={SlidersHorizontal} label="Device permissions" onClick={() => push("permissions")} />
            <Row icon={Palette} label="App theme" hint={s.theme} onClick={() => push("theme")} />
            <Row icon={HelpCircle} label="Help" onClick={() => push("help")} />
            <Row icon={Info} label="About" onClick={() => push("about")} />

            <SectionLabel>Login & sessions</SectionLabel>
            <Row icon={Smartphone} label="Where you're logged in" onClick={() => push("sessions")} />
            <Row
              icon={LogOut}
              label="Log out"
              danger
              onClick={() => set("signedOut", true)}
            />
            <Row
              icon={LogOut}
              label="Log out from all devices"
              danger
              onClick={() => set("signedOut", true)}
            />
            <p className="px-4 pb-4 pt-6 text-center text-xs text-muted-foreground">
              Kurbati Chitchat · v1.0.0
            </p>
          </>
        )}

        {current === "account" && (
          <>
            <Row icon={KeyRound} label="Password" onClick={() => push("password")} />
            <Row icon={ShieldCheck} label="Security" hint={s.twoFactor ? "Two-factor on" : "Two-factor off"} onClick={() => push("security")} />
            <Row icon={IdCard} label="Personal details" onClick={() => push("personal")} />
          </>
        )}

        {current === "password" && (
          <PasswordForm onDone={(m) => setToast(m)} />
        )}

        {current === "security" && (
          <>
            <Toggle icon={ShieldCheck} label="Two-factor authentication" hint="Ask for a code on new logins" checked={s.twoFactor} onChange={(v) => set("twoFactor", v)} />
            <Toggle icon={Bell} label="Login alerts" hint="Notify me about unrecognised logins" checked={s.loginAlerts} onChange={(v) => set("loginAlerts", v)} />
            <Row icon={Smartphone} label="Where you're logged in" onClick={() => push("sessions")} />
          </>
        )}

        {current === "personal" && (
          <PersonalForm
            value={s.personal}
            onSave={(v) => {
              set("personal", v);
              setToast("Details saved");
            }}
          />
        )}

        {current === "saved" && <TabbedGrids tabs={["Posts", "Reels"]} />}
        {current === "archive" && <TabbedGrids tabs={["Posts", "Stories"]} />}
        {current === "activity" && <ActivityScreen />}

        {current === "notifications" && (
          <>
            <Toggle icon={Bell} label="Push notifications" checked={s.notifications.push} onChange={(v) => set("notifications", { ...s.notifications, push: v })} />
            <Toggle icon={Activity} label="In-app notifications" checked={s.notifications.inApp} onChange={(v) => set("notifications", { ...s.notifications, inApp: v })} />
            <Toggle icon={Heart} label="Message notifications" checked={s.notifications.messages} onChange={(v) => set("notifications", { ...s.notifications, messages: v })} />
            <p className="px-4 pt-4 text-xs text-muted-foreground">
              {s.notifications.push || s.notifications.inApp || s.notifications.messages
                ? "You'll be notified about the categories turned on above."
                : "All notifications are paused."}
            </p>
          </>
        )}

        {current === "time" && (
          <TimeSpent
            limit={s.dailyLimitMinutes}
            onLimit={(v) => set("dailyLimitMinutes", v)}
          />
        )}

        {current === "privacy" && (
          <>
            <Toggle icon={Lock} label="Private account" hint={s.privateAccount ? "Only approved followers can see your content" : "Anyone can see your content"} checked={s.privateAccount} onChange={(v) => set("privateAccount", v)} />
            <SectionLabel>Content privacy</SectionLabel>
            <Radio label="All / Public" hint="Everyone on Kurbati" selected={s.contentPrivacy === "all"} onSelect={() => set("contentPrivacy", "all")} />
            <Radio label="Only me" hint="Hidden from everyone else" selected={s.contentPrivacy === "only-me"} onSelect={() => set("contentPrivacy", "only-me")} />
            <Radio label="Followers only" selected={s.contentPrivacy === "followers"} onSelect={() => set("contentPrivacy", "followers")} />
            <Radio label="Close friends" hint={`${s.closeFriends.length} people`} selected={s.contentPrivacy === "close-friends"} onSelect={() => set("contentPrivacy", "close-friends")} />
            <Radio label="Show only custom audience" hint={`${s.customAudience.length} selected`} selected={s.contentPrivacy === "custom"} onSelect={() => set("contentPrivacy", "custom")} />

            {s.contentPrivacy === "close-friends" && (
              <>
                <SectionLabel>Close friends list</SectionLabel>
                <PeoplePicker people={PEOPLE} selected={s.closeFriends} onToggle={(u) => toggleIn("closeFriends", u)} />
              </>
            )}
            {s.contentPrivacy === "custom" && (
              <>
                <SectionLabel>Custom audience</SectionLabel>
                <PeoplePicker people={PEOPLE} selected={s.customAudience} onToggle={(u) => toggleIn("customAudience", u)} actionLabel={(i) => (i ? "Selected" : "Select")} />
              </>
            )}
          </>
        )}

        {current === "close-friends" && (
          <PeoplePicker people={PEOPLE} selected={s.closeFriends} onToggle={(u) => toggleIn("closeFriends", u)} />
        )}
        {current === "blocked" && (
          <PeoplePicker people={PEOPLE} selected={s.blocked} onToggle={(u) => toggleIn("blocked", u)} actionLabel={(i) => (i ? "Unblock" : "Block")} />
        )}
        {current === "hide-story" && (
          <PeoplePicker people={PEOPLE} selected={s.hideStoryFrom} onToggle={(u) => toggleIn("hideStoryFrom", u)} actionLabel={(i) => (i ? "Hidden" : "Hide")} />
        )}
        {current === "muted" && (
          <PeoplePicker people={PEOPLE} selected={s.muted} onToggle={(u) => toggleIn("muted", u)} actionLabel={(i) => (i ? "Unmute" : "Mute")} />
        )}
        {current === "restricted" && (
          <PeoplePicker people={PEOPLE} selected={s.restricted} onToggle={(u) => toggleIn("restricted", u)} actionLabel={(i) => (i ? "Unrestrict" : "Restrict")} />
        )}

        {current === "permissions" && (
          <>
            <Toggle label="Camera" hint="For photos, reels and live" checked={s.permissions.camera} onChange={(v) => set("permissions", { ...s.permissions, camera: v })} />
            <Toggle label="Microphone" hint="For reels audio and calls" checked={s.permissions.microphone} onChange={(v) => set("permissions", { ...s.permissions, microphone: v })} />
            <Toggle label="Photos" hint="Upload from your library" checked={s.permissions.photos} onChange={(v) => set("permissions", { ...s.permissions, photos: v })} />
            <Toggle label="Contacts" hint="Find people you know" checked={s.permissions.contacts} onChange={(v) => set("permissions", { ...s.permissions, contacts: v })} />
          </>
        )}

        {current === "theme" && (
          <>
            <Radio label="Dark" selected={s.theme === "dark"} onSelect={() => set("theme", "dark")} />
            <Radio label="Light" selected={s.theme === "light"} onSelect={() => set("theme", "light")} />
            <Radio label="System" selected={s.theme === "system"} onSelect={() => set("theme", "system")} />
            <p className="px-4 pt-4 text-xs text-muted-foreground">
              Kurbati Chitchat is designed deep-dark first; your choice is saved
              on this device.
            </p>
          </>
        )}

        {current === "help" && <HelpScreen onSent={() => setToast("Message sent to support")} />}

        {current === "about" && (
          <div className="space-y-3 p-4 text-sm text-white">
            <p className="text-base font-semibold">Kurbati Chitchat</p>
            <p className="text-muted-foreground">Version 1.0.0 (build 240)</p>
            <p className="text-muted-foreground">
              A deep-dark social space for stories, reels and chat.
            </p>
            <div className="divide-y divide-border rounded-xl border border-border">
              {["Terms of service", "Privacy policy", "Community guidelines", "Open source licences"].map((t) => (
                <p key={t} className="px-4 py-3">{t}</p>
              ))}
            </div>
          </div>
        )}

        {current === "sessions" && (
          <SessionsScreen
            onLogoutAll={() => set("signedOut", true)}
            onEnded={() => setToast("Session ended")}
          />
        )}
      </Screen>
      {toast && <Toast message={toast} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub screens                                                        */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block px-4 py-2">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
      />
    </label>
  );
}

function PasswordForm({ onDone }: { onDone: (m: string) => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!cur) return setError("Enter your current password.");
    if (next.length < 8) return setError("New password must be 8+ characters.");
    if (next !== confirm) return setError("New passwords do not match.");
    setError(null);
    setCur("");
    setNext("");
    setConfirm("");
    onDone("Password updated");
  };

  return (
    <div className="pt-2">
      <Field label="Current password" type="password" value={cur} onChange={setCur} />
      <Field label="New password" type="password" value={next} onChange={setNext} />
      <Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} />
      {error && <p className="px-4 py-2 text-xs text-destructive">{error}</p>}
      <div className="p-4">
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
        >
          Change password
        </button>
      </div>
    </div>
  );
}

function PersonalForm({
  value,
  onSave,
}: {
  value: SettingsState["personal"];
  onSave: (v: SettingsState["personal"]) => void;
}) {
  const [form, setForm] = useState(value);
  return (
    <div className="pt-2">
      <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <Field label="Birthday" type="date" value={form.birthday} onChange={(v) => setForm({ ...form, birthday: v })} />
      <div className="p-4">
        <button
          type="button"
          onClick={() => onSave(form)}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

function TabbedGrids({ tabs }: { tabs: string[] }) {
  const [tab, setTab] = useState(tabs[0] ?? "");
  return (
    <>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <Grid seed={tab.toLowerCase()} />
    </>
  );
}

const ACTIVITY: Record<string, { user: string; text: string; when: string }[]> = {
  Likes: [
    { user: "aarav_official", text: "You liked a post", when: "2h" },
    { user: "zoya_design", text: "You liked a reel", when: "1d" },
    { user: "sanya.k", text: "You liked a photo", when: "3d" },
  ],
  Comments: [
    { user: "kabir.frames", text: "“This light is unreal 🔥”", when: "5h" },
    { user: "rey.moves", text: "“Sending this to my crew”", when: "2d" },
  ],
  Tags: [
    { user: "priya.verma", text: "Tagged you in a post", when: "6h" },
    { user: "rohan.sharma", text: "Tagged you in a reel", when: "4d" },
  ],
};

function ActivityScreen() {
  const [tab, setTab] = useState("Likes");
  const items = ACTIVITY[tab] ?? [];
  return (
    <>
      <Tabs tabs={["Likes", "Comments", "Tags"]} active={tab} onChange={setTab} />
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <img
            src={`https://i.pravatar.cc/80?u=${it.user}`}
            alt={it.user}
            className="h-10 w-10 rounded-[12px] object-cover"
          />
          <div className="flex-1">
            <p className="text-sm text-white">
              <span className="font-semibold">{it.user}</span> · {it.text}
            </p>
            <p className="text-xs text-muted-foreground">{it.when} ago</p>
          </div>
          <Check className="h-4 w-4 text-white" />
        </div>
      ))}
    </>
  );
}

function TimeSpent({
  limit,
  onLimit,
}: {
  limit: number;
  onLimit: (v: number) => void;
}) {
  const days = [
    { d: "Mon", m: 42 },
    { d: "Tue", m: 65 },
    { d: "Wed", m: 28 },
    { d: "Thu", m: 74 },
    { d: "Fri", m: 91 },
    { d: "Sat", m: 55 },
    { d: "Sun", m: 33 },
  ];
  const avg = Math.round(days.reduce((a, b) => a + b.m, 0) / days.length);
  const max = Math.max(...days.map((x) => x.m));
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">Daily average</p>
      <p className="mb-4 text-2xl font-semibold text-white">
        {Math.floor(avg / 60)}h {avg % 60}m
      </p>
      <div className="mb-6 flex h-36 items-end gap-2">
        {days.map((x) => (
          <div key={x.d} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-white"
              style={{ height: `${(x.m / max) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{x.d}</span>
          </div>
        ))}
      </div>
      <label className="block text-sm text-white">
        Daily limit reminder: {limit} min
        <input
          type="range"
          min={15}
          max={240}
          step={15}
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="mt-3 w-full accent-white"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        We'll remind you once you reach {limit} minutes in a day.
      </p>
    </div>
  );
}

const FAQS = [
  {
    q: "How do I make my account private?",
    a: "Open Settings and privacy → Account privacy and turn on Private account. Only approved followers will see your posts.",
  },
  {
    q: "How do I hide my story from someone?",
    a: "Settings and privacy → Hide story and live, then tap Hide next to that person.",
  },
  {
    q: "Can I recover a deleted post?",
    a: "Deleted posts stay in Archive for 30 days, then are removed permanently.",
  },
];

function HelpScreen({ onSent }: { onSent: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  return (
    <div>
      <SectionLabel>Frequently asked</SectionLabel>
      {FAQS.map((f, i) => (
        <div key={f.q} className="border-b border-border">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm text-white"
          >
            {f.q}
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition ${open === i ? "rotate-90" : ""}`}
            />
          </button>
          {open === i && (
            <p className="px-4 pb-4 text-xs text-muted-foreground">{f.a}</p>
          )}
        </div>
      ))}
      <SectionLabel>Report a problem</SectionLabel>
      <div className="px-4">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder="Tell us what went wrong…"
          className="w-full rounded-xl border border-border bg-muted p-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-white/40"
        />
        <button
          type="button"
          disabled={!msg.trim()}
          onClick={() => {
            setMsg("");
            onSent();
          }}
          className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black disabled:opacity-40"
        >
          Send to support
        </button>
      </div>
    </div>
  );
}

function SessionsScreen({
  onLogoutAll,
  onEnded,
}: {
  onLogoutAll: () => void;
  onEnded: () => void;
}) {
  const [sessions, setSessions] = useState([
    { id: 1, device: "iPhone 15 · Kurbati app", place: "Mumbai, IN", now: true },
    { id: 2, device: "Chrome · Windows", place: "Pune, IN", now: false },
    { id: 3, device: "iPad · Kurbati app", place: "Delhi, IN", now: false },
  ]);
  return (
    <div>
      {sessions.map((x) => (
        <div key={x.id} className="flex items-center gap-3 px-4 py-3.5">
          <Smartphone className="h-5 w-5 text-white" />
          <div className="flex-1">
            <p className="text-sm text-white">{x.device}</p>
            <p className="text-xs text-muted-foreground">
              {x.place}
              {x.now ? " · Active now" : " · 2 days ago"}
            </p>
          </div>
          {!x.now && (
            <button
              type="button"
              onClick={() => {
                setSessions((p) => p.filter((y) => y.id !== x.id));
                onEnded();
              }}
              className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-white"
            >
              Log out
            </button>
          )}
        </div>
      ))}
      <div className="space-y-2 p-4">
        <button
          type="button"
          onClick={onLogoutAll}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={onLogoutAll}
          className="w-full rounded-xl border border-destructive py-2.5 text-sm font-semibold text-destructive"
        >
          Log out from all devices
        </button>
      </div>
    </div>
  );
}
