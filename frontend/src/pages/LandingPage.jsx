import { createElement, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Palette,
  Phone,
  Shield,
  Sparkles,
  Users,
  Video,
  MapPin,
} from "lucide-react";
import { THEMES, THEME_META, useThemeStore } from "../store/useThemeStore";

const highlights = [
  { label: "Fast channels", value: "Realtime" },
  { label: "Friends online", value: "Live" },
  { label: "Calls and chat", value: "Unified" },
];

const features = [
  {
    icon: MessageSquare,
    title: "Focused conversations",
    description:
      "Keep direct chats, shared spaces, and recent messages close without the usual tab-hopping.",
  },
  {
    icon: Video,
    title: "One-click video rooms",
    description:
      "Move from a thread into a call when tone, timing, or context needs a little more bandwidth.",
  },
  {
    icon: Users,
    title: "People-first presence",
    description:
      "See who is around, manage friends, and pick up conversations without losing the thread.",
  },
  {
    icon: MapPin,
    title: "Live friends map",
    description:
      "See where your friends are on a real-time interactive map. Auto-detects your location and shows distance in chat — powered by OpenStreetMap, completely free.",
  },
];

const previewMessages = [
  { name: "Maya", text: "Design review is in the lounge room.", active: true },
  { name: "Arjun", text: "Pushed the notes from yesterday.", active: false },
  { name: "Sam", text: "Jumping into the call now.", active: true },
];

const Feature = ({ icon: Icon, title, description, highlight }) => (
  <article
    className="glass-hover rounded-2xl p-5"
    style={highlight ? { border: "1px solid oklch(var(--p) / 0.35)", background: "oklch(var(--p) / 0.05)" } : {}}
  >
    <div
      className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
      style={{ background: "oklch(var(--p) / 0.12)", color: "oklch(var(--p))" }}
    >
      {createElement(Icon, { size: 21 })}
    </div>
    {highlight && (
      <span
        className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: "oklch(var(--p) / 0.15)", color: "oklch(var(--p))" }}
      >
        <Sparkles size={10} /> New
      </span>
    )}
    <h3 className="font-display text-base" style={{ color: "var(--text-primary)" }}>{title}</h3>
    <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{description}</p>
  </article>
);

const LandingThemePicker = () => {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const currentTheme = THEME_META[theme] || THEME_META.dark;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "oklch(var(--b2) / 0.82)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
          boxShadow: open ? "0 16px 34px rgba(0,0,0,0.18)" : "none",
        }}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <Palette size={16} />
        <span className="hidden max-w-24 truncate sm:inline">{currentTheme.label}</span>
        <ChevronDown
          size={14}
          className="hidden transition-transform duration-200 sm:block"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl shadow-2xl animate-fade-in"
          style={{
            background: "oklch(var(--b2))",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.34)",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <Palette size={14} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Choose theme
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {THEMES.map((name) => {
              const meta = THEME_META[name];
              const active = theme === name;
              return (
                <button
                  key={name}
                  type="button"
                  data-theme={name}
                  onClick={() => { setTheme(name); setOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150 hover:bg-base-300"
                  style={{ background: active ? "oklch(var(--p) / 0.12)" : "transparent" }}
                >
                  <span className="flex h-5 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
                    <span className="flex-1" style={{ background: "oklch(var(--p))" }} />
                    <span className="flex-1" style={{ background: "oklch(var(--s))" }} />
                    <span className="flex-1" style={{ background: "oklch(var(--a))" }} />
                    <span className="flex-1" style={{ background: "oklch(var(--n))" }} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {meta.label}
                  </span>
                  {active && <Check size={13} style={{ color: "oklch(var(--p))", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden mesh-bg" style={{ color: "var(--text-primary)" }}>
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src="/TSlogo.png" alt="TalkStream logo" className="h-10 w-10 flex-shrink-0 rounded-xl object-contain" />
          <span className="truncate font-display text-lg">TalkStream</span>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <LandingThemePicker />
          <Link to="/login" className="btn-secondary px-4 py-2">Sign in</Link>
          <Link to="/signup" className="btn-brand hidden px-4 py-2 sm:inline-flex">Create account</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pb-16 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:px-8 lg:pb-24">
        <div className="max-w-3xl text-center lg:text-left">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "oklch(var(--b2) / 0.82)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Sparkles size={14} style={{ color: "oklch(var(--p))" }} />
            <span className="truncate">Built for chats that turn into collaboration</span>
          </div>

          <h1
            className="font-display text-4xl leading-[1.06] sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            Talk, call, and stay in sync without the clutter.
          </h1>

          <p
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0"
            style={{ color: "var(--text-secondary)" }}
          >
            TalkStream brings messages, friends, video calls, and a live friends map into one calm workspace for teams, classmates, and communities that need to move quickly.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/signup" className="btn-brand inline-flex items-center justify-center gap-2 px-6 py-3">
              Get started <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3">
              I already have an account
            </Link>
          </div>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:mt-10 lg:mx-0">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-4 text-center min-[420px]:text-left"
                style={{ background: "oklch(var(--b2) / 0.62)", border: "1px solid var(--border)" }}
              >
                <div className="text-sm font-bold sm:text-base" style={{ color: "var(--text-primary)" }}>{item.value}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto w-full max-w-xl lg:mr-0">
          <div
            className="absolute -left-4 top-10 hidden h-24 w-24 rounded-3xl sm:block"
            style={{ background: "oklch(var(--s) / 0.16)", transform: "rotate(-8deg)" }}
          />
          <div
            className="glass relative rounded-3xl p-3 shadow-2xl sm:rounded-[2rem] sm:p-5"
            style={{ boxShadow: "0 28px 80px rgba(0,0,0,0.24)" }}
          >
            <div
              className="rounded-2xl p-3 sm:rounded-[1.5rem] sm:p-4"
              style={{ background: "oklch(var(--b1) / 0.74)", border: "1px solid var(--border)" }}
            >
              <div className="mb-4 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Today</p>
                  <h2 className="mt-1 truncate font-display text-lg sm:text-xl">Project Lounge</h2>
                </div>
                <div
                  className="flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "oklch(var(--p) / 0.12)", color: "oklch(var(--p))" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: "#00e676" }} />
                  4 online
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_0.78fr]">
                <div className="space-y-3">
                  {previewMessages.map((message) => (
                    <div
                      key={message.name}
                      className="rounded-2xl p-3"
                      style={{ background: "oklch(var(--b2) / 0.95)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="relative flex h-10 w-10 items-center justify-center rounded-full font-bold"
                          style={{ background: "oklch(var(--p) / 0.14)", color: "oklch(var(--p))" }}
                        >
                          {message.name[0]}
                          {message.active && <span className="online-dot" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{message.name}</p>
                          <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>{message.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="flex min-h-44 flex-col justify-between rounded-2xl p-4 sm:min-h-56"
                  style={{
                    background: "linear-gradient(160deg, oklch(var(--p) / 0.18), oklch(var(--s) / 0.1))",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "oklch(var(--b1) / 0.72)" }}
                    >
                      <Phone size={22} style={{ color: "oklch(var(--p))" }} />
                    </div>
                    <h3 className="font-display text-lg">Live call ready</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                      Start a room from the chat when the conversation needs faces and voices.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <Shield size={15} style={{ color: "oklch(var(--p))" }} />
                    Secure sessions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map highlight banner */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div
          className="flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
          style={{
            background: "linear-gradient(135deg, oklch(var(--p) / 0.1), oklch(var(--s) / 0.07))",
            border: "1px solid oklch(var(--p) / 0.2)",
          }}
        >
          {/* Map pin icon block */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "oklch(var(--p) / 0.15)" }}
          >
            <MapPin size={30} style={{ color: "oklch(var(--p))" }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-display text-xl sm:text-2xl" style={{ color: "var(--text-primary)" }}>
                See your friends on a live map
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
                style={{ background: "oklch(var(--p) / 0.15)", color: "oklch(var(--p))" }}
              >
                <Sparkles size={10} /> New
              </span>
            </div>
            <p className="text-sm leading-6 sm:text-base" style={{ color: "var(--text-secondary)" }}>
              TalkStream automatically detects your location and shows it on an interactive map.
              See which friends are nearby, click any marker to open a chat, and get the exact
              distance between you and each contact — right inside the chat screen.
              Powered by OpenStreetMap. No API key. Always free.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "📍 Auto location detection",
                "📏 Distance shown in chat",
                "🗺️ Interactive friends map",
                "🆓 Free — no API key needed",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "oklch(var(--b2))", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: "oklch(var(--p))" }}>Why TalkStream</p>
            <h2 className="font-display text-2xl sm:text-4xl">A simpler surface for staying connected.</h2>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <CheckCircle2 size={18} style={{ color: "oklch(var(--p))" }} />
            Messaging, friends, calls, and map in one place
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Feature key={feature.title} {...feature} highlight={feature.icon === MapPin} />
          ))}
        </div>
      </section>
    </main>
  );
}